const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { createProjectValidation, updateProjectValidation } = require('../validations/projectValidation');

// Protect all project routes
router.use(authMiddleware);

router.post('/', roleMiddleware(['Admin', 'Project Manager']), createProjectValidation, validate, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', roleMiddleware(['Admin', 'Project Manager']), updateProjectValidation, validate, projectController.updateProject);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), projectController.deleteProject);

module.exports = router;
