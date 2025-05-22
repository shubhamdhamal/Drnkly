import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wine, Search, ShoppingCart, ChevronDown, ArrowLeft, ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Remove banner data
// const banners = [ ... ];

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

interface SubBrand {
  name: string;
  image: string;
  category: string;
}

// Cart Popup Component
const CartPopup = ({ 
  isOpen, 
  onClose, 
  items, 
  onViewCart 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[]; 
  onViewCart: () => void 
}) => {
  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryCharge = 40; // Fixed delivery charge
  const total = subtotal + deliveryCharge;

  // Get the 3 most recently added items (assuming they're at the end of the array)
  const recentItems = [...items].slice(-3).reverse();
  const remainingCount = items.length - recentItems.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative overflow-hidden shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        {/* Header */}
        <div className="bg-[#cd6839] text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Product Added to Cart
          </h2>
        </div>
        
        {/* Recently added items */}
        <div className="px-4 py-3">
          {recentItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b animate-slideIn">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-14 h-14 object-contain bg-gray-100 rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="text-sm text-center text-gray-500 mt-2">
              +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'} in cart
            </div>
          )}
        </div>
        
        {/* Bill summary */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex justify-between font-medium">
            <span>Total Items:</span>
            <span>{items.reduce((total, item) => total + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between font-medium mt-1">
            <span>Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-[#cd6839] text-[#cd6839] rounded-lg font-medium hover:bg-[#cd6839]/5 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={onViewCart}
            className="flex-1 py-2 px-4 bg-[#cd6839] text-white rounded-lg font-medium hover:bg-[#b55a31] transition-colors flex items-center justify-center"
          >
            <ShoppingBag className="mr-2" size={16} />
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubBrands, setShowSubBrands] = useState(false);
  const [subBrands, setSubBrands] = useState<SubBrand[]>([]);
  const [sortMethod, setSortMethod] = useState<'price' | 'volume'>('price');
  const [isCartPopupOpen, setIsCartPopupOpen] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const storeParam = params.get('store');
    const searchParam = params.get('search');
    const brandParam = params.get('brand');

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase();
      setSelectedCategory(catLower);
      
      // For all categories, show sub-brands when navigating from URL
      if (products.length > 0) {
        showSubBrandsForCategory(catLower);
      }
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
      
      // Special handling for Old Monk promotion
      if (searchParam.toLowerCase().includes('old monk')) {
        console.log('Old Monk search detected:', searchParam);
        
        // Set category to drinks
        setSelectedCategory('drinks');
        // Set brand to Old Monk if available
        if (products.length > 0) {
          const oldMonkProducts = products.filter(p => 
            p.name.toLowerCase().includes('old monk') || 
            p.brand.toLowerCase().includes('old monk')
          );
          
          console.log('Found Old Monk products:', oldMonkProducts.length);
          
          if (oldMonkProducts.length > 0) {
            setSelectedBrand('Old Monk');
            setShowSubBrands(false);
            
            // Show a toast notification about the free offer
            toast.success("🥃 Get a FREE Old Monk on your first order!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      }
    }
    
    if (brandParam) {
      setSelectedBrand(brandParam);
      setShowSubBrands(false);
    }
  }, [location.search, categories, products]);

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

  // Get sub-brands for a specific category
  const getSubBrandsForCategory = (category: string) => {
    // Create a map of brands and their images for the selected category
    const brandMap = new Map<string, string>();
    
    products.forEach(product => {
      if (product.category.toLowerCase() === category.toLowerCase() && product.brand) {
        if (!brandMap.has(product.brand)) {
          brandMap.set(product.brand, product.image);
        }
      }
    });
    
    // Convert to SubBrand array
    return Array.from(brandMap).map(([name, image]) => ({
      name,
      image,
      category
    }));
  };

  // Separate function to show sub-brands that can be called from useEffect and click handler
  const showSubBrandsForCategory = (category: string) => {
    // Determine sort method based on category
    if (['drinks', 'soft drinks'].includes(category)) {
      setSortMethod('volume');
    } else {
      setSortMethod('price');
    }
    
    const categorySubBrands = getSubBrandsForCategory(category);
    setSubBrands(categorySubBrands);
    setShowSubBrands(true);
  };

  // Handle category click to show sub-brands for all categories
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    showSubBrandsForCategory(category);
  };

  // Handle back from sub-brands
  const handleBackFromSubBrands = () => {
    setShowSubBrands(false);
    setSelectedBrand('all'); // Reset brand selection when returning to categories
  };

  // Handle sub-brand selection
  const handleSubBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setShowSubBrands(false);
  };

  // Modify handleAddToCart to accept an optional event parameter
const handleAddToCart = async (e: React.MouseEvent | null, product: Product) => {
  if (e) {
    e.stopPropagation();
  }

  const userId = localStorage.getItem('userId');
  if (!userId) {
    toast.error('Please log in first');
    navigate('/login');
    return;
  }

  // Check if product is Old Monk 180 ml
  const isOldMonk180 = product.name.toLowerCase().includes('old monk') && product.volume === 180;

  if (isOldMonk180) {
    // Check if already in cart
    const alreadyInCart = items.some(item =>
      item.name.toLowerCase().includes('old monk') &&
      item.volume === 180 &&
      item.quantity === 1
    );

    if (alreadyInCart) {
      toast.error('You can add only one 180ml Old Monk to the cart.');
      return;
    }
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

    // Add to local cart context
    addToCart({
      id: parseInt(product._id) || Date.now(), // Use timestamp as fallback if conversion fails
      productId: product._id,
      category: product.category,
      name: product.name,
      price: product.price,
      image: product.image,
      volume: product.volume
    });

    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    setTimeout(() => {
      setIsCartPopupOpen(true);
    }, 500);
  } catch (err: unknown) {
    if (err instanceof Error) {
      toast.error(err.message || 'Failed to add to cart');
    } else {
      toast.error('Failed to add to cart');
    }
    console.error('Cart Error:', err);
  }
};


  // Handle view cart action
  const handleViewCart = () => {
    setIsCartPopupOpen(false);
    navigate('/cart');
  };

  const getPriceRanges = () => [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹30', value: '0-30' },
    { label: '₹30 - ₹50', value: '30-50' },
    { label: '₹50 - ₹80', value: '50-80' },
    { label: 'Over ₹80', value: '80+' }
  ];

  // Filter by volume for drinks
  const filterByVolume = (products: Product[]) => {
    const filtered = [...products];
    
    if (sortOrder === 'asc') {
      return filtered.sort((a, b) => (a.volume || 0) - (b.volume || 0));
    } else {
      return filtered.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    }
  };

  // Filter by price (existing method)
  const filterByPrice = (products: Product[]) => {
    const filtered = [...products];
    
    if (sortOrder === 'asc') {
      return filtered.sort((a, b) => a.price - b.price);
    } else {
      return filtered.sort((a, b) => b.price - a.price);
    }
  };

  // The modified filter products function with sorting by category type
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

    // Apply sorting based on category type
    if (['drinks', 'soft drinks'].includes(selectedCategory.toLowerCase()) || sortMethod === 'volume') {
      return filterByVolume(filtered);
    } else {
      return filterByPrice(filtered);
    }
  };

  // Product Grid styles
  const productContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '20px',
    alignItems: 'stretch'
  };

  const productCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    justifyContent: 'space-between',
    position: 'relative' as const,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  };

  const productImageContainerStyle = {
    width: '100%',
    height: '150px',
    position: 'relative' as const,
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '10px',
    background: 'white'
  };

  const productImageStyle = {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease'
  };

  // CSS classes for hover effects
  const hoverZoomClass = `
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .product-card:hover .product-image {
      transform: scale(1.1);
    }
    .brand-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .brand-card:hover .brand-image {
      transform: scale(1.1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease forwards;
    }
    
    .animate-slideIn {
      animation: slideIn 0.4s ease forwards;
    }
  `;

  return (
    <div className="container mx-auto" style={{ 
      padding: '20px',
      backgroundImage: 'url(https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Add style tag for hover effects */}
      <style>{hoverZoomClass}</style>
      
      {/* Overlay to make content more visible */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)'
      }}></div>
      
      {/* Content Container - will sit above the overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>
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
            <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
              <ShoppingCart className="hover:text-[#cd6839] transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#cd6839] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </div>
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
            }}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
          />
        </div>

        {/* Sub-Brands Horizontal Display */}
        {showSubBrands ? (
          <div className="my-4">
            <div className="flex items-center mb-4">
              <button 
                onClick={handleBackFromSubBrands}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Categories</span>
              </button>
              <h2 className="ml-4 text-xl font-semibold">{selectedCategory} Brands</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {subBrands.map((subBrand) => (
                <div 
                  key={subBrand.name}
                  className={`brand-card cursor-pointer rounded-lg overflow-hidden border ${selectedBrand === subBrand.name ? 'border-[#cd6839]' : 'border-gray-200'} hover:shadow-md transition-all bg-white`}
                  onClick={() => handleSubBrandSelect(subBrand.name)}
                >
                  <div className="h-32 bg-white p-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={subBrand.image} 
                      alt={subBrand.name}
                      className="brand-image h-full object-contain bg-white transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=' + subBrand.name;
                      }}
                    />
                  </div>
                  <div className={`py-2 px-3 text-center ${selectedBrand === subBrand.name ? 'bg-orange-50 text-[#cd6839]' : 'bg-white'}`}>
                    <h3 className="text-sm font-medium">{subBrand.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Show main categories */
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
                onClick={() => handleCategoryClick(cat.name.toLowerCase())}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Display selected brand heading if not showing sub-brands */}
        {selectedBrand !== 'all' && !showSubBrands && (
          <div className="my-4 px-2">
            <h2 className="text-xl font-semibold text-[#cd6839]">Products by {selectedBrand}</h2>
          </div>
        )}

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

          {/* Sort By Filter */}
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
              Sort By {sortMethod === 'volume' ? 'Volume' : 'Price'} <ChevronDown size={16} />
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
                <button
                  onClick={() => {
                    setSortOrder('asc');
                    setShowBrandFilter(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: sortOrder === 'asc' ? '#cd6839' : 'black'
                  }}
                >
                  {sortMethod === 'volume' ? 'Volume: Low to High' : 'Price: Low to High'}
                </button>
                <button
                  onClick={() => {
                    setSortOrder('desc');
                    setShowBrandFilter(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: sortOrder === 'desc' ? '#cd6839' : 'black'
                  }}
                >
                  {sortMethod === 'volume' ? 'Volume: High to Low' : 'Price: High to Low'}
                </button>
              </div>
            )}
          </div>

          {/* Relevance Button */}
          <button
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
            Relevance
          </button>
        </div>

        {/* Product Grid */}
        <div style={productContainerStyle}>
          {filterProducts().map((product) => (
            <div
              key={product._id}
              className="product-card"
              style={productCardStyle}
              onClick={() => {
                // Navigate to product detail page if needed
                // navigate(`/product/${product._id}`);
              }}
            >
              <div> {/* Content wrapper */}
                <div style={productImageContainerStyle}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    style={productImageStyle}
                  />
                </div>
                <h3 style={{ margin: '10px 0', fontSize: '16px', fontWeight: 500, height: '40px', overflow: 'hidden' }}>{product.name}</h3>
                
                {/* Show volume for drinks */}
                {['drinks', 'soft drinks'].includes(product.category.toLowerCase()) ? (
                  <div className="flex justify-between items-center px-2 mt-2">
                    <span className="text-sm font-medium bg-blue-50 text-blue-600 py-1 px-2 rounded-lg">
                      {product.volume} ml
                    </span>
                    <span className="text-lg font-bold text-[#cd6839]">
                      ₹{product.price}
                    </span>
                  </div>
                ) : (
                  <p style={{ color: '#cd6839', fontWeight: 'bold', margin: '5px 0', fontSize: '18px' }}>₹{product.price}</p>
                )}
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
                  marginTop: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                className="hover:bg-[#b55a31]"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Cart Popup */}
      <CartPopup 
        isOpen={isCartPopupOpen}
        onClose={() => setIsCartPopupOpen(false)}
        items={items}
        onViewCart={handleViewCart}
      />
    </div>
  );
}

export default Products;
