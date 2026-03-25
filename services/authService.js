const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

class AuthService {
  async register(userData) {
    const { username, email, password, role } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'Developer'
    });

    await newUser.save();

    return {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };
  }

  async login(username, password, otp) {
    // Check if user exists
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - new Date()) / 1000 / 60);
      throw new Error(`Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      await user.save();
      throw new Error('Invalid credentials');
    }

    // Successful password, reset lock
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      await user.save();
    }

    // Generate token
    const jti = uuidv4();
    const payload = {
      user: {
        id: user._id,
        role: user.role
      },
      jti
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    // Save session
    user.sessionTokens.push(jti);
    await user.save();

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }



  async logout(userId, jti) {
    const user = await User.findById(userId);
    if (user) {
      user.sessionTokens = user.sessionTokens.filter(t => t !== jti);
      await user.save();
    }
  }

  async logoutAll(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.sessionTokens = [];
      await user.save();
    }
  }
}

module.exports = new AuthService();
