const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../controllers/orderController');
const verifySuperAdminToken = require('../middleware/authMiddleware');

router.get('/orders', verifySuperAdminToken, getAllOrders);

module.exports = router;
