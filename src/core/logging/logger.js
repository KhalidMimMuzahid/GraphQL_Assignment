/**
 * Centralized Logging System
 * Professional logging with different levels and formats
 */

const config = require('../../config');

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4
    };
    
    this.colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      http: '\x1b[35m',  // Magenta
      debug: '\x1b[37m', // White
      reset: '\x1b[0m'   // Reset
    };
  }

  /**
   * Format log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} meta - Additional metadata
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    const reset = this.colors.reset;
    
    let formattedMessage = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`;
    
    if (meta) {
      formattedMessage += `\n${color}Meta: ${JSON.stringify(meta, null, 2)}${reset}`;
    }
    
    return formattedMessage;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or metadata
   */
  error(message, error = null) {
    if (this.shouldLog('error')) {
      const meta = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error;
      
      console.error(this.formatMessage('error', message, meta));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {*} meta - Additional metadata
   */
  warn(message, meta = null) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {*} meta - Additional metadata
   */
  info(message, meta = null) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  /**
   * Log HTTP request message
   * @param {string} message - HTTP message
   * @param {*} meta - Additional metadata
   */
  http(message, meta = null) {
    if (this.shouldLog('http')) {
      console.log(this.formatMessage('http', message, meta));
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {*} meta - Additional metadata
   */
  debug(message, meta = null) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Check if should log based on configured level
   * @param {string} level - Log level to check
   * @returns {boolean} Whether to log this level
   */
  shouldLog(level) {
    const currentLevel = this.levels[config.logging.level] || this.levels.info;
    const messageLevel = this.levels[level] || this.levels.info;
    return messageLevel <= currentLevel;
  }

  /**
   * Log GraphQL operation
   * @param {string} operation - GraphQL operation type
   * @param {string} operationName - Operation name
   * @param {number} duration - Operation duration in ms
   * @param {boolean} success - Whether operation was successful
   */
  logGraphQLOperation(operation, operationName, duration, success = true) {
    const message = `GraphQL ${operation.toUpperCase()}: ${operationName} (${duration}ms)`;
    const meta = {
      operation,
      operationName,
      duration,
      success,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.info(message, meta);
    } else {
      this.error(message, meta);
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logHttpRequest(req, res, duration) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.http(message, meta);
    }
  }
}

module.exports = new Logger();
