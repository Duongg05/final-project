const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Protect all user management routes
// Only Admin and HR Manager can perform these actions
router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'HR Manager']));

// API endpoints
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
