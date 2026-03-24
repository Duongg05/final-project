const Attendance = require('../models/Attendance');
const security = require('./securityController');

exports.checkIn = async (req, res) => {
  try {
    const { userId, date, checkIn, note } = req.body;
    let attendance = await Attendance.findOne({ userId, date });
    
    if (attendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    attendance = new Attendance({
      userId,
      date,
      checkIn,
      status: 'Present',
      note
    });
    
    await attendance.save();

    await security.createLog({
      userId: req.user?.id || userId,
      action: 'CHECK_IN',
      resource: 'Attendance',
      details: `User checked in for ${date}`,
      timestamp: new Date()
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { userId, date, checkOut } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { userId, date },
      { checkOut },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

    await security.createLog({
      userId: req.user?.id || userId,
      action: 'CHECK_OUT',
      resource: 'Attendance',
      details: `User checked out for ${date}`,
      timestamp: new Date()
    });

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    let query = {};
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.date) query.date = req.query.date;

    const history = await Attendance.find(query).populate('userId', 'username email departmentId');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
