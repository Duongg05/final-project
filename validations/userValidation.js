const { body } = require('express-validator');

exports.createUserValidation = [
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'HR Manager', 'Project Manager', 'Developer', 'Designer']).withMessage('Invalid role specified'),
  body('status').optional().isIn(['Active', 'Inactive', 'Suspended']).withMessage('Invalid status')
];

exports.updateUserValidation = [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'HR Manager', 'Project Manager', 'Developer', 'Designer']).withMessage('Invalid role specified'),
  body('status').optional().isIn(['Active', 'Inactive', 'Suspended']).withMessage('Invalid status')
];
