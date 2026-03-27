const { body } = require('express-validator');

exports.createTaskValidation = [
  body('taskId').notEmpty().withMessage('Task ID is required'),
  body('title').notEmpty().withMessage('Task Title is required').isLength({ min: 3 }),
  body('projectId').notEmpty().withMessage('Project Reference is required'),
  body('status').optional().isIn(['Todo', 'In Progress', 'Testing', 'Completed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical'])
];

exports.updateTaskValidation = [
  body('title').optional().isLength({ min: 3 }),
  body('status').optional().isIn(['Todo', 'In Progress', 'Testing', 'Completed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical'])
];
