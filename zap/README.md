# OWASP ZAP Security Scanning

Headless ZAP scans of the IntelliCare application, run before and after
remediation.

## Contents

| Path | Description |
|------|-------------|
| `reports/zap-report-before.html` | Full scan prior to any fixes |
| `reports/zap-report-before.json` | Same findings in machine-readable form |
| `reports/zap-report-after.html` | Rescan confirming the fixes took effect |
| `reports/zap-report-after.json` | Same findings in machine-readable form |
| `REMEDIATION.md` | Each fixed vulnerability, with the commit that fixed it |

## Running a scan

The application must be served by Express (not the Vite dev server) so that the
production security headers are present in the responses being scanned.

```bash
docker run --rm -v "$(pwd)/zap:/zap/wrk/:rw" \
  -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t http://host.docker.internal:5000 \
  -r reports/zap-report-before.html \
  -J reports/zap-report-before.json -I
```

`host.docker.internal` is required on Windows, since `localhost` inside the
container refers to the container itself. The `-I` flag stops a non-zero exit
code on warnings from aborting the run.

Authenticated endpoints are only reached if a bearer token is injected via a
replacer rule; without one the scan sees the login page and static assets only.
