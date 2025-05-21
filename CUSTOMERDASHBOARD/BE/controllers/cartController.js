const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, image } = req.body;

  try {
    // Find cart for user
    let cart = await Cart.findOne({ userId });

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If cart doesn't exist, create new cart with this product
    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, price, image, quantity: 1 }]
      });
      return res.status(201).json({ message: 'Cart created', cart: newCart });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      // If exists, increment quantity by 1
      existingItem.quantity += 1;
    } else {
      // Else, add new item with quantity 1
      cart.items.push({ productId, name, price, image, quantity: 1 });
    }

    // Save updated cart
    await cart.save();

    return res.status(200).json({ message: 'Cart updated', cart });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }


};



// Get user's cart
exports.getUserCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product', // ✅ Ensure correct model name
      select: 'category liquorType name price image'
    });

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
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemToUpdate = cart.items.find(item => item.productId._id.toString() === productId);
    if (!itemToUpdate) return res.status(404).json({ message: 'Item not found in cart' });

    if (itemToUpdate.quantity === quantity) {
      return res.status(200).json({ message: 'No change', cart });
    }

    // Simply update quantity without any checks
    itemToUpdate.quantity = quantity;
    await cart.save();

    return res.status(200).json({ message: 'Quantity updated', cart });

  } catch (error) {
    console.error('Error updating quantity:', error);
    return res.status(500).json({ message: 'Error updating quantity', error: error.message });
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

// Clear entire cart
exports.clearCart = async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
