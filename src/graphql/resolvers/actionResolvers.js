/**
 * Action Resolvers
 * GraphQL resolvers for Action-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class ActionResolvers {
  /**
   * Get a single action by ID
   * @param {string} actionId - Action ID
   * @param {Object} context - GraphQL context
   * @returns {Object|null} Action object or null
   */
  getAction(actionId, context) {
    if (!actionId) {
      logger.warn('Action query called without actionId', { userId: context.user?.userId });
      return null;
    }

    logger.debug('Fetching action', { actionId, userId: context.user?.userId });
    return database.findById('actions', actionId);
  }

  /**
   * Get multiple actions with pagination and filtering
   * @param {Object} args - Query arguments
   * @param {Object} context - GraphQL context
   * @returns {Object} Connection object
   */
  getActions(args, context) {
    const { first = 10, after, filter = {} } = args;
    
    logger.debug('Fetching actions with pagination', {
      first,
      after,
      filter,
      userId: context.user?.userId
    });

    let actions = database.findAll('actions');

    // Apply filters
    if (filter.name) {
      actions = actions.filter(action => 
        action.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }
    if (filter.resourceTemplateId) {
      actions = actions.filter(action => action.resourceTemplateId === filter.resourceTemplateId);
    }

    // Simple pagination
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedActions = actions.slice(startIndex, endIndex);

    return {
      edges: paginatedActions.map((action, index) => ({
        node: action,
        cursor: (startIndex + index).toString()
      })),
      pageInfo: {
        hasNextPage: endIndex < actions.length,
        hasPreviousPage: startIndex > 0,
        startCursor: paginatedActions.length > 0 ? startIndex.toString() : null,
        endCursor: paginatedActions.length > 0 ? (endIndex - 1).toString() : null
      },
      totalCount: actions.length
    };
  }

  /**
   * Type resolvers for Action
   */
  get typeResolvers() {
    return {
      // Resolve resourceTemplate field
      resourceTemplate: (parent) => {
        if (!parent.resourceTemplateId) return null;
        return database.findById('resourceTemplates', parent.resourceTemplateId);
      },

      // Map _id to id for GraphQL
      id: (parent) => parent._id
    };
  }
}

module.exports = new ActionResolvers();
