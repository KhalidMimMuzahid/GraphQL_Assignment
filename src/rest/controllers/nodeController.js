/**
 * Node Controller
 * REST API controller for Node operations
 */

const BaseController = require('./baseController');
const database = require('../../core/database');
const logger = require('../../core/logging/logger');

class NodeController extends BaseController {
  /**
   * Get all nodes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNodes = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getNodes');
    
    const { page, limit, offset } = this.getPaginationParams(req.query);
    const { name, root, global, colour } = req.query;
    
    let nodes = database.findAll('nodes');
    
    // Apply filters
    if (name) {
      nodes = nodes.filter(node => 
        node.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (root !== undefined) {
      nodes = nodes.filter(node => node.root === (root === 'true'));
    }
    if (global !== undefined) {
      nodes = nodes.filter(node => node.global === (global === 'true'));
    }
    if (colour) {
      nodes = nodes.filter(node => node.colour === colour);
    }
    
    const total = nodes.length;
    const paginatedNodes = nodes.slice(offset, offset + limit);
    
    const response = this.createPaginatedResponse(paginatedNodes, page, limit, total);
    this.sendSuccess(res, response, `Found ${total} nodes`);
  });

  /**
   * Get node by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNodeById = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getNodeById');
    
    const { id } = req.params;
    const node = database.findById('nodes', id);
    
    if (!node) {
      return this.sendNotFound(res, 'Node', id);
    }
    
    this.sendSuccess(res, node, 'Node retrieved successfully');
  });

  /**
   * Get node with related data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNodeWithRelations = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getNodeWithRelations');
    
    const { id } = req.params;
    const node = database.findById('nodes', id);
    
    if (!node) {
      return this.sendNotFound(res, 'Node', id);
    }
    
    // Get related data
    const relatedData = {
      ...node,
      trigger: node.triggerId ? database.findById('triggers', node.triggerId) : null,
      responses: node.responses ? database.findByIds('responses', node.responses) : [],
      actions: node.actions ? database.findByIds('actions', node.actions) : [],
      parents: node.parents ? database.findParentNodesByCompositeIds(node.parents) : []
    };
    
    this.sendSuccess(res, relatedData, 'Node with relations retrieved successfully');
  });

  /**
   * Get node statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNodeStats = this.asyncHandler(async (req, res) => {
    this.logRequest(req, 'getNodeStats');
    
    const nodes = database.findAll('nodes');
    const stats = {
      total: nodes.length,
      rootNodes: nodes.filter(node => node.root).length,
      globalNodes: nodes.filter(node => node.global).length,
      withTriggers: nodes.filter(node => node.triggerId).length,
      withActions: nodes.filter(node => node.actions && node.actions.length > 0).length,
      withResponses: nodes.filter(node => node.responses && node.responses.length > 0).length,
      colourDistribution: this.getColourDistribution(nodes)
    };
    
    this.sendSuccess(res, stats, 'Node statistics retrieved successfully');
  });

  /**
   * Get colour distribution
   * @param {Array} nodes - Array of nodes
   * @returns {Object} Colour distribution
   */
  getColourDistribution(nodes) {
    const distribution = {};
    nodes.forEach(node => {
      const colour = node.colour || 'none';
      distribution[colour] = (distribution[colour] || 0) + 1;
    });
    return distribution;
  }
}

module.exports = new NodeController();
