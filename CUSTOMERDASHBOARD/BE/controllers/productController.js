const Product = require('../models/Product');

// Controller to get products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();  // Fetch products from DB
    res.json(products);  // Send products as a JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};
