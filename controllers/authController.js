const authService = require('../services/authService');

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
    
    res.status(200).json({ message: 'Login successful', token: result.token, user: result.user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};



exports.logout = async (req, res) => {
  try {
    await authService.logout(req.user.id, req.user.jti);
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
