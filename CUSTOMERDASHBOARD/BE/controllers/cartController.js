const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, image } = req.body;

  try {
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    const newProduct = await Product.findById(productId);
    if (!newProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newLiquorType = newProduct.liquorType;

    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, price, image, quantity: 1 }]
      });
      return res.status(201).json({ message: 'Cart created', cart: newCart });
    }

    let hardLiquorCount = 0;
    let mildLiquorCount = 0;
    let existingItem = null;

    // Count current quantities (excluding the current product if already in cart)
    cart.items.forEach(item => {
      const type = item.productId.liquorType;
      const qty = item.quantity;
      const isSameProduct = item.productId._id.toString() === productId;

      if (isSameProduct) {
        existingItem = item;
        return;
      }

      if (type === 'Hard Liquor') hardLiquorCount += qty;
      if (type === 'Mild Liquor') mildLiquorCount += qty;
    });

    // Add +1 to respective type
    const addQty = 1;
    const futureHard = newLiquorType === 'Hard Liquor'
      ? hardLiquorCount + addQty + (existingItem && existingItem.productId.liquorType === 'Hard Liquor' ? existingItem.quantity : 0)
      : hardLiquorCount + (existingItem && existingItem.productId.liquorType === 'Hard Liquor' ? existingItem.quantity : 0);

    const futureMild = newLiquorType === 'Mild Liquor'
      ? mildLiquorCount + addQty + (existingItem && existingItem.productId.liquorType === 'Mild Liquor' ? existingItem.quantity : 0)
      : mildLiquorCount + (existingItem && existingItem.productId.liquorType === 'Mild Liquor' ? existingItem.quantity : 0);

    // ❌ BLOCKERS — BEFORE mutation
    if (hardLiquorCount === 2 && newLiquorType === 'Mild Liquor') {
      return res.status(400).json({ message: '❌ Cannot add Mild Liquor when 2 Hard Liquors already in cart.' });
    }

    if (mildLiquorCount === 12 && newLiquorType === 'Hard Liquor') {
      return res.status(400).json({ message: '❌ Cannot add Hard Liquor when 12 Mild Liquors already in cart.' });
    }

    if (futureHard > 2) {
      return res.status(400).json({ message: '❌ Max 2 Hard Liquors allowed.' });
    }

    if (futureMild > 12) {
      return res.status(400).json({ message: '❌ Max 12 Mild Liquors allowed.' });
    }

    if (futureHard === 1 && futureMild > 6) {
      return res.status(400).json({ message: '❌ Only 1 Hard + up to 6 Mild allowed.' });
    }

    if (futureHard === 2 && futureMild > 0) {
      return res.status(400).json({ message: '❌ Cannot mix 2 Hard with any Mild Liquor.' });
    }

    // ✅ PASS — Proceed to update cart
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
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
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'category liquorType name price image'
    });

    // ✅ Log to check if `category` is being populated
    console.log('Cart:', JSON.stringify(cart, null, 2));

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
