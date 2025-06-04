const express = require('express');
const router = express.Router();
const { getAllVendors, updateVendorStatus,getVendorById } = require('../controllers/vendorController');
const verifySuperAdminToken = require('../middleware/authMiddleware');

router.get('/vendors', verifySuperAdminToken, getAllVendors);
router.put('/vendor/:id/status', verifySuperAdminToken, updateVendorStatus);
router.get('/vendors/:id', verifySuperAdminToken, getVendorById);

module.exports = router;
