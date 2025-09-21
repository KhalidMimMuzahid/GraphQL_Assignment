/**
 * System Resolvers
 * GraphQL resolvers for system-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class SystemResolvers {
  /**
   * Get health status
   * @param {Object} context - GraphQL context
   * @returns {Object} Health status object
   */
  getHealthStatus(context) {
    logger.debug('Fetching health status', { userId: context.user?.userId });
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Get system statistics
   * @param {Object} context - GraphQL context
   * @returns {Object} System stats object
   */
  getSystemStats(context) {
    logger.debug('Fetching system stats', { userId: context.user?.userId });
    
    const stats = database.getAllStats();
    
    return {
      totalNodes: stats.nodes?.count || 0,
      totalTriggers: stats.triggers?.count || 0,
      totalActions: stats.actions?.count || 0,
      totalResponses: stats.responses?.count || 0,
      totalResourceTemplates: stats.resourceTemplates?.count || 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new SystemResolvers();
