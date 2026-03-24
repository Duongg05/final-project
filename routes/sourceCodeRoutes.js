const express = require('express');
const router = express.Router();
const sourceCodeController = require('../controllers/sourceCodeController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['Admin', 'Project Manager', 'Developer']), upload.single('sourceCode'), sourceCodeController.createSourceCode);
router.get('/', sourceCodeController.getSourceCodes);
router.put('/:id', roleMiddleware(['Admin', 'Project Manager', 'Developer']), upload.single('sourceCode'), sourceCodeController.updateSourceCode);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), sourceCodeController.deleteSourceCode);

module.exports = router;
