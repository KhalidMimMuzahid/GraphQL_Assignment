/**
 * Authentication Module
 * Centralized authentication and authorization logic
 */

const jwt = require('jsonwebtoken');
const config = require('../../config');
const { ERROR_CODES, USER_ROLES } = require('../../shared/constants');
const logger = require('../logging/logger');

class AuthService {
  constructor() {
    this.jwtSecret = config.auth.jwt.secret;
    this.jwtExpiresIn = config.auth.jwt.expiresIn;
    this.jwtAlgorithm = config.auth.jwt.algorithm;
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Token expiration time
   * @returns {string} JWT token
   */
  generateToken(payload, expiresIn = this.jwtExpiresIn) {
    try {
      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn,
        algorithm: this.jwtAlgorithm
      });
      
      logger.debug('Token generated successfully', {
        userId: payload.userId,
        role: payload.role,
        expiresIn
      });
      
      return token;
    } catch (error) {
      logger.error('Failed to generate token', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: [this.jwtAlgorithm]
      });
      
      logger.debug('Token verified successfully', {
        userId: decoded.userId,
        role: decoded.role,
        exp: decoded.exp
      });
      
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed', {
        error: error.message,
        token: token ? 'present' : 'missing'
      });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Create authentication context
   * @param {Object} req - Express request object
   * @returns {Object} Authentication context
   */
  createAuthContext(req) {
    const authHeader = req.headers.authorization;
    const token = this.extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        user: null,
        authenticated: false,
        error: 'No token provided'
      };
    }

    try {
      const user = this.verifyToken(token);
      return {
        user,
        authenticated: true,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has required role
   * @param {Object} user - User object
   * @param {string} requiredRole - Required role
   * @returns {boolean} Whether user has required role
   */
  hasRole(user, requiredRole) {
    if (!user || !user.role) return false;
    
    const roleHierarchy = {
      [USER_ROLES.GUEST]: 0,
      [USER_ROLES.USER]: 1,
      [USER_ROLES.ADMIN]: 2
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  /**
   * Check if user has permission for resource
   * @param {Object} user - User object
   * @param {string} resource - Resource name
   * @param {string} action - Action (read, write, delete)
   * @returns {boolean} Whether user has permission
   */
  hasPermission(user, resource, action = 'read') {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === USER_ROLES.ADMIN) return true;
    
    // User permissions
    if (user.role === USER_ROLES.USER) {
      const userPermissions = {
        nodes: ['read', 'write'],
        triggers: ['read', 'write'],
        actions: ['read', 'write'],
        responses: ['read', 'write'],
        resourceTemplates: ['read']
      };
      
      return userPermissions[resource]?.includes(action) || false;
    }
    
    // Guest has read-only access
    if (user.role === USER_ROLES.GUEST) {
      return action === 'read';
    }
    
    return false;
  }

  /**
   * Generate sample user token for development
   * @param {Object} userData - User data
   * @returns {string} JWT token
   */
  generateSampleToken(userData = {}) {
    const defaultUser = {
      userId: 'sample-user-123',
      email: 'user@example.com',
      role: USER_ROLES.USER,
      ...userData
    };
    
    return this.generateToken(defaultUser);
  }

  /**
   * Validate token and return user info
   * @param {string} token - JWT token
   * @returns {Object} User information
   * @throws {Error} If token is invalid
   */
  validateToken(token) {
    const user = this.verifyToken(token);
    
    // Check if token is expired
    if (user.exp && user.exp < Date.now() / 1000) {
      throw new Error('Token has expired');
    }
    
    return user;
  }
}

module.exports = new AuthService();
