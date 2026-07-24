# Security Findings and Remediation

Scans were run with `zap-full-scan.py` against the built application served by
Express, authenticated through a replacer rule so the API endpoints were
reachable. The AI routes were excluded from active scanning: it posts to every
endpoint it discovers, and each of those calls reaches a third-party model with
its own rate limit and cost.

## Result

| Risk | Alert | Before | After | Outcome |
|------|-------|-------:|------:|---------|
| Medium | CSP: Wildcard Directive | 5 | 0 | Fixed |
| Medium | Sub Resource Integrity Attribute Missing | 5 | 0 | Fixed |
| Medium | CSP: `style-src unsafe-inline` | 5 | 5 | Accepted, see below |
| Medium | HTTP Only Site | 1 | 1 | Accepted, see below |
| Low | Permissions Policy Header Not Set | 5 | 0 | Fixed |
| Low | Cross-Origin-Embedder-Policy Missing | 5 | 0 | Fixed |
| Informational | CORS Header, Modern Web Application, Storable but Non-Cacheable Content, User Agent Fuzzer | 20 | 20 | No action |

Rules passed: 136 before, 139 after. No high risk alerts in either scan.

## What the scan did not find

Both MongoDB injection rules reported a pass in the first scan:

```
PASS: NoSQL Injection - MongoDB [40033]
PASS: NoSQL Injection - MongoDB (Time Based) [90039]
```

The application was nevertheless injectable. `backend/scripts/probe-login.js`
sends query operators where the sign-in endpoint expects strings, and two of
them reached the database:

```
Operator in email and password
  sent:     {"email":{"$ne":null},"password":{"$ne":null}}
  result:   REACHED THE DATABASE (Illegal arguments: object, string)
```

An email of `{"$ne": null}` is not compared to an address. MongoDB reads it as
a query operator and selects the first account that has any email at all.
Authentication still failed, but only because the password library refuses a
non-string argument — an accident of that library, not a control anyone chose.
The error it raised was then returned to the caller verbatim, confirming to
whoever sent the request that their operator had reached the comparison.

Both ZAP rules detect injection by measuring delay. This flaw introduces none,
so the scanner had no signal to work with. An automated scan establishes a
floor, not a ceiling.

## Fixes

### 1. Query operator injection at sign-in

`backend/src/middleware/validate.js`, `backend/src/routes/authRoutes.js`

Both credentials are asserted to be strings before the controller runs, so an
object can no longer reach the query.

```js
const credentials = [
  body('email').isString().bail().trim().isEmail().normalizeEmail(),
  body('password').isString().bail().isLength({ min: 1, max: 200 }),
];

router.post('/login', loginLimiter, credentials, validate, authController.login);
```

Evidence: `remediation/probe-login-before.txt` and `remediation/probe-login-after.txt`.
All four operator cases move from reaching the database to being rejected by
validation, while valid credentials still sign in.

### 2. Internal error text returned to the caller

`backend/src/middleware/errorHandler.js`

Server errors now return a generic message. Client errors keep theirs, since
those are written for the caller.

```js
const isClientError = status >= 400 && status < 500;
const safeToSend = isClientError || process.env.NODE_ENV === 'development';
res.status(status).json({ message: safeToSend ? err.message : 'Internal server error' });
```

### 3. Content security policy wildcard and missing integrity attribute

`frontend/index.html`, `frontend/src/styles/index.css`, `backend/src/app.js`

The interface font was loaded from a font provider through a stylesheet in the
page head. That stylesheet could carry no integrity attribute we control, and
permitting it forced the policy to allow any `https:` origin for both styles
and fonts — which is what produced three of the four medium alerts.

The Latin subset is now served from this application, so no third-party origin
needs to be trusted, and the policy names this origin only:

```js
directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  fontSrc: ["'self'"],
  imgSrc: ["'self'", 'data:'],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
}
```

First contentful paint improved from 1.7s to 1.5s as a side effect, since the
DNS lookup, connection and redirect to the font host are gone.

### 4. Missing Permissions-Policy and Cross-Origin-Embedder-Policy

`backend/src/app.js`

Helmet sets the second when asked; the first it does not cover, so it is sent
directly. Browser features the application never uses are denied.

### 5. Password guessing at sign-in

`backend/src/routes/authRoutes.js`

Sign-in is the one unauthenticated endpoint that checks a secret. It now has
its own limit of ten attempts per fifteen minutes, rather than relying on the
global limit of two hundred requests.

## Accepted, not fixed

**`style-src 'unsafe-inline'`** — React applies element styles directly and the
date picker positions itself that way, so removing this breaks the interface
rather than hardening it. Addressing it properly means moving those styles to
classes or issuing a nonce per response, which is a larger change than this
assignment covers. Recorded here rather than silently left.

**`HTTP Only Site`** — the application is served over HTTP because it runs
locally. In a deployment this is terminated by the host, and `Strict-Transport-Security`
is already sent. There is nothing to change in the application itself.

## Reproducing

```bash
npm run build --prefix frontend
npm start --prefix backend

docker run --rm --add-host=host.docker.internal:host-gateway \
  -v "$(pwd)/zap:/zap/wrk/:rw" \
  -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t http://host.docker.internal:5000 \
  -r reports/zap-report-after.html -J reports/zap-report-after.json -I

node backend/scripts/probe-login.js
```
