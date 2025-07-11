import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, User, Settings, LogOut, BookOpen, Clock, AlertTriangle, Sparkles, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import oldMonkImage from './pop.jpeg';
import CartCounter from '../components/CartCounter';
import { sessionManager } from '../utils/sessionManager';
import { useNavigateWithScroll } from '../utils/scrollToTop';
const mobileBannerImage = "/mobile.jpeg";


// Simplified banner animations CSS with media queries
const bannerAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .banner-fade {
    animation: fadeIn 0.5s ease-out;
  }
  
  .banner-content {
    transition: transform 0.3s ease;
  }
  
  .banner-content:hover {
    transform: translateY(-5px);
  }
  
  /* Mobile banners - hidden on desktop */
  .mobile-banner {
    display: block;
  }
  
  .desktop-banner {
    display: none;
  }
  
  /* Desktop banners - hidden on mobile */
  @media (min-width: 768px) {
    .mobile-banner {
      display: none;
    }
    
    .desktop-banner {
      display: block;
    }
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

// Banner data - Separate arrays for mobile and desktop
const mobileBanners = [
  {
    id: "mobile-1",
    image: mobileBannerImage,
  
    mobileOptimized: true
  },
  {
    id: "mobile-2", 
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop",
    title: "Quick Delivery",
    description: "Fast delivery in 30 minutes or less",
    type: "featured",
    theme: "whiskey",
    mobileOptimized: true
  },
  {
    id: "mobile-3",
    image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=600&auto=format&fit=crop", 
    title: "Party Packages",
    description: "Everything for your weekend gathering",
    type: "regular",
    theme: "wine",
    mobileOptimized: true
  },
  {
    id: "mobile-4",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&auto=format&fit=crop",
    title: "Happy Hours",
    description: "50% off on selected drinks from 4-7 PM",
    type: "special",
    theme: "beer",
    mobileOptimized: true
  }
];

const desktopBanners = [
  {
    id: "desktop-1",
    image: "https://images.unsplash.com/photo-1616527546362-77e70524262d?q=80&w=2070&auto=format&fit=crop",
    
    mobileOptimized: false
  },
  {
    id: "desktop-2",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
    title: "Premium Drinks Delivered",
    description: "Fast delivery in 45 minutes or less. Order now and enjoy premium quality!",
    type: "featured", 
    theme: "whiskey",
    mobileOptimized: false
  },
  {
    id: "desktop-3",
    image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=2070&auto=format&fit=crop",
    title: "Premium Party Packages",
    description: "Everything you need for your weekend gathering in one comprehensive order",
    type: "regular",
    theme: "wine", 
    mobileOptimized: false
  },
  {
    id: "desktop-4",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop",
    title: "Craft Beer Selection",
    description: "Explore our curated collection of local and international craft beers",
    type: "featured",
    theme: "beer",
    mobileOptimized: false
  }
];

// Legacy banners array for backward compatibility
const banners = [...mobileBanners, ...desktopBanners];

// Old Monk Promotional Popup Component
const OldMonkPromotion = ({ isOpen, onClose, onGetOffer }: { isOpen: boolean, onClose: () => void, onGetOffer: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-3xl w-full overflow-hidden shadow-2xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>
        
        {/* Main content - clickable image with built-in FREE button */}
        <div className="relative cursor-pointer" onClick={onGetOffer}>
          <img 
            src={oldMonkImage} 
            alt="Promotion Background" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigateWithScroll();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentMobileBanner, setCurrentMobileBanner] = useState(0);
  const [currentDesktopBanner, setCurrentDesktopBanner] = useState(0);
  const [sparkles, setSparkles] = useState<{ x: number, y: number, size: number, delay: number }[]>([]);
  const [bubbles, setBubbles] = useState<{left: string, size: number, delay: number, duration: number}[]>([]);
  
  // Old Monk promotion state
  const [showOldMonkPromo, setShowOldMonkPromo] = useState(false);

  // Initialize Facebook Pixel
  useEffect(() => {
    // Add Facebook Pixel base code
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1232437498289481');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    
    // Add noscript pixel
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = 'https://www.facebook.com/tr?id=1232437498289481&ev=PageView&noscript=1';
    noscript.appendChild(img);
    document.body.appendChild(noscript);
    
    // Clean up on unmount
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      if (noscript.parentNode) {
        document.body.removeChild(noscript);
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    sessionManager.clearSession();
    localStorage.removeItem("locationGranted");
    setIsLoggedIn(false);
    navigate('/login');
  };
  
  // Function to handle the Old Monk offer
  const handleGetOldMonkOffer = () => {
    // Close the popup
    setShowOldMonkPromo(false);
    
    // Add debug log
    console.log('Navigating to Old Monk products page...');
    
    // Navigate to Old Monk product in Products page - search ONLY for "Old Monk" (without 180ml)
    navigate('/products?search=Old%20Monk%20Rum%20Free');
    
    // Set a flag to mark the offer as shown to this user
    localStorage.setItem('oldMonkOfferShown', 'true');
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const isSkipped = localStorage.getItem('isSkippedLogin'); 
        const oldMonkOfferShown = localStorage.getItem('oldMonkOfferShown');
        
        // Set login status
        const loginStatus = !!token && !isSkipped;
        console.log('Dashboard login check:', { token: !!token, userId: !!userId, isSkipped: !!isSkipped, loginStatus });
        setIsLoggedIn(loginStatus);
  
        // Show the Old Monk promotion for all users
          setShowOldMonkPromo(true);
  
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

  // Banner carousel logic - Separate for mobile and desktop
  useEffect(() => {
    const mobileInterval = setInterval(() => {
      setCurrentMobileBanner((prev) => (prev + 1) % mobileBanners.length);
    }, 7000);
    
    const desktopInterval = setInterval(() => {
      setCurrentDesktopBanner((prev) => (prev + 1) % desktopBanners.length);
    }, 7000);
    
    return () => {
      clearInterval(mobileInterval);
      clearInterval(desktopInterval);
    };
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
    // Restore immediate navigation to Products page as user types
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Navigate when form is submitted (Enter key)
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
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

  // Generate bubbles for beer-themed banner
  useEffect(() => {
    const currentMobileBannerData = mobileBanners[currentMobileBanner];
    const currentDesktopBannerData = desktopBanners[currentDesktopBanner];
    
    if (currentMobileBannerData?.theme === 'beer' || currentDesktopBannerData?.theme === 'beer') {
      const newBubbles = [];
      for (let i = 0; i < 20; i++) {
        newBubbles.push({
          left: `${Math.random() * 100}%`,
          size: Math.random() * 15 + 5,
          delay: Math.random() * 5,
          duration: Math.random() * 5 + 3
        });
      }
      setBubbles(newBubbles);
    }
  }, [currentMobileBanner, currentDesktopBanner]);

  // Function to trigger Facebook Pixel event
  const triggerFacebookPixelEvent = () => {
    try {
      // Create and inject Meta Pixel script directly
      const pixelScript = document.createElement('script');
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1232437498289481');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
      
      // Create and inject noscript pixel
      const noscriptElement = document.createElement('noscript');
      const imgElement = document.createElement('img');
      imgElement.height = 1;
      imgElement.width = 1;
      imgElement.style.display = 'none';
      imgElement.src = 'https://www.facebook.com/tr?id=1232437498289481&ev=PageView&noscript=1';
      noscriptElement.appendChild(imgElement);
      document.body.appendChild(noscriptElement);
      
      alert('Facebook Pixel loaded and PageView event tracked!');
      
      // If fbq is already defined, track an additional custom event
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ButtonClick');
        console.log('Additional ButtonClick event tracked');
      }
    } catch (error) {
      console.error('Error loading Facebook Pixel:', error);
      alert('Error loading Facebook Pixel. See console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add simplified animation styles */}
      <style>{bannerAnimations}</style>

      {/* Old Monk Promotional Popup */}
      <OldMonkPromotion 
        isOpen={showOldMonkPromo} 
        onClose={() => setShowOldMonkPromo(false)} 
        onGetOffer={handleGetOldMonkOffer}
      />

      {/* Header */}
      {!showOldMonkPromo && (
        <div 
          className={`sticky top-0 z-50 bg-white shadow-md transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
              </div>

              <div
                className="cursor-pointer inline-block"
                onClick={() => navigate('/dashboard')}
              >
                <img
                  src="/finallogo.png"
                  alt="Drnkly Logo"
                  className="mx-auto object-contain w-28 sm:w-32 md:w-40 lg:w-48 transition-all duration-300"
                />
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium shadow-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-[#cd6839] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-[#b55a31] transition-colors text-xs sm:text-sm font-medium shadow-sm"
                  >
                    Login
                  </button>
                )}
                <button
                  onClick={() => navigate('/cart')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                  aria-label="View cart"
                >
                  <ShoppingCart size={20} className="text-gray-700" />
                  <CartCounter size="medium" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-3 sm:mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for drinks, snacks, and more..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#cd6839] transition-all duration-200"
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile Banner Carousel */}
        <div className="mobile-banner relative mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-lg h-48 sm:h-64 md:h-72 -mx-3 sm:mx-0">
          {/* Mobile Carousel indicators */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center space-x-2">
            {mobileBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMobileBanner(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentMobileBanner === index 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to mobile slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Carousel navigation buttons */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMobileBanner((prev) => (prev === 0 ? mobileBanners.length - 1 : prev - 1));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Previous mobile banner"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMobileBanner((prev) => (prev + 1) % mobileBanners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Next mobile banner"
          >
            <ChevronRight size={20} />
          </button>

          {/* Mobile Banner slides */}
          <div className="relative w-full h-full">
            {mobileBanners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentMobileBanner === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                onClick={() => {
                  navigate('/products?search=Old%20Monk%20Rum%20Free');
                }}
              >
                {/* For first mobile banner, show only image and below it the text */}
                {banner.id === "mobile-1" ? (
                  <>
                    <img
                      src={banner.image}
                      alt="Old Monk Offer"
                      className="w-full h-full object-cover scale-90"
                      style={{ objectPosition: 'center' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "website1.png";
                      }}
                    />
                    {/* Small Order Now button for first mobile banner */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/products?search=Old%20Monk%20Rum%20Free');
                      }}
                      className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[#cd6839] hover:bg-[#b55a31] text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg hover:shadow-xl text-xs font-medium z-20"
                    >
                      Order Now →
                    </button>
                    <div className="bg-white text-center py-2 px-2 text-sm font-semibold text-[#cd6839]">
                      GET OLD MONK QUARTER FREE!<br />
                      On Your First Order<br />
                      180 ml | Delivered in 45 Min
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mobile Banner content for other banners (if any) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20 z-10 flex flex-col justify-center p-4 sm:p-6">
                      <div className="max-w-lg">
                        {banner.type === "special" && (
                          <div className="inline-block bg-yellow-400 text-blue-900 font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-3">
                            Weekend Special!
                          </div>
                        )}
                        {banner.type === "featured" && (
                          <div className="inline-block bg-[#cd6839]/20 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-3">
                            Most Popular
                          </div>
                        )}
                        <h1 className="text-white text-xl sm:text-2xl font-bold mb-2 md:mb-3 banner-fade leading-tight">
                          {banner.title}
                        </h1>
                        <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 banner-fade leading-relaxed">
                          {banner.description}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/products?search=Old%20Monk%20Rum%20Free');
                          }}
                          className="bg-[#cd6839] hover:bg-[#b55a31] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium banner-content"
                        >
                          Order Now →
                        </button>
                      </div>
                    </div>
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "website1.png";
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Banner Carousel */}
        <div className="desktop-banner relative mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-lg h-48 sm:h-64 md:h-72 -mx-3 sm:mx-0">
          {/* Desktop Carousel indicators */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center space-x-2">
            {desktopBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDesktopBanner(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentDesktopBanner === index 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to desktop slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Desktop Carousel navigation buttons */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentDesktopBanner((prev) => (prev === 0 ? desktopBanners.length - 1 : prev - 1));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Previous desktop banner"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentDesktopBanner((prev) => (prev + 1) % desktopBanners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Next desktop banner"
          >
            <ChevronRight size={20} />
          </button>

          {/* Desktop Banner slides */}
          <div className="relative w-full h-full">
            {desktopBanners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentDesktopBanner === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                onClick={() => {
                  navigate('/products?search=Old%20Monk%20Rum%20Free');
                }}
              >
                {/* Desktop Banner content */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20 z-10 flex flex-col justify-center p-4 sm:p-6 md:p-10">
                  <div className="max-w-lg">
                    {/* Special banner badge */}
                    {banner.type === "special" && (
                      <div className="inline-block bg-yellow-400 text-blue-900 font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-3">
                        Weekend Special!
                      </div>
                    )}
                    
                    {/* Featured banner badge */}
                    {banner.type === "featured" && (
                      <div className="inline-block bg-[#cd6839]/20 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-3">
                        Most Popular
                      </div>
                    )}
                    
                    <h1 className="text-white text-xl sm:text-2xl md:text-4xl font-bold mb-2 md:mb-3 banner-fade leading-tight">
                      {banner.title}
                    </h1>
                    
                    <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-3 sm:mb-4 md:mb-6 banner-fade leading-relaxed">
                      {banner.description}
                    </p>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/products?search=Old%20Monk%20Rum%20Free');
                      }}
                      className="bg-[#cd6839] hover:bg-[#b55a31] text-white px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base font-medium banner-content"
                    >
                      Order Now →
                    </button>
                  </div>
                </div>
                
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "website1.png";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile warning - Now visible on mobile too */}
        <div className="drink-warning text-center text-[#cd6839] font-bold text-xs sm:text-sm md:text-xl mb-4 sm:mb-6 md:mb-8 p-2 md:p-3 border border-[#cd6839]/20 rounded-xl bg-[#cd6839]/5">
          Drink Responsibly – Alcohol consumption is injurious to health 🍷
        </div>

        {/* Categories */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Categories</h2>
            <button 
              onClick={() => navigate('/products')}
              className="text-xs sm:text-sm text-[#cd6839] hover:text-[#b55a31] font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
            {categories.map((category) => (
              <div 
                key={category.name} 
                onClick={() => {
                  navigate(`/products?category=${encodeURIComponent(category.name)}`);
                }}
                className="relative bg-white overflow-hidden rounded-lg sm:rounded-xl cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg group border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 sm:p-3 z-10">
                    <span className="text-lg sm:text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {category.icon}
                    </span>
                    <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">{category.name}</h3>
                  </div>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Nearby Stores</h2>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 sm:mr-2"></span>
              Open Now
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6">
            {stores.map((store) => (
              <div 
                key={store.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100" 
                onClick={() => {
                  if (store.name === "PK Wines") {
                    navigate('/products?store=pkwines&exclude=food');
                  } else if (store.name === "Sunrise Family Garden Restaurant") {
                    navigate('/products?store=sunrise&category=food');
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-36 sm:h-auto relative overflow-hidden">
                    <img 
                      src={store.image} 
                      alt={store.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs sm:text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{store.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{store.name}</h3>
                        <div className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded-full">
                          Open
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">{store.address}</p>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">{store.openTime}</p>
                      
                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          <span>{store.deliveryTime}</span>
                        </div>
                        <div>
                          <span>{store.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-blue-600 font-medium hover:underline">View Menu</span>
                      <button className="bg-[#cd6839] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#b55a31] transition-colors shadow-sm font-medium text-xs sm:text-sm">
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
            className="absolute top-0 left-0 w-64 sm:w-80 h-full bg-white p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-out" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Menu</h2>
              <button 
                onClick={toggleMenu}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={22} className="text-gray-700" />
              </button>
            </div>

            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#cd6839]/10 rounded-full flex items-center justify-center">
                <User size={18} className="text-[#cd6839]" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">{userName || 'Guest User'}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {isLoggedIn ? 'View Profile' : 'Please login to continue'}
                </p>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigate('/profile')} 
                  className="flex items-center w-full p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User size={18} className="mr-3 text-gray-600" /> 
                  <span className="font-medium text-sm sm:text-base">My Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/blog')} 
                  className="flex items-center w-full p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BookOpen size={18} className="mr-3 text-[#cd6839]" /> 
                  <span className="font-medium text-sm sm:text-base">Blog</span>
                </button>
              )}
              
              <button 
                onClick={() => navigate('/order-history')} 
                className="flex items-center w-full p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Clock size={18} className="mr-3 text-gray-600" /> 
                <span className="font-medium text-sm sm:text-base">Order History</span>
              </button>
              
              <button 
                onClick={() => navigate('/issue-report')} 
                className="flex items-center w-full p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <AlertTriangle size={18} className="mr-3 text-yellow-500" /> 
                <span className="font-medium text-sm sm:text-base">Report Issue</span>
              </button>
              
              <button 
                onClick={() => navigate('/issue-tracking')} 
                className="flex items-center w-full p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Sparkles size={18} className="mr-3 text-blue-500" /> 
                <span className="font-medium text-sm sm:text-base">Track Issue</span>
              </button>
              
              <div className="pt-2 mt-2 border-t border-gray-100"></div>
              
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={18} className="mr-3" /> 
                  <span className="font-medium text-sm sm:text-base">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="flex items-center w-full p-2 sm:p-3 text-[#cd6839] hover:bg-[#cd6839]/10 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={18} className="mr-3" /> 
                  <span className="font-medium text-sm sm:text-base">Login</span>
                </button>
              )}
            </div>
            
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 px-4 sm:px-6">
              <div className="bg-[#cd6839]/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
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
