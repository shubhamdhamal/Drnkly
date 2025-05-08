// orderController.js

const Order = require('../models/Order');
const Product = require('../models/product');
const { authenticateVendor } = require('../middleware/auth'); // Middleware for vendor authentication

// ✔️ Main function: Filter orders by vendor's own products only
const getOrdersForVendor = async (vendorId) => {
    try {
        const allOrders = await Order.find();

        const filteredOrders = [];

        for (const order of allOrders) {
            const vendorItems = [];

            for (const item of order.items) {
                const product = await Product.findById(item.productId);

                // ⚠️ Fix: Skip if no product or vendorId
                if (!product || !product.vendorId) continue;

                if (product.vendorId.toString() === vendorId.toString()) {
                    vendorItems.push({
                        productId: item.productId,
                        orderNumber: order.orderNumber,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                        status: item.status || 'pending', // ✅ INCLUDE STATUS HERE
                        productName: product.name,
                        productImage: product.image,
                        orderId: order._id,
                        deliveryAddress: order.deliveryAddress,
                        orderDate: order.createdAt,
                        paymentStatus: order.paymentStatus
                    });
                }
            }

            // ⚠️ Return only if vendor has at least one item in this order
            if (vendorItems.length > 0) {
                filteredOrders.push({
                    orderId: order._id,
                    customerId: order.userId,
                    deliveryAddress: order.deliveryAddress,
                    createdAt: order.createdAt,
                    paymentStatus: order.paymentStatus,
                    paymentProof: order.paymentProof || '',
                    totalAmount: order.totalAmount || 0,
                    orderNumber: order.orderNumber,
                    items: vendorItems
                });
            }
        }

        return filteredOrders;
    } catch (err) {
        console.error("❌ Error fetching vendor orders:", err);
        throw new Error('Unable to fetch vendor orders');
    }
};

// Export controller functions to be used in the routes file
module.exports = {
    getOrdersForVendor
};
