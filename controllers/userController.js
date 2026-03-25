const User = require('../models/User');
const bcrypt = require('bcrypt');
const security = require('./securityController');

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status, departmentId } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, departmentId, status } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'Developer',
      departmentId: departmentId || null,
      status: status || 'Active'
    });

    await newUser.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'CREATE_USER',
      resource: 'User',
      details: `Created user: ${username}`,
      timestamp: new Date()
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, departmentId, status, password, currentPassword } = req.body;
    
    console.log('UpdateUser debug:', { reqUserId: req.user.id, paramId: id, reqUserType: typeof req.user.id, paramType: typeof id });

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (departmentId !== undefined) user.departmentId = departmentId;
    if (status) user.status = status;

    if (password) {
      if (req.user.id && req.user.id.toString() === id.toString()) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to change your password' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect current password' });
        }
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'UPDATE_USER',
      resource: 'User',
      details: `Updated user: ${user.username}`,
      timestamp: new Date()
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await security.createLog({
      userId: req.user?.id,
      action: 'DELETE_USER',
      resource: 'User',
      details: `Deleted user: ${user.username}`,
      timestamp: new Date()
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
