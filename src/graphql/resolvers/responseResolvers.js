/**
 * Response Resolvers
 * GraphQL resolvers for Response-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class ResponseResolvers {
  /**
   * Get a single response by ID
   * @param {string} responseId - Response ID
   * @param {Object} context - GraphQL context
   * @returns {Object|null} Response object or null
   */
  getResponse(responseId, context) {
    if (!responseId) {
      logger.warn('Response query called without responseId', { userId: context.user?.userId });
      return null;
    }

    logger.debug('Fetching response', { responseId, userId: context.user?.userId });
    return database.findById('responses', responseId);
  }

  /**
   * Get multiple responses with pagination and filtering
   * @param {Object} args - Query arguments
   * @param {Object} context - GraphQL context
   * @returns {Object} Connection object
   */
  getResponses(args, context) {
    const { first = 10, after, filter = {} } = args;
    
    logger.debug('Fetching responses with pagination', {
      first,
      after,
      filter,
      userId: context.user?.userId
    });

    let responses = database.findAll('responses');

    // Apply filters
    if (filter.name) {
      responses = responses.filter(response => 
        response.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }

    // Simple pagination
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedResponses = responses.slice(startIndex, endIndex);

    return {
      edges: paginatedResponses.map((response, index) => ({
        node: response,
        cursor: (startIndex + index).toString()
      })),
      pageInfo: {
        hasNextPage: endIndex < responses.length,
        hasPreviousPage: startIndex > 0,
        startCursor: paginatedResponses.length > 0 ? startIndex.toString() : null,
        endCursor: paginatedResponses.length > 0 ? (endIndex - 1).toString() : null
      },
      totalCount: responses.length
    };
  }

  /**
   * Type resolvers for Response
   */
  get typeResolvers() {
    return {
      // Map _id to id for GraphQL
      id: (parent) => parent._id
    };
  }
}

module.exports = new ResponseResolvers();
