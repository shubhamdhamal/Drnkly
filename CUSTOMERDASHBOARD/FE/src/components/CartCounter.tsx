import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

interface CartCounterProps {
  size?: 'small' | 'medium' | 'large';
}

const CartCounter: React.FC<CartCounterProps> = ({ size = 'medium' }) => {
  const { items } = useCart();
  const [count, setCount] = useState(0);
  const userId = localStorage.getItem('userId');

  // Get size-based styling
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4 text-xs';
      case 'large':
        return 'w-6 h-6 text-sm';
      default: // medium
        return 'w-5 h-5 text-xs';
    }
  };

  // Fetch cart items from server
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        if (res.data && res.data.items) {
          const totalItems = res.data.items.reduce(
            (total: number, item: any) => total + (Number(item.quantity) || 0), 
            0
          );
          setCount(totalItems);
        }
      } catch (error) {
        console.error('Failed to fetch cart count', error);
      }
    };

    fetchCartCount();
  }, [userId, items]); // Re-fetch when items in context changes

  // Also update count from local cart context
  useEffect(() => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    // Only update if we have items in context and it's different from server count
    if (items.length > 0 && totalItems !== count) {
      setCount(totalItems);
    }
  }, [items, count]);

  if (count === 0) return null;

  return (
    <span 
      className={`absolute -top-2 -right-2 bg-red-500 text-white font-bold rounded-full flex items-center justify-center ${getSizeStyles()}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default CartCounter; 