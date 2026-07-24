import api from './api';

// Short lived cache for directory reads, so paging back and forth or returning
// from a patient record does not refetch a page the browser already has.
const entries = new Map();
const TTL_MS = 30_000;
const MAX_ENTRIES = 50;

export const cachedGet = async (path, params) => {
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const entry = entries.get(key);

  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }

  const { data } = await api.get(path, { params });

  if (entries.size >= MAX_ENTRIES) {
    entries.delete(entries.keys().next().value);
  }
  entries.set(key, { data, expiresAt: Date.now() + TTL_MS });

  return data;
};

export const clearApiCache = () => entries.clear();
