/**
 * Trigger Resolvers
 * GraphQL resolvers for Trigger-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class TriggerResolvers {
  /**
   * Get a single trigger by ID
   * @param {string} triggerId - Trigger ID
   * @param {Object} context - GraphQL context
   * @returns {Object|null} Trigger object or null
   */
  getTrigger(triggerId, context) {
    if (!triggerId) {
      logger.warn('Trigger query called without triggerId', { userId: context.user?.userId });
      return null;
    }

    logger.debug('Fetching trigger', { triggerId, userId: context.user?.userId });
    return database.findById('triggers', triggerId);
  }

  /**
   * Get multiple triggers with pagination and filtering
   * @param {Object} args - Query arguments
   * @param {Object} context - GraphQL context
   * @returns {Object} Connection object
   */
  getTriggers(args, context) {
    const { first = 10, after, filter = {} } = args;
    
    logger.debug('Fetching triggers with pagination', {
      first,
      after,
      filter,
      userId: context.user?.userId
    });

    let triggers = database.findAll('triggers');

    // Apply filters
    if (filter.name) {
      triggers = triggers.filter(trigger => 
        trigger.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }
    if (filter.resourceTemplateId) {
      triggers = triggers.filter(trigger => trigger.resourceTemplateId === filter.resourceTemplateId);
    }

    // Simple pagination
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedTriggers = triggers.slice(startIndex, endIndex);

    return {
      edges: paginatedTriggers.map((trigger, index) => ({
        node: trigger,
        cursor: (startIndex + index).toString()
      })),
      pageInfo: {
        hasNextPage: endIndex < triggers.length,
        hasPreviousPage: startIndex > 0,
        startCursor: paginatedTriggers.length > 0 ? startIndex.toString() : null,
        endCursor: paginatedTriggers.length > 0 ? (endIndex - 1).toString() : null
      },
      totalCount: triggers.length
    };
  }

  /**
   * Type resolvers for Trigger
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

module.exports = new TriggerResolvers();
