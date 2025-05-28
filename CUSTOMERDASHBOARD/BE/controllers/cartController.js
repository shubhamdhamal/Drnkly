const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, image } = req.body;

  try {
    // Fetch product details from DB to check volume and name
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is Old Monk 180 ml
    const isOldMonk180 = product.name.toLowerCase().includes('old monk') && product.volume === 180;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with this product
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, price, image, quantity: 1 }]
      });

      const populatedCart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product',
        select: 'category liquorType name price image volume'
      });

      return res.status(201).json({ message: 'Cart created', cart: populatedCart });
    }

    // Check if Old Monk 180ml is already in the cart (fresh from DB)
    const oldMonkInCart = cart.items.some(item => {
      const isOldMonkItem = item.productId.toString() === productId && isOldMonk180;
      return isOldMonkItem;
    });

    if (isOldMonk180 && oldMonkInCart) {
      // Prevent adding duplicate 180ml Old Monk
      return res.status(400).json({ message: '180ml Old Monk can only be added once' });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      // For other products increment quantity normally
      existingItem.quantity += 1;
    } else {
      // Add new product to cart
      cart.items.push({ productId, name, price, image, quantity: 1 });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'category liquorType name price image volume'
    });

    return res.status(200).json({ message: '✅ Cart updated', cart: updatedCart });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};



// ✅ Get User's Cart
exports.getUserCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'category liquorType name price image'
    });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// ✅ Update Quantity
exports.updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const isOldMonk180 = product.name.toLowerCase().includes('old monk') && product.volume === 180;

    if (isOldMonk180) {
      return res.status(400).json({ message: 'Quantity for 180ml Old Monk cannot be updated' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemToUpdate = cart.items.find(item => item.productId.toString() === productId);
    if (!itemToUpdate) return res.status(404).json({ message: 'Item not found in cart' });

    itemToUpdate.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'category liquorType name price image volume'
    });

    return res.status(200).json({ message: '✅ Quantity updated', cart: updatedCart });

  } catch (error) {
    console.error('Error updating quantity:', error);
    return res.status(500).json({ message: 'Error updating quantity', error: error.message });
  }
};


// ✅ Remove from Cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'category liquorType name price image'
    });

    res.status(200).json({ message: 'Item removed', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
};

// ✅ Clear Entire Cart
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
