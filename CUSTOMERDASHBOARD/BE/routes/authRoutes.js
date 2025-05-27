const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' }); // Set up file storage for ID Proof

const { sendOtp, verifyOtp, resetPassword } = require('../controllers/authController');
// POST request to send OTP
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// Send OTP to email
router.post('/send-email-otp', sendOtp);

// Verify OTP
router.post('/verify-email-otp', verifyOtp);

// Reset password
router.post('/reset-password', resetPassword);
// User Signup Route
router.post('/signup', upload.single('idProof'), signup);

module.exports = router;

const { login } = require('../controllers/authController');

router.post('/login', login);

module.exports = router;