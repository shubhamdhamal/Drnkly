const express = require('express');
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/:userId', getUserCart);
router.put('/update', updateQuantity);
router.delete('/remove', removeFromCart);
router.post('/clear', clearCart); 

module.exports = router;
