import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { setItems: setContextItems } = useCart(); // Get setItems from context

  interface CartItem {
    category: any;
    productId: any; 
    name: string;
    price: number | string;
    image: string;
    quantity: number | string;
  }

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const userId = localStorage.getItem('userId');
  
  // Track item being deleted for confirmation modal
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    
    // Track ViewCart event
    if (window && (window as any).fbq) {
      (window as any).fbq('track', 'ViewCart');
    }
    
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

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return toast.error('User not logged in');

      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        const populatedItems = res.data.items.map((item: any) => ({
          ...item,
          category: item.productId?.category || null
        }));
        setItems(populatedItems);

        // Update the cart context with the fetched items
        const contextItems = res.data.items.map((item: any) => ({
          id: item.productId?._id || item.productId,
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || item.name,
          price: Number(item.productId?.price || item.price),
          image: item.productId?.image || item.image,
          category: item.productId?.category || null,
          quantity: Number(item.quantity)
        }));
        setContextItems(contextItems);

        // Debug: Log each product's category
        console.log('Fetched Cart Items:');
        res.data.items.forEach((item: any, i: number) => {
          console.log(`Item ${i + 1}:`, item.productId?.category || 'No category found');
        });
      } catch (error) {
        toast.error('Failed to load cart');
        console.error(error);
      }
    };

    fetchCart();
  }, [userId, setContextItems]);


  // Update quantity in backend
  const updateQuantity = async (productId: string, quantity: number) => {
    // Set loading state for this specific item
    setIsLoading(prev => ({ ...prev, [productId]: true }));
    
    try {


      const updatedItems = res.data.cart.items.map((item: any) => ({
        ...item,
        category: item.productId?.category || null,
        name: item.productId?.name || item.name,
        image: item.productId?.image || item.image,
        price: item.productId?.price || item.price,
        productId: item.productId?._id || item.productId, // normalize
        quantity: item.quantity
      }));

      setItems(updatedItems);
      
      // Update the cart context with the updated items
      const contextItems = res.data.cart.items.map((item: any) => ({
        id: item.productId?._id || item.productId,
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || item.name,
        price: Number(item.productId?.price || item.price),
        image: item.productId?.image || item.image,
        category: item.productId?.category || null,
        quantity: Number(item.quantity)
      }));
      setContextItems(contextItems);
      
      // Track Add/Remove from Cart events for Facebook Pixel
      if (window && (window as any).fbq) {
        (window as any).fbq('track', 'UpdateCart', {
          content_type: 'product',
          content_ids: [productId],
          contents: [{ id: productId, quantity: quantity }],
          currency: 'INR'
        });
      }
      
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Error updating quantity:', error);
    } finally {
      // Clear loading state for this item
      setIsLoading(prev => ({ ...prev, [productId]: false }));
    }
  };



  // Cancel delete confirmation
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
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
              className="h-12 sm:h-16 md:h-20 lg:h-24 mx-auto object-contain"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <ShoppingCart className="h-8 w-8 text-gray-900 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-yellow-500 mr-3" size={24} />
                <h3 className="text-lg font-medium">Remove Item?</h3>
              </div>
              <p className="mb-6 text-gray-600">Are you sure you want to remove this item from your cart?</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => itemToDelete && removeFromCart(itemToDelete)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

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
              items.map((item: any) => {

            }
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
                onClick={() => {
                  // Track InitiateCheckout event for Facebook Pixel
                  if (window && (window as any).fbq) {
                    (window as any).fbq('track', 'InitiateCheckout', {
                      content_type: 'product',
                      contents: items.map(item => ({
                        id: item.productId?._id || item.productId,
                        quantity: Number(item.quantity)
                      })),
                      num_items: items.length,
                      currency: 'INR',
                      value: finalTotal
                    });
                  }
                  navigate('/checkout');
                }}
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
