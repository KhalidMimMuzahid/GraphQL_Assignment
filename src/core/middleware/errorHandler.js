/**
 * Centralized Error Handling Middleware
 * Professional error handling with proper logging and response formatting
 */

require("dotenv").config();

const { HTTP_STATUS, ERROR_CODES } = require('../../shared/constants');
const logger = require('../logging/logger');

class ErrorHandler {
  constructor() {
    this.handleRestError = this.handleRestError.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  /**
   * Handle GraphQL errors
   * @param {Error} error - Error object
   * @param {Object} context - GraphQL context
   * @returns {Object} Formatted error response
   */
  handleGraphQLError(error, context = {}) {
    logger.error("GraphQL Error", {
      message: error.message,
      stack: error.stack,
      context: context.operationName || "unknown",
      userId: context.user?.userId || "anonymous",
    });

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return {
      message: isDevelopment ? error.message : "Internal server error",
      code: this.getErrorCode(error),
      extensions: isDevelopment
        ? {
            stack: error.stack,
            originalError: error.message,
          }
        : undefined,
    };
  }

  /**
   * Handle REST API errors
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  handleRestError(error, req, res, next) {
    logger.error("REST API Error", {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId || "anonymous",
      ip: req.ip || req.connection.remoteAddress,
    });

    const statusCode = this.getHttpStatus(error);
    const errorResponse = this.formatErrorResponse(error, req);

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle 404 errors for REST API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  handleNotFound(req, res, next) {
    const error = new Error(
      `Route not found: ${req.method} ${req.originalUrl}`
    );
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.RESOURCE_NOT_FOUND;

    this.handleRestError(error, req, res, next);
  }

  /**
   * Get HTTP status code from error
   * @param {Error} error - Error object
   * @returns {number} HTTP status code
   */
  getHttpStatus(error) {
    if (error.statusCode) return error.statusCode;

    switch (error.code) {
      case ERROR_CODES.AUTHENTICATION_REQUIRED:
      case ERROR_CODES.INVALID_TOKEN:
      case ERROR_CODES.TOKEN_EXPIRED:
        return HTTP_STATUS.UNAUTHORIZED;
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
        return HTTP_STATUS.FORBIDDEN;
      case ERROR_CODES.RESOURCE_NOT_FOUND:
        return HTTP_STATUS.NOT_FOUND;
      case ERROR_CODES.VALIDATION_ERROR:
        return HTTP_STATUS.BAD_REQUEST;
      case ERROR_CODES.DUPLICATE_RESOURCE:
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Get error code from error
   * @param {Error} error - Error object
   * @returns {string} Error code
   */
  getErrorCode(error) {
    if (error.code) return error.code;

    if (error.message.includes("Authentication required")) {
      return ERROR_CODES.AUTHENTICATION_REQUIRED;
    }
    if (
      error.message.includes("Invalid token") ||
      error.message.includes("Token has expired")
    ) {
      return ERROR_CODES.INVALID_TOKEN;
    }
    if (error.message.includes("not found")) {
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    }
    if (error.message.includes("validation")) {
      return ERROR_CODES.VALIDATION_ERROR;
    }

    return ERROR_CODES.INTERNAL_ERROR;
  }

  /**
   * Format error response for REST API
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @returns {Object} Formatted error response
   */
  formatErrorResponse(error, req) {
    const isDevelopment = process.env.NODE_ENV === "development";
    const statusCode = this.getHttpStatus(error);

    const response = {
      success: false,
      error: {
        code: this.getErrorCode(error),
        message: error.message,
        statusCode,
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    };

    // Add additional details in development
    if (isDevelopment) {
      response.error.stack = error.stack;
      response.error.originalError = error.message;
    }

    return response;
  }

  /**
   * Create custom error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} statusCode - HTTP status code
   * @returns {Error} Custom error
   */
  createError(
    message,
    code = ERROR_CODES.INTERNAL_ERROR,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  /**
   * Create validation error
   * @param {string} message - Error message
   * @param {Array} details - Validation details
   * @returns {Error} Validation error
   */
  createValidationError(message, details = []) {
    const error = this.createError(
      message,
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST
    );
    error.details = details;
    return error;
  }

  /**
   * Create authentication error
   * @param {string} message - Error message
   * @returns {Error} Authentication error
   */
  createAuthError(message = "Authentication required") {
    return this.createError(
      message,
      ERROR_CODES.AUTHENTICATION_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  /**
   * Create not found error
   * @param {string} resource - Resource name
   * @param {string} id - Resource ID
   * @returns {Error} Not found error
   */
  createNotFoundError(resource, id) {
    return this.createError(
      `${resource} with ID '${id}' not found`,
      ERROR_CODES.RESOURCE_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND
    );
  }
}

module.exports = new ErrorHandler();
