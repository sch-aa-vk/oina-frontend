interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const HISTORY_REFRESH_EVENT = "app:history-refresh";

export const CACHE_TTL = {
  PERSONAL: 2 * 60 * 1000,
  PUBLIC: 5 * 60 * 1000,
} as const;

export const appCache = {
  get<T>(key: string, ttl: number): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttl) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T): void {
    store.set(key, { data, timestamp: Date.now() });
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  invalidatePrefix(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },
};

export function requestHistoryRefresh() {
  appCache.invalidate("game-history");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HISTORY_REFRESH_EVENT));
  }
}

export function onHistoryRefresh(handler: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(HISTORY_REFRESH_EVENT, handler);
  return () => window.removeEventListener(HISTORY_REFRESH_EVENT, handler);
}
