const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getVendorStats = async (req, res) => {
  const { vendorId } = req.query;

  if (!vendorId) {
    return res.status(400).json({ message: 'vendorId is required' });
  }

  try {
    // Step 1: Get all orders
    const allOrders = await Order.find();

    let activeOrders = 0;
    let completedOrders = 0;
    let totalSales = 0;

    for (const order of allOrders) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (!product || product.vendorId.toString() !== vendorId.toString()) {
          continue;
        }

        // ✅ Active Orders
        if (item.status === 'pending') {
          activeOrders++;
        }

        // ✅ Completed Orders + Sales
        if (item.deliveryStatus === 'delivered') {
          completedOrders++;
          totalSales += (item.price || 0) * (item.quantity || 1);
        }
      }
    }

    // Step 2: Get vendor's product count
    const totalProducts = await Product.countDocuments({ vendorId });

    // Step 3: Send back the stats
    return res.status(200).json({
      activeOrders,
      totalProducts,
      completedOrders,
      totalSales
    });

  } catch (error) {
    console.error('❌ Error in getVendorStats:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
