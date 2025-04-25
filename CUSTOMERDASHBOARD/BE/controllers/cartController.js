const Cart = require('../models/Cart');

// Add item to cart
exports.addToCart = async (req, res) => {
  let { userId, productId, name, price, image } = req.body;

  try {
    // Clean the price if it's a string (e.g. "$32132")
    if (typeof price === 'string') {
      price = Number(price.replace(/[^\d.]/g, ''));
    }

    if (isNaN(price)) {
      return res.status(400).json({ message: 'Invalid price value' });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ productId, name, price, image, quantity: 1 }); // ✅ Ensure quantity
      }
      await cart.save();
      return res.status(200).json({ message: 'Cart updated', cart });
    }

    // Create new cart
    const newCart = await Cart.create({
      userId,
      items: [{ productId, name, price, image, quantity: 1 }] // ✅ Ensure quantity
    });

    res.status(201).json({ message: 'Cart created', cart: newCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Get user's cart
exports.getUserCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Update quantity
exports.updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: 'Quantity updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quantity', error: error.message });
  }
};

// Remove item
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: 'Item removed', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
};
