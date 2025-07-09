import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook that scrolls to the top of the page whenever the route changes
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);
};

/**
 * Custom hook that wraps useNavigate and automatically scrolls to top on navigation
 */
export const useNavigateWithScroll = () => {
  const navigate = useNavigate();
  
  const navigateWithScroll = (to: string | number, options?: any) => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    navigate(to, options);
  };
  
  return navigateWithScroll;
};

/**
 * Utility function to manually scroll to top
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Utility function to scroll to top instantly (without smooth animation)
 */
export const scrollToTopInstant = () => {
  window.scrollTo(0, 0);
};
