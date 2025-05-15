import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const navigate = useNavigate();

  interface CartItem {
    category: any;
    productId: any; 
    name: string;
    price: number | string;
    image: string;
    quantity: number | string;
  }

  const [items, setItems] = useState<CartItem[]>([]);
  const userId = localStorage.getItem('userId');

useEffect(() => {
  const fetchCart = async () => {
    if (!userId) return toast.error('User not logged in');

    try {
      const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
      
      const populatedItems = res.data.items.map((item: any) => {
        const product = item.productId;
        return {
          ...item,
          name: product?.name || item.name,
          price: product?.price || item.price,
          image: product?.image || item.image,
          category: product?.category || 'N/A',  // ✅ this fixes the category
          liquorType: product?.liquorType || '',
        };
      });

      setItems(populatedItems);

      // Debug: Log each product's category
      console.log('Fetched Cart Items:');
      populatedItems.forEach((item, i) => {
        console.log(`Item ${i + 1}:`, item.category || 'No category found');
      });

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
    const res = await axios.put('https://peghouse.in/api/cart/update', {
      userId,
      productId,
      quantity,
    });

    const updatedItems = res.data.cart.items.map((item: any) => {
      const product = item.productId;
      return {
        ...item,
        name: product?.name || item.name,
        price: product?.price || item.price,
        image: product?.image || item.image,
        category: product?.category || 'N/A',
        liquorType: product?.liquorType || '',
      };
    });

    setItems(updatedItems);
    toast.success('Quantity updated');
  } catch (error) {
    toast.error('Failed to update quantity');
  }
};


  // Remove item from cart
const removeFromCart = async (productId: string) => {
  try {
    const res = await axios.delete('https://peghouse.in/api/cart/remove', {
      data: { userId, productId },
    });

    const updatedItems = res.data.cart.items.map((item: any) => {
      const product = item.productId;
      return {
        ...item,
        name: product?.name || item.name,
        price: product?.price || item.price,
        image: product?.image || item.image,
        category: product?.category || 'N/A',
        liquorType: product?.liquorType || '',
      };
    });

    setItems(updatedItems);
    toast.success('Item removed');
  } catch (error) {
    toast.error('Failed to remove item');
  }
};


  // Base total
  const total = items.reduce((sum, item) => {
    const rawPrice = typeof item.price === 'string' ? item.price.replace(/[^\d.]/g, '') : item.price;
    const rawQuantity = typeof item.quantity === 'string' ? item.quantity.replace(/[^\d.]/g, '') : item.quantity;
    const price = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);
    const quantity = isNaN(Number(rawQuantity)) ? 1 : Number(rawQuantity);
    return sum + price * quantity;
  }, 0);

  // Drinks Fee (35%)
const drinksFee = items.reduce((sum, item) => {
  const category = item?.category;
  const price = typeof item.price === 'string' ? Number(item.price.replace(/[^\d.]/g, '')) : item.price;
  const quantity = typeof item.quantity === 'string' ? Number(item.quantity.replace(/[^\d.]/g, '')) : item.quantity;

  if (category === 'Drinks') {
    return sum + (Number(price) || 0) * (Number(quantity) || 1) * 0.35;
  }

  return sum;
}, 0);



  const shipping = 100;
  const platformFee = 12;
  const gst = (total + drinksFee) * 0.18;
  const finalTotal = total + drinksFee + shipping + platformFee + gst;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-1 py-1 sm:px-1 lg:px-1">
        <div className="flex justify-center mb-2">
          <div
            className="cursor-pointer inline-block"
            onClick={() => navigate('/dashboard')}
          >
            <img
              src="/finallogo.png"
              alt="Drnkly Logo"
              className="h-21 md:h-28 lg:h-25 mx-auto object-contain"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <ShoppingCart className="h-8 w-8 text-gray-900 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
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
                <div key={item.productId._id || item.productId} className="flex items-center justify-between border-b pb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div>
        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 capitalize">
          Category: {item.category || 'N/A'}
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-1">₹{item.price}</p>

        {item.category === 'Drinks' && (
          <p className="text-sm text-red-600 mt-1">
            + ₹{(Number(item.price) * Number(item.quantity) * 0.35).toFixed(2)} Service Fee (35%)
          </p>
        )}
      </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.productId._id || item.productId, Number(item.quantity) - 1)}
                      >
                        <Minus className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.productId._id || item.productId, Number(item.quantity) + 1)}
                      >
                        <Plus className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.productId._id || item.productId)}
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
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Service Fee (35%)</span>
                <span className="text-gray-900 font-medium">₹{drinksFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">₹{shipping.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-gray-600">Platform Fee</span>
                <span className="text-gray-900 font-medium">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-gray-600">GST (18%)</span>
                <span className="text-gray-900 font-medium">₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-6 text-lg font-semibold">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

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