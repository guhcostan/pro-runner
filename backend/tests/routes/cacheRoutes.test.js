const request = require('supertest');
const app = require('../../src/index.js');
const cacheService = require('../../src/services/cacheService.js');

// Mock do middleware de autenticação para os testes
jest.mock('../../src/middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'user-123', role: 'admin' };
    next();
  },
  optionalAuth: (req, res, next) => {
    req.user = { id: 'user-123', role: 'user' };
    next();
  },
  requireRole: (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado' });
    }
  },
  createRateLimit: () => (req, res, next) => next()
}));

describe('Cache Routes', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  describe('GET /api/cache/stats', () => {
    it('should return cache statistics for admin users', async () => {
      // Add some data to cache
      cacheService.set('test-key-1', 'value1');
      cacheService.set('test-key-2', 'value2');
      cacheService.get('test-key-1'); // Hit
      cacheService.get('non-existent'); // Miss

      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('timestamp');
      
      const stats = response.body.stats;
      expect(stats).toHaveProperty('hits', 1);
      expect(stats).toHaveProperty('misses', 1);
      expect(stats).toHaveProperty('sets', 2);
      expect(stats).toHaveProperty('size', 2);
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('memoryUsage');
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.getStats to throw an error
      const originalGetStats = cacheService.getStats;
      cacheService.getStats = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      const response = await request(app)
        .get('/api/cache/stats')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Erro ao buscar estatísticas do cache');

      // Restore original method
      cacheService.getStats = originalGetStats;
    });
  });

  describe('GET /api/cache/keys', () => {
    beforeEach(() => {
      cacheService.set('user:1', { id: 1, name: 'User 1' });
      cacheService.set('user:2', { id: 2, name: 'User 2' });
      cacheService.set('plan:1', { id: 1, type: 'Plan 1' });
      cacheService.set('other:key', 'other value');
    });

    it('should return all cache keys by default', async () => {
      const response = await request(app)
        .get('/api/cache/keys')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('keys');
      expect(response.body).toHaveProperty('count', 4);
      expect(response.body).toHaveProperty('pattern', '*');
      
      expect(response.body.keys).toContain('user:1');
      expect(response.body.keys).toContain('user:2');
      expect(response.body.keys).toContain('plan:1');
      expect(response.body.keys).toContain('other:key');
    });

    it('should return keys matching pattern', async () => {
      const response = await request(app)
        .get('/api/cache/keys?pattern=user:*')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('keys');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('pattern', 'user:*');
      
      expect(response.body.keys).toContain('user:1');
      expect(response.body.keys).toContain('user:2');
      expect(response.body.keys).not.toContain('plan:1');
    });

    it('should handle pattern with no matches', async () => {
      const response = await request(app)
        .get('/api/cache/keys?pattern=nonexistent:*')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('keys', []);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('pattern', 'nonexistent:*');
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.keys to throw an error
      const originalKeys = cacheService.keys;
      cacheService.keys = jest.fn().mockImplementation(() => {
        throw new Error('Keys error');
      });

      const response = await request(app)
        .get('/api/cache/keys')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Erro ao buscar chaves do cache');

      // Restore original method
      cacheService.keys = originalKeys;
    });
  });

  describe('DELETE /api/cache/clear', () => {
    it('should clear all cache entries', async () => {
      // Add some data to cache
      cacheService.set('test-key-1', 'value1');
      cacheService.set('test-key-2', 'value2');
      cacheService.set('test-key-3', 'value3');

      expect(cacheService.getStats().size).toBe(3);

      const response = await request(app)
        .delete('/api/cache/clear')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cache limpo com sucesso');
      expect(response.body).toHaveProperty('clearedEntries', 3);

      expect(cacheService.getStats().size).toBe(0);
    });

    it('should handle empty cache', async () => {
      const response = await request(app)
        .delete('/api/cache/clear')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('clearedEntries', 0);
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.getStats and clear to throw errors
      const originalGetStats = cacheService.getStats;
      const originalClear = cacheService.clear;
      
      cacheService.getStats = jest.fn().mockImplementation(() => {
        throw new Error('Stats error');
      });

      const response = await request(app)
        .delete('/api/cache/clear')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Erro ao limpar cache');

      // Restore original methods
      cacheService.getStats = originalGetStats;
      cacheService.clear = originalClear;
    });
  });

  describe('DELETE /api/cache/keys/:pattern', () => {
    beforeEach(() => {
      cacheService.set('user:1', { id: 1, name: 'User 1' });
      cacheService.set('user:2', { id: 2, name: 'User 2' });
      cacheService.set('plan:1', { id: 1, type: 'Plan 1' });
      cacheService.set('other:key', 'other value');
    });

    it('should delete keys matching pattern', async () => {
      const response = await request(app)
        .delete('/api/cache/keys/user:*')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Entradas do cache deletadas: 2');
      expect(response.body).toHaveProperty('pattern', 'user:*');
      expect(response.body).toHaveProperty('deletedCount', 2);

      // Verify that user keys are deleted but others remain
      expect(cacheService.get('user:1')).toBeNull();
      expect(cacheService.get('user:2')).toBeNull();
      expect(cacheService.get('plan:1')).not.toBeNull();
      expect(cacheService.get('other:key')).not.toBeNull();
    });

    it('should handle pattern with no matches', async () => {
      const response = await request(app)
        .delete('/api/cache/keys/nonexistent:*')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('deletedCount', 0);
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.deletePattern to throw an error
      const originalDeletePattern = cacheService.deletePattern;
      cacheService.deletePattern = jest.fn().mockImplementation(() => {
        throw new Error('Delete pattern error');
      });

      const response = await request(app)
        .delete('/api/cache/keys/user:*')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Erro ao deletar entradas do cache');

      // Restore original method
      cacheService.deletePattern = originalDeletePattern;
    });
  });

  describe('POST /api/cache/cleanup', () => {
    it('should cleanup expired entries', async () => {
      // Add expired and non-expired entries
      cacheService.set('expire-key-1', 'value1', 0.001); // Very short TTL
      cacheService.set('expire-key-2', 'value2', 0.001); // Very short TTL
      cacheService.set('persist-key', 'value3', 100); // Long TTL

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .post('/api/cache/cleanup')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('cleanedCount');
      expect(response.body.message).toContain('entradas expiradas removidas');
    });

    it('should handle cleanup with no expired entries', async () => {
      cacheService.set('persist-key', 'value', 100); // Long TTL

      const response = await request(app)
        .post('/api/cache/cleanup')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('cleanedCount', 0);
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.cleanup to throw an error
      const originalCleanup = cacheService.cleanup;
      cacheService.cleanup = jest.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });

      const response = await request(app)
        .post('/api/cache/cleanup')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Erro ao executar limpeza manual');

      // Restore original method
      cacheService.cleanup = originalCleanup;
    });
  });

  describe('GET /api/cache/health', () => {
    it('should return healthy status for small cache', async () => {
      // Add a few entries (should be healthy)
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      const response = await request(app)
        .get('/api/cache/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('healthy', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('timestamp');
      
      expect(response.body.stats).toHaveProperty('size');
      expect(response.body.stats).toHaveProperty('hitRate');
      expect(response.body.stats).toHaveProperty('memoryUsage');
    });

    it('should return unhealthy status for large cache', async () => {
      // Mock getStats to return large size
      const originalGetStats = cacheService.getStats;
      cacheService.getStats = jest.fn().mockReturnValue({
        size: 15000, // Above threshold
        hitRate: '50%',
        memoryUsage: '100 KB'
      });

      const response = await request(app)
        .get('/api/cache/health')
        .expect(503);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('healthy', false);

      // Restore original method
      cacheService.getStats = originalGetStats;
    });

    it('should handle errors gracefully', async () => {
      // Mock cacheService.getStats to throw an error
      const originalGetStats = cacheService.getStats;
      cacheService.getStats = jest.fn().mockImplementation(() => {
        throw new Error('Health check error');
      });

      const response = await request(app)
        .get('/api/cache/health')
        .expect(503);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('healthy', false);
      expect(response.body).toHaveProperty('error', 'Cache health check failed');

      // Restore original method
      cacheService.getStats = originalGetStats;
    });
  });
}); 