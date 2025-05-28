const express = require('express');
const router = express.Router();
const { getAllVendors, updateVendorStatus } = require('../controllers/vendorController');
const verifySuperAdminToken = require('../middleware/authMiddleware');

router.get('/vendors', verifySuperAdminToken, getAllVendors);
router.put('/vendor/:id/status', verifySuperAdminToken, updateVendorStatus);

module.exports = router;
