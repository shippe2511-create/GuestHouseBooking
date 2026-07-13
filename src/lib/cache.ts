import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'guestos_cache_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export async function setCache<T>(
  key: string,
  data: T,
  expiryMs: number = CACHE_EXPIRY_MS
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + expiryMs,
  };
  await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function invalidateCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(CACHE_PREFIX + key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const matchingKeys = keys.filter(
    (k) => k.startsWith(CACHE_PREFIX) && k.includes(pattern)
  );
  await AsyncStorage.multiRemove(matchingKeys);
}

export async function clearAllCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(cacheKeys);
}

// Offline queue for mutations
const OFFLINE_QUEUE_KEY = 'guestos_offline_queue';

interface QueuedMutation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

export async function queueOfflineMutation(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: Record<string, unknown>
): Promise<void> {
  const queue = await getOfflineQueue();
  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    table,
    operation,
    data,
    timestamp: Date.now(),
  });
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function getOfflineQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function removeFromOfflineQueue(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((m) => m.id !== id);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
}

// Network state helper
export function createCachedFetcher<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  expiryMs?: number
) {
  return async (forceRefresh = false): Promise<T | null> => {
    if (!forceRefresh) {
      const cached = await getCache<T>(cacheKey);
      if (cached) return cached;
    }

    try {
      const data = await fetcher();
      await setCache(cacheKey, data, expiryMs);
      return data;
    } catch (error) {
      // On network error, try returning stale cache
      const staleCache = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
      if (staleCache) {
        const entry: CacheEntry<T> = JSON.parse(staleCache);
        return entry.data;
      }
      throw error;
    }
  };
}
