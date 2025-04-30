const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, image } = req.body;

  try {
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    const newProduct = await Product.findById(productId);
    const newLiquorType = newProduct.liquorType;

    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, price, image, quantity: 1 }]
      });
      return res.status(201).json({ message: 'Cart created', cart: newCart });
    }

    // Count ALL Hard/Mild items from the entire cart INCLUDING this one (as future state)
    let hardLiquorCount = 0;
    let mildLiquorCount = 0;
    let found = false;

    const updatedItems = cart.items.map(item => {
      if (item.productId._id.toString() === productId) {
        found = true;
        item.quantity += 1;
      }

      const type = item.productId.liquorType;
      const quantity = item.quantity;

      if (type === 'Hard Liquor') hardLiquorCount += quantity;
      else if (type === 'Mild Liquor') mildLiquorCount += quantity;

      return item;
    });

    // If this is a new product being added
    if (!found) {
      if (newLiquorType === 'Hard Liquor') hardLiquorCount += 1;
      else if (newLiquorType === 'Mild Liquor') mildLiquorCount += 1;
    }

    // 🧠 Validation based on future state
    if (hardLiquorCount > 2) {
      return res.status(400).json({ message: '❌ Max 2 Hard Liquors allowed.' });
    }
    if (hardLiquorCount === 2 && mildLiquorCount > 0) {
      return res.status(400).json({ message: '❌ Cannot mix Mild with 2 Hard Liquors.' });
    }
    if (hardLiquorCount === 1 && mildLiquorCount > 6) {
      return res.status(400).json({ message: '❌ Only 1 Hard + up to 6 Mild allowed.' });
    }
    if (hardLiquorCount === 0 && mildLiquorCount > 12) {
      return res.status(400).json({ message: '❌ Max 12 Mild Liquors allowed.' });
    }

    // ✅ All good — Save the update
    if (!found) {
      cart.items.push({ productId, name, price, image, quantity: 1 });
    }

    await cart.save();
    return res.status(200).json({ message: '✅ Cart updated', cart });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Error adding to cart', error: error.message });
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
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemToUpdate = cart.items.find(item => item.productId._id.toString() === productId);
    if (!itemToUpdate) return res.status(404).json({ message: 'Item not found in cart' });

    const newLiquorType = itemToUpdate.productId.liquorType;
    const currentQty = itemToUpdate.quantity;
    const delta = quantity - currentQty;

    if (delta === 0) return res.status(200).json({ message: 'No change', cart });

    // Count Hard and Mild (excluding this item)
    let hardLiquorCount = 0;
    let mildLiquorCount = 0;

    cart.items.forEach(item => {
      if (item.productId._id.toString() === productId) return; // skip current
      const type = item.productId.liquorType;
      if (type === 'Hard Liquor') hardLiquorCount += item.quantity;
      else if (type === 'Mild Liquor') mildLiquorCount += item.quantity;
    });

    // Simulate new totals
    const futureHard = newLiquorType === 'Hard Liquor'
      ? hardLiquorCount + quantity
      : hardLiquorCount;

    const futureMild = newLiquorType === 'Mild Liquor'
      ? mildLiquorCount + quantity
      : mildLiquorCount;

    // ✅ Enforce all restrictions
    if (futureHard > 2) {
      return res.status(400).json({ message: '❌ Max 2 Hard Liquors allowed.' });
    }
    if (futureHard === 2 && futureMild > 0) {
      return res.status(400).json({ message: '❌ Cannot mix Mild with 2 Hard Liquors.' });
    }
    if (futureHard === 1 && futureMild > 6) {
      return res.status(400).json({ message: '❌ Only 1 Hard + up to 6 Mild allowed.' });
    }
    if (futureHard === 0 && futureMild > 12) {
      return res.status(400).json({ message: '❌ Max 12 Mild Liquors allowed.' });
    }

    // ✅ Update quantity
    itemToUpdate.quantity = quantity;
    await cart.save();

    return res.status(200).json({ message: '✅ Quantity updated', cart });

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