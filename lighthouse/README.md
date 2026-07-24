# Lighthouse — Client-Side Rendering Measurements

Evidence for the client-side optimizations. JMeter measures what the server
does; these runs measure what the browser does.

## Why a separate tool

The load test showed the JavaScript bundle being served in 4–24 ms, because
Express reads it from local disk over loopback. That number says nothing about
rendering: it measures the file system, not the browser parsing and executing
488 KB of JavaScript. Lighthouse applies mobile throttling, so it reports what a
real user on a real connection experiences, which is where bundle size actually
matters.

## Contents

| Path | Description |
|------|-------------|
| `baseline/login.report.html` | Readable report for the baseline build |
| `baseline/login.report.json` | Same run, machine-readable |
| `optimized/` | The same page after the client-side optimizations |

## Test conditions

Identical across runs, so the comparison stays valid.

| Setting | Value |
|---------|-------|
| Lighthouse | 12.8.2 |
| Form factor | Mobile |
| Throttling | Simulated — 1,638 Kbps down, 150 ms RTT, 4× CPU slowdown |
| Target | `http://localhost:5000/login` |
| Categories | Performance only |

The sign-in page is the entry point, and it is the page that exposes the cost of
shipping a single bundle: a visitor who has not signed in still downloads the
patient table, the date picker, the icon set and the date library, none of which
that screen uses.

## Running a scan

The backend must be serving the built frontend.

```bash
npm run build --prefix frontend
npm start --prefix backend

npx lighthouse@12 http://localhost:5000/login \
  --output=html --output=json \
  --output-path=lighthouse/baseline/login \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance --quiet
```

Change `baseline` to `optimized` for the second run.

## Baseline results

| Metric | Value |
|--------|-------|
| Performance score | 80 |
| First Contentful Paint | 3.8 s |
| Largest Contentful Paint | 3.8 s |
| Speed Index | 3.8 s |
| Time to Interactive | 3.8 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Total page weight | 578 KiB |

Transfer breakdown for the sign-in page:

| Resource | Size |
|----------|------|
| `assets/index.js` | 488,575 B |
| `assets/index.css` | 49,971 B |
| Inter web font | 48,464 B |
| `index.html` | 1,778 B |

The single JavaScript bundle is 84 percent of the page weight.
