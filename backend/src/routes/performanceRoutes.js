const express = require('express');
const performanceService = require('../services/performanceService.js');
const cacheService = require('../services/cacheService.js');
const { authenticateToken, createRateLimit } = require('../middleware/auth.js');

const router = express.Router();

/**
 * GET /api/performance/stats - Get performance statistics
 */
router.get('/stats', authenticateToken, createRateLimit(50, 15), async (req, res) => {
  try {
    const stats = performanceService.getPerformanceStats();
    
    res.json({
      message: 'Performance statistics retrieved successfully',
      performance: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter estatísticas de performance'
    });
  }
});

/**
 * GET /api/performance/summary - Get performance summary
 */
router.get('/summary', authenticateToken, createRateLimit(50, 15), async (req, res) => {
  try {
    const summary = performanceService.getPerformanceSummary();
    
    res.json({
      message: 'Performance summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance summary:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter resumo de performance'
    });
  }
});

/**
 * GET /api/performance/recommendations - Get optimization recommendations
 */
router.get('/recommendations', authenticateToken, createRateLimit(50, 15), async (req, res) => {
  try {
    const recommendations = performanceService.getOptimizationRecommendations();
    
    res.json({
      message: 'Optimization recommendations retrieved successfully',
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter recomendações de otimização'
    });
  }
});

/**
 * GET /api/performance/database - Get database statistics
 */
router.get('/database', authenticateToken, createRateLimit(30, 15), async (req, res) => {
  try {
    const dbStats = await performanceService.getDatabaseStats();
    
    res.json({
      message: 'Database statistics retrieved successfully',
      database: dbStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter estatísticas do banco de dados'
    });
  }
});

/**
 * GET /api/performance/export - Export performance data
 */
router.get('/export', authenticateToken, createRateLimit(10, 15), async (req, res) => {
  try {
    const exportData = performanceService.exportPerformanceData();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="performance-data-${Date.now()}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting performance data:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível exportar dados de performance'
    });
  }
});

/**
 * DELETE /api/performance/stats - Clear performance statistics
 */
router.delete('/stats', authenticateToken, createRateLimit(10, 15), async (req, res) => {
  try {
    performanceService.clearStats();
    
    res.json({
      message: 'Performance statistics cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing performance stats:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível limpar estatísticas de performance'
    });
  }
});

/**
 * GET /api/performance/overview - Complete performance overview
 */
router.get('/overview', authenticateToken, createRateLimit(30, 15), async (req, res) => {
  try {
    const [
      performanceStats,
      cacheStats,
      dbStats
    ] = await Promise.all([
      performanceService.getPerformanceStats(),
      cacheService.getStats(),
      performanceService.getDatabaseStats()
    ]);

    const overview = {
      query_performance: performanceStats,
      cache_performance: cacheStats,
      database_stats: dbStats,
      system_health: {
        status: 'operational',
        checks: {
          queries: performanceStats.summary.errorRate < 5 ? 'healthy' : 'warning',
          cache: cacheStats.hitRate > 70 ? 'healthy' : cacheStats.hitRate > 50 ? 'warning' : 'critical',
          recommendations: performanceStats.summary.recommendations.length
        }
      }
    };

    res.json({
      message: 'Performance overview retrieved successfully',
      overview,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance overview:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter visão geral de performance'
    });
  }
});

module.exports = router; 