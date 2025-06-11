const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const otpStore = new Map();

// 📤 Send OTP for registration
exports.handleSendOtp = async (req, res) => {
  const { email } = req.body;

  try {
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

// ✅ Verify OTP
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

    otpStore.delete(email);
    res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
};

// 📤 Send OTP for password reset
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

// ✅ Verify OTP and generate token
exports.verifyPasswordResetOtp = async (req, res) => {
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

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

  otpStore.delete(email);

  return res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    token,
  });
};

exports.updateUserPasswordAfterOtp = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const { email, mobile, newPassword } = req.body;
  if (!email || !mobile || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });

  if (decoded.email !== email) {
    return res.status(403).json({ message: 'Email mismatch. Access denied.' });
  }

  try {
    const user = await User.findOne({ email, mobile });
    if (!user) return res.status(404).json({ message: 'User not found with provided email and mobile' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const newToken = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: newToken,
    });
  } catch (err) {
    console.error('Password Reset Error:', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};


// ✅ User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, mobile, password, state, city, dob, selfDeclaration } = req.body;

    if (!name || (!email && !mobile) || !password || !state || !city || !dob || !selfDeclaration) {
      return res.status(400).json({ message: 'Please provide all necessary fields.' });
    }

    let userExists = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const idProof = req.file ? path.join('/uploads/idproofs', req.file.filename) : null;

    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      state,
      city,
      dob,
      idProof,
      selfDeclaration
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created successfully!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ User Login
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
