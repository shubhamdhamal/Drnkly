const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' });



const {
  signup,

  login
} = require('../controllers/authController');

// Import controller functions
const { handleSendOtp, handleVerifyOtp} = require('../controllers/authController');
const {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  updateUserPasswordAfterOtp
} = require('../controllers/authController');

// ✅ Forgot Password OTP routes (renamed to avoid conflict)
router.post('/send-forgot-otp', sendPasswordResetOtp);
router.post('/verify-forgot-otp', verifyPasswordResetOtp);
router.post('/reset-password', updateUserPasswordAfterOtp);


// OTP Routes
router.post('/send-otp', handleSendOtp);  // Send OTP route
router.post('/verify-otp', handleVerifyOtp);  // Verify OTP route


router.post('/signup', upload.single('idProof'), signup);
router.post('/login', login); // ✅ Login route

module.exports = router;
