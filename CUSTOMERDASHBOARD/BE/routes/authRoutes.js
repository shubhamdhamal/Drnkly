const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/idproofs/' });

const {
  signup,
  sendOtp,
  verifyOtp,
  resetPassword,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  login
} = require('../controllers/authController');

// All routes together
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/send-email-otp', sendOtp);
router.post('/verify-email-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/signup', upload.single('idProof'), signup);
router.post('/login', login); // ✅ Login route

module.exports = router;
