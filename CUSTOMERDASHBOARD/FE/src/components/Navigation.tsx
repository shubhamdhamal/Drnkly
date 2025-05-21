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
    const token = localStorage.getItem('authToken');
    const isSkipped = localStorage.getItem('isSkippedLogin');
    const loginStatus = !!token && !isSkipped;
    console.log('Navigation login check:', { token: !!token, isSkipped: !!isSkipped, loginStatus });
    setIsLoggedIn(loginStatus);
    
    // Listen for changes to localStorage
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem('authToken');
      const updatedSkipped = localStorage.getItem('isSkippedLogin');
      const updatedStatus = !!updatedToken && !updatedSkipped;
      console.log('Storage changed:', { token: !!updatedToken, isSkipped: !!updatedSkipped, loginStatus: updatedStatus });
      setIsLoggedIn(updatedStatus);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
  
  

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Terms Popup */}

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
            icon={<ShoppingCart size={24} />}
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