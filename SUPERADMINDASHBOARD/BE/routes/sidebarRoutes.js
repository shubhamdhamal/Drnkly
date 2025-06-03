// BE/routes/sidebarRoutes.js
const express = require('express');
const router = express.Router();
const { getSidebarStats } = require('../controllers/sidebarController');
const verifySuperAdminToken = require('../middleware/authMiddleware');

router.get('/sidebar-stats', verifySuperAdminToken, getSidebarStats);

module.exports = router;
