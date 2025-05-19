import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wine, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  volume: number;
  category: string;
  brand: string;
  alcoholContent?: number;
}

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const storeParam = params.get('store');
    const searchParam = params.get('search');

    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }

    if (storeParam === 'sunrise') {
      // Add Food category if it doesn't exist
      if (!categories.some(cat => cat.name === 'Food')) {
        setCategories(prev => [...prev, { _id: 'food', name: 'Food' }]);
      }
      setSelectedCategory('food');
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search, categories]);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          axios.get('https://peghouse.in/api/products'),
          axios.get('https://peghouse.in/api/categories'),
        ]);
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching data:', err.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
  
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in first');
      navigate('/login');
      return;
    }
  
    try {
      const res = await axios.post('https://peghouse.in/api/cart/add', {
        userId,
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        volume: product.volume,
        alcoholContent: product.alcoholContent
      });
  
      alert(`${product.name} added to cart!`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Failed to add to cart');
      } else {
        alert('Failed to add to cart');
      }
      console.error('Cart Error:', err);
    }
  };

  const getPriceRanges = () => [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹30', value: '0-30' },
    { label: '₹30 - ₹50', value: '30-50' },
    { label: '₹50 - ₹80', value: '50-80' },
    { label: 'Over ₹80', value: '80+' }
  ];

  const getBrands = () => {
    const filteredProducts = selectedCategory === 'all'
      ? products
      : products.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());
    
    const brands = new Set(filteredProducts.map(product => product.brand));
    return ['all', ...Array.from(brands)];
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) return product.price >= min && product.price <= max;
        return product.price >= min;
      });
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.brand.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      {/* Top Navbar */}
     
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-1">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/finallogo.png"
            alt="Drnkly Logo"
            className="h-20 md:h-24 lg:h-26 object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 16px',
              background: '#cd6839',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Login
          </button>
          <ShoppingCart
            onClick={() => navigate('/cart')}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for drinks..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            // No need to manually update URL - only update query state
          }}
          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
        />
      </div>

      {/* Categories from Backend */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', overflowX: 'auto' }}>
        <button
          style={{
            padding: '8px 16px',
            background: selectedCategory === 'all' ? '#cd6839' : '#f5f5f5',
            color: selectedCategory === 'all' ? 'white' : 'black',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.name.toLowerCase() ? '#cd6839' : '#f5f5f5',
              color: selectedCategory === cat.name.toLowerCase() ? 'white' : 'black',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedCategory(cat.name.toLowerCase())}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', position: 'relative' }}>
        {/* Price Filter */}
        <div style={{ width: '30%', position: 'relative' }}>
          <button
            onClick={() => {
              setShowPriceFilter(!showPriceFilter);
              setShowBrandFilter(false);
            }}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            Price <ChevronDown size={16} />
          </button>
          {showPriceFilter && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 10,
              marginTop: '4px'
            }}>
              {getPriceRanges().map(range => (
                <button
                  key={range.value}
                  onClick={() => {
                    setPriceRange(range.value);
                    setShowPriceFilter(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: priceRange === range.value ? '#cd6839' : 'black'
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div style={{ width: '30%', position: 'relative' }}>
          <button
            onClick={() => {
              setShowBrandFilter(!showBrandFilter);
              setShowPriceFilter(false);
            }}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            Brand <ChevronDown size={16} />
          </button>
          {showBrandFilter && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 10,
              marginTop: '4px'
            }}>
              {getBrands().map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setShowBrandFilter(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: selectedBrand === brand ? '#cd6839' : 'black'
                  }}
                >
                  {brand === 'all' ? 'All Brands' : brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Button */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '8px',
            width: '30%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          Sort: {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
        </button>
      </div>

      {/* Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
        gap: '20px',
        alignItems: 'stretch' // Changed to stretch to make all boxes same height
      }}>
        {filterProducts().map((product) => (
          <div
            key={product._id}
            style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '10px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: '100%', // Take full height
              justifyContent: 'space-between' // This will push the button to bottom
            }}
          >
            <div> {/* Content wrapper */}
              <div style={{ 
                width: '100%',
                height: '200px',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </div>
              <h3 style={{ margin: '10px 0', fontSize: '16px' }}>{product.name}</h3>
              <p style={{ color: '#666', margin: '5px 0' }}>{product.brand}</p>
              {!['snacks', 'cigarette', 'glasses & plates'].includes(product.category.toLowerCase()) && (
  <p style={{ color: '#666', margin: '5px 0' }}>{product.volume} ml</p>
)}
              <p style={{ color: '#666', margin: '5px 0' }}>₹{product.price}</p>
            </div>
            
            <button
              onClick={(e) => handleAddToCart(e, product)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#cd6839',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                marginTop: 'auto', // This pushes button to bottom
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
