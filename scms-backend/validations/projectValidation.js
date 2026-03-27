const { body } = require('express-validator');

exports.createProjectValidation = [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('name').notEmpty().withMessage('Project Name is required').isLength({ min: 3 }),
  body('status').optional().isIn(['Planning', 'In Progress', 'Completed', 'On Hold']),
  body('priority').optional().isIn(['Critical', 'High', 'Medium', 'Low'])
];

exports.updateProjectValidation = [
  body('name').optional().isLength({ min: 3 }),
  body('status').optional().isIn(['Planning', 'In Progress', 'Completed', 'On Hold']),
  body('progress').optional().isNumeric().isInt({ min: 0, max: 100 }),
  body('priority').optional().isIn(['Critical', 'High', 'Medium', 'Low'])
];
