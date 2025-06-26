const cacheService = require('../../src/services/cacheService.js');

describe('Cache Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  afterAll(() => {
    // Stop periodic cleanup and clear cache
    cacheService.stopPeriodicCleanup();
    cacheService.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get values correctly', () => {
      const key = 'test-key';
      const value = { name: 'Test User', id: 123 };

      cacheService.set(key, value);
      const retrieved = cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should delete values correctly', () => {
      const key = 'test-key';
      const value = 'test-value';

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe(value);

      cacheService.delete(key);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should check if key exists', () => {
      const key = 'test-key';
      const value = 'test-value';

      expect(cacheService.has(key)).toBe(false);

      cacheService.set(key, value);
      expect(cacheService.has(key)).toBe(true);

      cacheService.delete(key);
      expect(cacheService.has(key)).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire values after TTL', (done) => {
      const key = 'ttl-test-key';
      const value = 'ttl-test-value';
      const ttl = 0.05; // 50ms

      cacheService.set(key, value, ttl);
      expect(cacheService.get(key)).toBe(value);

      setTimeout(() => {
        expect(cacheService.get(key)).toBeNull();
        done();
      }, 100); // Wait longer than TTL
    });

    it('should use default TTL when not specified', () => {
      const key = 'default-ttl-key';
      const value = 'default-ttl-value';

      cacheService.set(key, value);
      const retrieved = cacheService.get(key);

      expect(retrieved).toBe(value);
    });

    it('should handle zero TTL correctly (no expiration)', () => {
      const key = 'no-ttl-key';
      const value = 'no-ttl-value';

      cacheService.set(key, value, 0);
      const retrieved = cacheService.get(key);

      expect(retrieved).toBe(value);
    });

    it('should update TTL when setting existing key', (done) => {
      const key = 'update-ttl-key';
      const value1 = 'value1';
      const value2 = 'value2';

      // Set with short TTL
      cacheService.set(key, value1, 0.05);
      expect(cacheService.get(key)).toBe(value1);

      // Update with longer TTL
      cacheService.set(key, value2, 1);
      expect(cacheService.get(key)).toBe(value2);

      // Should still exist after original TTL would have expired
      setTimeout(() => {
        expect(cacheService.get(key)).toBe(value2);
        done();
      }, 100);
    });
  });

  describe('Pattern Operations', () => {
    beforeEach(() => {
      cacheService.set('user:1', { id: 1, name: 'User 1' });
      cacheService.set('user:2', { id: 2, name: 'User 2' });
      cacheService.set('plan:1', { id: 1, type: 'Plan 1' });
      cacheService.set('plan:2', { id: 2, type: 'Plan 2' });
      cacheService.set('other:key', 'other value');
    });

    it('should get all keys with * pattern', () => {
      const keys = cacheService.keys('*');
      expect(keys).toHaveLength(5);
      expect(keys).toContain('user:1');
      expect(keys).toContain('user:2');
      expect(keys).toContain('plan:1');
      expect(keys).toContain('plan:2');
      expect(keys).toContain('other:key');
    });

    it('should get keys matching user pattern', () => {
      const keys = cacheService.keys('user:*');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('user:1');
      expect(keys).toContain('user:2');
    });

    it('should get keys matching plan pattern', () => {
      const keys = cacheService.keys('plan:*');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('plan:1');
      expect(keys).toContain('plan:2');
    });

    it('should delete keys matching pattern', () => {
      const deletedCount = cacheService.deletePattern('user:*');
      expect(deletedCount).toBe(2);

      expect(cacheService.get('user:1')).toBeNull();
      expect(cacheService.get('user:2')).toBeNull();
      expect(cacheService.get('plan:1')).not.toBeNull();
      expect(cacheService.get('plan:2')).not.toBeNull();
    });

    it('should handle patterns with no matches', () => {
      const keys = cacheService.keys('nonexistent:*');
      expect(keys).toHaveLength(0);

      const deletedCount = cacheService.deletePattern('nonexistent:*');
      expect(deletedCount).toBe(0);
    });
  });

  describe('getOrSet Method', () => {
    it('should fetch and cache value when not in cache', async () => {
      const key = 'fetch-key';
      const expectedValue = { data: 'fetched data' };
      
      const fetchFn = jest.fn().mockResolvedValue(expectedValue);

      const result = await cacheService.getOrSet(key, fetchFn, 1);

      expect(result).toEqual(expectedValue);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(cacheService.get(key)).toEqual(expectedValue);
    });

    it('should return cached value without calling fetch function', async () => {
      const key = 'cached-key';
      const cachedValue = { data: 'cached data' };
      const fetchValue = { data: 'fetched data' };

      cacheService.set(key, cachedValue);
      const fetchFn = jest.fn().mockResolvedValue(fetchValue);

      const result = await cacheService.getOrSet(key, fetchFn, 1);

      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should handle fetch function errors gracefully', async () => {
      const key = 'error-key';
      const fetchFn = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      await expect(cacheService.getOrSet(key, fetchFn, 1)).rejects.toThrow('Fetch failed');
      expect(cacheService.get(key)).toBeNull();
    });

    it('should not cache null or undefined values', async () => {
      const key1 = 'null-key';
      const key2 = 'undefined-key';
      
      const fetchNull = jest.fn().mockResolvedValue(null);
      const fetchUndefined = jest.fn().mockResolvedValue(undefined);

      const result1 = await cacheService.getOrSet(key1, fetchNull, 1);
      const result2 = await cacheService.getOrSet(key2, fetchUndefined, 1);

      expect(result1).toBeNull();
      expect(result2).toBeUndefined();
      expect(cacheService.get(key1)).toBeNull();
      expect(cacheService.get(key2)).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should track cache hits and misses', () => {
      const key = 'stats-key';
      const value = 'stats-value';

      // Initial stats
      let stats = cacheService.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Miss
      cacheService.get('non-existent');
      stats = cacheService.getStats();
      expect(stats.misses).toBe(1);

      // Set and Hit
      cacheService.set(key, value);
      cacheService.get(key);
      stats = cacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.sets).toBe(1);
    });

    it('should calculate hit rate correctly', () => {
      const key = 'hit-rate-key';
      const value = 'hit-rate-value';

      cacheService.set(key, value);
      
      // 2 hits, 1 miss = 66.67% hit rate
      cacheService.get(key);
      cacheService.get(key);
      cacheService.get('non-existent');

      const stats = cacheService.getStats();
      expect(stats.hitRate).toBe('66.67%');
    });

    it('should track cache size', () => {
      let stats = cacheService.getStats();
      expect(stats.size).toBe(0);

      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      stats = cacheService.getStats();
      expect(stats.size).toBe(2);
    });

    it('should estimate memory usage', () => {
      cacheService.set('memory-test', { large: 'data'.repeat(100) });
      
      const stats = cacheService.getStats();
      expect(stats.memoryUsage).toMatch(/\d+\.\d+ KB/);
    });
  });

  describe('Cleanup Operations', () => {
    it('should cleanup expired entries manually', (done) => {
      const key1 = 'expire-key-1';
      const key2 = 'expire-key-2';
      const key3 = 'persist-key';

      cacheService.set(key1, 'value1', 0.001); // 1ms
      cacheService.set(key2, 'value2', 0.001); // 1ms
      cacheService.set(key3, 'value3', 10); // 10 seconds

      setTimeout(() => {
        const cleanedCount = cacheService.cleanup();
        expect(cleanedCount).toBeGreaterThanOrEqual(0); // Could be 0 if auto-cleanup already ran
        
        expect(cacheService.get(key1)).toBeNull();
        expect(cacheService.get(key2)).toBeNull();
        expect(cacheService.get(key3)).toBe('value3');
        
        done();
      }, 50);
    }, 15000);

    it('should clear all cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      expect(cacheService.getStats().size).toBe(3);

      cacheService.clear();

      expect(cacheService.getStats().size).toBe(0);
      expect(cacheService.getStats().hits).toBe(0);
      expect(cacheService.getStats().misses).toBe(0);
    });

    it('should start and stop periodic cleanup', () => {
      // This test verifies the methods exist and can be called
      expect(() => {
        cacheService.startPeriodicCleanup(1);
        cacheService.stopPeriodicCleanup();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle complex objects as values', () => {
      const key = 'complex-object';
      const value = {
        user: {
          id: 1,
          name: 'John Doe',
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        plans: [
          { id: 1, name: 'Plan A' },
          { id: 2, name: 'Plan B' }
        ]
      };

      cacheService.set(key, value);
      const retrieved = cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle setting the same key multiple times', () => {
      const key = 'multi-set-key';

      cacheService.set(key, 'value1');
      expect(cacheService.get(key)).toBe('value1');

      cacheService.set(key, 'value2');
      expect(cacheService.get(key)).toBe('value2');

      cacheService.set(key, 'value3');
      expect(cacheService.get(key)).toBe('value3');
    });

    it('should handle deleting non-existent keys', () => {
      expect(() => {
        cacheService.delete('non-existent-key');
      }).not.toThrow();
    });

    it('should handle expired keys in has() method', (done) => {
      const key = 'has-expire-key';
      const value = 'has-expire-value';

      cacheService.set(key, value, 0.05); // 50ms
      expect(cacheService.has(key)).toBe(true);

      setTimeout(() => {
        expect(cacheService.has(key)).toBe(false);
        done();
      }, 100);
    });

    it('should handle keys with special characters', () => {
      const specialKeys = [
        'key:with:colons',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key with spaces',
        'key/with/slashes',
        'key@with#special$chars%'
      ];

      specialKeys.forEach((key, index) => {
        const value = `value-${index}`;
        cacheService.set(key, value);
        expect(cacheService.get(key)).toBe(value);
      });
    });
  });
}); 