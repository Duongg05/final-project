const express = require('express');
const router = express.Router();
const sourceCodeController = require('../controllers/sourceCodeController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { auditMiddleware } = require('../middlewares/auditMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');
const { downloadAnomalyMiddleware } = require('../middlewares/downloadAnomalyMiddleware');
const rateLimit = require('express-rate-limit');
const securityService = require('../services/securityService');

const downloadSpikeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests max (Spike threshold)
  handler: async (req, res) => {
    await securityService.logSecurityEvent({
      userId: req.user?.id,
      action: 'DATA_ACCESS_SPIKE',
      ip: req.ip || req.connection.remoteAddress,
      details: 'Excessive requests to Source Code data',
      riskLevel: 'Critical'
    });
    await securityService.triggerAlert({
      type: 'DATA_ACCESS_SPIKE',
      message: `Excessive Source Code fetching detected from User. Potential Exfiltration.`,
      userId: req.user?.id
    });
    res.status(429).json({ message: 'Too many requests. Your access has been flagged.' });
  }
});

router.use(authMiddleware);
router.use(auditMiddleware('SOURCE_CODE_API'));
router.use(checkPermission(['DEV']));

router.post('/', roleMiddleware(['Admin', 'Project Manager', 'Developer']), upload.single('sourceCode'), sourceCodeController.createSourceCode);
router.get('/', downloadSpikeLimiter, sourceCodeController.getSourceCodes);
router.get('/:id/download', downloadAnomalyMiddleware, sourceCodeController.downloadSourceCode);
router.put('/:id', roleMiddleware(['Admin', 'Project Manager', 'Developer']), upload.single('sourceCode'), sourceCodeController.updateSourceCode);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), sourceCodeController.deleteSourceCode);

module.exports = router;
