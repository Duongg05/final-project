const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 login attempts
  message: { message: 'Too many login attempts, please try again after 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
// Registration disabled - Only Admin can create users through HR Management
// router.post('/register', registerValidation, validate, authController.register);

router.post('/login', loginLimiter, loginValidation, validate, authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

// OTP routes
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

