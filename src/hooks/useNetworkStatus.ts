import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getOfflineQueue, clearOfflineQueue, removeFromOfflineQueue } from '../lib/cache';
import { supabase } from '../lib/supabase';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);

      if (connected) {
        syncOfflineQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncOfflineQueue = async () => {
    setIsSyncing(true);
    try {
      const queue = await getOfflineQueue();

      for (const mutation of queue) {
        try {
          if (mutation.operation === 'insert') {
            await supabase.from(mutation.table).insert(mutation.data);
          } else if (mutation.operation === 'update') {
            const { id, ...data } = mutation.data;
            await supabase.from(mutation.table).update(data).eq('id', id);
          } else if (mutation.operation === 'delete') {
            await supabase.from(mutation.table).delete().eq('id', mutation.data.id);
          }

          await removeFromOfflineQueue(mutation.id);
        } catch (error) {
          console.error('Failed to sync mutation:', mutation, error);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isConnected, isSyncing, syncOfflineQueue };
}

export function useOfflineAware<T>(
  onlineFetcher: () => Promise<T>,
  cacheKey: string,
  options: { expiryMs?: number } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { isConnected } = useNetworkStatus();

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const { getCache, setCache } = await import('../lib/cache');

      if (!forceRefresh && !isConnected) {
        const cached = await getCache<T>(cacheKey);
        if (cached) {
          setData(cached);
          setIsStale(true);
          setLoading(false);
          return;
        }
      }

      const result = await onlineFetcher();
      setData(result);
      setIsStale(false);
      await setCache(cacheKey, result, options.expiryMs);
    } catch (err) {
      const { getCache } = await import('../lib/cache');
      const cached = await getCache<T>(cacheKey);

      if (cached) {
        setData(cached);
        setIsStale(true);
      } else {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cacheKey, isConnected]);

  return { data, loading, error, isStale, refetch: () => fetchData(true) };
}
