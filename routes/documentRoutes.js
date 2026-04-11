const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const rateLimit = require('express-rate-limit');
const securityService = require('../services/securityService');

const documentSpikeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 50, // 50 requests max for documents
  handler: async (req, res) => {
    await securityService.logSecurityEvent({
      userId: req.user?.id,
      action: 'DATA_ACCESS_SPIKE',
      ip: req.ip || req.connection.remoteAddress,
      details: 'Excessive fetching of internal documents',
      riskLevel: 'Critical'
    });
    await securityService.triggerAlert({
      type: 'DATA_ACCESS_SPIKE',
      message: `Massive Document fetching detected. Possible data exfiltration.`,
      userId: req.user?.id
    });
    res.status(429).json({ message: 'Request limit exceeded. Activity flagged.' });
  }
});

router.use(authMiddleware);

router.post('/', roleMiddleware(['Admin', 'Project Manager']), upload.single('document'), documentController.createDocument);
router.put('/:id', roleMiddleware(['Admin', 'Project Manager']), upload.single('document'), documentController.updateDocument);
router.get('/', documentSpikeLimiter, documentController.getDocuments);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), documentController.deleteDocument);

module.exports = router;
