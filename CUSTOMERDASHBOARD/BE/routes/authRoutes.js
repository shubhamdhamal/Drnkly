const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');

// User Signup Route (no need for file upload now)
router.post('/signup', signup);

const { login } = require('../controllers/authController');

router.post('/login', login);

module.exports = router;