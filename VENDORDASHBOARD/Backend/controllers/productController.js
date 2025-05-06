const Product = require('../models/product');
const path = require('path');
const multer = require('multer');

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, Date.now() + ext); // Add a timestamp to the filename to avoid collisions
  }
});

const upload = multer({ storage }).single('image'); // Set the field name for the image to 'image'

// Function to categorize liquor based on alcohol content
const categorizeLiquor = (alcoholContent) => {
  if (alcoholContent >= 40) {
    return 'Hard Liquor';
  } else {
    return 'Mild Liquor';
  }
};

// Add product with image upload handling
exports.addProduct = async (req, res) => {
  try {
    const { name, brand, category, alcoholContent, price, stock, volume, description } = req.body;

    // Check the liquor type based on alcohol content
    const liquorType = categorizeLiquor(alcoholContent);

    // ✅ Check image file from multer
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Image URL to return in API

    const newProduct = new Product({
      name,
      brand,
      category,
      alcoholContent,
      price,
      stock,
      volume,
      description,
      image,
      liquorType, // Add liquor type based on the categorization
      vendorId: req.vendorId,
      inStock: stock > 0, // Set inStock based on stock availability
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct
    });

  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Fetch products for the logged-in vendor
exports.getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.vendorId; // Extracted from JWT by middleware
    const products = await Product.find({ vendorId }); // Filter by vendor
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Update product details
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from URL params
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(updatedProduct); // Send updated product back to client
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// Delete product (DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from URL params
    console.log('Deleting product with ID:', id); // Debugging log

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};
