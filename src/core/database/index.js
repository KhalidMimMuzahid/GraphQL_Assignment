/**
 * Database Layer
 * Centralized data access layer with support for multiple data sources
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const logger = require('../logging/logger');

class Database {
  constructor() {
    this.data = null;
    this.initialized = false;
  }

  /**
   * Initialize the database
   * Load data from configured sources
   */
  async initialize() {
    try {
      logger.info("Initializing database...");
      this.data = await this.loadData();
      this.initialized = true;
      logger.info("Database initialized successfully", {
        collections: Object.keys(this.data),
        totalRecords: this.getTotalRecordCount(),
      });
    } catch (error) {
      logger.error("Failed to initialize database", error);
      throw error;
    }
  }

  findParentNodesByCompositeIds(compositeIds) {
    if (!Array.isArray(compositeIds)) {
      compositeIds = [compositeIds];
    }

    return this.find("nodes", (node) => {
      // adjust depending on your JSON structure
      return node.children?.some((childId) => compositeIds.includes(childId));
    });
  }

  /**
   * Load data from configured sources
   * @returns {Object} Loaded data
   */
  async loadData() {
    const dataPath = config.database.dataPath;

    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data path does not exist: ${dataPath}`);
    }

    const data = {};
    const files = [
      "action.json",
      "node.json",
      "resourceTemplate.json",
      "response.json",
      "trigger.json",
    ];

    for (const file of files) {
      const filePath = path.join(dataPath, file);

      if (fs.existsSync(filePath)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const collectionName = this.getCollectionName(file);
          data[collectionName] = Array.isArray(fileData)
            ? fileData
            : [fileData];
          logger.debug(
            `Loaded ${data[collectionName].length} records from ${file}`
          );
        } catch (error) {
          logger.error(`Failed to load data from ${file}`, error);
          data[this.getCollectionName(file)] = [];
        }
      } else {
        logger.warn(`Data file not found: ${file}`);
        data[this.getCollectionName(file)] = [];
      }
    }

    return data;
  }

  /**
   * Get collection name from filename
   * @param {string} filename - Filename
   * @returns {string} Collection name
   */
  getCollectionName(filename) {
    const nameMap = {
      "action.json": "actions",
      "node.json": "nodes",
      "resourceTemplate.json": "resourceTemplates",
      "response.json": "responses",
      "trigger.json": "triggers",
    };
    return nameMap[filename] || filename.replace(".json", "");
  }

  /**
   * Get total record count across all collections
   * @returns {number} Total record count
   */
  getTotalRecordCount() {
    if (!this.data) return 0;
    return Object.values(this.data).reduce(
      (total, collection) => total + collection.length,
      0
    );
  }

  /**
   * Generic find method
   * @param {string} collection - Collection name
   * @param {Function} predicate - Filter function
   * @returns {Array} Filtered results
   */
  find(collection, predicate) {
    if (!this.initialized) {
      throw new Error("Database not initialized");
    }

    if (!this.data[collection]) {
      logger.warn(`Collection '${collection}' not found`);
      return [];
    }

    return this.data[collection].filter(predicate);
  }

  /**
   * Generic findOne method
   * @param {string} collection - Collection name
   * @param {Function} predicate - Filter function
   * @returns {Object|null} Found record or null
   */
  findOne(collection, predicate) {
    const results = this.find(collection, predicate);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find by ID
   * @param {string} collection - Collection name
   * @param {string} id - Record ID
   * @param {string} idField - ID field name (default: '_id')
   * @returns {Object|null} Found record or null
   */
  findById(collection, id, idField = "_id") {
    return this.findOne(collection, (record) => record[idField] === id);
  }

  /**
   * Find multiple records by IDs
   * @param {string} collection - Collection name
   * @param {Array} ids - Array of IDs
   * @param {string} idField - ID field name (default: '_id')
   * @returns {Array} Found records
   */
  findByIds(collection, ids, idField = "_id") {
    if (!ids || !Array.isArray(ids)) return [];
    return this.find(collection, (record) => ids.includes(record[idField]));
  }

  /**
   * Get all records from a collection
   * @param {string} collection - Collection name
   * @returns {Array} All records
   */
  findAll(collection) {
    if (!this.initialized) {
      throw new Error("Database not initialized");
    }

    return this.data[collection] || [];
  }

  /**
   * Get collection statistics
   * @param {string} collection - Collection name
   * @returns {Object} Collection statistics
   */
  getCollectionStats(collection) {
    if (!this.data[collection]) {
      return { count: 0, exists: false };
    }

    return {
      count: this.data[collection].length,
      exists: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all collection statistics
   * @returns {Object} All collection statistics
   */
  getAllStats() {
    const stats = {};
    for (const collection in this.data) {
      stats[collection] = this.getCollectionStats(collection);
    }
    return stats;
  }
}

module.exports = new Database();
