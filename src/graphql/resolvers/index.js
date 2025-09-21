/**
 * GraphQL Resolvers
 * Centralized resolver management with modular resolver composition
 */

const authMiddleware = require('../../core/middleware/authMiddleware');
const errorHandler = require('../../core/middleware/errorHandler');
const logger = require('../../core/logging/logger');

// Import modular resolvers
const nodeResolvers = require('./nodeResolvers');
const triggerResolvers = require('./triggerResolvers');
const actionResolvers = require('./actionResolvers');
const responseResolvers = require('./responseResolvers');
const resourceTemplateResolvers = require('./resourceTemplateResolvers');
const systemResolvers = require('./systemResolvers');

// Scalar resolvers
const scalarResolvers = {
  Long: {
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => ast.value
  },
  JSON: {
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => {
      switch (ast.kind) {
        case 'StringValue':
        case 'BooleanValue':
          return ast.value;
        case 'IntValue':
        case 'FloatValue':
          return parseFloat(ast.value);
        case 'ObjectValue':
          return ast.fields.reduce((obj, field) => {
            obj[field.name.value] = JSON.parse(field.value.value);
            return obj;
          }, {});
        case 'ListValue':
          return ast.values.map(value => JSON.parse(value.value));
        default:
          return null;
      }
    }
  }
};

// Main resolvers object
const resolvers = {
  // Query resolvers
  Query: {
    // Node queries
    node: (parent, { nodeId }, context) => {
      try {
        authMiddleware.requireAuth(context);
        return nodeResolvers.getNode(nodeId, context);
      } catch (error) {
        logger.error('Error in node query', { error: error.message, nodeId });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    nodes: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return nodeResolvers.getNodes(args, context);
      } catch (error) {
        logger.error('Error in nodes query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },

    // Trigger queries
    trigger: (parent, { triggerId }, context) => {
      try {
        authMiddleware.requireAuth(context);
        return triggerResolvers.getTrigger(triggerId, context);
      } catch (error) {
        logger.error('Error in trigger query', { error: error.message, triggerId });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    triggers: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return triggerResolvers.getTriggers(args, context);
      } catch (error) {
        logger.error('Error in triggers query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },

    // Action queries
    action: (parent, { actionId }, context) => {
      try {
        authMiddleware.requireAuth(context);
        return actionResolvers.getAction(actionId, context);
      } catch (error) {
        logger.error('Error in action query', { error: error.message, actionId });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    actions: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return actionResolvers.getActions(args, context);
      } catch (error) {
        logger.error('Error in actions query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },

    // Response queries
    response: (parent, { responseId }, context) => {
      try {
        authMiddleware.requireAuth(context);
        return responseResolvers.getResponse(responseId, context);
      } catch (error) {
        logger.error('Error in response query', { error: error.message, responseId });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    responses: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return responseResolvers.getResponses(args, context);
      } catch (error) {
        logger.error('Error in responses query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },

    // Resource Template queries
    resourceTemplate: (parent, { templateId }, context) => {
      try {
        authMiddleware.requireAuth(context);
        return resourceTemplateResolvers.getResourceTemplate(templateId, context);
      } catch (error) {
        logger.error('Error in resourceTemplate query', { error: error.message, templateId });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    resourceTemplates: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return resourceTemplateResolvers.getResourceTemplates(args, context);
      } catch (error) {
        logger.error('Error in resourceTemplates query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },

    // System queries
    health: (parent, args, context) => {
      try {
        // Health check doesn't require authentication
        return systemResolvers.getHealthStatus(context);
      } catch (error) {
        logger.error('Error in health query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    },
    
    stats: (parent, args, context) => {
      try {
        authMiddleware.requireAuth(context);
        return systemResolvers.getSystemStats(context);
      } catch (error) {
        logger.error('Error in stats query', { error: error.message });
        throw errorHandler.handleGraphQLError(error, context);
      }
    }
  },

  // Type resolvers
  NodeObject: nodeResolvers.typeResolvers,
  Trigger: triggerResolvers.typeResolvers,
  Action: actionResolvers.typeResolvers,
  Response: responseResolvers.typeResolvers,
  ResourceTemplate: resourceTemplateResolvers.typeResolvers,

  // Scalar resolvers
  ...scalarResolvers
};

module.exports = resolvers;
