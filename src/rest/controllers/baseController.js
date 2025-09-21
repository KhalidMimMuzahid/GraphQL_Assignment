/**
 * Base Controller
 * Common functionality for all REST API controllers
 */

const { HTTP_STATUS } = require('../../shared/constants');
const logger = require('../../core/logging/logger');

class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    logger.info('API Success Response', {
      statusCode,
      message,
      hasData: data !== null
    });

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} details - Error details
   */
  sendError(res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString()
      }
    };

    if (details) {
      response.error.details = details;
    }

    logger.error('API Error Response', {
      statusCode,
      message,
      details
    });

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  sendValidationError(res, errors, message = 'Validation failed') {
    this.sendError(res, message, HTTP_STATUS.BAD_REQUEST, { validation: errors });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name
   * @param {string} id - Resource ID
   */
  sendNotFound(res, resource, id) {
    this.sendError(res, `${resource} with ID '${id}' not found`, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  sendUnauthorized(res, message = 'Authentication required') {
    this.sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  sendForbidden(res, message = 'Insufficient permissions') {
    this.sendError(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Handle async controller methods
   * @param {Function} fn - Async function
   * @returns {Function} Wrapped function
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Get pagination parameters from query
   * @param {Object} query - Query parameters
   * @returns {Object} Pagination parameters
   */
  getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Create paginated response
   * @param {Array} data - Data array
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @returns {Object} Paginated response
   */
  createPaginatedResponse(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array} requiredFields - Required field names
   * @returns {Array} Validation errors
   */
  validateRequiredFields(data, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    
    return errors;
  }

  /**
   * Log API request
   * @param {Object} req - Express request object
   * @param {string} action - Action being performed
   */
  logRequest(req, action) {
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      action,
      userId: req.user?.userId || 'anonymous',
      ip: req.ip || req.connection.remoteAddress
    });
  }
}

module.exports = BaseController;
