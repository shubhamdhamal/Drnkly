const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentVendors } = require('../controllers/dashboardController');

router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-vendors', getRecentVendors);

module.exports = router;
