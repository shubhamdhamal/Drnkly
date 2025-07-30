const express = require('express');
const router = express.Router();
const { getAllDeliveryPartners } = require('../controllers/deliveryBoyController');

// GET /api/delivery-partners
router.get('/delivery-partners', getAllDeliveryPartners);

module.exports = router;
