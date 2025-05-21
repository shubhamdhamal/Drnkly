import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, User, Settings, LogOut, BookOpen, Clock, AlertTriangle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Banner animations CSS
const bannerAnimations = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeInSlideUp {
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .banner-element {
    animation: float 6s ease-in-out infinite;
  }
  
  .banner-pulse {
    animation: pulse 3s ease-in-out infinite;
  }
  
  .banner-shimmer {
    background: linear-gradient(100deg, 
      rgba(255,255,255,0) 20%, 
      rgba(255,255,255,0.5) 50%, 
      rgba(255,255,255,0) 80%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .banner-rotate {
    animation: rotate 15s linear infinite;
  }
  
  .banner-appear {
    animation: fadeInSlideUp 0.8s ease-out forwards;
  }
  
  .banner-appear-delay-1 {
    animation: fadeInSlideUp 0.8s ease-out 0.2s forwards;
    opacity: 0;
  }
  
  .banner-appear-delay-2 {
    animation: fadeInSlideUp 0.8s ease-out 0.4s forwards;
    opacity: 0;
  }
  
  .banner-particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.6);
    pointer-events: none;
  }
`;

const categories = [
  {
    name: 'Drinks',
    image: 'https://plus.unsplash.com/premium_photo-1671244417901-6d0f50085167?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: '🍸'
  },
  {
    name: 'Snacks',
    image: 'https://plus.unsplash.com/premium_photo-1695558759748-5cad76d7d48e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: '🍿'
  },
  {
    name: 'Soft Drinks',
    image: 'https://images.unsplash.com/photo-1452725210141-07dda20225ec?q=80&w=2152&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: '🥤'
  },
  {
    name: 'Cigarette',
    image: 'https://images.unsplash.com/photo-1702306455611-e3360e6ffeee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: '🚬'
  },
  {
    name: 'Glasses & Plates',
    image: 'https://images.unsplash.com/photo-1516600164266-f3b8166ae679?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: '🥃'
  }
];

const stores = [
  { id: 1, name: "PK Wines", rating: 4.8, image: "https://images.unsplash.com/photo-1597290282695-edc43d0e7129?w=600&h=400&fit=crop", address: "123 Main St", distance: "0.8 miles", openTime: "10:00 AM - 10:00 PM", deliveryTime: "25-30 min" },
  { id: 2, name: "Sunrise Family Garden Restaurant", rating: 4.5, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", address: "456 Oak Ave", distance: "1.2 miles", openTime: "11:00 AM - 9:00 PM", deliveryTime: "30-35 min" }
];

// Banner data
const banners = [
  {
    id: 1,
    image: "website1.png",
    title: "Premium Drinks Delivered",
    description: "Fast delivery in 45 minutes or less. Order now!",
    type: "regular"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1616527546362-77e70524262d?q=80&w=2070&auto=format&fit=crop",
    title: "Weekend Special Offers",
    description: "Up to 20% off on premium liquor brands and free delivery on orders above ₹999",
    type: "special" // Special banner with enhanced styling
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1574807947927-2960b61a4dba?q=80&w=2070&auto=format&fit=crop",
    title: "Craft Beer Collection",
    description: "Discover our handpicked selection of local craft beers",
    type: "regular"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=2070&auto=format&fit=crop",
    title: "Premium Party Packages",
    description: "Everything you need for your weekend gathering in one order",
    type: "regular"
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [sparkles, setSparkles] = useState<{ x: number, y: number, size: number, delay: number }[]>([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("locationGranted");
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const isSkipped = localStorage.getItem('isSkippedLogin'); 
        
        const loginStatus = !!token && !isSkipped;
        console.log('Dashboard login check:', { token: !!token, userId: !!userId, isSkipped: !!isSkipped, loginStatus });
        setIsLoggedIn(loginStatus);
  
        if (token && userId && loginStatus) {
          const response = await axios.get(`https://peghouse.in/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const user = response.data;
          setUserName(user.name);
        }
      } catch (error) {
        console.error('Failed to fetch user info for sidebar', error);
      }
    };
  
    fetchUserName();
    
    const handleStorageChange = () => {
      fetchUserName();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSparklePosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Banner carousel logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Generate random sparkles for banners
  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = [];
      for (let i = 0; i < 20; i++) {
        newSparkles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 5 + 2,
          delay: Math.random() * 5
        });
      }
      setSparkles(newSparkles);
    };
    
    generateSparkles();
    const interval = setInterval(generateSparkles, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add animation styles */}
      <style>{bannerAnimations}</style>

      {/* Header */}
      <div 
        className={`sticky top-0 z-50 bg-white shadow-md transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} className="text-gray-700" />
            </button>

            <div
              className="cursor-pointer inline-block"
              onClick={() => navigate('/dashboard')}
            >
              <img
                src="/finallogo.png"
                alt="Drnkly Logo"
                className="mx-auto object-contain w-32 md:w-40 lg:w-48 transition-all duration-300"
              />
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#cd6839] text-white px-3 py-1.5 rounded-full hover:bg-[#b55a31] transition-colors text-sm font-medium shadow-sm"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => navigate('/cart')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label="View cart"
              >
                <ShoppingCart size={22} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for drinks, snacks, and more..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cd6839] transition-all duration-200"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Banner Carousel */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg cursor-pointer group h-48 md:h-72">
          {/* Sparkle elements */}
          {sparkles.map((sparkle, index) => (
            <div
              key={index}
              className="banner-particle banner-pulse"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                animationDelay: `${sparkle.delay}s`
              }}
            />
          ))}
          
          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentBanner === index 
                    ? "bg-white w-8" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Carousel navigation buttons */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevBanner();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextBanner();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Banner slides */}
          <div className="relative w-full h-full transition-all duration-500">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentBanner === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                onClick={() => {
                  if (banner.type === "special") {
                    navigate('/products?category=Drinks&offer=weekend');
                  } else {
                    navigate('/products');
                  }
                }}
              >
                {/* Special banner with enhanced design */}
                {banner.type === "special" && currentBanner === index && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f1b4c]/80 to-transparent z-10"></div>
                    
                    {/* Animated elements for special banner */}
                    <div className="absolute right-[20%] top-[20%] w-16 h-16 rounded-full bg-yellow-300/30 banner-element" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute right-[30%] bottom-[30%] w-12 h-12 rounded-full bg-blue-400/20 banner-element" style={{animationDelay: '1s'}}></div>
                    <div className="absolute left-[70%] top-[50%] w-8 h-8 rounded-full bg-white/20 banner-element" style={{animationDelay: '1.5s'}}></div>
                    
                    {/* Circular discount badge */}
                    <div className="absolute right-10 top-10 z-30 w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-400 flex items-center justify-center banner-rotate hidden md:flex">
                      <div className="text-center">
                        <div className="text-blue-900 font-bold text-lg md:text-xl">20%</div>
                        <div className="text-blue-900 font-bold text-xs md:text-sm">OFF</div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 z-20">
                      <div className="flex items-center">
                        <div className="bg-yellow-400 text-blue-900 font-bold px-3 py-1 rounded-full text-sm md:text-base banner-pulse">
                          This Weekend Only!
                        </div>
                      </div>
                      <h2 className="text-white text-2xl md:text-4xl font-bold mt-3 mb-2 banner-appear">
                        {banner.title}
                      </h2>
                      <p className="text-white/90 max-w-md mb-4 md:text-lg banner-appear-delay-1">
                        {banner.description}
                      </p>
                      <div className="banner-appear-delay-2">
                        <button className="bg-white text-[#0f1b4c] hover:bg-white/90 font-bold py-2 px-5 rounded-lg w-fit flex items-center gap-2 group-hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                          <span className="relative z-10">Explore Offers</span>
                          <span className="inline-block transition-transform group-hover:translate-x-1 relative z-10">→</span>
                          <div className="absolute left-0 top-0 w-full h-full banner-shimmer opacity-50"></div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Regular banner design */}
                {banner.type === "regular" && currentBanner === index && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10 flex flex-col justify-end p-6">
                      <h1 className="text-white text-xl md:text-3xl font-bold mb-2 banner-appear relative">
                        {banner.title}
                        <div className="absolute -right-4 -top-4 banner-element opacity-70">
                          <span className="text-2xl">✨</span>
                        </div>
                      </h1>
                      <p className="text-white/90 md:max-w-md banner-appear-delay-1 relative">
                        {banner.description}
                        <span className="absolute left-0 bottom-0 w-full h-0.5 banner-shimmer"></span>
                      </p>
                      <div className="mt-4 banner-appear-delay-2">
                        <button className="bg-[#cd6839] hover:bg-[#b55a31] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group">
                          Order Now
                          <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-10 right-10 md:top-16 md:right-16 transform rotate-12 banner-element hidden md:block">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                        <span className="text-[#cd6839] font-bold">Premium Selection</span>
                      </div>
                    </div>
                  </>
                )}
                
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="drink-warning text-center text-[#cd6839] font-bold text-lg md:text-xl hidden md:block mb-8 p-3 border border-[#cd6839]/20 rounded-xl bg-[#cd6839]/5">
          Drink Responsibly – Alcohol consumption is injurious to health 🍷
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
            <button 
              onClick={() => navigate('/products')}
              className="text-sm text-[#cd6839] hover:text-[#b55a31] font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div 
                key={category.name} 
                onClick={() => {
                  navigate(`/products?category=${encodeURIComponent(category.name)}`);
                }}
                className="relative bg-white overflow-hidden rounded-xl cursor-pointer transform hover:scale-102 transition-all duration-300 hover:shadow-md group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 z-10">
                  <span className="text-4xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.icon}
                  </span>
                  <h3 className="text-white font-medium text-lg">{category.name}</h3>
                </div>
                <img src={category.image} alt={category.name} className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>

        {/* Stores */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-800">Nearby Stores</h2>
            <div className="text-sm text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Open Now
            </div>
          </div>
          <div className="grid gap-6">
            {stores.map((store) => (
              <div 
                key={store.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100" 
                onClick={() => {
                  if (store.name === "PK Wines") {
                    navigate('/products?store=pkwines');
                  } else if (store.name === "Sunrise Family Garden Restaurant") {
                    navigate('/products?store=sunrise&category=Food');
                  }
                }}
              >
                <div className="sm:flex">
                  <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
                    <img 
                      src={store.image} 
                      alt={store.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{store.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{store.name}</h3>
                        <div className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Open
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{store.address}</p>
                      <p className="text-gray-500 text-sm mb-3">{store.openTime}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{store.deliveryTime}</span>
                        </div>
                        <div>
                          <span>{store.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium hover:underline">View Menu</span>
                      <button className="bg-[#cd6839] text-white px-4 py-2 rounded-lg hover:bg-[#b55a31] transition-colors shadow-sm font-medium">
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" onClick={toggleMenu}>
          <div 
            className="absolute top-0 left-0 w-80 h-full bg-white p-6 shadow-2xl transform transition-transform duration-300 ease-out" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button 
                onClick={toggleMenu}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-8">
              <div className="w-12 h-12 bg-[#cd6839]/10 rounded-full flex items-center justify-center">
                <User size={22} className="text-[#cd6839]" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">{userName || 'Guest User'}</h3>
                <p className="text-sm text-gray-600">
                  {isLoggedIn ? 'View Profile' : 'Please login to continue'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigate('/profile')} 
                  className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User size={20} className="mr-3 text-gray-600" /> 
                  <span className="font-medium">My Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/blog')} 
                  className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BookOpen size={20} className="mr-3 text-[#cd6839]" /> 
                  <span className="font-medium">Blog</span>
                </button>
              )}
              
              <button 
                onClick={() => navigate('/order-history')} 
                className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Clock size={20} className="mr-3 text-gray-600" /> 
                <span className="font-medium">Order History</span>
              </button>
              
              <button 
                onClick={() => navigate('/issue-report')} 
                className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <AlertTriangle size={20} className="mr-3 text-yellow-500" /> 
                <span className="font-medium">Report Issue</span>
              </button>
              
              <button 
                onClick={() => navigate('/issue-tracking')} 
                className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Sparkles size={20} className="mr-3 text-blue-500" /> 
                <span className="font-medium">Track Issue</span>
              </button>
              
              <div className="pt-2 mt-2 border-t border-gray-100"></div>
              
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={20} className="mr-3" /> 
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="flex items-center w-full p-3 text-[#cd6839] hover:bg-[#cd6839]/10 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={20} className="mr-3" /> 
                  <span className="font-medium">Login</span>
                </button>
              )}
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 px-6">
              <div className="bg-[#cd6839]/10 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-medium mb-1 text-[#cd6839]">Need Help?</p>
                <p>Contact our support team at support@drnkly.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
