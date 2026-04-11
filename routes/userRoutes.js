const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');

// Protect all user management routes
const adminOrHR = roleMiddleware(['Admin', 'HR Manager']);

const allowSelfOrAdmin = async (req, res, next) => {
  if (req.user.id === req.params.id || ['Admin', 'HR Manager'].includes(req.user.role)) {
    return next();
  }
  
  const securityService = require('../services/securityService');
  await securityService.logSecurityEvent({
    userId: req.user.id,
    action: 'UNAUTHORIZED_ACCESS',
    ip: req.ip || req.connection.remoteAddress,
    details: `User Role ${req.user.role} attempted to edit another user's profile without Admin/HR rights`,
    riskLevel: 'High'
  });
  await securityService.triggerAlert({
    type: 'UNAUTHORIZED_ACCESS',
    message: `Unauthorized attempt to modify User ID ${req.params.id} by Role ${req.user.role}`,
    userId: req.user.id
  });

  return res.status(403).json({ message: 'Access denied: insufficient permissions' });
};

router.use(authMiddleware);

// API endpoints
router.get('/', roleMiddleware(['Admin', 'HR Manager', 'Project Manager', 'Developer']), userController.getAllUsers);
router.post('/', adminOrHR, createUserValidation, validate, userController.createUser);
router.put('/:id', allowSelfOrAdmin, updateUserValidation, validate, userController.updateUser);
router.delete('/:id', adminOrHR, userController.deleteUser);

module.exports = router;
