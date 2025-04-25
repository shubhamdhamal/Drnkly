const express = require('express');
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateQuantity,
  removeFromCart
} = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/:userId', getUserCart);
router.put('/update', updateQuantity);
router.delete('/remove', removeFromCart);

module.exports = router;
