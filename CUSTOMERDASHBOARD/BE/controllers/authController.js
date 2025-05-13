const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const path = require('path');
const fs = require('fs');

// Secret key for JWT signing
const JWT_SECRET = 'your_jwt_secret_key'; // Ideally, store this in an environment variable

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
      selfDeclaration 
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

    // Create user object
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      state,
      city,
      dob,
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
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

