const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/articleController');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;


