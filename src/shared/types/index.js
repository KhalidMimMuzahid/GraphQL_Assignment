/**
 * Shared Type Definitions
 * Common type definitions used across the application
 */

/**
 * User type definition
 * @typedef {Object} User
 * @property {string} userId - Unique user identifier
 * @property {string} email - User email address
 * @property {string} role - User role (admin, user, guest)
 * @property {number} iat - Token issued at timestamp
 * @property {number} exp - Token expiration timestamp
 */

/**
 * GraphQL Context type definition
 * @typedef {Object} GraphQLContext
 * @property {User|null} user - Authenticated user or null
 * @property {string|null} authError - Authentication error message
 * @property {Object} request - Express request object
 * @property {Object} response - Express response object
 */

/**
 * API Response type definition
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} data - Response data
 * @property {string|null} message - Response message
 * @property {Object|null} error - Error details
 * @property {number} statusCode - HTTP status code
 */

/**
 * Pagination type definition
 * @typedef {Object} Pagination
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNext - Whether there's a next page
 * @property {boolean} hasPrev - Whether there's a previous page
 */

/**
 * Validation Error type definition
 * @typedef {Object} ValidationError
 * @property {string} field - Field name that failed validation
 * @property {string} message - Validation error message
 * @property {*} value - Value that failed validation
 */

module.exports = {
  // Export types for JSDoc usage
};
