import AsyncStorage from '@react-native-async-storage/async-storage';

const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => delete mockStorage[key]);
    return Promise.resolve();
  }),
}));

import {
  setCache,
  getCache,
  invalidateCache,
  clearAllCache,
  queueOfflineMutation,
  getOfflineQueue,
  clearOfflineQueue,
} from '../src/lib/cache';

describe('Cache utilities', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe('setCache / getCache', () => {
    it('should store and retrieve data', async () => {
      const testData = { foo: 'bar', count: 42 };
      await setCache('test-key', testData);

      const result = await getCache<typeof testData>('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for missing keys', async () => {
      const result = await getCache('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for expired cache', async () => {
      await setCache('expired-key', { data: 'test' }, 1);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await getCache('expired-key');
      expect(result).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should remove specific cache entry', async () => {
      await setCache('key1', 'value1');
      await setCache('key2', 'value2');

      await invalidateCache('key1');

      expect(await getCache('key1')).toBeNull();
      expect(await getCache('key2')).toBe('value2');
    });
  });

  describe('clearAllCache', () => {
    it('should remove all cache entries', async () => {
      await setCache('key1', 'value1');
      await setCache('key2', 'value2');

      await clearAllCache();

      expect(await getCache('key1')).toBeNull();
      expect(await getCache('key2')).toBeNull();
    });
  });

  describe('Offline queue', () => {
    it('should queue and retrieve mutations', async () => {
      await queueOfflineMutation('bookings', 'insert', { guest_name: 'Test' });
      await queueOfflineMutation('rooms', 'update', { id: '123', status: 'available' });

      const queue = await getOfflineQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].table).toBe('bookings');
      expect(queue[0].operation).toBe('insert');
      expect(queue[1].table).toBe('rooms');
    });

    it('should clear the queue', async () => {
      await queueOfflineMutation('test', 'insert', {});
      await clearOfflineQueue();

      const queue = await getOfflineQueue();
      expect(queue).toHaveLength(0);
    });
  });
});
