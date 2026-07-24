# JMeter Comparison - Baseline vs Optimized

Generated with: python jmeter/summarise.py <before-report> <after-report>

For latency columns a negative change is an improvement. For throughput a
positive change is an improvement.

## Light load - 10 users, 30s ramp, 10 loops

| Endpoint                                        | Avg (ms) before | Avg (ms) after | Change  | Median (ms) before | Median (ms) after | Change | p95 (ms) before | p95 (ms) after | Change   | Req/s before | Req/s after | Change | Error % before | Error % after | Change |
| ----------------------------------------------- | --------------- | -------------- | ------- | ------------------ | ----------------- | ------ | --------------- | -------------- | -------- | ------------ | ----------- | ------ | -------------- | ------------- | ------ |
| 01 POST /api/auth/login                         | 70              | 66             | -5.1%   | 65                 | 63                | -3.1%  | 99              | 107            | +8.0%    | 0.75         | 0.87        | +15.0% | 0.00           | 0.00          | n/a    |
| 02 GET / (index.html)                           | 6               | 7              | +21.4%  | 2                  | 2                 | +0.0%  | 58              | 64             | +9.7%    | 0.75         | 0.87        | +15.0% | 0.00           | 0.00          | n/a    |
| 03 GET /assets/index.js (main bundle)           | 4               | 10             | +117.3% | 3                  | 3                 | +0.0%  | 6               | 67             | +1016.7% | 0.75         | 0.87        | +15.0% | 0.00           | 0.00          | n/a    |
| 04 GET /assets/index.css                        | 6               | 10             | +57.3%  | 2                  | 3                 | +50.0% | 47              | 66             | +40.9%   | 0.75         | 0.87        | +15.0% | 0.00           | 0.00          | n/a    |
| 05 GET /api/dashboard/stats                     | 525             | 7              | -98.6%  | 518                | 2                 | -99.6% | 596             | 73             | -87.8%   | 0.75         | 0.87        | +15.4% | 0.00           | 0.00          | n/a    |
| 06 GET /api/patients (paginated list)           | 177             | 17             | -90.5%  | 166                | 14                | -91.6% | 256             | 72             | -72.0%   | 0.75         | 0.87        | +15.2% | 0.00           | 0.00          | n/a    |
| 07 GET /api/patients?search= (name search)      | 366             | 12             | -96.6%  | 354                | 6                 | -98.3% | 468             | 64             | -86.3%   | 0.75         | 0.87        | +15.4% | 0.00           | 0.00          | n/a    |
| 08 GET /api/patients/{id} (record with history) | 4,677           | 10             | -99.8%  | 4,684              | 5                 | -99.9% | 5,476           | 66             | -98.8%   | 0.73         | 0.87        | +18.8% | 0.00           | 0.00          | n/a    |
| 09 GET /api/appointments (day view)             | 399             | 5              | -98.7%  | 383                | 2                 | -99.5% | 525             | 33             | -93.6%   | 0.76         | 0.87        | +14.6% | 0.00           | 0.00          | n/a    |
| 10 POST /api/ai/pre-appointment/{id}            | 3,198           | 7,080          | +121.4% | 3,066              | 1,624             | -47.0% | 5,782           | 55,195         | +854.6%  | 0.09         | 0.12        | +25.5% | 0.00           | 0.00          | n/a    |
| Total                                           | 720             | 94             | -87.0%  | 168                | 4                 | -97.6% | 4,751           | 67             | -98.6%   | 6.39         | 7.61        | +19.1% | 0.00           | 0.00          | n/a    |

## Moderate load - 50 users, 60s ramp, 5 loops

| Endpoint                                        | Avg (ms) before | Avg (ms) after | Change | Median (ms) before | Median (ms) after | Change  | p95 (ms) before | p95 (ms) after | Change  | Req/s before | Req/s after | Change  | Error % before | Error % after | Change |
| ----------------------------------------------- | --------------- | -------------- | ------ | ------------------ | ----------------- | ------- | --------------- | -------------- | ------- | ------------ | ----------- | ------- | -------------- | ------------- | ------ |
| 01 POST /api/auth/login                         | 131             | 76             | -42.3% | 106                | 64                | -39.6%  | 299             | 128            | -57.0%  | 1.56         | 3.21        | +105.9% | 0.00           | 0.00          | n/a    |
| 02 GET / (index.html)                           | 13              | 5              | -65.1% | 3                  | 2                 | -33.3%  | 93              | 8              | -91.4%  | 1.56         | 3.22        | +106.1% | 0.00           | 0.00          | n/a    |
| 03 GET /assets/index.js (main bundle)           | 24              | 25             | +4.7%  | 3                  | 4                 | +50.0%  | 126             | 121            | -3.5%   | 1.56         | 3.22        | +106.1% | 0.00           | 0.00          | n/a    |
| 04 GET /assets/index.css                        | 13              | 15             | +12.1% | 2                  | 3                 | +50.0%  | 88              | 69             | -21.5%  | 1.56         | 3.22        | +106.1% | 0.00           | 0.00          | n/a    |
| 05 GET /api/dashboard/stats                     | 1,572           | 9              | -99.4% | 1,586              | 2                 | -99.9%  | 2,766           | 62             | -97.8%  | 1.56         | 3.22        | +106.8% | 0.00           | 0.00          | n/a    |
| 06 GET /api/patients (paginated list)           | 525             | 18             | -96.5% | 542                | 4                 | -99.3%  | 940             | 75             | -92.0%  | 1.56         | 3.22        | +106.6% | 0.00           | 0.00          | n/a    |
| 07 GET /api/patients?search= (name search)      | 1,032           | 17             | -98.4% | 1,036              | 6                 | -99.4%  | 1,625           | 67             | -95.9%  | 1.56         | 3.22        | +106.8% | 0.00           | 0.00          | n/a    |
| 08 GET /api/patients/{id} (record with history) | 13,059          | 16             | -99.9% | 13,346             | 4                 | -100.0% | 20,965          | 64             | -99.7%  | 1.52         | 3.22        | +112.3% | 0.00           | 0.00          | n/a    |
| 09 GET /api/appointments (day view)             | 1,220           | 5              | -99.6% | 1,241              | 2                 | -99.8%  | 1,951           | 32             | -98.4%  | 1.56         | 3.22        | +105.9% | 0.00           | 0.00          | n/a    |
| 10 POST /api/ai/pre-appointment/{id}            | 4,919           | 2,854          | -42.0% | 4,445              | 1,491             | -66.5%  | 8,745           | 27,950         | +219.6% | 0.16         | 0.35        | +115.9% | 0.00           | 0.00          | n/a    |
| Total                                           | 1,987           | 52             | -97.4% | 436                | 4                 | -99.1%  | 14,551          | 95             | -99.3%  | 13.32        | 27.77       | +108.4% | 0.00           | 0.00          | n/a    |
