const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// User Signup Route
router.post('/signup', express.json(), signup);  // ✅ Use express.json() instead of multer
router.post('/login', login);

module.exports = router;