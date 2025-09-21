/**
 * System Controller
 * REST API controller for system operations
 */

const BaseController = require('./baseController');
const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class SystemController extends BaseController {
  /**
   * Get health status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getHealth = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getHealth');
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      database: {
        connected: true,
        collections: Object.keys(database.data || {}),
        totalRecords: database.getTotalRecordCount()
      }
    };
    
    this.sendSuccess(res, health, 'Health status retrieved successfully');
  });

  /**
   * Get system statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getStats = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getStats');
    
    const stats = database.getAllStats();
    const systemStats = {
      ...stats,
      lastUpdated: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };
    
    this.sendSuccess(res, systemStats, 'System statistics retrieved successfully');
  });

  /**
   * Get API information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getApiInfo = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getApiInfo');
    
    const apiInfo = {
      name: 'GraphQL & REST API Server',
      version: '1.0.0',
      description: 'Scalable API server with GraphQL and REST endpoints',
      endpoints: {
        graphql: '/graphql',
        rest: {
          nodes: '/api/nodes',
          triggers: '/api/triggers',
          actions: '/api/actions',
          responses: '/api/responses',
          resourceTemplates: '/api/resource-templates',
          health: '/api/health',
          stats: '/api/stats'
        }
      },
      features: [
        'GraphQL API with Apollo Server',
        'REST API with Express',
        'JWT Authentication',
        'Modular Architecture',
        'Comprehensive Logging',
        'Error Handling',
        'Pagination Support'
      ],
      documentation: {
        graphql: '/graphql (GraphQL Playground)',
        rest: '/api/docs (Coming Soon)'
      }
    };
    
    this.sendSuccess(res, apiInfo, 'API information retrieved successfully');
  });
}

module.exports = new SystemController();
