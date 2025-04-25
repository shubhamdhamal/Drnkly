const Order = require('../models/Order');



// Get all orders with items that have a handoverStatus of 'handedOver'
const getHandedOverOrders = async (req, res) => {
  try {
    // Fetch all orders, and filter items where handoverStatus is 'handedOver'
    const orders = await Order.aggregate([
      { 
        $unwind: '$items' 
      },
      { 
        $match: { 
          'items.handoverStatus': 'handedOver' 
        } 
      },
      { 
        $group: {
          _id: '$_id',
          orderNumber: { $first: '$orderNumber' },
          userId: { $first: '$userId' },
          items: { $push: '$items' },
          deliveryAddress: { $first: '$deliveryAddress' },
          totalAmount: { $first: '$totalAmount' },
          paymentStatus: { $first: '$paymentStatus' },
          createdAt: { $first: '$createdAt' },
        }
      }
    ]);
    
    return res.json(orders); // Send filtered orders back to frontend
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching handedOver orders' });
  }
};



module.exports = { getHandedOverOrders };