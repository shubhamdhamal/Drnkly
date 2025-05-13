const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' }); // Set up file storage for ID Proof

// User Signup Route
router.post('/signup', upload.single('idProof'), signup);

const { login } = require('../controllers/authController');

router.post('/login', login);

module.exports = router;
