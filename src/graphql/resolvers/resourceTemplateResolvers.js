/**
 * Resource Template Resolvers
 * GraphQL resolvers for Resource Template-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class ResourceTemplateResolvers {
  /**
   * Get a single resource template by ID
   * @param {string} templateId - Template ID
   * @param {Object} context - GraphQL context
   * @returns {Object|null} Resource template object or null
   */
  getResourceTemplate(templateId, context) {
    if (!templateId) {
      logger.warn('ResourceTemplate query called without templateId', { userId: context.user?.userId });
      return null;
    }

    logger.debug('Fetching resource template', { templateId, userId: context.user?.userId });
    return database.findById('resourceTemplates', templateId);
  }

  /**
   * Get multiple resource templates with pagination and filtering
   * @param {Object} args - Query arguments
   * @param {Object} context - GraphQL context
   * @returns {Object} Connection object
   */
  getResourceTemplates(args, context) {
    const { first = 10, after, filter = {} } = args;
    
    logger.debug('Fetching resource templates with pagination', {
      first,
      after,
      filter,
      userId: context.user?.userId
    });

    let resourceTemplates = database.findAll('resourceTemplates');

    // Apply filters
    if (filter.name) {
      resourceTemplates = resourceTemplates.filter(template => 
        template.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }
    if (filter.integrationId) {
      resourceTemplates = resourceTemplates.filter(template => 
        template.integrationId === filter.integrationId
      );
    }
    if (filter.key) {
      resourceTemplates = resourceTemplates.filter(template => 
        template.key === filter.key
      );
    }

    // Simple pagination
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedTemplates = resourceTemplates.slice(startIndex, endIndex);

    return {
      edges: paginatedTemplates.map((template, index) => ({
        node: template,
        cursor: (startIndex + index).toString()
      })),
      pageInfo: {
        hasNextPage: endIndex < resourceTemplates.length,
        hasPreviousPage: startIndex > 0,
        startCursor: paginatedTemplates.length > 0 ? startIndex.toString() : null,
        endCursor: paginatedTemplates.length > 0 ? (endIndex - 1).toString() : null
      },
      totalCount: resourceTemplates.length
    };
  }

  /**
   * Type resolvers for ResourceTemplate
   */
  get typeResolvers() {
    return {
      // Map _id to id for GraphQL
      id: (parent) => parent._id
    };
  }
}

module.exports = new ResourceTemplateResolvers();
