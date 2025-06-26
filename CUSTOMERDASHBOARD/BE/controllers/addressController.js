// controllers/addressController.js
const Address = require('../models/Address');
const axios = require('axios');

// Save address using reverse geocoding
exports.getAddressFromCoordinates = async (req, res) => {
  const { latitude, longitude, userId } = req.query;

  if (!latitude || !longitude || !userId) {
    return res.status(400).json({ message: 'Latitude, longitude, and userId are required' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat: latitude,
        lon: longitude,
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'Drnkly/1.0',
      },
    });

    const { display_name, address } = response.data;
    const city = address.city || address.town || address.village || '';
    const pincode = address.postcode || '';

    const newAddress = new Address({
      userId,
      address: display_name,
      city,
      pincode,
      latitude,
      longitude,
      type: 'Auto'
    });

    await newAddress.save();

    res.status(201).json({
      address: display_name,
      city,
      pincode,
      message: 'Address saved successfully'
    });
  } catch (err) {
    console.error('❌ Reverse geocoding failed:', err.message);
    res.status(500).json({ message: 'Failed to fetch address from coordinates' });
  }
};

// Get all addresses by user ID
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(addresses);
  } catch (err) {
    console.error('❌ Error fetching addresses:', err.message);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
};

// Manually add a new address
exports.addManualAddress = async (req, res) => {
  const { userId, address, city, pincode, type } = req.body;

  if (!userId || !address || !city || !pincode) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newAddress = new Address({
      userId,
      address,
      city,
      pincode,
      type: type || 'Manual'
    });

    await newAddress.save();
    res.status(201).json({ message: 'Address added successfully', address: newAddress });
  } catch (err) {
    console.error('❌ Error saving manual address:', err.message);
    res.status(500).json({ message: 'Failed to add address' });
  }
};
