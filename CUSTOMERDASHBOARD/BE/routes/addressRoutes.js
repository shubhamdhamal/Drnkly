// routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAddressFromCoordinates,
  getUserAddresses,
  addManualAddress
} = require('../controllers/addressController');

// GET: reverse geocode from lat/lng and save
router.get('/reverse-geocode/location', getAddressFromCoordinates);

// GET: get all addresses of a user
router.get('/:userId', getUserAddresses);

// POST: add a new address manually
router.post('/', addManualAddress);

module.exports = router;
