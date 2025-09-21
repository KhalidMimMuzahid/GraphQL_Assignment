/**
 * GraphQL Context Factory
 * Creates and manages GraphQL context for each request
 */

const authService = require('../../core/auth');
const logger = require('../../core/logging/logger');

class GraphQLContextFactory {
  /**
   * Create GraphQL context
   * @param {Object} params - Context parameters
   * @param {Object} params.req - Express request object
   * @param {Object} params.res - Express response object
   * @returns {Object} GraphQL context
   */
  createContext({ req, res }) {
    const authContext = authService.createAuthContext(req);
    
    const context = {
      // Authentication
      user: authContext.user,
      authenticated: authContext.authenticated,
      authError: authContext.error,
      
      // Request information
      request: req,
      response: res,
      
      // Request metadata
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      
      // User agent and IP
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      
      // GraphQL specific
      operationName: null,
      variables: null,
      
      // Performance tracking
      startTime: Date.now()
    };

    // Log context creation
    logger.debug('GraphQL context created', {
      requestId: context.requestId,
      authenticated: context.authenticated,
      userId: context.user?.userId || 'anonymous',
      userAgent: context.userAgent,
      ip: context.ip
    });

    return context;
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update context with operation information
   * @param {Object} context - GraphQL context
   * @param {string} operationName - Operation name
   * @param {Object} variables - Operation variables
   */
  updateContextWithOperation(context, operationName, variables) {
    context.operationName = operationName;
    context.variables = variables;
    
    logger.debug('GraphQL operation started', {
      requestId: context.requestId,
      operationName,
      variables: Object.keys(variables || {}),
      userId: context.user?.userId || 'anonymous'
    });
  }

  /**
   * Finalize context after operation completion
   * @param {Object} context - GraphQL context
   * @param {boolean} success - Whether operation was successful
   * @param {Error} error - Error if operation failed
   */
  finalizeContext(context, success = true, error = null) {
    const duration = Date.now() - context.startTime;
    
    logger.logGraphQLOperation(
      context.operationName || 'unknown',
      context.operationName || 'unknown',
      duration,
      success
    );

    if (error) {
      logger.error('GraphQL operation failed', {
        requestId: context.requestId,
        operationName: context.operationName,
        duration,
        error: error.message,
        userId: context.user?.userId || 'anonymous'
      });
    }
  }
}

module.exports = new GraphQLContextFactory();
