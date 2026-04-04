// Simple in-memory cache for API routes.
// Cloudflare Workers reuse isolates across requests, so this provides
// effective request deduplication within a single edge location.

interface CacheEntry<T> {
  data: T;
  expires: number;
}

/** Cap total keys to limit memory growth from high-cardinality params. */
const MAX_ENTRIES = 400;

const store = new Map<string, CacheEntry<unknown>>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expires) {
      store.delete(key);
    }
  }
}

function evictToMax(): void {
  pruneExpired();
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  evictToMax();
  store.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
  if (store.size > MAX_ENTRIES) {
    evictToMax();
  }
}
