/**
 * Authentication Middleware
 * Middleware for handling authentication and authorization
 */

const authService = require('../auth');
const errorHandler = require('./errorHandler');
const logger = require('../logging/logger');

class AuthMiddleware {
  /**
   * GraphQL authentication middleware
   * @param {Object} context - GraphQL context
   * @param {Object} context.user - User object
   * @param {boolean} context.authenticated - Authentication status
   * @param {string} context.error - Authentication error
   * @returns {Object} User object
   * @throws {Error} If authentication fails
   */
  requireAuth(context) {
    if (!context.authenticated || !context.user) {
      logger.warn('Authentication required for GraphQL operation', {
        error: context.error || 'No user in context'
      });
      throw errorHandler.createAuthError(context.error || 'Authentication required');
    }
    
    return context.user;
  }

  /**
   * GraphQL role-based authorization middleware
   * @param {Object} context - GraphQL context
   * @param {string} requiredRole - Required role
   * @returns {Object} User object
   * @throws {Error} If authorization fails
   */
  requireRole(context, requiredRole) {
    const user = this.requireAuth(context);
    
    if (!authService.hasRole(user, requiredRole)) {
      logger.warn('Insufficient permissions for GraphQL operation', {
        userId: user.userId,
        userRole: user.role,
        requiredRole
      });
      throw errorHandler.createError(
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }
    
    return user;
  }

  /**
   * GraphQL resource permission middleware
   * @param {Object} context - GraphQL context
   * @param {string} resource - Resource name
   * @param {string} action - Action (read, write, delete)
   * @returns {Object} User object
   * @throws {Error} If permission check fails
   */
  requirePermission(context, resource, action = 'read') {
    const user = this.requireAuth(context);
    
    if (!authService.hasPermission(user, resource, action)) {
      logger.warn('Insufficient resource permissions', {
        userId: user.userId,
        userRole: user.role,
        resource,
        action
      });
      throw errorHandler.createError(
        `Insufficient permissions for ${action} on ${resource}`,
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }
    
    return user;
  }

  /**
   * REST API authentication middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  authenticate(req, res, next) {
    try {
      const authContext = authService.createAuthContext(req);
      
      if (!authContext.authenticated) {
        logger.warn('Authentication failed for REST API request', {
          method: req.method,
          url: req.originalUrl,
          error: authContext.error
        });
        
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: authContext.error || 'Authentication required'
          }
        });
      }
      
      req.user = authContext.user;
      req.authenticated = true;
      next();
    } catch (error) {
      logger.error('Authentication middleware error', error);
      next(error);
    }
  }

  /**
   * REST API role-based authorization middleware
   * @param {string} requiredRole - Required role
   * @returns {Function} Middleware function
   */
  authorize(requiredRole) {
    return (req, res, next) => {
      try {
        if (!req.authenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required'
            }
          });
        }
        
        if (!authService.hasRole(req.user, requiredRole)) {
          logger.warn('Insufficient permissions for REST API request', {
            userId: req.user.userId,
            userRole: req.user.role,
            requiredRole,
            method: req.method,
            url: req.originalUrl
          });
          
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions'
            }
          });
        }
        
        next();
      } catch (error) {
        logger.error('Authorization middleware error', error);
        next(error);
      }
    };
  }

  /**
   * REST API resource permission middleware
   * @param {string} resource - Resource name
   * @param {string} action - Action (read, write, delete)
   * @returns {Function} Middleware function
   */
  requireResourcePermission(resource, action = 'read') {
    return (req, res, next) => {
      try {
        if (!req.authenticated || !req.user) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required'
            }
          });
        }
        
        if (!authService.hasPermission(req.user, resource, action)) {
          logger.warn('Insufficient resource permissions for REST API request', {
            userId: req.user.userId,
            userRole: req.user.role,
            resource,
            action,
            method: req.method,
            url: req.originalUrl
          });
          
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `Insufficient permissions for ${action} on ${resource}`
            }
          });
        }
        
        next();
      } catch (error) {
        logger.error('Resource permission middleware error', error);
        next(error);
      }
    };
  }

  /**
   * Optional authentication middleware (doesn't fail if no auth)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  optionalAuth(req, res, next) {
    try {
      const authContext = authService.createAuthContext(req);
      
      if (authContext.authenticated) {
        req.user = authContext.user;
        req.authenticated = true;
      } else {
        req.user = null;
        req.authenticated = false;
      }
      
      next();
    } catch (error) {
      logger.error('Optional authentication middleware error', error);
      req.user = null;
      req.authenticated = false;
      next();
    }
  }
}

module.exports = new AuthMiddleware();
