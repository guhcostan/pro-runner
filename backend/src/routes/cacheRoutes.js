const express = require('express');
const cacheService = require('../services/cacheService.js');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

const router = express.Router();

/**
 * GET /api/cache/stats - Get cache statistics
 * Protected route for admins
 */
router.get('/stats', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas do cache'
    });
  }
});

/**
 * GET /api/cache/keys - Get all cache keys or keys matching pattern
 * Protected route for admins
 */
router.get('/keys', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { pattern = '*' } = req.query;
    const keys = cacheService.keys(pattern);
    
    res.json({
      success: true,
      keys,
      count: keys.length,
      pattern
    });
  } catch (error) {
    console.error('Error getting cache keys:', error);
    res.status(500).json({
      error: 'Erro ao buscar chaves do cache'
    });
  }
});

/**
 * DELETE /api/cache/clear - Clear all cache
 * Protected route for admins
 */
router.delete('/clear', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const stats = cacheService.getStats();
    cacheService.clear();
    
    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      clearedEntries: stats.size
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Erro ao limpar cache'
    });
  }
});

/**
 * DELETE /api/cache/keys/:pattern - Delete keys matching pattern
 * Protected route for admins
 */
router.delete('/keys/:pattern', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { pattern } = req.params;
    const deletedCount = cacheService.deletePattern(pattern);
    
    res.json({
      success: true,
      message: `Entradas do cache deletadas: ${deletedCount}`,
      pattern,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    res.status(500).json({
      error: 'Erro ao deletar entradas do cache'
    });
  }
});

/**
 * POST /api/cache/cleanup - Manual cleanup of expired entries
 * Protected route for admins
 */
router.post('/cleanup', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const cleanedCount = cacheService.cleanup();
    
    res.json({
      success: true,
      message: `Limpeza manual executada: ${cleanedCount} entradas expiradas removidas`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({
      error: 'Erro ao executar limpeza manual'
    });
  }
});

/**
 * GET /api/cache/health - Cache health check
 * Public route for monitoring
 */
router.get('/health', (req, res) => {
  try {
    const stats = cacheService.getStats();
    const isHealthy = stats.size < 10000; // Arbitrary health threshold
    
    res.status(isHealthy ? 200 : 503).json({
      success: true,
      healthy: isHealthy,
      stats: {
        size: stats.size,
        hitRate: stats.hitRate,
        memoryUsage: stats.memoryUsage
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking cache health:', error);
    res.status(503).json({
      success: false,
      healthy: false,
      error: 'Cache health check failed'
    });
  }
});

module.exports = router; 