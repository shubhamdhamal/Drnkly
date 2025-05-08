// orderRoutes.js

const express = require('express');
const router = express.Router();

const { authenticateVendor } = require('../middleware/auth'); // Middleware for vendor authentication
const { getOrdersForVendor } = require('../controllers/orderController'); // Import the controller function

// ✅ Route to fetch orders for vendor
router.get('/vendor/orders', authenticateVendor, async (req, res) => {
    const vendorId = req.vendorId; // Vendor ID from JWT
  
    try {
        const orders = await getOrdersForVendor(vendorId); // Fetch orders using controller logic
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Update order item status (Accept / Reject) by Vendor
router.put('/vendor/orders/:orderId/status', authenticateVendor, async (req, res) => {
    const { orderId } = req.params;
    const { productId, status } = req.body;
    const vendorId = req.vendorId;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        let updated = false;

        // Loop through each item and update status only if vendor owns the product
        for (let item of order.items) {
            if (
                item.productId.toString() === productId &&
                (await Product.findOne({ _id: productId, vendorId }))
            ) {
                item.status = status; // Set status
                updated = true;
                break;
            }
        }

        if (!updated) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        await order.save();
        return res.status(200).json({ message: 'Order item status updated' });
    } catch (err) {
        console.error('❌ Error updating order status:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Route for fetching ready-for-pickup orders
router.get('/vendor/ready-for-pickup', authenticateVendor, async (req, res) => {
    const vendorId = req.vendorId;

    try {
        const allOrders = await Order.find();
        const readyOrders = [];

        for (const order of allOrders) {
            const vendorItems = [];

            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (!product || !product.vendorId) continue;

                // Match current vendor and accepted status
                if (product.vendorId.toString() === vendorId.toString() && item.status === 'accepted') {
                    vendorItems.push({
                        productId: item.productId,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        orderNumber: order.orderNumber,
                        customerName: order.deliveryAddress?.fullName || 'Customer',
                        customerAddress: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`,
                        orderId: order._id,
                        totalAmount: item.price * item.quantity,
                        readyTime: order.createdAt,
                    });
                }
            }

            if (vendorItems.length > 0) {
                readyOrders.push(...vendorItems);
            }
        }

        res.status(200).json({ orders: readyOrders });
    } catch (err) {
        console.error('Error fetching ready-for-pickup orders:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update order item handover status (Handover to delivery)
router.put('/vendor/orders/handover', authenticateVendor, async (req, res) => {
    const { productId, orderNumber } = req.body;
    const vendorId = req.vendorId;

    try {
        // Find the order with the given orderNumber
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        let updated = false;

        // Loop through each item and check if the productId and vendor match
        for (let item of order.items) {
            if (
                item.productId.toString() === productId &&
                (await Product.findOne({ _id: productId, vendorId }))
            ) {
                item.handoverStatus = 'handedOver';  // Update handoverStatus
                updated = true;
                break;  // No need to check further items once we have updated the status
            }
        }

        if (!updated) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        // Save the updated order
        await order.save();
        res.status(200).json({ message: 'Handover marked successfully' });
    } catch (error) {
        console.error('❌ Error handing over:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
