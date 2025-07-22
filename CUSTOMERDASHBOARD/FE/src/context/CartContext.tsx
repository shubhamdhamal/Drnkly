import React, { createContext, useContext, useState, ReactNode } from 'react';

// 🛒 Define structure of each item in the cart
export interface CartItem {
  category: string;
  productId: string;
  _id?: any;
  // id: number; // Remove id
  name: string;
  price: number;
  image: string;
  quantity: number;
  volume?: number;
}

// 📦 Define structure of the cart context
interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// 🔁 Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 🧠 Cart Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.productId);

      if (existingItem) {
        return currentItems.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(currentItems => {
      // If quantity is 0, remove the item
      if (quantity <= 0) {
        return currentItems.filter(item => item.productId !== productId);
      }
      
      // Check if item exists
      const itemExists = currentItems.some(item => item.productId === productId);
      
      // If item doesn't exist and quantity > 0, we can't update it (this shouldn't happen)
      if (!itemExists && quantity > 0) {
        console.warn(`Tried to update quantity for non-existent product: ${productId}`);
        return currentItems;
      }
      
      // Update the quantity
      return currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, setItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// 🧩 Hook to access cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
