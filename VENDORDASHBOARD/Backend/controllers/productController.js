const Product = require('../models/product');
const path = require('path');
const multer = require('multer');
// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/var/www/Drnkly/images/uploads');  // ✅ Matches Nginx path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); 
  }
});

const upload = multer({ storage }).single('image');



// Function to categorize liquor based on alcohol content
const categorizeLiquor = (alcoholContent) => {
  if (alcoholContent >= 40) {
    return 'Hard Liquor';
  } else {
    return 'Mild Liquor';
  }
};

exports.addProduct = async (req, res) => {
  try {
    const {
      name, brand, category,
      alcoholContent, price, stock, volume, description
    } = req.body;

    // Check the liquor type based on alcohol content
    const liquorType = categorizeLiquor(alcoholContent);

    // ✅ Check image file from multer
    const image = req.file ? `https://image.peghouse.in/uploads/${req.file.filename}` : null;

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


exports.updateStockForProducts = async (req, res) => {
  try {
    const { products } = req.body;

    // Ensure products is an array
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "'products' should be an array" });
    }

    const updatePromises = products.map(async (product) => {
      const { productId, inStock } = product;

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: `Invalid productId: ${productId}` });
      }

      // Find the product and update its inStock status
      return await Product.findByIdAndUpdate(
        productId, 
        { inStock }, 
        { new: true } // Return the updated product
      );
    });

    const updatedProducts = await Promise.all(updatePromises);
    res.status(200).json({ updatedProducts });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ error: 'Error updating product stock' });
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


  
  
  // Fetch products for the logged-in vendor
  exports.getProductsByVendor = async (req, res) => {
    try {
      const vendorId = req.vendorId; // Extract vendorId from the JWT token
      const products = await Product.find({ vendorId }); // Fetch all products by the vendorId
      
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };
  
  
  // productController.js
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

  
// productController.js

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