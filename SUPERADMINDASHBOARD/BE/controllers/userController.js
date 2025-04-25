const User = require('../models/User');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find();
    res.status(200).json({ customers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};
