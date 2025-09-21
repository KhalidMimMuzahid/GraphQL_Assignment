/**
 * Node Resolvers
 * GraphQL resolvers for Node-related operations
 */

const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class NodeResolvers {
  /**
   * Get a single node by ID
   * @param {string} nodeId - Node ID
   * @param {Object} context - GraphQL context
   * @returns {Object|null} Node object or null
   */
  getNode(nodeId, context) {
    if (!nodeId) {
      logger.warn('Node query called without nodeId', { userId: context.user?.userId });
      return null;
    }

    logger.debug('Fetching node', { nodeId, userId: context.user?.userId });
    return database.findById('nodes', nodeId);
  }

  /**
   * Get multiple nodes with pagination and filtering
   * @param {Object} args - Query arguments
   * @param {Object} context - GraphQL context
   * @returns {Object} Connection object
   */
  getNodes(args, context) {
    const { first = 10, after, filter = {} } = args;
    
    logger.debug('Fetching nodes with pagination', {
      first,
      after,
      filter,
      userId: context.user?.userId
    });

    let nodes = database.findAll('nodes');

    // Apply filters
    if (filter.name) {
      nodes = nodes.filter(node => 
        node.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }
    if (filter.root !== undefined) {
      nodes = nodes.filter(node => node.root === filter.root);
    }
    if (filter.global !== undefined) {
      nodes = nodes.filter(node => node.global === filter.global);
    }
    if (filter.colour) {
      nodes = nodes.filter(node => node.colour === filter.colour);
    }

    // Simple pagination (in a real app, you'd use cursor-based pagination)
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedNodes = nodes.slice(startIndex, endIndex);

    return {
      edges: paginatedNodes.map((node, index) => ({
        node,
        cursor: (startIndex + index).toString()
      })),
      pageInfo: {
        hasNextPage: endIndex < nodes.length,
        hasPreviousPage: startIndex > 0,
        startCursor: paginatedNodes.length > 0 ? startIndex.toString() : null,
        endCursor: paginatedNodes.length > 0 ? (endIndex - 1).toString() : null
      },
      totalCount: nodes.length
    };
  }

  /**
   * Type resolvers for NodeObject
   */
  get typeResolvers() {
    return {
      // Resolve trigger field
      trigger: (parent) => {
        if (!parent.triggerId) return null;
        return database.findById('triggers', parent.triggerId);
      },

      // Resolve responses field
      responses: (parent) => {
        if (!parent.responses || !Array.isArray(parent.responses)) return [];
        return database.findByIds('responses', parent.responses);
      },

      // Resolve actions field
      actions: (parent) => {
        if (!parent.actions || !Array.isArray(parent.actions)) return [];
        return database.findByIds('actions', parent.actions);
      },

      // Resolve parents field
      parents: (parent) => {
        if (!parent.parents || !Array.isArray(parent.parents)) return [];
        return database.findParentNodesByCompositeIds(parent.parents);
      },

      // Map responseIds from the responses array
      responseIds: (parent) => {
        return parent.responses || [];
      },

      // Map actionIds from the actions array  
      actionIds: (parent) => {
        return parent.actions || [];
      },

      // Map parentIds from the parents array
      parentIds: (parent) => {
        return parent.parents || [];
      },

      // Map _id to id for GraphQL
      id: (parent) => parent._id
    };
  }
}

module.exports = new NodeResolvers();
