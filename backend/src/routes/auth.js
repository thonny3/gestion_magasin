const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Only admin can create users
router.post('/register', authenticate, authorize(['admin']), register);
router.post('/login', login);

module.exports = router;


