const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../controllers/orderController');

router.get('/orders', getAllOrders);

module.exports = router;
