const User = require('../models/User');

// GET profile by ID
exports.getProfile = async (req, res) => {
  try {
    // Fetch user details except password
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);  // Return user data
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE profile by ID
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, kycDocument, address } = req.body;

    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, kycDocument, address },
      { new: true }
    ).select('-password'); // Don't return password in response

    res.json(updatedUser);  // Return the updated user data
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};
