const performanceService = require('../../src/services/performanceService.js');

describe('PerformanceService', () => {
  beforeEach(() => {
    // Clear stats before each test
    performanceService.clearStats();
  });

  afterEach(() => {
    // Clean up after each test
    performanceService.clearStats();
  });

  describe('monitorQuery', () => {
    it('should monitor successful query execution', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ data: 'test' });
      
      const result = await performanceService.monitorQuery('test-query', mockQuery);
      
      expect(result).toEqual({ data: 'test' });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      
      const stats = performanceService.getPerformanceStats();
      expect(stats.queries['test-query']).toBeDefined();
      expect(stats.queries['test-query'].totalExecutions).toBe(1);
      expect(stats.queries['test-query'].successCount).toBe(1);
      expect(stats.queries['test-query'].errorCount).toBe(0);
    });

    it('should monitor failed query execution', async () => {
      const mockError = new Error('Database error');
      const mockQuery = jest.fn().mockRejectedValue(mockError);
      
      await expect(
        performanceService.monitorQuery('failing-query', mockQuery)
      ).rejects.toThrow('Database error');
      
      const stats = performanceService.getPerformanceStats();
      expect(stats.queries['failing-query']).toBeDefined();
      expect(stats.queries['failing-query'].totalExecutions).toBe(1);
      expect(stats.queries['failing-query'].successCount).toBe(0);
      expect(stats.queries['failing-query'].errorCount).toBe(1);
    });

    it('should detect slow queries', async () => {
      const mockQuery = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: 'slow' }), 1100))
      );
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = await performanceService.monitorQuery('slow-query', mockQuery);
      
      expect(result).toEqual({ data: 'slow' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🐌 SLOW QUERY DETECTED: slow-query took')
      );
      
      const stats = performanceService.getPerformanceStats();
      expect(stats.queries['slow-query'].slowQueryCount).toBe(1);
      
      consoleSpy.mockRestore();
    });

    it('should track execution times correctly', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ data: 'fast' });
      
      await performanceService.monitorQuery('fast-query', mockQuery);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['fast-query'];
      
      expect(queryStats.minTime).toBeGreaterThanOrEqual(0);
      expect(queryStats.maxTime).toBeGreaterThanOrEqual(queryStats.minTime);
      expect(queryStats.avgTime).toBeGreaterThanOrEqual(0);
      expect(queryStats.totalTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recordQueryStats', () => {
    it('should initialize stats for new query', () => {
      performanceService.recordQueryStats('new-query', 100, true);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['new-query'];
      
      expect(queryStats).toBeDefined();
      expect(queryStats.totalExecutions).toBe(1);
      expect(queryStats.totalTime).toBe(100);
      expect(queryStats.avgTime).toBe(100);
      expect(queryStats.minTime).toBe(100);
      expect(queryStats.maxTime).toBe(100);
      expect(queryStats.successCount).toBe(1);
      expect(queryStats.errorCount).toBe(0);
      expect(queryStats.slowQueryCount).toBe(0);
    });

    it('should update existing query stats', () => {
      performanceService.recordQueryStats('existing-query', 100, true);
      performanceService.recordQueryStats('existing-query', 200, false);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['existing-query'];
      
      expect(queryStats.totalExecutions).toBe(2);
      expect(queryStats.totalTime).toBe(300);
      expect(queryStats.avgTime).toBe(150);
      expect(queryStats.minTime).toBe(100);
      expect(queryStats.maxTime).toBe(200);
      expect(queryStats.successCount).toBe(1);
      expect(queryStats.errorCount).toBe(1);
    });

    it('should track slow queries', () => {
      performanceService.recordQueryStats('slow-query', 1500, true);
      
      const stats = performanceService.getPerformanceStats();
      expect(stats.queries['slow-query'].slowQueryCount).toBe(1);
    });

    it('should maintain recent execution history', () => {
      performanceService.recordQueryStats('history-query', 100, true);
      performanceService.recordQueryStats('history-query', 200, false);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['history-query'];
      
      expect(queryStats.recentExecutions).toHaveLength(2);
      expect(queryStats.recentExecutions[0].executionTime).toBe(100);
      expect(queryStats.recentExecutions[0].success).toBe(true);
      expect(queryStats.recentExecutions[1].executionTime).toBe(200);
      expect(queryStats.recentExecutions[1].success).toBe(false);
    });
  });

  describe('getPerformanceStats', () => {
    it('should return empty stats initially', () => {
      const stats = performanceService.getPerformanceStats();
      
      expect(stats.queries).toEqual({});
      expect(stats.summary).toBeDefined();
      expect(stats.summary.totalQueries).toBe(0);
    });

    it('should calculate success and slow query rates', () => {
      performanceService.recordQueryStats('test-query', 500, true);
      performanceService.recordQueryStats('test-query', 1500, true);
      performanceService.recordQueryStats('test-query', 200, false);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['test-query'];
      
      expect(queryStats.successRate).toBe('66.67'); // 2 success out of 3
      expect(queryStats.slowQueryRate).toBe('33.33'); // 1 slow out of 3
    });
  });

  describe('getPerformanceSummary', () => {
    it('should provide accurate summary statistics', () => {
      performanceService.recordQueryStats('query1', 500, true);
      performanceService.recordQueryStats('query1', 1500, true);
      performanceService.recordQueryStats('query2', 200, false);
      performanceService.recordQueryStats('query2', 300, true);
      
      const summary = performanceService.getPerformanceSummary();
      
      expect(summary.totalQueries).toBe(4);
      expect(summary.totalSlowQueries).toBe(1);
      expect(summary.totalErrors).toBe(1);
      expect(summary.slowQueryRate).toBe(25.00);
      expect(summary.errorRate).toBe(25.00);
      expect(summary.slowestQuery).toBe('query1');
      expect(summary.maxExecutionTime).toBe(1500);
    });

    it('should handle empty statistics', () => {
      const summary = performanceService.getPerformanceSummary();
      
      expect(summary.totalQueries).toBe(0);
      expect(summary.totalSlowQueries).toBe(0);
      expect(summary.totalErrors).toBe(0);
      expect(summary.avgExecutionTime).toBe(0);
      expect(summary.slowQueryRate).toBe(0);
      expect(summary.errorRate).toBe(0);
      expect(summary.slowestQuery).toBeNull();
      expect(summary.maxExecutionTime).toBe(0);
    });
  });

  describe('getOptimizationRecommendations', () => {
    it('should recommend optimization for slow queries', () => {
      performanceService.recordQueryStats('slow-query', 2000, true);
      performanceService.recordQueryStats('slow-query', 1800, true);
      
      const recommendations = performanceService.getOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThanOrEqual(1);
      const slowQueryRec = recommendations.find(r => r.type === 'slow_query');
      expect(slowQueryRec).toBeDefined();
      expect(slowQueryRec.query).toBe('slow-query');
      expect(slowQueryRec.suggestion).toContain('adding indexes');
    });

    it('should recommend fixes for high error rate queries', () => {
      performanceService.recordQueryStats('error-query', 100, false);
      performanceService.recordQueryStats('error-query', 100, false);
      performanceService.recordQueryStats('error-query', 100, true);
      
      const recommendations = performanceService.getOptimizationRecommendations();
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('high_error_rate');
      expect(recommendations[0].query).toBe('error-query');
      expect(recommendations[0].suggestion).toContain('error handling');
    });

    it('should recommend caching for frequently slow queries', () => {
      // Add 10 queries where 4 are slow (40% slow rate)
      for (let i = 0; i < 6; i++) {
        performanceService.recordQueryStats('frequent-slow', 500, true);
      }
      for (let i = 0; i < 4; i++) {
        performanceService.recordQueryStats('frequent-slow', 1200, true);
      }
      
      const recommendations = performanceService.getOptimizationRecommendations();
      
      const cachingRec = recommendations.find(r => r.type === 'frequently_slow');
      expect(cachingRec).toBeDefined();
      expect(cachingRec.query).toBe('frequent-slow');
      expect(cachingRec.suggestion).toContain('caching');
    });

    it('should return empty recommendations for healthy queries', () => {
      performanceService.recordQueryStats('healthy-query', 100, true);
      performanceService.recordQueryStats('healthy-query', 150, true);
      performanceService.recordQueryStats('healthy-query', 80, true);
      
      const recommendations = performanceService.getOptimizationRecommendations();
      
      expect(recommendations).toHaveLength(0);
    });
  });

  describe('clearStats', () => {
    it('should clear all performance statistics', () => {
      performanceService.recordQueryStats('test-query', 100, true);
      
      let stats = performanceService.getPerformanceStats();
      expect(Object.keys(stats.queries)).toHaveLength(1);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      performanceService.clearStats();
      
      stats = performanceService.getPerformanceStats();
      expect(Object.keys(stats.queries)).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith('📊 Performance statistics cleared');
      
      consoleSpy.mockRestore();
    });
  });

  describe('getDatabaseStats', () => {
    it('should return database statistics placeholder', async () => {
      const dbStats = await performanceService.getDatabaseStats();
      
      expect(dbStats).toBeDefined();
      expect(dbStats.note).toContain('Supabase Admin API access');
      expect(dbStats.active_connections).toBe('N/A (Supabase managed)');
    });
  });

  describe('exportPerformanceData', () => {
    it('should export comprehensive performance data', () => {
      performanceService.recordQueryStats('export-query', 250, true);
      
      const exportData = performanceService.exportPerformanceData();
      
      expect(exportData).toHaveProperty('exported_at');
      expect(exportData).toHaveProperty('query_stats');
      expect(exportData).toHaveProperty('summary');
      expect(exportData).toHaveProperty('configuration');
      
      expect(exportData.query_stats['export-query']).toBeDefined();
      expect(exportData.configuration.slow_query_threshold).toBe(1000);
    });

    it('should export valid JSON structure', () => {
      const exportData = performanceService.exportPerformanceData();
      
      // Should be serializable to JSON
      expect(() => JSON.stringify(exportData)).not.toThrow();
      
      // Should have ISO timestamp
      expect(new Date(exportData.exported_at)).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle very fast queries (< 1ms)', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ data: 'instant' });
      
      await performanceService.monitorQuery('instant-query', mockQuery);
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['instant-query'];
      
      expect(queryStats.minTime).toBeGreaterThanOrEqual(0);
      expect(queryStats.avgTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle concurrent query monitoring', async () => {
      const queries = Array(10).fill().map((_, i) => 
        performanceService.monitorQuery(
          'concurrent-query', 
          () => Promise.resolve({ data: `result-${i}` })
        )
      );
      
      const results = await Promise.all(queries);
      
      expect(results).toHaveLength(10);
      const stats = performanceService.getPerformanceStats();
      expect(stats.queries['concurrent-query'].totalExecutions).toBe(10);
    });

    it('should limit recent execution history', () => {
      // Add more than 100 executions
      for (let i = 0; i < 150; i++) {
        performanceService.recordQueryStats('history-limit', 100, true);
      }
      
      const stats = performanceService.getPerformanceStats();
      const queryStats = stats.queries['history-limit'];
      
      expect(queryStats.recentExecutions).toHaveLength(100);
      expect(queryStats.totalExecutions).toBe(150);
    });
  });
}); 