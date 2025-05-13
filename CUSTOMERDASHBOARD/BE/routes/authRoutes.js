const express = require('express');
const multer = require('multer');
const router = express.Router();
const { signup } = require('../controllers/authController');

const upload = multer();

// User Signup Route
router.post('/signup', upload.none(), signup);

const { login } = require('../controllers/authController');

router.post('/login', login);

module.exports = router;
