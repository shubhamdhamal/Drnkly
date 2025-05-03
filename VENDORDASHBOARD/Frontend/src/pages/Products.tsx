import React, { useState, useEffect } from 'react';
import { Plus, Search, Wine, Edit, Trash2, X } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import FileUpload from '../components/FileUpload';
import axios from 'axios';

interface Product {
  _id: string; // Use _id for MongoDB ID
  name: string;
  brand: string;
  category: string;
  alcoholContent: number;
  price: number;
  stock: number;
  description: string;
  volume: number;
  image: string; // Image path will be saved in the database
}

interface Category {
  _id: string;
  name: string;
}

const Products: React.FC = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch products and categories when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
  
        const response = await axios.get('https://drnkly.in/vendor/api/products/vendor', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setProducts(response.data.products); // Set vendor's products
      } catch (error) {
        console.error('Error fetching vendor products:', error);
      }
    };
  
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://drnkly.in/vendor/api/categories');
        setCategories(response.data.categories); // Update state with categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchProducts();
    fetchCategories();
  }, []);
  

const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No authentication token found');
    return;
  }

  try {
    const response = await axios.post('https://drnkly.in/vendor/api/products/add', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Important to set this header
      },
    });

    // Add the newly created product to the state
    setProducts((prevProducts) => [...prevProducts, response.data.product]);

    setShowAddProduct(false); // Close the modal
    form.reset(); // Reset the form fields
  } catch (error) {
    console.error('Error adding product:', error);
  }
};


  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct?._id) {
      console.error('Product ID is missing:', editingProduct);
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      category: formData.get('category') as string,
      alcoholContent: Number(formData.get('alcoholContent')),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      description: formData.get('description') as string,
      volume: Number(formData.get('volume')),
    };

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Sending the PUT request to update the product
      const response = await axios.put(
        `https://drnkly.in/vendor/api/products/${updatedProduct._id}`, // Use _id instead of id
        updatedProduct,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // After successful update, update the state to reflect the changes in the current page
      setProducts(
        products.map((p) =>
          p._id === updatedProduct._id ? response.data.product : p
        )
      );

      // Close the modal and reset editing states
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Send DELETE request to backend
        await axios.delete(`https://drnkly.in/vendor/api/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Remove the product from the state
        setProducts(products.filter((p) => p._id !== productId)); // Remove from UI
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ProductForm = ({
    product,
    onSubmit,
    isEditing,
  }: {
    product?: Product;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Product Name" name="name" required defaultValue={product?.name} />
        <Input label="Brand" name="brand" required defaultValue={product?.brand} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="category"
          className="w-full px-3 py-2 border rounded-lg"
          defaultValue={product?.category}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <Input
          label="Alcohol Content (%)"
          type="number"
          name="alcoholContent"
          required
          defaultValue={product?.alcoholContent}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Price" type="number" name="price" required defaultValue={product?.price} />
        <Input label="Stock" type="number" name="stock" required defaultValue={product?.stock} />
        <Input label="Volume (ml)" type="number" name="volume" required defaultValue={product?.volume} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          defaultValue={product?.description}
          required
        />
      </div>

      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
  <input
    type="file"
    name="image"
    accept=".jpg,.jpeg,.png"
    className="w-full px-3 py-2 border rounded-lg"
    required={!isEditing}
  />
</div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            setShowAddProduct(false);
            setIsEditing(false);
            setEditingProduct(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setShowAddProduct(true)} // Toggles the modal visibility
        >
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            icon={<Search className="w-5 h-5 text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={`https://drnkly.in/vendor${product.image}`} // The image path returned by the backend
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {product.alcoholContent}% ABV
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">₹{product.price}</p>
                <p className={`text-sm ${product.stock > 20 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock} in stock
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" icon={<Edit className="w-4 h-4" />} onClick={() => {
                  setIsEditing(true);
                  setEditingProduct(product);
                }}>
                  Edit
                </Button>
                <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteProduct(product._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setIsEditing(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={isEditing ? handleEditProduct : handleAddProduct}
              isEditing={isEditing}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;