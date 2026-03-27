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

const requestOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute for request OTP
  max: 1, // Only 1 request per minute
  message: { message: 'Vui lòng đợi 60 giây để yêu cầu mã OTP mới.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginLimiter, loginValidation, validate, authController.login);
router.post('/request-otp', requestOtpLimiter, authController.requestOtp);
router.post('/verify-otp', loginLimiter, authController.verifyOtp);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;
