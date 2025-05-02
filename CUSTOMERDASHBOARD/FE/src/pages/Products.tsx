import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Products() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    volume: number;
    category: string;
    brand: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          axios.get('http://drnkly.in/api/products'),
          axios.get('http://drnkly.in/api/categories'),
        ]);
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
  
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in first');
      return;
    }
  
    try {
      // Proceed to add the product to the cart
      const res = await axios.post('http://drnkly.in/api/cart/add', {
        userId,
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        volume: product.volume,
        alcoholContent: product.alcoholContent
      });
  
      alert(`${product.name} added to cart!`);
    } catch (error) {
      // If the error is due to restrictions, show an alert
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

    filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

    return filtered;
  };

  return (
    <div className="container">
      {/* Top Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 0' }}>
        <h1 style={{ margin: '0 auto' }}>Logo</h1>
        <ShoppingCart onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
        {filterProducts().map((product) => (
          <div
            key={product._id}
            style={{ background: 'white', borderRadius: '12px', padding: '10px', textAlign: 'center' }}
          >
            <img
              src={`http://drnkly.in${product.image}`}
              alt={product.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <h3 style={{ margin: '10px 0', fontSize: '16px' }}>{product.name}</h3>
            <p style={{ color: '#666', margin: '5px 0' }}>{product.brand}</p>
            <p style={{ color: '#666', margin: '5px 0' }}>{product.volume} ml</p>
            
            <p style={{ color: '#666', margin: '5px 0' }}>₹{product.price}</p>
            <button
              onClick={(e) => handleAddToCart(e, product)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#cd6839',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                marginTop: '10px',
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
