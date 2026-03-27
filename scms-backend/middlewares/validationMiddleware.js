const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation failed for', req.originalUrl, 'Errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validate };
