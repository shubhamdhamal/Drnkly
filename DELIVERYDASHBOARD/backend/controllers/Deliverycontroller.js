const DeliveryBoy = require('../models/Deliveryboymodel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');  // Add this line at the top


// REGISTER
exports.registerDeliveryPartner = async (req, res) => {
  try {
    const { username, password, name, email, phone, area } = req.body;
    const aadharCard = req.files?.['aadharCard']?.[0]?.path;
    const drivingLicense = req.files?.['drivingLicense']?.[0]?.path;

    const existingUser = await DeliveryBoy.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already exists' });

    const deliveryBoy = new DeliveryBoy({ username, password, name, email, phone, area, aadharCard, drivingLicense });
    await deliveryBoy.save();

    const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Registration successful', token, deliveryBoy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
exports.loginDeliveryPartner = async (req, res) => {
  try {
    const { username, password } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ username });
    if (!deliveryBoy) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, deliveryBoy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getDeliveryBoyProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.user.id).select('-password');
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(deliveryBoy);
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE PROFILE
exports.updateDeliveryBoyProfile = async (req, res) => {
  try {
    const { name, email, phone, area } = req.body;
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, area },
      { new: true, runValidators: true }
    ).select('-password');

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', deliveryBoy });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

