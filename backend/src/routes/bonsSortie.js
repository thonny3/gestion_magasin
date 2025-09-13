const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/bonSortieController');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/lignes', controller.saveLignes);
router.post('/:id/upload-pdf', controller.uploadPdf);

module.exports = router;



