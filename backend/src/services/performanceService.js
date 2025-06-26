// const { supabase } = require('../config/supabase.js');

/**
 * Performance monitoring service for database queries
 * Tracks slow queries and provides optimization insights
 */
class PerformanceService {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.maxStatsHistory = 1000;
  }

  /**
   * Wraps a Supabase query with performance monitoring
   * @param {string} queryName - Name/description of the query
   * @param {Function} queryFunction - Function that executes the query
   * @returns {Promise} - Query result with performance metrics
   */
  async monitorQuery(queryName, queryFunction) {
    const startTime = Date.now();
    
    try {
      const result = await queryFunction();
      const executionTime = Date.now() - startTime;
      
      // Log performance metrics
      this.recordQueryStats(queryName, executionTime, true);
      
      // Log slow queries
      if (executionTime > this.slowQueryThreshold) {
        console.warn(`🐌 SLOW QUERY DETECTED: ${queryName} took ${executionTime}ms`);
      }
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.recordQueryStats(queryName, executionTime, false);
      
      console.error(`❌ QUERY ERROR: ${queryName} failed after ${executionTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Records query statistics for analysis
   * @param {string} queryName - Name of the query
   * @param {number} executionTime - Execution time in milliseconds
   * @param {boolean} success - Whether query was successful
   */
  recordQueryStats(queryName, executionTime, success) {
    if (!this.queryStats.has(queryName)) {
      this.queryStats.set(queryName, {
        totalExecutions: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        successCount: 0,
        errorCount: 0,
        slowQueryCount: 0,
        recentExecutions: []
      });
    }

    const stats = this.queryStats.get(queryName);
    
    // Update counters
    stats.totalExecutions++;
    stats.totalTime += executionTime;
    stats.avgTime = Math.round(stats.totalTime / stats.totalExecutions);
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    
    if (success) {
      stats.successCount++;
    } else {
      stats.errorCount++;
    }
    
    if (executionTime > this.slowQueryThreshold) {
      stats.slowQueryCount++;
    }
    
    // Keep recent execution history (for trend analysis)
    stats.recentExecutions.push({
      timestamp: new Date().toISOString(),
      executionTime,
      success
    });
    
    // Limit history size
    if (stats.recentExecutions.length > 100) {
      stats.recentExecutions.shift();
    }
  }

  /**
   * Get performance statistics for all queries
   * @returns {Object} - Performance statistics
   */
  getPerformanceStats() {
    const stats = {};
    
    this.queryStats.forEach((queryStats, queryName) => {
      stats[queryName] = {
        ...queryStats,
        successRate: (queryStats.successCount / queryStats.totalExecutions * 100).toFixed(2),
        slowQueryRate: (queryStats.slowQueryCount / queryStats.totalExecutions * 100).toFixed(2)
      };
    });
    
    return {
      queries: stats,
      summary: this.getPerformanceSummary()
    };
  }

  /**
   * Get performance summary with insights
   * @returns {Object} - Performance summary
   */
  getPerformanceSummary() {
    let totalQueries = 0;
    let totalSlowQueries = 0;
    let totalErrors = 0;
    let avgExecutionTime = 0;
    let slowestQuery = null;
    let maxExecutionTime = 0;

    this.queryStats.forEach((stats, queryName) => {
      totalQueries += stats.totalExecutions;
      totalSlowQueries += stats.slowQueryCount;
      totalErrors += stats.errorCount;
      avgExecutionTime += stats.avgTime;
      
      if (stats.maxTime > maxExecutionTime) {
        maxExecutionTime = stats.maxTime;
        slowestQuery = queryName;
      }
    });

    const numQueries = this.queryStats.size;
    avgExecutionTime = numQueries > 0 ? Math.round(avgExecutionTime / numQueries) : 0;

    return {
      totalQueries,
      totalSlowQueries,
      totalErrors,
      avgExecutionTime,
      slowQueryRate: totalQueries > 0 ? parseFloat((totalSlowQueries / totalQueries * 100).toFixed(2)) : 0,
      errorRate: totalQueries > 0 ? parseFloat((totalErrors / totalQueries * 100).toFixed(2)) : 0,
      slowestQuery,
      maxExecutionTime,
      recommendations: this.getOptimizationRecommendations()
    };
  }

  /**
   * Get optimization recommendations based on performance data
   * @returns {Array} - Array of optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    
    this.queryStats.forEach((stats, queryName) => {
      // High average execution time
      if (stats.avgTime > this.slowQueryThreshold) {
        recommendations.push({
          type: 'slow_query',
          query: queryName,
          avgTime: stats.avgTime,
          suggestion: 'Consider adding indexes or optimizing the query structure'
        });
      }
      
      // High error rate
      if (stats.errorCount / stats.totalExecutions > 0.05) { // 5% error rate
        recommendations.push({
          type: 'high_error_rate',
          query: queryName,
          errorRate: (stats.errorCount / stats.totalExecutions * 100).toFixed(2),
          suggestion: 'Review query logic and add proper error handling'
        });
      }
      
      // Frequently slow queries
      if (stats.slowQueryCount / stats.totalExecutions > 0.3) { // 30% slow rate
        recommendations.push({
          type: 'frequently_slow',
          query: queryName,
          slowRate: (stats.slowQueryCount / stats.totalExecutions * 100).toFixed(2),
          suggestion: 'This query is frequently slow - consider caching or database optimization'
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Clear performance statistics
   */
  clearStats() {
    this.queryStats.clear();
    console.log('📊 Performance statistics cleared');
  }

  /**
   * Get database connection statistics
   * @returns {Promise<Object>} - Database connection statistics
   */
  async getDatabaseStats() {
    try {
      // For now, return mock data since we don't have direct PostgreSQL access
      // These queries would work with PostgreSQL but need Supabase Admin API:
      // - 'SELECT COUNT(*) as active_connections FROM pg_stat_activity WHERE state = \'active\''
      // - 'SELECT COUNT(*) as total_connections FROM pg_stat_activity'
      // - 'SELECT query, state, query_start, now() - query_start as duration FROM pg_stat_activity WHERE state != \'idle\' ORDER BY duration DESC LIMIT 10'
      
      return {
        active_connections: 'N/A (Supabase managed)',
        total_connections: 'N/A (Supabase managed)',
        longest_queries: 'N/A (Supabase managed)',
        note: 'Database connection stats require Supabase Admin API access'
      };
    } catch (error) {
      console.error('Error fetching database stats:', error);
      return {
        error: 'Unable to fetch database statistics',
        message: error.message
      };
    }
  }

  /**
   * Export performance data for analysis
   * @returns {Object} - Exportable performance data
   */
  exportPerformanceData() {
    return {
      exported_at: new Date().toISOString(),
      query_stats: Object.fromEntries(this.queryStats),
      summary: this.getPerformanceSummary(),
      configuration: {
        slow_query_threshold: this.slowQueryThreshold,
        max_stats_history: this.maxStatsHistory
      }
    };
  }
}

// Singleton instance
const performanceService = new PerformanceService();

module.exports = performanceService; 