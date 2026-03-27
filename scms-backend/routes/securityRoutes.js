const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.get('/audit-logs', securityController.getAuditLogs);

module.exports = router;
