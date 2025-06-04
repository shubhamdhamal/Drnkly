const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' }); // Set up file storage for ID Proof

const { sendOtp, verifyOtp, resetPassword } = require('../controllers/authController');
const { sendRegistrationOtp,  verifyRegistrationOtp} = require('../controllers/authController');

router.post('/send-registration-otp', sendRegistrationOtp);

// Verify registration OTP (optional, if implemented)
router.post('/verify-registration-otp', verifyRegistrationOtp);

// Send OTP to email
router.post('/send-email-otp', sendOtp);

// Verify OTP
router.post('/verify-email-otp', verifyOtp);

// Reset password
router.post('/reset-password', resetPassword);
// User Signup Route
router.post('/signup', upload.single('idProof'), signup);

router.post('/login', login);

module.exports = router;
