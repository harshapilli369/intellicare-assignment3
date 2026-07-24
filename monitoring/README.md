# Prometheus and Grafana Monitoring

Continuous monitoring stack for the IntelliCare backend.

## Contents

| Path | Description |
|------|-------------|
| `docker-compose.yml` | Prometheus and Grafana services |
| `prometheus.yml` | Scrape configuration |
| `grafana/provisioning/datasources/` | Prometheus wired in as a data source |
| `grafana/provisioning/dashboards/` | Dashboard definition, provisioned as JSON |

## Running the stack

```bash
docker compose -f monitoring/docker-compose.yml up -d
```

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

Grafana runs on 3001 to avoid colliding with the frontend dev server on 3000.
The dashboard and data source are provisioned from files, so no manual setup is
needed after the containers start.

## Metrics

The backend exposes `/metrics` via `prom-client`. Alongside the default Node
process metrics it publishes a `http_request_duration_seconds` histogram and a
`http_requests_total` counter, both labelled by method, route and status code.

| Panel | Query |
|-------|-------|
| CPU utilization | `rate(process_cpu_seconds_total[1m]) * 100` |
| Memory usage | `process_resident_memory_bytes / 1024 / 1024` |
| Request latency (p95) | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le, route))` |
| Error rate | `sum(rate(http_requests_total{status_code=~"[45].."}[1m])) / sum(rate(http_requests_total[1m])) * 100` |

The `/metrics` endpoint is exempt from authentication and rate limiting, since
Prometheus scrapes it unauthenticated every five seconds.
