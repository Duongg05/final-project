const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const { loginRateLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginRateLimiter, loginValidation, validate, authController.login);
router.get('/me', authMiddleware, authController.me);

router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;
