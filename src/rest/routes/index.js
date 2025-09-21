/**
 * REST API Routes
 * Centralized route management with modular route definitions
 */

const express = require('express');
const authMiddleware = require('../../core/middleware/authMiddleware');
const errorHandler = require('../../core/middleware/errorHandler');
const logger = require('../../core/logging/logger');

// Import controllers
const nodeController = require('../controllers/nodeController');
const systemController = require('../controllers/systemController');

// Import route modules
const nodeRoutes = require('./nodeRoutes');
const systemRoutes = require('./systemRoutes');

class RouteManager {
  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Setup all routes
   */
  setupRoutes() {
    // API information endpoint (no auth required)
    this.router.get('/', systemController.getApiInfo);
    
    // System routes
    this.router.use('/health', systemRoutes);
    this.router.use('/stats', authMiddleware.authenticate, systemRoutes);
    
    // Resource routes (all require authentication)
    this.router.use('/nodes', authMiddleware.authenticate, nodeRoutes);
    
    // 404 handler for API routes
    this.router.use('*', (req, res) => {
      errorHandler.handleNotFound(req, res);
    });
  }

  /**
   * Get the router instance
   * @returns {Object} Express router
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get route information
   * @returns {Array} Array of route information
   */
  getRouteInfo() {
    const routes = [];
    
    // System routes
    routes.push({
      method: 'GET',
      path: '/',
      description: 'Get API information',
      auth: false
    });
    
    routes.push({
      method: 'GET',
      path: '/health',
      description: 'Get health status',
      auth: false
    });
    
    routes.push({
      method: 'GET',
      path: '/stats',
      description: 'Get system statistics',
      auth: true
    });
    
    // Node routes
    routes.push({
      method: 'GET',
      path: '/nodes',
      description: 'Get all nodes with pagination and filtering',
      auth: true,
      query: ['page', 'limit', 'name', 'root', 'global', 'colour']
    });
    
    routes.push({
      method: 'GET',
      path: '/nodes/:id',
      description: 'Get node by ID',
      auth: true
    });
    
    routes.push({
      method: 'GET',
      path: '/nodes/:id/relations',
      description: 'Get node with related data',
      auth: true
    });
    
    routes.push({
      method: 'GET',
      path: '/nodes/stats',
      description: 'Get node statistics',
      auth: true
    });
    
    return routes;
  }
}

module.exports = new RouteManager();
