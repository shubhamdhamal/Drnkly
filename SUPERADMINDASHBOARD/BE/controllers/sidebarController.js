// BE/controllers/sidebarController.js
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Issue = require('../models/Issue');
const User = require('../models/User'); // this should refer to customers

exports.getSidebarStats = async (req, res) => {
  try {
    const vendors = await Vendor.countDocuments();
    const customers = await User.countDocuments();
    const issues = await Issue.countDocuments();
    const orders = await Order.countDocuments({ paymentStatus: 'paid' });

    const reports = 0; // update if model is created
    const payouts = 0; // update if model is created

    res.status(200).json({
      vendors,
      customers,
      issues,
      orders,
      reports,
      payouts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sidebar stats', error: error.message });
  }
};
