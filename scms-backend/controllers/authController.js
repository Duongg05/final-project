const authService = require('../services/authService');
const securityService = require('../services/securityService');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    
    // Log success
    await securityService.logSecurityEvent({
      userId: result.user.id,
      action: 'LOGIN_SUCCESS',
      ip: req.ip || req.connection.remoteAddress,
      details: 'User logged in successfully',
      riskLevel: 'Low'
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: 'Login successful', user: result.user });
  } catch (error) {
    // Log failures
    await securityService.logSecurityEvent({
      userId: null,
      action: 'LOGIN_FAILED',
      ip: req.ip || req.connection.remoteAddress,
      details: `Failed login for username: ${req.body?.username || 'unknown'}. Reason: ${error.message}`,
      riskLevel: 'Medium'
    });

    res.status(401).json({ message: error.message });
  }
};

exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.requestOtp(email);
    res.status(200).json({ message: 'Mã OTP đã được gửi đến email của bạn' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);

    // Log success
    await securityService.logSecurityEvent({
      userId: result.user.id,
      action: 'LOGIN_SUCCESS',
      ip: req.ip || req.connection.remoteAddress,
      details: 'User logged in successfully via OTP',
      riskLevel: 'Low'
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: 'Login successful', user: result.user });
  } catch (error) {
    // Log failures
    await securityService.logSecurityEvent({
      userId: null,
      action: 'LOGIN_FAILED',
      ip: req.ip || req.connection.remoteAddress,
      details: `Failed OTP login for email: ${req.body?.email || 'unknown'}. Reason: ${error.message}`,
      riskLevel: 'Medium'
    });

    res.status(401).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logout(req.user.id, req.user.jti);
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await authService.logoutAll(req.user.id);
    res.status(200).json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    // Use the authMiddleware to inject req.user
    const userId = req.user.id;
    const User = require('../models/User');
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure id is present for frontend compatibility
    const userObj = user.toObject();
    userObj.id = user._id;
    
    res.status(200).json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
