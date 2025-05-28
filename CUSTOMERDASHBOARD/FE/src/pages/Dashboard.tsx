import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, User, Settings, LogOut, BookOpen, Clock, AlertTriangle, Sparkles, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import oldMonkImage from './pop.jpeg';
import CartCounter from '../components/CartCounter';

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
  
  /* Rain animation */
  @keyframes rain {
    0% {
      background-position: 0px 0px;
    }
    100% {
      background-position: 500px 1000px;
    }
  }
  
  /* Bubble animation */
  @keyframes bubble {
    0% {
      transform: translateY(100%) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-100vh) scale(1);
      opacity: 0;
    }
  }
  
  /* Glass reflection effect */
  @keyframes glassReflection {
    0% { transform: translateX(-100%) rotate(30deg); }
    100% { transform: translateX(200%) rotate(30deg); }
  }
  
  /* 3D tilt effect */
  @keyframes tilt {
    0% { transform: perspective(1000px) rotateY(0deg); }
    25% { transform: perspective(1000px) rotateY(3deg); }
    75% { transform: perspective(1000px) rotateY(-3deg); }
    100% { transform: perspective(1000px) rotateY(0deg); }
  }
  
  .banner-3d {
    transition: transform 0.5s ease;
    transform-style: preserve-3d;
    animation: tilt 8s infinite ease-in-out;
    box-shadow: 0 20px 30px rgba(0,0,0,0.3);
  }
  
  .banner-3d:hover {
    transform: perspective(1000px) rotateY(5deg) scale(1.02);
  }
  
  .glass-reflection {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.2) 50%,
      rgba(255,255,255,0) 100%
    );
    transform: translateX(-100%) rotate(30deg);
    animation: glassReflection 5s infinite;
    pointer-events: none;
    z-index: 15;
  }
  
  .bubble {
    position: absolute;
    bottom: 0;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .rain-animation {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAYAAABLLYUHAAAAGElEQVQYV2NkYGD4z8DAwMgAI0AMdM5/ACRwAgMsRgU3AAAAAElFTkSuQmCC');
    width: 100%;
    height: 100%;
    animation: rain 10s linear infinite;
    opacity: 0.5;
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
  
  @keyframes flashingText {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  .free-tag {
    animation: flashingText 1.5s infinite;
  }
  
  @keyframes glowEffect {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 215, 0, 0.8); }
  }
  
  .glow-effect {
    animation: glowEffect 2s infinite;
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
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
    title: "Premium Drinks Delivered",
    description: "Fast delivery in 45 minutes or less. Order now!",
    type: "featured",
    theme: "whiskey"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1616527546362-77e70524262d?q=80&w=2070&auto=format&fit=crop",
    title: "Weekend Special Offers",
    description: "Up to 20% off on premium liquor brands and free delivery on orders above ₹999",
    type: "special",
    theme: "cocktail"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1574807947927-2960b61a4dba?q=80&w=2070&auto=format&fit=crop",
    title: "Craft Beer Collection",
    description: "Discover our handpicked selection of local craft beers",
    type: "regular",
    theme: "beer"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=2070&auto=format&fit=crop",
    title: "Premium Party Packages",
    description: "Everything you need for your weekend gathering in one order",
    type: "regular",
    theme: "wine"
  }
];


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
    localStorage.clear();
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
    navigate('/products?search=Old%20Monk');
    
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
    if (banners[currentBanner]?.theme === 'beer') {
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
  }, [currentBanner]);

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
      {/* Add animation styles */}
      <style>{bannerAnimations}</style>

      {/* Old Monk Promotional Popup */}
      <OldMonkPromotion 
        isOpen={showOldMonkPromo} 
        onClose={() => setShowOldMonkPromo(false)} 
        onGetOffer={handleGetOldMonkOffer}
      />

      {/* Header */}
      <div 
        className={`sticky top-0 z-50 bg-white shadow-md transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-gray-700" />
            </button>

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
              {/* Facebook Pixel Button */}
              <button
                onClick={triggerFacebookPixelEvent}
                className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-sm"
              >
                Track Event
              </button>
              
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Hero Banner Carousel - Updated with 3D effects */}
        <div className="relative mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-lg cursor-pointer group h-48 sm:h-64 md:h-72 banner-3d">
          {/* Glass reflection effect */}
          <div className="glass-reflection"></div>
          
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
          
          {/* Beer bubbles - only shown for beer theme */}
          {banners[currentBanner]?.theme === 'beer' && bubbles.map((bubble, index) => (
            <div
              key={`bubble-${index}`}
              className="bubble"
              style={{
                left: bubble.left,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                animationDelay: `${bubble.delay}s`,
                animation: `bubble ${bubble.duration}s linear infinite ${bubble.delay}s`
              }}
            />
          ))}
          
          {/* Carousel indicators */}
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  currentBanner === index 
                    ? "bg-white w-6 sm:w-8" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Carousel navigation buttons - Made more visible on mobile */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevBanner();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 sm:p-1.5 backdrop-blur-sm transition-all duration-300 opacity-90"
            aria-label="Previous banner"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextBanner();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 sm:p-1.5 backdrop-blur-sm transition-all duration-300 opacity-90"
            aria-label="Next banner"
          >
            <ChevronRight size={18} />
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
                    <div className="absolute right-[20%] top-[20%] w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-yellow-300/30 banner-element" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute right-[30%] bottom-[30%] w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-blue-400/20 banner-element" style={{animationDelay: '1s'}}></div>
                    <div className="absolute left-[70%] top-[50%] w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white/20 banner-element" style={{animationDelay: '1.5s'}}></div>
                    
                    {/* Cocktail glass icon for cocktail theme */}
                    {banner.theme === 'cocktail' && (
                      <div className="absolute right-[15%] top-[40%] text-3xl sm:text-5xl banner-element opacity-70" style={{animationDelay: '1.2s'}}>
                        🍸
                      </div>
                    )}
                    
                    {/* Circular discount badge - Now visible on mobile */}
                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-30 w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full bg-yellow-400 flex items-center justify-center banner-rotate flex glow-effect">
                      <div className="text-center">
                        <div className="text-blue-900 font-bold text-sm sm:text-base md:text-xl">20%</div>
                        <div className="text-blue-900 font-bold text-xs md:text-sm">OFF</div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 flex flex-col justify-center p-3 sm:p-4 md:p-10 z-20">
                      <div className="flex items-center">
                        <div className="bg-yellow-400 text-blue-900 font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-base banner-pulse">
                          This Weekend Only!
                        </div>
                      </div>
                      <h2 className="text-white text-lg sm:text-xl md:text-4xl font-bold mt-1 sm:mt-2 mb-1 md:mt-3 md:mb-2 banner-appear">
                        {banner.title}
                      </h2>
                      <p className="text-white/90 text-xs sm:text-sm md:text-lg max-w-md mb-1 sm:mb-2 md:mb-4 banner-appear-delay-1 line-clamp-2 md:line-clamp-none">
                        {banner.description}
                      </p>
                      <div className="banner-appear-delay-2">
                        <button className="bg-white text-[#0f1b4c] hover:bg-white/90 font-bold py-1 px-3 sm:py-1.5 sm:px-4 md:py-2 md:px-5 rounded-lg w-fit flex items-center gap-1 sm:gap-2 group-hover:shadow-lg transition-all duration-300 relative overflow-hidden text-xs sm:text-sm md:text-base">
                          <span className="relative z-10">Explore Offers</span>
                          <span className="inline-block transition-transform group-hover:translate-x-1 relative z-10">→</span>
                          <div className="absolute left-0 top-0 w-full h-full banner-shimmer opacity-50"></div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Featured banner for Premium Drinks Delivered */}
                {banner.type === "featured" && currentBanner === index && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 z-10 flex flex-col justify-center p-3 sm:p-4 md:p-6">
                      <div className="max-w-lg mx-auto text-center">
                        <div className="inline-block bg-[#cd6839]/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2 border border-[#cd6839]/30">
                          <span className="text-white text-xs sm:text-sm font-medium flex items-center justify-center">
                            <span className="mr-1 text-yellow-400">★</span> Most Popular
                          </span>
                        </div>
                        
                        <h1 className="text-white text-xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 banner-appear relative">
                          {banner.title}
                          <div className="absolute -right-4 -top-4 banner-element opacity-70">
                            <span className="text-xl sm:text-2xl md:text-3xl">✨</span>
                          </div>
                        </h1>
                        
                        <p className="text-white/90 text-sm sm:text-base md:text-lg banner-appear-delay-1 relative mx-auto mb-3 md:mb-4">
                          {banner.description}
                          <span className="absolute left-1/4 right-1/4 bottom-0 h-0.5 banner-shimmer"></span>
                        </p>
                        
                        <div className="banner-appear-delay-2">
                          <button className="bg-[#cd6839] hover:bg-[#b55a31] text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group text-sm sm:text-base md:text-lg font-medium">
                            Order Now
                            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Whiskey theme icon */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 transform rotate-12 banner-element">
                        <div className="bg-amber-700/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                          <span className="text-white font-bold flex items-center text-xs sm:text-sm">Premium Drinks 🥃</span>
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 md:left-8 md:bottom-8 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#cd6839]/20 backdrop-blur-sm flex items-center justify-center banner-rotate">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#cd6839]/40"></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Regular banner design with theme-specific elements */}
                {banner.type === "regular" && currentBanner === index && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 z-10 flex flex-col justify-end p-3 sm:p-4 md:p-6">
                      <h1 className="text-white text-base sm:text-lg md:text-3xl font-bold mb-1 md:mb-2 banner-appear relative">
                        {banner.title}
                        <div className="absolute -right-4 -top-4 banner-element opacity-70">
                          <span className="text-lg sm:text-xl md:text-2xl">✨</span>
                        </div>
                      </h1>
                      <p className="text-white/90 text-xs sm:text-sm md:text-base md:max-w-md banner-appear-delay-1 relative line-clamp-2 md:line-clamp-none">
                        {banner.description}
                        <span className="absolute left-0 bottom-0 w-full h-0.5 banner-shimmer"></span>
                      </p>
                      <div className="mt-2 sm:mt-3 md:mt-4 banner-appear-delay-2">
                        <button className="bg-[#cd6839] hover:bg-[#b55a31] text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group text-xs sm:text-sm md:text-base">
                          Order Now
                          <span className="inline-block ml-1 sm:ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Theme-specific icons - now visible on mobile */}
                    {banner.theme === 'beer' && (
                      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 md:top-16 md:right-16 transform rotate-12 banner-element">
                        <div className="bg-amber-500/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                          <span className="text-white font-bold flex items-center text-xs sm:text-sm">Craft Beer 🍺</span>
                        </div>
                      </div>
                    )}
                    
                    {banner.theme === 'wine' && (
                      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 md:top-16 md:right-16 transform rotate-12 banner-element">
                        <div className="bg-purple-800/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                          <span className="text-white font-bold flex items-center text-xs sm:text-sm">Premium Selection 🍷</span>
                        </div>
                      </div>
                    )}
                    
                    {banner.theme === 'whiskey' && (
                      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 md:top-16 md:right-16 transform rotate-12 banner-element">
                        <div className="bg-amber-700/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                          <span className="text-white font-bold flex items-center text-xs sm:text-sm">Premium Drinks 🥃</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${banner.type === "featured" ? "scale-105 filter brightness-75" : "scale-100 group-hover:scale-105"}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop";
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {categories.map((category) => (
              <div 
                key={category.name} 
                onClick={() => {
                  navigate(`/products?category=${encodeURIComponent(category.name)}`);
                }}
                className="relative bg-white overflow-hidden rounded-xl cursor-pointer transform hover:scale-102 transition-all duration-300 hover:shadow-md group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-4 z-10">
                  <span className="text-2xl sm:text-4xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.icon}
                  </span>
                  <h3 className="text-white font-medium text-sm sm:text-lg">{category.name}</h3>
                </div>
                <img src={category.image} alt={category.name} className="w-full h-24 sm:h-36 object-cover transition-transform duration-700 group-hover:scale-110" />
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
                    navigate('/products?store=pkwines');
                  } else if (store.name === "Sunrise Family Garden Restaurant") {
                    navigate('/products?store=sunrise&category=Food');
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
