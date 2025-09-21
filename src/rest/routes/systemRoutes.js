/**
 * System Routes
 * REST API routes for system operations
 */

const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

// System routes
router.get('/', systemController.getHealth);
router.get('/health', systemController.getHealth);
router.get('/stats', systemController.getStats);

module.exports = router;
