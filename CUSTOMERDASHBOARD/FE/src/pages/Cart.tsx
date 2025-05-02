import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const Cart = () => {
  const navigate = useNavigate();
  interface CartItem {
    productId: string;
    name: string;
    price: number | string;
    image: string;
    quantity: number | string;
  }
  
  const [items, setItems] = useState<CartItem[]>([]);
  

  const userId = localStorage.getItem('userId');

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return toast.error('User not logged in');

      try {
        const res = await axios.get(`https://drnkly.in/api/cart/${userId}`);
        setItems(res.data.items);
      } catch (error) {
        toast.error('Failed to load cart');
        console.error(error);
      }
    };

    fetchCart();
  }, [userId]);

  // Update quantity in backend
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const res = await axios.put('https://drnkly.in/api/cart/update', {
        userId,
        productId,
        quantity,
      });
      setItems(res.data.cart.items);
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      const res = await axios.delete('https://drnkly.in/api/cart/remove', {
        data: { userId, productId },
      });
      setItems(res.data.cart.items);
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const total = items.reduce((sum, item) => {
    const rawPrice = typeof item.price === 'string' ? item.price.replace(/[^\d.]/g, '') : item.price;
    const rawQuantity = typeof item.quantity === 'string' ? item.quantity.replace(/[^\d.]/g, '') : item.quantity;
  
    const price = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);
    const quantity = isNaN(Number(rawQuantity)) ? 1 : Number(rawQuantity);
  
    return sum + price * quantity;
  }, 0);
  
  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <ShoppingCart className="h-8 w-8 text-gray-900 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
                <button
                  onClick={() => navigate('/products')}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between border-b pb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-lg font-semibold text-gray-900 mt-1">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
  <div className="bg-gray-50 p-6 rounded-b-lg">
    {/* Subtotal */}
    <div className="flex justify-between mb-4">
      <span className="text-gray-600">Subtotal</span>
      <span className="text-gray-900 font-medium">₹{total.toFixed(2)}</span>
    </div>

    {/* Shipping */}
    <div className="flex justify-between mb-6">
      <span className="text-gray-600">Shipping</span>
      <span className="text-gray-900 font-medium">₹100.00</span>
    </div>
{/* PLATFORM FEE */}
    <div className="flex justify-between mb-6">
      <span className="text-gray-600">Platform Fee</span>
      <span className="text-gray-900 font-medium">₹12.00</span>
    </div>
    <div className="flex justify-between mb-6">
    <span className="text-gray-600">GST (5%)</span>
    <span className="text-gray-900 font-medium">₹{((total) * 0.05).toFixed(2)}</span>
  </div>

    {/* Final Total (Subtotal + Shipping) */}
    <div className="flex justify-between mb-6 text-lg font-semibold">
      <span>Total</span>
      <span>₹{(total + 100 + 12 + (total) * 0.05).toFixed(2)}</span>
    </div>

    {/* Checkout Button */}
    <button
      onClick={() => navigate('/checkout')}
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
    >
      Proceed to Checkout
    </button>
  </div>
)}

        </div>
      </div>

    </div>
  );
};

export default Cart;
