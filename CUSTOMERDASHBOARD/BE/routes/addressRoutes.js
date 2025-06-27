const express = require('express');
const router = express.Router();
const {
  getAddressFromCoordinates,
  getUserAddresses,
  addManualAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

// GET: Reverse geocode from lat/lng and save
router.get('/reverse-geocode/location', getAddressFromCoordinates);

// GET: Get all addresses of a user
router.get('/:userId', getUserAddresses);

// POST: Add a new address manually
router.post('/', addManualAddress);

// PUT: Update an existing address by ID
router.put('/:addressId', updateAddress);

// DELETE: Delete an address by ID
router.delete('/:addressId', deleteAddress);

module.exports = router;
