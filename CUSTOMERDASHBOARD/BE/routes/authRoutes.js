const express = require('express');
const router = express.Router();

// Import the necessary functions from the controller
const { signup, login } = require('../controllers/authController');

// User Signup Route
router.post('/signup', signup);

// User Login Route
router.post('/login', login);

module.exports = router;
