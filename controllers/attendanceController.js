const Attendance = require('../models/Attendance');
const security = require('./securityController');

exports.checkIn = async (req, res) => {
  try {
    console.log('--- CHECK-IN REQUEST ---');
    console.log('User from token:', req.user);
    const userId = req.user.id;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const { note } = req.body;
    
    let attendance = await Attendance.findOne({ userId, date });
    
    if (attendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    // Determine status (Late if after 09:00 AM)
    let status = 'Present';
    const checkInTime = now.getHours() * 60 + now.getMinutes();
    const lateThreshold = 9 * 60; // 09:00 AM
    if (checkInTime > lateThreshold) {
      status = 'Late';
    }

    attendance = new Attendance({
      userId,
      date,
      checkIn: now,
      status,
      note
    });
    
    await attendance.save();

    await security.createLog({
      userId,
      action: 'CHECK_IN',
      resource: 'Attendance',
      details: `User checked in for ${date}${status === 'Late' ? ' (Late)' : ''}`,
      timestamp: now
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    console.log('--- CHECK-OUT REQUEST ---');
    console.log('User from token:', req.user);
    const userId = req.user.id;
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ userId, date }).sort({ createdAt: -1 });
    if (!attendance) {
      console.log('No attendance record found for user on date:', date);
      return res.status(404).json({ message: 'No check-in record found for today' });
    }
    
    if (attendance.checkOut) {
      console.log('User already checked out:', attendance.checkOut);
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    attendance.checkOut = now;
    await attendance.save();

    await security.createLog({
      userId,
      action: 'CHECK_OUT',
      resource: 'Attendance',
      details: `User checked out for ${date}`,
      timestamp: now
    });

    res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    let query = {};
    
    // Regular users can only see their own attendance
    const isAdminOrHR = ['Admin', 'HR Manager'].includes(req.user.role);
    console.log('GET Attendance - Role:', req.user.role, 'isAdminOrHR:', isAdminOrHR);
    
    if (!isAdminOrHR) {
      query.userId = req.user.id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.date) query.date = req.query.date;

    const history = await Attendance.find(query)
      .populate('userId', 'username email role departmentId')
      .sort({ date: -1, createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    console.log('GET Today Status - User:', userId, 'Date:', date);
    const attendance = await Attendance.findOne({ userId, date }).sort({ createdAt: -1 });
    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
