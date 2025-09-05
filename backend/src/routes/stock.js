const express = require('express');
const { authenticate } = require('../middleware/auth');
const { listMovements } = require('../controllers/stockController');

const router = express.Router();

router.use(authenticate);

router.get('/mouvements', listMovements);

module.exports = router;


