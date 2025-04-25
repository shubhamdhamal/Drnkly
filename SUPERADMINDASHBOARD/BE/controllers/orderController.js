const Order = require('../models/Order');
const User = require('../models/User');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name') // only get name from user
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      customer: order.userId?.name || 'Unknown',
      items: order.items.map((item) => item.name),
      status: order.paymentStatus,
      total: order.totalAmount
    }));

    res.status(200).json({ orders: formattedOrders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};
