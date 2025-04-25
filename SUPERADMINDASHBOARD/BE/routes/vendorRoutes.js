const express = require('express');
const router = express.Router();
const { getAllVendors, updateVendorStatus } = require('../controllers/vendorController');

router.get('/vendors', getAllVendors); // GET all
router.put('/vendor/:id/status', updateVendorStatus); // Update status

module.exports = router;
