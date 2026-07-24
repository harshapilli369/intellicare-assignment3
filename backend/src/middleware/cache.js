// A small time-to-live cache for read endpoints.
//
// The dashboard counters and the patient directory are read far more often
// than the data behind them changes, and each read was recomputing the same
// answer against collections of hundreds of thousands of documents.
//
// Entries are keyed by user as well as URL. Two clinicians requesting the same
// path are entitled to different data, so a shared key would leak one
// caseload into the other's response.

const store = new Map();
const counters = { hits: 0, misses: 0, evictions: 0 };

// Bounds the cache. Search terms are user supplied, so the number of distinct
// keys is effectively unbounded without a limit.
const MAX_ENTRIES = 1000;

const evictOldest = () => {
  const oldest = store.keys().next();
  if (!oldest.done) {
    store.delete(oldest.value);
    counters.evictions += 1;
  }
};

const cache = (ttlSeconds) => (req, res, next) => {
  const key = `${req.user?.id || 'anonymous'}:${req.originalUrl}`;
  const entry = store.get(key);

  if (entry && entry.expiresAt > Date.now()) {
    counters.hits += 1;
    res.set('X-Cache', 'HIT');
    return res.json(entry.body);
  }

  if (entry) store.delete(key);
  counters.misses += 1;
  res.set('X-Cache', 'MISS');

  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      if (store.size >= MAX_ENTRIES) evictOldest();
      store.set(key, { body, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    return sendJson(body);
  };

  return next();
};

// Drops every entry whose key contains the fragment. Called after a write so a
// stale clinical record cannot be served from memory.
const invalidate = (fragment) => {
  let removed = 0;
  for (const key of store.keys()) {
    if (key.includes(fragment)) {
      store.delete(key);
      removed += 1;
    }
  }
  return removed;
};

const stats = () => ({ ...counters, size: store.size });

module.exports = { cache, invalidate, stats };
