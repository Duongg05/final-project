const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const securityService = require('./securityService');

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
      
      // 2-Strike Early Warning Rule for Subordinates
      if (user.failedLoginAttempts === 2 && user.role !== 'Admin') {
         await securityService.triggerAlert({
           type: 'MULTIPLE_FAILED_LOGIN',
           message: `Subordinate Employee ${user.username} (${user.role}) has failed login 2 times. Early warning alert.`,
           userId: user._id
         });
      }

      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await securityService.triggerAlert({
          type: 'MULTIPLE_FAILED_LOGIN',
          message: `Account ${user.username} is temporarily locked due to 5 consecutive failed logins.`,
          userId: user._id
        });
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

    if (user.role === 'Admin') {
      // Generate token immediately for Admin role
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

    // Force 2FA OTP verification step for Non-Admins
    await this.requestOtp(user.email);

    return {
      requiresOtp: true,
      user: {
        email: user.email,
        username: user.username
      }
    };
  }



  async requestOtp(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found');

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Otp model
    const Otp = require('../models/Otp');
    // If there's an existing OTP, delete or update it
    await Otp.deleteMany({ email });
    const newOtp = new Otp({ email, otp: otpCode });
    await newOtp.save();

    // Send email
    const emailService = require('./emailService');
    await emailService.sendOtpEmail(email, otpCode);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email, submittedOtp) {
    const Otp = require('../models/Otp');
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) throw new Error('OTP expired or not found');

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    if (otpRecord.otp !== submittedOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new Error('Invalid OTP');
    }

    // OTP Correct
    await Otp.deleteOne({ _id: otpRecord._id });

    // Login user
    const user = await User.findOne({ email });

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
