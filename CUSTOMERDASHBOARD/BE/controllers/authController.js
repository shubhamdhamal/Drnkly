const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const nodemailer = require('nodemailer'); // Add nodemailer for email sending
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // Ensure this is required at the top
// Put this at the top of your controller file or in a separate module
const otpStore = new Map(); // email => { otp, otpExpire }


// Secret key for JWT signing
const JWT_SECRET = 'your_jwt_secret_key'; // Ideally, store this in an environment variable
// Send OTP to email

exports.sendRegistrationOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save OTP and expiry keyed by email in otpStore
    otpStore.set(email, { otp, otpExpire });

    // Configure nodemailer transporter (Gmail example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,    // your email address
        pass: process.env.EMAIL_PASS,    // your email password or app password
      },
    });

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('Error sending registration OTP:', err);
    res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
  }
};
exports.verifyRegistrationOtp = (req, res) => {
  try {
    const { email, otp } = req.body;

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

    // OTP verified successfully, remove it from the store
    otpStore.delete(email);

    return res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error during OTP verification." });
  }
};








exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found with this email address' });
  }

  // Generate numeric OTP (6-digit OTP)
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number

  // Store OTP temporarily
  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
  }
};



// Verify OTP
// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Check if OTP exists and is valid
    if (user.otp.toString() !== otp.toString() || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and expiration time after successful verification
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Send confirmation email after OTP verification
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
      subject: 'OTP Verified Successfully',
      text: `Your OTP for password reset has been verified successfully.`,
    };

    // Send confirmation email
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    // Send success response to frontend
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};





exports.resetPassword = async (req, res) => {
  const { mobile, newPassword } = req.body;

  try {
    // Validate required fields
    if (!mobile || !newPassword) {
      return res.status(400).json({ message: 'Please provide mobile and new password.' });
    }

    // Find the user by mobile number
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this mobile number' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password without triggering validation for other fields
    await User.updateOne({ mobile }, { $set: { password: hashedPassword } });

    // Send success response
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
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

    // ✅ CHECK STATUS before password
    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Your account is pending verification. Please wait for approval.' });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({ message: 'Your account has been rejected due to government regulations.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token, user });

  } catch (error) {
  console.error('Login error:', error); // ✅ Show error in logs
  res.status(500).json({ message: 'Server error.', error: error.message });
}

};
