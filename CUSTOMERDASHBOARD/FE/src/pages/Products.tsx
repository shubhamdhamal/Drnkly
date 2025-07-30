import React, { useState, useEffect, useRef } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import { Wine, Search, ShoppingCart, ChevronDown, ArrowLeft, ShoppingBag, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
  import { useCart } from '../context/CartContext';
  import CartCounter from '../components/CartCounter';
  import CartNotificationPopup from '../components/CartNotificationPopup';
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
    inStock?: boolean;
  }

  interface SubBrand {
    name: string;
    image: string;
    category: string;
  }

  // Define local CartItem interface to extend the imported one
  interface LocalCartItem {
    productId: string;
    category: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    volume?: number;
  }

  // Remove mock Food products data and replace with empty array
  const mockFoodProducts: Product[] = [];

  // Helper: category sort order
  const CATEGORY_ORDER = [
    'drinks',
    'cigarette',
    'soft drinks',
    'snacks',
    'glass/plates'
  ];

  function Products() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart, items, updateQuantity } = useCart();
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
    const [lastAddedProductId, setLastAddedProductId] = useState<string | undefined>(undefined);
    const [isCartUpdate, setIsCartUpdate] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [allBrands, setAllBrands] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<{products: Product[], brands: string[]}>({products: [], brands: []});
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [quantityModal, setQuantityModal] = useState<{ product: Product, quantity: number } | null>(null);

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
      const excludeParam = params.get('exclude');

      // Handle PK Wines - exclude Food category
      if (storeParam === 'pkwines' && excludeParam === 'food') {
        // Filter out Food category from categories
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.name.toLowerCase() !== 'food')
        );
      }

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
          setSelectedCategory('all');
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
        setIsLoading(true);
        try {
          const [productRes, categoryRes] = await Promise.all([
            axios.get('https://peghouse.in/api/products'),
            axios.get('https://peghouse.in/api/categories'),
          ]);
          
          // Get store parameter
          const params = new URLSearchParams(location.search);
          const storeParam = params.get('store');
          const categoryParam = params.get('category');
          const excludeParam = params.get('exclude');

          // Filter out Food products for PK Wines
          if (storeParam === 'pkwines' && excludeParam === 'food') {
            const filteredProducts = productRes.data.filter((product: Product) => 
              product.category.toLowerCase() !== 'food'
            );
            setProducts(filteredProducts);
            
            const filteredCategories = categoryRes.data.filter((cat: Category) => 
              cat.name.toLowerCase() !== 'food'
            );
            setCategories(filteredCategories);
          }
          // Only filter out Food products if not coming from Sunrise restaurant
          else if (!(storeParam === 'sunrise' && categoryParam?.toLowerCase() === 'Food')) {
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
        } finally {
          setIsLoading(false);
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

    // Update getSubBrandsForCategory to handle Food with no brands
    const getSubBrandsForCategory = (category: string) => {
      // Create a map of brands and their images for the selected category
      const brandMap = new Map<string, string>();
      const foodProducts: Product[] = [];

      products.forEach(product => {
        if (product.category.toLowerCase() === category.toLowerCase()) {
          if (product.brand) {
            if (!brandMap.has(product.brand)) {
              brandMap.set(product.brand, product.image);
            }
          } else if (category.toLowerCase() === 'food') {
            // If no brand, use product name as sub-brand for Food
            foodProducts.push(product);
          }
        }
      });

      // If there are brands, show brands as sub-brands
      if (brandMap.size > 0) {
        return Array.from(brandMap).map(([name, image]) => ({
          name,
          image,
          category
        }));
      }

      // If no brands for Food, show each unique product as a sub-brand
      if (category.toLowerCase() === 'food' && foodProducts.length > 0) {
        // Use product name and image as sub-brand
        const uniqueProducts = Array.from(new Map(foodProducts.map(p => [p.name, p])).values());
        return uniqueProducts.map(product => ({
          name: product.name,
          image: product.image,
          category: 'food'
        }));
      }

      return [];
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
      setSearchQuery(''); // Clear search bar
      setShowSearchResults(false); // Hide search results
      showSubBrandsForCategory(category); // This will work for Food too
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
        productId: product._id,
        category: product.category,
        name: product.name,
        price: product.price,
        image: product.image,
        volume: product.volume,
      };
      addToCart(cartItem);

      // Update quantity in local cart context so "Add More" appears instantly
      const newQty = (items.find(i => i.productId === product._id)?.quantity || 0) + 1;
      updateQuantity(product._id, newQty);

      // Set the last added product ID and show the cart popup
      setLastAddedProductId(product._id);
      setIsCartUpdate(false);
      setIsCartPopupOpen(true);
      
      // Optional toast notification
      toast.success(`${product.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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

    // Dynamic filter options based on sortBy
    const getFilterOptions = () => {
      if (sortBy === 'volume') {
        return [
          { label: 'All Volumes', value: 'all' },
          { label: '180 ml', value: 'vol-180' },
          { label: '375 ml', value: 'vol-375' },
          { label: '750 ml', value: 'vol-750' },
          { label: '1000 ml', value: 'vol-1000' },
        ];
      } else {
        return [
          { label: 'All Prices', value: 'all' },
          { label: 'Under ₹30', value: '0-30' },
          { label: '₹30 - ₹50', value: '30-50' },
          { label: '₹50 - ₹80', value: '50-80' },
          { label: 'Over ₹80', value: '80+' },
        ];
      }
    };

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

    // Add to state:
    const [sortBy, setSortBy] = useState<'price' | 'volume'>('price');

    // Update filterProducts to handle new price range logic
    const filterProducts = () => {
      let filtered = [...products];

      // Remove Food unless sunrise+Food or Food category is selected
      const params = new URLSearchParams(location.search);
      const storeParam = params.get('store');
      const categoryParam = params.get('category');
      const isFoodCategory = selectedCategory.toLowerCase() === 'food';
      const isSunriseFood = (storeParam === 'sunrise' && categoryParam?.toLowerCase() === 'food') || isFoodCategory;

      if (!isSunriseFood) {
        filtered = filtered.filter(product => product.category.toLowerCase() !== 'food');
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(product =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      if (selectedBrand !== 'all') {
        filtered = filtered.filter(product => product.brand === selectedBrand);
      }

      // Volume filter (first box)
      if (isLiquorCategory && priceRange.startsWith('vol-')) {
        const vol = parseInt(priceRange.replace('vol-', ''));
        filtered = filtered.filter(product => product.volume === vol);
      }

      // Price range filter (second box)
      if (priceRange !== 'all' && !priceRange.startsWith('vol-')) {
        if (priceRange === '500+') {
          filtered = filtered.filter(product => product.price > 500);
        } else {
          const [min, max] = priceRange.split('-').map(Number);
          filtered = filtered.filter(product => product.price >= min && product.price <= max);
        }
      }

      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery)
        );
      }

      // Sort by selected method
      if (sortBy === 'volume') {
        // Separate products with valid volume and those without
        const withVolume = filtered.filter(p => typeof p.volume === 'number' && p.volume > 0);
        const withoutVolume = filtered.filter(p => !(typeof p.volume === 'number' && p.volume > 0));
        // Sort products with volume in ascending order (smallest first)
        withVolume.sort((a, b) => (a.volume || 0) - (b.volume || 0));
        filtered = [...withVolume, ...withoutVolume];
      } else if (sortBy === 'price' && selectedCategory === 'all') {
        // Group by category order, then by price
        filtered.sort((a, b) => {
          const aCat = a.category.toLowerCase();
          const bCat = b.category.toLowerCase();
          const aIdx = CATEGORY_ORDER.indexOf(aCat) === -1 ? 99 : CATEGORY_ORDER.indexOf(aCat);
          const bIdx = CATEGORY_ORDER.indexOf(bCat) === -1 ? 99 : CATEGORY_ORDER.indexOf(bCat);
          if (aIdx !== bIdx) return aIdx - bIdx;
          // If same category, sort by price low to high
          return a.price - b.price;
        });
      } else {
        filtered.sort((a, b) => a.price - b.price);
      }

      return filtered;
    };

    // Update the productContainerStyle with responsive grid
    const productContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', // Smaller on mobile
      gap: '8px', // Smaller gap on mobile
      padding: '0 6px',
      maxWidth: '1920px',
      margin: '0 auto',
      alignItems: 'stretch'
    };

    // Update the productCardStyle to be smaller on mobile
    const productCardStyle = {
      background: 'white',
      borderRadius: '6px',
      padding: '6px',
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      justifyContent: 'space-between',
      position: 'relative' as const,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: 'translateY(0)',
      border: '1px solid rgba(229, 231, 235, 0.5)'
    };

    // Update the productImageContainerStyle to be smaller on mobile
    const productImageContainerStyle = {
      width: '100%',
      height: '100px',
      position: 'relative' as const,
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '4px',
      background: 'white'
    };

    // Update the productImageStyle for smaller images
    const productImageStyle = {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
      borderRadius: '4px',
      backgroundColor: 'white',
      transition: 'transform 0.3s ease',
      padding: '3px'
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

    // Loading Skeleton Component
    const LoadingSkeleton = () => (
      <div 
        className="product-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '8px',
          padding: '0 6px 120px 6px',
          maxWidth: '1920px',
          margin: '0 auto',
          alignItems: 'stretch',
          minHeight: 'calc(100vh - 400px)'
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="product-card animate-pulse"
            style={{
              background: 'white',
              borderRadius: '6px',
              padding: '6px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              minHeight: '200px'
            }}
          >
            <div>
              {/* Image skeleton */}
              <div 
                style={{
                  width: '100%',
                  height: '100px',
                  position: 'relative',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                  background: '#f3f4f6'
                }}
              >
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
              </div>
              
              <div className="px-1">
                {/* Title skeleton */}
                <div 
                  style={{
                    height: '16px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
                
                <div className="flex justify-between items-center mt-1">
                  {/* Volume/Price skeleton */}
                  <div 
                    style={{
                      width: '40px',
                      height: '12px',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                  <div 
                    style={{
                      width: '50px',
                      height: '16px',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Button skeleton */}
            <div 
              style={{
                width: '100%',
                height: '28px',
                background: '#f3f4f6',
                borderRadius: '4px',
                marginTop: '8px',
                animation: 'shimmer 1.5s infinite'
              }}
            />
          </div>
        ))}
      </div>
    );

    // Helper: Check if current category is liquor (drinks or soft drinks)
    const isLiquorCategory = ['drinks', 'soft drinks'].includes(selectedCategory.toLowerCase()) || selectedCategory === 'all';

    // Volume filter options for liquor
    const volumeOptions = [
      { label: 'All Volumes', value: 'all' },
      { label: '180 ml', value: 'vol-180' },
      { label: '375 ml', value: 'vol-375' },
      { label: '750 ml', value: 'vol-750' },
      { label: '1000 ml', value: 'vol-1000' },
    ];

    // Price range filter options
    const priceRangeOptions = [
      { label: 'All Prices', value: 'all' },
      { label: 'Under ₹100', value: '0-100' },
      { label: '₹100 - ₹200', value: '100-200' },
      { label: '₹200 - ₹300', value: '200-300' },
      { label: '₹300 - ₹400', value: '300-400' },
      { label: '₹400 - ₹500', value: '400-500' },
      { label: 'Over ₹500', value: '500+' },
    ];

    // Helper to open modal
    function openQuantityModal(product: Product, quantity: number) {
      setQuantityModal({ product, quantity });
    }
    function closeQuantityModal() {
      setQuantityModal(null);
    }

    // Add this function to update cart quantity
    const updateCartQuantity = async (product: Product, newQuantity: number) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please log in first');
        navigate('/login');
        return;
      }
      try {
        // Use the correct endpoint for updating cart quantity
        const res = await axios.put('https://peghouse.in/api/cart/update', {
          userId,
          productId: product._id,
          quantity: newQuantity,
        });
        
        // Update local cart context
        updateQuantity(product._id, newQuantity);
        
        // If quantity is 0, remove from cart
        if (newQuantity === 0) {
          await axios.delete('https://peghouse.in/api/cart/remove', {
            data: { userId, productId: product._id },
          });
        } else {
          // Show cart popup when quantity is updated (not zero)
          setLastAddedProductId(product._id);
          setIsCartUpdate(true);
          setIsCartPopupOpen(true);
        }
        
        toast.success(`Cart updated! (${product.name}: Qty ${newQuantity})`, { autoClose: 2000 });
        console.log(`Cart updated for ${product.name}: Qty ${newQuantity}`);
      } catch (err) {
        toast.error('Failed to update cart');
        console.error('Error updating cart:', err);
      }
    };

    console.log('Cart items:', items);

    return (
      <div className="container mx-auto bg-white min-h-screen pb-20">
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
            <div className="my-4 px-2">
              <div className="flex items-center mb-4">
                <button 
                  onClick={handleBackFromSubBrands}
                  className="flex items-center text-gray-700 hover:text-gray-900 text-sm"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span className="font-medium">Back</span>
                </button>
                <h2 className="ml-3 text-lg font-semibold text-gray-800">{selectedCategory} Brands</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {subBrands.map((subBrand) => (
                  <div 
                    key={subBrand.name}
                    className={`brand-card cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md bg-white ${
                      selectedBrand === subBrand.name 
                        ? 'border-[#cd6839] shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSubBrandSelect(subBrand.name)}
                  >
                    <div className="aspect-square bg-white p-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={subBrand.image} 
                        alt={subBrand.name}
                        className="brand-image w-full h-full object-contain bg-white transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150?text=' + subBrand.name;
                        }}
                      />
                    </div>
                    <div className={`py-2 px-2 text-center ${
                      selectedBrand === subBrand.name 
                        ? 'bg-orange-50 text-[#cd6839]' 
                        : 'bg-white text-gray-700'
                    }`}>
                      <h3 className="text-xs sm:text-sm font-medium truncate">{subBrand.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Show main categories */
            <div className="my-4 px-2">
              <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2">
                <button
                  className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'all' 
                      ? 'bg-[#cd6839] text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat.name.toLowerCase() 
                        ? 'bg-[#cd6839] text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCategoryClick(cat.name.toLowerCase())}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
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
            {/* Volume Filter (for liquor only) */}
            <div style={{ width: '30%', position: 'relative' }}>
              {isLiquorCategory ? (
                <>
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
                    Volume (ml) <ChevronDown size={16} />
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
                      {volumeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setPriceRange(option.value);
                            setShowPriceFilter(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: priceRange === option.value ? '#cd6839' : 'black'
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button disabled style={{ width: '100%', padding: '8px 16px', background: '#f5f5f5', border: 'none', borderRadius: '8px', color: '#aaa' }}>Volume (ml)</button>
              )}
            </div>
            {/* Price Range Filter (second box) */}
            <div style={{ width: '30%', position: 'relative' }}>
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  width: '100%',
                  fontWeight: 500
                }}
              >
                {priceRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* Relevance Button (unchanged) */}
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
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div 
              className="product-grid"
              style={{
                display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
    padding: '0 8px 20px 8px',  // ✅ Updated padding
    maxWidth: '1920px',
    margin: '0 auto',
    alignItems: 'stretch',
    minHeight: 'auto'
              }}
            >
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
                filterProducts().map((product) => {
                  const cartItem = items.find(item => item.productId === product._id);
                  const productQuantity = cartItem ? cartItem.quantity : 0;
                  return (
                    <div
  key={product._id}
  id={`product-${product._id}`}
  className={`product-card ${product.inStock === false ? 'opacity-50 grayscale pointer-events-none' : ''}`}
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
                        <div className="px-1">
                          <div className="text-[11px] sm:text-[12px] md:text-[13px] font-medium truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            {['drinks', 'soft drinks'].includes(product.category.toLowerCase()) ? (
                              <>
                                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium bg-blue-50 text-blue-600 py-0.5 px-1 rounded">
                                  {product.volume} ml
                                </span>
                                <span className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-[#cd6839]">
                                  ₹{product.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-[#cd6839] w-full text-center">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
  disabled={!product.inStock}
  onClick={e => {
    if (productQuantity > 0) {
      openQuantityModal(product, productQuantity);
    } else {
      handleAddToCart(e, product);
    }
  }}
  className={`w-full py-1 px-2 mt-2 rounded font-medium text-[9px] sm:text-[10px] transition-colors duration-200 focus:outline-none ${
    product.inStock
      ? 'bg-[#cd6839] text-white hover:bg-[#b55a31] focus:ring-1 focus:ring-[#cd6839] focus:ring-opacity-50'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
  {product.inStock
    ? productQuantity > 0
      ? `Add One More (Qty: ${productQuantity})`
      : 'Add to Cart'
    : 'Out of Stock'}
</button>

                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Add Cart Notification Popup */}
        <CartNotificationPopup 
          isOpen={isCartPopupOpen}
          onClose={() => setIsCartPopupOpen(false)}
          onViewCart={() => {
            setIsCartPopupOpen(false);
            navigate('/cart');
          }}
          productId={lastAddedProductId}
          isUpdate={isCartUpdate}
        />

        {/* Add highlight animation styles */}
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            
            @keyframes highlightProduct {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(205, 104, 57, 0); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(205, 104, 57, 0.2); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(205, 104, 57, 0); }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out forwards;
            }
            
            .animate-slideIn {
              animation: slideIn 0.3s ease-out forwards;
            }
            
            .highlight-product {
              animation: highlightProduct 2s ease-out;
              border: 2px solid #cd6839;
            }

            /* Ensure product cards are properly displayed */
            .product-card {
              display: flex !important;
              flex-direction: column !important;
              height: 100% !important;
              min-height: 180px !important;
              background: white !important;
              border-radius: 6px !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              transition: all 0.2s ease !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 6px !important;
            }
            
            /* Responsive styles for larger screens */
            @media (min-width: 640px) {
              .product-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
                gap: 10px !important;
              }
              
              .product-card {
                min-height: 190px !important;
                padding: 7px !important;
              }
            }
            
            @media (min-width: 768px) {
              .product-grid {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
                gap: 12px !important;
              }
              
              .product-card {
                min-height: 200px !important;
                padding: 8px !important;
                border-radius: 8px !important;
              }
            }

            /* Fix for last row products */
            .product-grid {
              padding-bottom: 120px !important;
              margin-bottom: 20px !important;
            }

            /* Ensure proper spacing between cards */
            .product-card + .product-card {
              margin-top: 0 !important;
            }

            /* Fix grid alignment issues */
            .product-card > div {
              display: flex !important;
              flex-direction: column !important;
              height: 100% !important;
            }

            /* Ensure button stays at bottom */
            .product-card button {
              margin-top: auto !important;
            }
          `}
        </style>

        {quantityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-xs mx-4 relative">
              <button onClick={closeQuantityModal} className="absolute top-2 right-2 text-gray-500">
                <X size={20} />
              </button>
              <div className="flex flex-col items-center">
                <img src={quantityModal.product.image} alt={quantityModal.product.name} className="w-20 h-20 object-contain mb-2" />
                <h3 className="font-semibold mb-2 text-center">{quantityModal.product.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      if (quantityModal.quantity > 1) {
                        setQuantityModal(q => q && { ...q, quantity: q.quantity - 1 });
                      }
                    }}
                    className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xl"
                    disabled={quantityModal.quantity <= 1}
                  >-</button>
                  <span className="text-lg font-bold">{quantityModal.quantity}</span>
                  <button
                    onClick={() => {
                      setQuantityModal(q => q && { ...q, quantity: q.quantity + 1 });
                    }}
                    className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xl"
                  >+</button>
                </div>
                <button
                  onClick={async () => {
                    if (quantityModal) {
                      await updateCartQuantity(quantityModal.product, quantityModal.quantity);
                      closeQuantityModal();
                    }
                  }}
                  className="mt-4 bg-[#cd6839] text-white px-4 py-2 rounded"
                >
                  Update Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default Products;
