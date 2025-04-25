const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
    try {
      const totalVendors = await Vendor.countDocuments({});
      const pendingApprovals = await Vendor.countDocuments({ verificationStatus: 'pending' });
      const verifiedVendors = await Vendor.countDocuments({ verificationStatus: 'verified' });
      const activeOrders = await Order.countDocuments({ paymentStatus: 'paid' });
  
      return res.status(200).json({
        totalVendors,
        pendingApprovals,
        verifiedVendors,
        activeOrders
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
  };
exports.getRecentVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 }).limit(5);
    const formatted = vendors.map((v, i) => ({
      id: `V${i + 1}`,
      businessName: v.businessName,
      status: v.verificationStatus.charAt(0).toUpperCase() + v.verificationStatus.slice(1),
      appliedDate: new Date(v.createdAt).toISOString().split('T')[0],
      documentsCount: 3,
    }));

    res.status(200).json({ vendors: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vendors', error: err.message });
  }
};
