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
        <div className="py-1 text-center text-red-500 text-sm font-semibold">
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