const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentVendors } = require('../controllers/dashboardController');
const verifySuperAdminToken = require('../middleware/authMiddleware');

router.get('/dashboard-stats', verifySuperAdminToken, getDashboardStats);
router.get('/recent-vendors', verifySuperAdminToken, getRecentVendors);

module.exports = router;
