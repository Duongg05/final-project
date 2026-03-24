const express = require('express');
const router = express.Router();
const sourceCodeController = require('../controllers/sourceCodeController');

router.post('/', sourceCodeController.createSourceCode);
router.get('/', sourceCodeController.getSourceCodes);
router.put('/:id', sourceCodeController.updateSourceCode);
router.delete('/:id', sourceCodeController.deleteSourceCode);

module.exports = router;
