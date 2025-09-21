/**
 * Main Application
 * Enterprise-grade application with GraphQL and REST APIs
 */

const express = require('express');
const cors = require('cors');
const { json } = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http');

// Import core modules
const config = require('./config');
const logger = require('./core/logging/logger');
const database = require('./core/database');
const errorHandler = require('./core/middleware/errorHandler');
const contextFactory = require('./graphql/context');

// Import GraphQL modules
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');

// Import REST modules
const routeManager = require('./rest/routes');

class Application {
  constructor() {
    this.app = express();
    this.httpServer = null;
    this.apolloServer = null;
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      logger.info('Initializing application...');
      
      // Initialize database
      await database.initialize();
      
      // Create HTTP server first
      this.httpServer = http.createServer(this.app);
      
      // Setup Express middleware
      this.setupMiddleware();
      
      // Setup Apollo Server
      await this.setupApolloServer();
      
      // Setup REST API routes
      this.setupRestRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      this.initialized = true;
      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // CORS configuration
    this.app.use(cors(config.server.cors));
    
    // Body parsing
    this.app.use(json());
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.logHttpRequest(req, res, duration);
      });
      
      next();
    });
  }

  /**
   * Setup Apollo Server
   */
  async setupApolloServer() {
    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })],
      introspection: config.graphql.introspection,
      playground: config.graphql.playground,
      formatError: (error) => {
        logger.error('GraphQL Error', {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions
        });
        
        return errorHandler.handleGraphQLError(error);
      }
    });

    await this.apolloServer.start();
    
    // Apply GraphQL middleware
    this.app.use('/graphql', expressMiddleware(this.apolloServer, {
      context: contextFactory.createContext.bind(contextFactory)
    }));
  }

  /**
   * Setup REST API routes
   */
  setupRestRoutes() {
    // Apply REST API routes
    this.app.use('/api', routeManager.getRouter());
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'GraphQL & REST API Server',
        version: '1.0.0',
        endpoints: {
          graphql: '/graphql',
          rest: '/api',
          health: '/api/health'
        },
        documentation: {
          graphql: 'Visit /graphql for GraphQL Playground',
          rest: 'Visit /api for REST API information'
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use('*', errorHandler.handleNotFound);
    
    // Global error handler
    this.app.use(errorHandler.handleRestError);
  }

  /**
   * Start the server
   */
  async start() {
    if (!this.initialized) {
      throw new Error('Application not initialized. Call initialize() first.');
    }

    const PORT = config.server.port;
    const HOST = config.server.host;
    
    await new Promise((resolve) => {
      this.httpServer.listen({ port: PORT, host: HOST }, resolve);
    });
    
    logger.info('🚀 Server started successfully', {
      port: PORT,
      host: HOST,
      environment: config.server.environment,
      graphqlEndpoint: `http://${HOST}:${PORT}/graphql`,
      restEndpoint: `http://${HOST}:${PORT}/api`,
      healthEndpoint: `http://${HOST}:${PORT}/api/health`
    });
    
    // Log available routes
    this.logAvailableRoutes();
  }

  /**
   * Log available routes
   */
  logAvailableRoutes() {
    const routes = routeManager.getRouteInfo();
    logger.info('Available REST API Routes:', {
      totalRoutes: routes.length,
      routes: routes.map(route => ({
        method: route.method,
        path: route.path,
        description: route.description,
        auth: route.auth ? 'Required' : 'Not Required'
      }))
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down server...');
    
    if (this.apolloServer) {
      await this.apolloServer.stop();
    }
    
    if (this.httpServer) {
      await new Promise((resolve) => {
        this.httpServer.close(resolve);
      });
    }
    
    logger.info('Server shutdown complete');
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.environment
    };
  }
}

module.exports = Application;
