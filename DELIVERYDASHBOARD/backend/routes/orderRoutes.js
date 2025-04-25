const express = require('express');
const router = express.Router();
const { getHandedOverOrders} = require('../controllers/orderController');
const Order = require('../models/Order'); // Import Order model here



// Ensure this route matches the one you're trying to hit
router.get('/orders/handedOver', getHandedOverOrders);

// Route for accepting an item within an order
router.put('/orders/:orderId/items/:itemId/accept', async (req, res) => {
    const { orderId, itemId } = req.params;
    
    try {
      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Find the item by itemId
      const item = order.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Update the deliveryBoyStatus for the specific item to 'accepted'
      item.deliveryBoyStatus = 'accepted';
  
      // Save the updated order
      await order.save();
  
      // Respond with the updated order
      return res.json({
        message: 'Item accepted successfully',
        order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error accepting item' });
    }
  });
  router.put('/orders/:orderId/items/:itemId/reject', async (req, res) => {
    const { orderId, itemId } = req.params;
  
    try {
      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Find the item by itemId
      const item = order.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Update the deliveryBoyStatus for the specific item to 'rejected'
      item.deliveryBoyStatus = 'rejected';
  
      // Save the updated order
      await order.save();
  
      // Respond with the updated order
      return res.json({
        message: 'Item rejected successfully',
        order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error rejecting item' });
    }
  });
  
  router.put('/orders/:orderId/items/:itemId/deliver', async (req, res) => {
    const { orderId, itemId } = req.params;
  
    try {
      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Find the item by itemId
      const item = order.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Check if the item has been accepted before marking it as delivered
      if (item.deliveryBoyStatus !== 'accepted') {
        return res.status(400).json({ message: 'Item must be accepted before it can be marked as delivered' });
      }
  
      // Update the deliveryStatus for the specific item to 'delivered'
      item.deliveryStatus = 'delivered';
  
      // Save the updated order
      await order.save();
  
      // Respond with the updated order
      return res.json({
        message: 'Item marked as delivered successfully',
        order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error marking item as delivered' });
    }
  });
  
  

module.exports = router;