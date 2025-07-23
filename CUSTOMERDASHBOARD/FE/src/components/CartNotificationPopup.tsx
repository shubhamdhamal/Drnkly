import React, { useEffect, useState } from 'react';
import { ShoppingCart, ShoppingBag, X } from 'lucide-react';
import axios from 'axios';

// Define local CartItem interface
interface LocalCartItem {
  productId: string;
  category: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  volume?: number;
}

// Cart Popup Component Props
interface CartNotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  productId?: string; // Optional: to highlight the newly added product
  isUpdate?: boolean; // Optional: to show different title when updating cart
}

const CartNotificationPopup: React.FC<CartNotificationPopupProps> = ({ 
  isOpen, 
  onClose, 
  onViewCart,
  productId,
  isUpdate = false
}) => {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      setLoading(true);
      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        const fetchedItems = res.data.items.map((item: any) => ({
          category: item.productId.category,
          name: item.productId.name,
          image: item.productId.image,
          price: Number(item.productId.price),
          productId: item.productId._id,
          quantity: Number(item.quantity),
        }));
        setItems(fetchedItems);
      } catch (err) {
        console.error('Failed to fetch cart items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate progress toward free shipping
  const FREE_SHIPPING_THRESHOLD = 500;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeft = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Get the 3 most recently added items
  const recentItems = [...items].slice(-3).reverse();
  const remainingCount = items.length - recentItems.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative overflow-hidden shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close cart popup"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-[#cd6839] text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            {isUpdate ? 'Cart Updated' : 'Product Added to Cart'}
          </h2>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading cart items...</div>
        ) : (
          <>
            {/* Recently added items */}
            <div className="px-4 py-3">
              {recentItems.map((item) => (
                <div 
                  key={item.productId} 
                  className={`flex items-center gap-3 py-2 border-b animate-slideIn ${
                    item.productId === productId ? 'bg-orange-50' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain bg-gray-100 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}

              {remainingCount > 0 && (
                <div className="text-sm text-center text-gray-500 mt-2">
                  +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'} in cart
                </div>
              )}
            </div>

            {/* Bill summary */}
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex justify-between font-medium">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between font-medium mt-1">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {/* Service Fee Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Shiping Fee</span>
                  {isFree ? (
                    <span className="text-green-600 font-semibold">FREE!</span>
                  ) : (
                    <span className="text-gray-600 text-xs">Add ₹{amountLeft} more</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${isFree ? 'bg-green-500' : 'bg-orange-400'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                    {Math.round(progress)}%
                  </span>
                </div>
                {!isFree && (
                  <div className="text-xs text-gray-500 mt-1">
                    Add products worth ₹{amountLeft} more to get <span className="text-green-600 font-semibold">FREE shiping Fee</span>!
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-[#cd6839] text-[#cd6839] rounded-lg font-medium hover:bg-[#cd6839]/5 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={onViewCart}
            className="flex-1 py-2 px-4 bg-[#cd6839] text-white rounded-lg font-medium hover:bg-[#b55a31] transition-colors flex items-center justify-center"
          >
            <ShoppingBag className="mr-2" size={16} />
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartNotificationPopup;
