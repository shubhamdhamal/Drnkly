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

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, state, city, dob } = req.body;
    const userId = req.params.id;

    // 🔍 Check if mobile is already used by another user
    const existingMobile = await User.findOne({ mobile, _id: { $ne: userId } });
    if (existingMobile) {
      return res.status(400).json({ message: 'Mobile number already in use by another user' });
    }

    // 🔍 Check if email is already used by another user
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use by another user' });
    }

    // ✅ Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        mobile,
        state,
        city,
        dob: new Date(dob)
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('❌ Update Error:', err.message);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
