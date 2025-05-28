const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { superAdminLogin } = require('../controllers/superAdminController');

// ✅ Rate limiter for login route (max 5 tries in 15 mins)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 mins
  max: 5,
  message: 'Too many login attempts. Try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔐 Superadmin login route
router.post('/login', loginLimiter, superAdminLogin);

module.exports = router;
