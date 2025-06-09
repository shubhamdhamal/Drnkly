const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' });



const {
  signup,

  resetPassword,
  login
} = require('../controllers/authController');

// Import controller functions
const { handleSendOtp, handleVerifyOtp } = require('../controllers/authController');

// OTP Routes
router.post('/send-otp', handleSendOtp);  // Send OTP route
router.post('/verify-otp', handleVerifyOtp);  // Verify OTP route

router.post('/reset-password', resetPassword);
router.post('/signup', upload.single('idProof'), signup);
router.post('/login', login); // ✅ Login route

module.exports = router;
