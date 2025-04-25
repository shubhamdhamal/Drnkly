const Product = require('../models/Product');
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

// Add a new product
// exports.addProduct = async (req, res) => {
//   try {
//     const { name, brand, category, alcoholContent, price, stock, volume, description } = req.body;
//     const image = req.file ? `/uploads/${req.file.filename}` : null; // Save the image path
    
//     const newProduct = new Product({
//       name,
//       brand,
//       category,
//       alcoholContent,
//       price,
//       stock,
//       volume,
//       description,
//       image, // Save the image path to the database
//       vendorId: req.vendorId, // The vendor ID from the JWT token
//       inStock: false, // Default value when the product is added
//     });

//     await newProduct.save();

//     res.status(201).json({
//       message: 'Product added successfully',
//       product: newProduct,  // Return the newly added product with the image path
//     });
//   } catch (err) {
//     console.error('Error adding product:', err);
//     res.status(500).json({ error: 'Failed to add product' });
//   }
// };
  

exports.addProduct = async (req, res) => {
  try {
    const {
      name, brand, category,
      alcoholContent, price, stock, volume, description
    } = req.body;

    // ✅ Check image file from multer
    const image = req.file ? `/uploads/${req.file.filename}` : null;

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
      vendorId: req.vendorId,
      inStock: false
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