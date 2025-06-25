import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import CartCounter from './CartCounter';
import { sessionManager } from '../utils/sessionManager';

interface NavigationProps {
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isChatOpen, setIsChatOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentFooterIndex, setCurrentFooterIndex] = useState(0);

  // Footer messages - alternating English and Marathi
  const footerMessages = [
    // English messages
    "No service fees on orders above ₹500!",
    "Enjoy free service charges when you spend over ₹500.",
    "Orders ₹500 and up come with zero service fees.",
    "Say goodbye to service fees – just order for ₹500 or more!",
    "Get your service fee waived on all orders above ₹500.",
    "Spend ₹500 or more and skip the service charges.",
    "Big orders, no extra fees – service fee is free over ₹500.",
    "Service charges? Not when you order for ₹500+!",
    "Shop for ₹500 or more and enjoy free service fees.",
    "Service fee? We've got it covered on all ₹500+ orders.",
    // Marathi messages
    "₹५०० पेक्षा जास्त खरेदीवर सर्व्हिस फी बिलात समाविष्ट नाही.",
    "आता ₹५०० किंवा त्याहून अधिकच्या ऑर्डरसाठी कोणतीही सर्व्हिस फी लागणार नाही!",
    "₹५००+ च्या ऑर्डरवर तुम्हाला सर्व्हिस चार्ज फ्री मिळेल.",
    "मोठ्या ऑर्डरवर मोठी बचत – ₹५००च्या पुढे सर्व्हिस फी शून्य!",
    "₹५०० पेक्षा जास्त खर्च करा आणि सर्व्हिस फीला गुडबाय करा!",
    "फक्त ₹५००च्या वरची ऑर्डर द्या, सर्व्हिस फी पूर्णपणे माफ!",
    "तुमची ऑर्डर ₹५००च्या पुढे गेली की सर्व्हिस चार्ज शून्य होतो.",
    "₹५००+ च्या खरेदीवर सर्व्हिस फीच्या झंझटीपासून मुक्तता.",
    "आता ₹५००पेक्षा जास्त ऑर्डरवर सर्व्हिस फी काहीच लागणार नाही.",
    "₹५००च्या पुढे खरेदी केल्यावर तुमची सर्व्हिस फी आमच्याकडून."
  ];

  // Rotate footer messages every 6 seconds (slower)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFooterIndex((prevIndex) => 
        prevIndex === footerMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [footerMessages.length]);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const isSessionValid = sessionManager.isSessionValid();
    const isSkipped = localStorage.getItem('isSkippedLogin');
      setIsLoggedIn(isSessionValid && !isSkipped);
    };

    // Initial check
    checkLoginStatus();
    
    // Listen for session expiry event
    const handleSessionExpired = () => {
      setIsLoggedIn(false);
    };
    
    window.addEventListener('sessionExpired', handleSessionExpired);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const hiddenPaths = ['/', '/signup', '/login', '/verify-age'];

  if (hiddenPaths.includes(location.pathname)) return null;

  const handleNavClick = (path: string) => {
    if (path === 'chat') {
      setIsChatOpen(true);
    } else {
      navigate(path);
    }
  };
  
  const handleLogout = () => {
    sessionManager.clearSession();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Add CSS animation */}
      <style>
        {`
          @keyframes slideInOut {
            0% { transform: translateX(100%); opacity: 0; }
            10% { transform: translateX(0); opacity: 1; }
            90% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          
          .footer-message {
            animation: slideInOut 6s ease-in-out infinite;
            white-space: nowrap;
            overflow: hidden;
          }
        `}
      </style>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-40">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-between items-center">
          <NavButton
            icon={<Home size={24} />}
            label="Home"
            isActive={isActive('/dashboard')}
            onClick={() => handleNavClick('/dashboard')}
          />
          <NavButton
            icon={<ShoppingBag size={24} />}
            label="Products"
            isActive={isActive('/products')}
            onClick={() => handleNavClick('/products')}
          />
          <NavButton
            icon={
              <div className="relative">
                <ShoppingCart size={24} />
                <CartCounter size="small" />
              </div>
            }
            label="Cart"
            isActive={isActive('/cart')}
            onClick={() => handleNavClick('/cart')}
          />
          <NavButton
            icon={<Clock size={24} />}
            label="Orders"
            isActive={isActive('/order-history')}
            onClick={() => handleNavClick('/order-history')}
          />
          {isLoggedIn ? (
          <NavButton
            icon={<User size={24} />}
            label="Profile"
            isActive={isActive('/profile')}
            onClick={() => handleNavClick('/profile')}
          />
          ) : (
            <NavButton
              icon={<BookOpen size={24} />}
              label="Blog"
              isActive={isActive('/blog')}
              onClick={() => handleNavClick('/blog')}
            />
          )}
        </div>
        {/* Rotating Promotional Message */}
        <div className="py-1 text-center text-red-600 text-xs font-medium bg-white border-t border-gray-200 overflow-hidden">
          <p 
            className="footer-message"
            style={{
              margin: 0,
              padding: '1px 6px',
              display: 'inline-block'
            }}
          >
            {footerMessages[currentFooterIndex]}
          </p>
        </div>
        {/* Health Warning */}
        <div className="py-1 text-center text-red-500 text-xs font-semibold bg-white">
        🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा 🚯
        </div>
      </nav>
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center px-3 py-2 ${
      isActive ? 'text-blue-600' : 'text-gray-600'
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default Navigation;
