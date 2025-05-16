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
  alcoholContent?: number; // Made optional since not all products have this
  restaurant?: string;
}

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { _id: '1', name: 'All' },
    { _id: '2', name: 'Drinks' },
    { _id: '3', name: 'Cigarette' },
    { _id: '4', name: 'Soft Drinks' },
    { _id: '5', name: 'Snacks' },
    { _id: '6', name: 'Food' },
    { _id: '7', name: 'Glasses & Plates' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Read category and restaurant from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const restaurantParam = params.get('restaurant');
    
    console.log('Category from URL:', categoryParam);
    console.log('Restaurant from URL:', restaurantParam);
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (restaurantParam) {
      setSelectedRestaurant(restaurantParam);
    }
  }, [location]);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get('https://peghouse.in/api/products');
        console.log('Fetched Products:', productRes.data);
        setProducts(productRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Add useEffect to check login status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token && !!userId);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("locationGranted");
    setIsLoggedIn(false);
    navigate('/login');
  };

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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
      console.error('Cart Error:', error);
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
    console.log('Initial products:', filtered);
    console.log('Selected category:', selectedCategory);
    console.log('Selected restaurant:', selectedRestaurant);

    // Filter by restaurant if selected
    if (selectedRestaurant) {
      filtered = filtered.filter(product => product.restaurant === selectedRestaurant);
    }

    // Filter by category if not "All"
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => {
        const productCategory = product.category;
        const selected = selectedCategory;
        
        console.log(`Comparing - Product: "${productCategory}" with Selected: "${selected}"`);
        
        // First try exact match
        if (productCategory === selected) {
          console.log('Exact match found!');
          return true;
        }
        
        // Then try case-insensitive match
        if (productCategory.toLowerCase() === selected.toLowerCase()) {
          console.log('Case-insensitive match found!');
          return true;
        }
        
        // Finally try with trimmed spaces
        const trimmedProduct = productCategory.trim().toLowerCase();
        const trimmedSelected = selected.trim().toLowerCase();
        const trimMatch = trimmedProduct === trimmedSelected;
        console.log(`Trimmed match: ${trimMatch}`);
        
        return trimMatch;
      });
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

    filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

    return filtered;
  };

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    console.log('Changing category to:', category);
    setSelectedCategory(category);
    const params = new URLSearchParams(location.search);
    
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Preserve restaurant parameter if it exists
    if (selectedRestaurant) {
      params.set('restaurant', selectedRestaurant);
    }
    
    navigate({ search: params.toString() });
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
        {selectedRestaurant && (
          <div className="text-xl font-semibold text-[#cd6839]">
            {selectedRestaurant}
          </div>
        )}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
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
              Logout
            </button>
          ) : (
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
          )}
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
        />
      </div>

      {/* Categories from Backend */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', overflowX: 'auto' }}>
        {categories.map((cat) => (
          <button
            key={cat._id}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.name ? '#cd6839' : '#f5f5f5',
              color: selectedCategory === cat.name ? 'white' : 'black',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
            onClick={() => {
              console.log('Category clicked:', cat.name);
              if (cat.name === 'All') {
                handleCategoryChange('All');
              } else {
                handleCategoryChange(cat.name);
              }
            }}
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
              <p style={{ color: '#666', margin: '5px 0' }}>{product.volume} ml</p>
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
