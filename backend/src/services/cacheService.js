/**
 * Cache Service - In-Memory Cache with TTL support
 * This can be easily migrated to Redis when available
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = 300; // 5 minutes default
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Set value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const expires = ttl > 0 ? Date.now() + (ttl * 1000) : null;
    
    this.cache.set(key, {
      value,
      expires,
      createdAt: Date.now()
    });

    // Set auto-cleanup timer
    if (expires) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
    }

    this.stats.sets++;
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.stats.deletes++;
    }

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    
    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      memoryUsage: this._getMemoryUsage()
    };
  }

  /**
   * Get cache keys matching pattern (simple wildcard support)
   * @param {string} pattern - Pattern with * wildcard
   * @returns {string[]} Matching keys
   */
  keys(pattern = '*') {
    if (pattern === '*') {
      return Array.from(this.cache.keys());
    }

    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    );

    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern with * wildcard
   * @returns {number} Number of deleted keys
   */
  deletePattern(pattern) {
    const keys = this.keys(pattern);
    keys.forEach(key => this.delete(key));
    return keys.length;
  }

  /**
   * Get or set cached value (cache-aside pattern)
   * @param {string} key - Cache key
   * @param {function} fetchFn - Function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fresh value
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    let value = this.get(key);
    
    if (value !== null) {
      return value;
    }

    // Fetch fresh data
    value = await fetchFn();
    
    if (value !== null && value !== undefined) {
      this.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Estimate memory usage (rough calculation)
   * @private
   */
  _getMemoryUsage() {
    let size = 0;
    
    for (const [key, item] of this.cache.entries()) {
      // Rough estimation: key + JSON size
      size += key.length * 2; // UTF-16
      size += JSON.stringify(item).length * 2;
    }
    
    return `${(size / 1024).toFixed(2)} KB`;
  }

  /**
   * Cleanup expired entries (maintenance task)
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expires && now > item.expires) {
        this.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Start periodic cleanup
   * @param {number} intervalSeconds - Cleanup interval in seconds
   */
  startPeriodicCleanup(intervalSeconds = 300) { // 5 minutes
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Stop periodic cleanup
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Start periodic cleanup only in non-test environments
if (process.env.NODE_ENV !== 'test') {
  cacheService.startPeriodicCleanup();
}

module.exports = cacheService; 