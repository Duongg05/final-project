const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { createTaskValidation, updateTaskValidation } = require('../validations/taskValidation');

router.use(authMiddleware);

router.post('/', roleMiddleware(['Admin', 'Project Manager']), createTaskValidation, validate, taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', roleMiddleware(['Admin', 'Project Manager', 'Developer', 'Tester']), updateTaskValidation, validate, taskController.updateTask);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), taskController.deleteTask);

module.exports = router;
