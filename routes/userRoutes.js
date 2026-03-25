const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');

// Protect all user management routes
const adminOrHR = roleMiddleware(['Admin', 'HR Manager']);

const allowSelfOrAdmin = (req, res, next) => {
  if (req.user.id === req.params.id || ['Admin', 'HR Manager'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: insufficient permissions' });
};

router.use(authMiddleware);

// API endpoints
router.get('/', adminOrHR, userController.getAllUsers);
router.post('/', adminOrHR, createUserValidation, validate, userController.createUser);
router.put('/:id', allowSelfOrAdmin, updateUserValidation, validate, userController.updateUser);
router.delete('/:id', adminOrHR, userController.deleteUser);

module.exports = router;
