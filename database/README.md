# Database Query Plans

Evidence for the server-side indexing optimization, captured with
`backend/scripts/explain-search.js`.

## Contents

| Path | Description |
|------|-------------|
| `baseline/explain-search.txt` | Query plan before any index was added |
| `optimized/explain-search.txt` | The same query once the search index exists |

## Why this is recorded separately

A timing alone is weak evidence, because it varies with network conditions,
cache warmth and whatever else the machine is doing. The query plan is not
subject to that: MongoDB reports which strategy it chose and how many documents
it had to inspect to answer the query. A change from a collection scan to an
index scan, with the examined count falling from the full collection to a
handful of documents, demonstrates the optimization directly.

This output must be captured before the index is created. Once the index
exists the original plan cannot be reproduced without dropping it again.

## Capturing a plan

```bash
node backend/scripts/explain-search.js an
```

The argument is the search term. Any term produces the same plan, because a
case-insensitive regular expression without a prefix anchor cannot use an
index and therefore scans the whole collection regardless of what is matched.

## Baseline

| Property | Value |
|----------|-------|
| Documents in collection | 100,000 |
| Data size | 32.3 MB |
| Indexes present | `_id_` only |
| Winning stage | `SORT` over a collection scan |
| Documents examined | 100,000 |
| Index keys examined | 0 |
| Documents returned | 20 |
| Execution time | 202 ms |

The query examines all 100,000 documents to return 20, and consults no index in
the process.
