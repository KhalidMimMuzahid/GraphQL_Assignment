/**
 * Node Routes
 * REST API routes for Node operations
 */

const express = require('express');
const nodeController = require('../controllers/nodeController');

const router = express.Router();

// Node routes
router.get('/', nodeController.getNodes);
router.get('/stats', nodeController.getNodeStats);
router.get('/:id', nodeController.getNodeById);
router.get('/:id/relations', nodeController.getNodeWithRelations);

module.exports = router;
