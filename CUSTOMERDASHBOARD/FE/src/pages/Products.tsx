import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wine, Search, ShoppingCart, ChevronDown, ArrowLeft, ShoppingBag, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartCounter from '../components/CartCounter';
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
  description?: string;
}

interface SubBrand {
  name: string;
  image: string;
  category: string;
}

// Define local CartItem interface to extend the imported one
interface LocalCartItem {
  id: number;
  productId: string;
  category: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  volume?: number;
}

// Cart Popup Component
interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose, onViewCart }) => {
  const [items, setItems] = React.useState<LocalCartItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      setLoading(true);
      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        const fetchedItems = res.data.items.map((item: any) => ({
          category: item.productId.category,
          name: item.productId.name,
          image: item.productId.image,
          price: Number(item.productId.price),
          productId: item.productId._id,
          quantity: Number(item.quantity),
        }));
        setItems(fetchedItems);
      } catch (err) {
        console.error('Failed to fetch cart items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryCharge = 40; // Fixed delivery charge
  const total = subtotal + deliveryCharge;

  // Get the 3 most recently added items
  const recentItems = [...items].slice(-3).reverse();
  const remainingCount = items.length - recentItems.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative overflow-hidden shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close cart popup"
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

        {loading ? (
          <div className="p-4 text-center">Loading cart items...</div>
        ) : (
          <>
            {/* Recently added items */}
            <div className="px-4 py-3">
              {recentItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-2 border-b animate-slideIn">
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
          </>
        )}

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

// Remove mock Food products data and replace with empty array
const mockFoodProducts: Product[] = [];

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<{products: Product[], brands: string[]}>({products: [], brands: []});
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Enhanced search function with debouncing
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const isSkipped = localStorage.getItem('isSkippedLogin');
    
    const loginStatus = !!token && !isSkipped;
    setIsLoggedIn(loginStatus);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("locationGranted");
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    const brandParam = params.get('brand');
    const storeParam = params.get('store');

    // Handle Sunrise restaurant Food category
    if (storeParam === 'sunrise' && categoryParam?.toLowerCase() === 'Food') {
      setSelectedCategory('Food');
      // Add Food category if not present
      setCategories(prevCategories => {
        if (!prevCategories.some(cat => cat.name.toLowerCase() === 'Food')) {
          return [...prevCategories, { _id: 'Food', name: 'Food' }];
        }
        return prevCategories;
      });
    }

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase();
      setSelectedCategory(catLower);
      if (products.length > 0) {
        showSubBrandsForCategory(catLower);
      }
    }

    if (searchParam) {
      setSearchQuery(searchParam);
      
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          if (searchParam.trim() !== '') {
            handleSearch(searchParam);
          }
        }
      }, 100);
      
      // Special handling for Old Monk promotion
      if (searchParam.toLowerCase().includes('old monk')) {
        setSelectedCategory('drinks');
        if (products.length > 0) {
          const oldMonkProducts = products.filter(p => 
            p.name.toLowerCase().includes('old monk') || 
            p.brand.toLowerCase().includes('old monk')
          );
          
          if (oldMonkProducts.length > 0) {
            setSelectedBrand('Old Monk');
            setShowSubBrands(false);
            
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
        
        // Get store parameter
        const params = new URLSearchParams(location.search);
        const storeParam = params.get('store');
        const categoryParam = params.get('category');

        // Only filter out Food products if not coming from Sunrise restaurant
        if (!(storeParam === 'sunrise' && categoryParam?.toLowerCase() === 'Food')) {
          const filteredProducts = productRes.data.filter((product: Product) => 
            product.category.toLowerCase() !== 'Food'
          );
          setProducts(filteredProducts);
          
          const filteredCategories = categoryRes.data.filter((cat: Category) => 
            cat.name.toLowerCase() !== 'Food'
          );
          setCategories(filteredCategories);
        } else {
          // If coming from Sunrise, include all products
          setProducts(productRes.data);
          setCategories(categoryRes.data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching data:', err.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
    };

    fetchData();
  }, [location.search]);

  // Extract all unique brands from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = Array.from(new Set(products.map(product => product.brand).filter(Boolean)));
      setAllBrands(uniqueBrands);
    }
  }, [products]);

  // Enhanced search function that handles both products and brands
  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    setSearchQuery(query);
    
    if (!trimmedQuery) {
      setShowSearchResults(false);
      setSearchResults({ products: [], brands: [] });
      return;
    }
    
    // Search in products
    const matchedProducts = products.filter(product => {
      const searchableText = [
        product.name,
        product.brand,
        product.category
      ].map(text => text?.toLowerCase() || '').join(' ');
      
      return searchableText.includes(trimmedQuery);
    });
    
    // Search in brands
    const matchedBrands = allBrands.filter(brand => 
      brand.toLowerCase().includes(trimmedQuery)
    );
    
    // Sort results by relevance
    const sortedProducts = matchedProducts.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact matches first
      if (aName === trimmedQuery && bName !== trimmedQuery) return -1;
      if (bName === trimmedQuery && aName !== trimmedQuery) return 1;
      
      // Starts with query
      if (aName.startsWith(trimmedQuery) && !bName.startsWith(trimmedQuery)) return -1;
      if (bName.startsWith(trimmedQuery) && !aName.startsWith(trimmedQuery)) return 1;
      
      // Contains query
      return aName.indexOf(trimmedQuery) - bName.indexOf(trimmedQuery);
    });
    
    setSearchResults({
      products: sortedProducts.slice(0, 5), // Limit to 5 product results
      brands: matchedBrands.slice(0, 3)     // Limit to 3 brand results
    });
    
    setShowSearchResults(true);
  };

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    handleSearch(value);
  };

  // Handle product selection from search results
  const handleProductSelect = (product: Product) => {
    setSearchQuery(product.name);
    setShowSearchResults(false);
    
    // Set the selected brand to show only this product
    setSelectedBrand(product.brand);
    setShowSubBrands(false);
    
    // Scroll to the product after a short delay to allow the filter to update
    setTimeout(() => {
      const element = document.getElementById(`product-${product._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight animation
        element.classList.add('highlight-product');
        setTimeout(() => {
          element.classList.remove('highlight-product');
        }, 2000);
      }
    }, 100);
  };

  // Handle brand selection from search results
  const handleBrandSelect = (brand: string) => {
    setSearchQuery(brand);
    setSelectedBrand(brand);
    setShowSearchResults(false);
    setShowSubBrands(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Modify handleAddToCart to handle volume properly
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
  const isOldMonk180 = product.name.toLowerCase().includes('Old Monk Rum Free') && product.volume === 180;

  if (isOldMonk180) {
    // Check if already in cart
    const alreadyInCart = items.some(item =>
      item.name.toLowerCase().includes('Old Monk Rum Free') &&
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

      // Add to local cart context with the correct type
      const cartItem = {
        id: parseInt(product._id) || Date.now(),
      productId: product._id,
      category: product.category,
      name: product.name,
      price: product.price,
        image: product.image
      };
      addToCart(cartItem);

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

  // Update the productContainerStyle to make cards even more compact
  const productContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', // Reduced from 130px
    gap: '8px', // Reduced from 10px
    padding: '0 6px', // Reduced from 8px
    maxWidth: '1920px',
    margin: '0 auto',
    alignItems: 'stretch'
  };

  // Update the productCardStyle to be more minimal
  const productCardStyle = {
    background: 'white',
    borderRadius: '6px', // Reduced from 8px
    padding: '6px', // Reduced from 8px
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    justifyContent: 'space-between',
    position: 'relative' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Reduced shadow
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: 'translateY(0)',
    border: '1px solid rgba(229, 231, 235, 0.5)'
  };

  // Update the productImageContainerStyle
  const productImageContainerStyle = {
    width: '100%',
    height: '100px', // Reduced from 110px
    position: 'relative' as const,
    borderRadius: '4px', // Reduced from 6px
    overflow: 'hidden',
    marginBottom: '4px', // Reduced from 6px
    background: 'white'
  };

  // Update the productImageStyle
  const productImageStyle = {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    borderRadius: '4px', // Reduced from 6px
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
    padding: '3px' // Reduced from 4px
  };

  // Update the hoverZoomClass to be simpler
  const hoverZoomClass = `
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .product-card:hover .product-image {
      transform: scale(1.03);
    }
  `;

  // Check if we can go back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCanGoBack(window.history.state?.idx > 0);
      setCanGoForward(window.history.state?.idx < window.history.length - 1);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial check

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="container mx-auto bg-white min-h-screen">
      {/* Add style tag for hover effects */}
      <style>{hoverZoomClass}</style>
      
      {/* Content Container */}
      <div>
        {/* Header */}
        <div className="flex justify-between items-center px-2 py-1">
          <div className="flex items-center">
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
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={16} />
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
            <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
              <ShoppingCart className="hover:text-[#cd6839] transition-colors" />
              <CartCounter size="small" />
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839] focus:border-transparent transition-all"
              autoComplete="off"
              onFocus={() => {
                if (searchQuery.trim() !== '') {
                  setShowSearchResults(true);
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                  setSearchResults({ products: [], brands: [] });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Enhanced Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div 
              ref={searchResultsRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg z-20 border border-gray-200 max-h-[60vh] overflow-y-auto"
            >
              {/* Brand Results */}
              {searchResults.brands.length > 0 && (
                <div className="p-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Brands</h3>
                  {searchResults.brands.map(brand => (
                    <div 
                      key={brand} 
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors"
                      onClick={() => handleBrandSelect(brand)}
                    >
                      <Wine size={16} className="mr-2 text-[#cd6839]" />
                      <span className="font-medium">{brand}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Product Results */}
              {searchResults.products.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Products</h3>
                  {searchResults.products.map(product => (
                    <div 
                      key={product._id} 
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors group"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="w-12 h-12 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150?text=' + product.name;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-[#cd6839] transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {product.brand} • {product.category}
                        </div>
                        <div className="text-sm font-semibold text-[#cd6839] mt-1">
                          ₹{product.price}
                        </div>
                      </div>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-[#cd6839]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {searchResults.products.length === 0 && searchResults.brands.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords or browse categories</p>
                </div>
              )}
            </div>
          )}
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
          {selectedCategory === 'Food' ? (
            <div style={{
              width: '100%',
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                color: '#4B5563',
                marginBottom: '10px'
              }}>
                Food Menu Coming Soon
              </h3>
              <p style={{ 
                color: '#6B7280',
                fontSize: '16px'
              }}>
                We are currently preparing our Food menu. Please check back later.
              </p>
            </div>
          ) : (
            filterProducts().map((product) => (
            <div
              key={product._id}
              id={`product-${product._id}`}
              className="product-card"
              style={productCardStyle}
            >
              <div>
                <div style={productImageContainerStyle}>
                  {product.category.toLowerCase() === 'Food' ? (
                    <div 
                      style={{
                        ...productImageStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        fontSize: '10px',
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    >
                      {product.name}
                    </div>
                  ) : (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      style={productImageStyle}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=' + product.name;
                      }}
                    />
                  )}
                </div>
                
                <div className="px-0.5">
                  <div className="text-[11px] font-medium truncate" title={product.name}>
                    {product.name}
                  </div>
                  
                  <div className="flex justify-between items-center mt-0.5">
                    {['drinks', 'soft drinks'].includes(product.category.toLowerCase()) ? (
                      <>
                        <span className="text-[9px] font-medium bg-blue-50 text-blue-600 py-0.5 px-1 rounded">
                          {product.volume} ml
                        </span>
                        <span className="text-[11px] font-bold text-[#cd6839]">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-[#cd6839] w-full text-center">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="w-full py-0.5 px-1 bg-[#cd6839] text-white text-[9px] rounded font-medium mt-1
                          hover:bg-[#b55a31] transition-colors duration-200
                          focus:outline-none focus:ring-1 focus:ring-[#cd6839] focus:ring-opacity-50"
              >
                Add to Cart
              </button>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Add Cart Popup */}
      <CartPopup 
        isOpen={isCartPopupOpen}
        onClose={() => setIsCartPopupOpen(false)}
        onViewCart={() => {
          setIsCartPopupOpen(false);
          navigate('/cart');
        }}
      />

      {/* Add highlight animation styles */}
      <style>
        {`
          @keyframes highlightProduct {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(205, 104, 57, 0); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(205, 104, 57, 0.2); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(205, 104, 57, 0); }
          }
          
          .highlight-product {
            animation: highlightProduct 2s ease-out;
            border: 2px solid #cd6839;
          }
        `}
      </style>
    </div>
  );
}

export default Products;
