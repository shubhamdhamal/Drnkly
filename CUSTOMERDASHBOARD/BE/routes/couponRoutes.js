// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupons');

router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();  // normalize incoming code
    const coupon = await Coupon.findOne({ code: { $regex: `^${code}$`, $options: 'i' } }); // case-insensitive

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
