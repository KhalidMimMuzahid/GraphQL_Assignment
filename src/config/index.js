/**
 * Application Configuration
 * Centralized configuration management for the entire application
 */

require("dotenv").config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || "localhost",
    environment: process.env.NODE_ENV || "development",
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  },

  // Authentication Configuration
  auth: {
    jwt: {
      secret:
        process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: "HS256",
    },
    refreshToken: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    },
  },

  // Database Configuration
  database: {
    type: "file", // Can be extended to support different databases
    dataPath: process.env.DATA_PATH || "./data",
  },

  // GraphQL Configuration
  graphql: {
    playground: process.env.NODE_ENV === "development",
    introspection: process.env.NODE_ENV === "development" || true,
    tracing: process.env.NODE_ENV === "development",
    cacheControl: {
      defaultMaxAge: 0,
      stripFormattedExtensions: false,
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== "false",
    enableFile: process.env.ENABLE_FILE_LOGGING === "true",
  },

  // API Configuration
  api: {
    version: "v1",
    prefix: "/api",
    graphqlEndpoint: "/graphql",
    restEndpoints: {
      nodes: "/nodes",
      triggers: "/triggers",
      actions: "/actions",
      responses: "/responses",
      resourceTemplates: "/resource-templates",
    },
  },
};

module.exports = config;
