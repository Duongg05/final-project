const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['Admin', 'Project Manager', 'Developer']), upload.single('document'), documentController.createDocument);
router.get('/', documentController.getDocuments);
router.delete('/:id', roleMiddleware(['Admin', 'Project Manager']), documentController.deleteDocument);

module.exports = router;
