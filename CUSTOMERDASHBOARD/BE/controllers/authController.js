const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const nodemailer = require('nodemailer'); // Add nodemailer for email sending
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // Ensure this is required at the top
// Put this at the top of your controller file or in a separate module
// 📌 In-memory store: { email: { otp, otpExpire, verified } }
const otpStore = new Map();


// Secret key for JWT signing
const JWT_SECRET = 'your_jwt_secret_key'; // Ideally, store this in an environment variable
// Send OTP to email

// Send OTP function
exports.handleSendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = Date.now() + 10 * 60 * 1000;  // OTP expiration time

    // Save OTP in memory
    otpStore.set(email, { otp, otpExpire });

    // Send OTP email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
  }
};

// Verify OTP function
exports.handleVerifyOtp = (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    if (Date.now() > record.otpExpire) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    otpStore.delete(email);  // OTP verified successfully
    res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
};

// 📌 Send OTP only if user exists
exports.sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { otp, otpExpire });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'OTP sent to email successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

exports.verifyPasswordResetOtp = (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: 'OTP not found for this email' });

  if (Date.now() > record.otpExpire) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (String(record.otp) !== String(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Mark as verified, keep the record
  otpStore.set(email, { ...record, verified: true });

  return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};


exports.updateUserPasswordAfterOtp = async (req, res) => {
  const { email, mobile, newPassword } = req.body;
  if (!email || !mobile || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });

  // Check if OTP was verified
  const record = otpStore.get(email);
  if (!record || !record.verified) {
    return res.status(403).json({ message: 'OTP not verified. Access denied.' });
  }

  try {
    const user = await User.findOne({ email, mobile });
    if (!user) return res.status(404).json({ message: 'User not found with provided email and mobile' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear the store after successful password change
    otpStore.delete(email);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password Reset Error:', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};
exports.signup = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      mobile, 
      password, 
      state, 
      city, 
      dob, 
      selfDeclaration // Remove aadhaar from here
    } = req.body;

    // Validate input fields
    if (!name || (!email && !mobile) || !password || !state || !city || !dob || !selfDeclaration) {
      return res.status(400).json({ message: 'Please provide all necessary fields.' });
    }

    // Check if user already exists by email or mobile
    let userExists = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with uploaded file
    const idProof = req.file ? path.join('/uploads/idproofs', req.file.filename) : null;

    // Create user object without aadhaar field
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      state,
      city,
      dob,
      idProof,  // Path to uploaded ID proof
      selfDeclaration
    });

    // Save user in the database
    await user.save();

    // Generate a JWT token after successful user creation
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Send success response with JWT token
    res.status(201).json({ message: 'User created successfully!', token });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Please provide both mobile number and password.' });
  }

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the status check part, so it skips checking account status (Pending/Rejected)

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token, user });

  } catch (error) {
    console.error('Login error:', error); // ✅ Show error in logs
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


