const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Function to categorize liquor as Hard or Mild
const categorizeLiquor = (alcoholContent) => {
  return alcoholContent >= 40 ? 'Hard Liquor' : 'Mild Liquor';
};

exports.addToCart = async (req, res) => {
  const { userId, productId, name, price, image, volume, alcoholContent } = req.body;

  try {
    // Fetch the user's cart and populate product details to access liquorType
    let cart = await Cart.findOne({ userId }).populate('items.productId'); // Populating items to access full product info

    // If no cart exists, create one
    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, price, image, quantity: 1 }]
      });
      return res.status(201).json({ message: 'Cart created', cart: newCart });
    }

    // Count current Hard and Mild Liquors in the cart
    let hardLiquorCount = 0;
    let mildLiquorCount = 0;

    cart.items.forEach(item => {
      const product = item.productId; // Populated product info
      const liquorType = product.liquorType;

      if (liquorType === 'Hard Liquor') {
        hardLiquorCount += item.quantity;
      } else if (liquorType === 'Mild Liquor') {
        mildLiquorCount += item.quantity;
      }
    });

    // Fetch the liquor type of the new product being added
    const newProduct = await Product.findById(productId);
    const newLiquorType = newProduct.liquorType;

    // Check if the addition of this product violates the restrictions
    if (newLiquorType === 'Hard Liquor') {
      if (hardLiquorCount >= 2) {
        return res.status(400).json({ message: 'You can only add up to 2 Hard Liquors to the cart' });
      }
      if (mildLiquorCount + 1 > 6) {
        return res.status(400).json({ message: 'You can add only 1 Hard Liquor and up to 6 Mild Liquors' });
      }
    }

    if (newLiquorType === 'Mild Liquor') {
      if (mildLiquorCount >= 12) {
        return res.status(400).json({ message: 'You can only add up to 12 Mild Liquors to the cart' });
      }
    }

    // Add the product to the cart if no issues
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += 1; // Update quantity if the item already exists
    } else {
      cart.items.push({ productId, name, price, image, quantity: 1 }); // Add the new item to the cart
    }

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
    // Fetch the user's cart and populate product details to access liquorType
    let cart = await Cart.findOne({ userId }).populate('items.productId');  // Populating items to access full product info

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Count current Hard and Mild Liquors in the cart
    let hardLiquorCount = 0;
    let mildLiquorCount = 0;

    cart.items.forEach(item => {
      const product = item.productId;  // Populated product info
      const liquorType = product.liquorType;

      if (liquorType === 'Hard Liquor') {
        hardLiquorCount += item.quantity;
      } else if (liquorType === 'Mild Liquor') {
        mildLiquorCount += item.quantity;
      }
    });

    // Fetch the liquor type of the product being updated
    const product = await Product.findById(productId);
    const newLiquorType = product.liquorType;

    // Check if the update violates any restrictions
    if (newLiquorType === 'Hard Liquor') {
      // If updating a Hard Liquor, check if the count exceeds 2
      if (hardLiquorCount + quantity > 2) {
        return res.status(400).json({ message: 'You can only add up to 2 Hard Liquors to the cart' });
      }
      // If updating a Hard Liquor, check if the count exceeds 1 Hard + 6 Mild
      if (mildLiquorCount + quantity > 6) {
        return res.status(400).json({ message: 'You can add only 1 Hard Liquor and up to 6 Mild Liquors' });
      }
    }

    if (newLiquorType === 'Mild Liquor') {
      // If updating a Mild Liquor, check if the count exceeds 12
      if (mildLiquorCount + quantity > 12) {
        return res.status(400).json({ message: 'You can only add up to 12 Mild Liquors to the cart' });
      }
    }

    // Find the item to update and update the quantity
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