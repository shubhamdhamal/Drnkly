const DeliveryBoy = require('../models/Deliveryboymodel');

// Get all delivery partners
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await DeliveryBoy.find().select('-password'); // don't expose password
    res.status(200).json({ deliveryPartners });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ message: 'Server error while fetching delivery partners' });
  }
};
