import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { setItems: setContextItems, clearCart: clearContextCart } = useCart();

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

  // Fetch cart items and sync with context
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        toast.error('User not logged in');
        clearContextCart(); // Clear context cart if user is not logged in
        setItems([]); // Clear local items
        return;
      }

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

        // If no items in cart, clear context
        if (res.data.items.length === 0) {
          clearContextCart();
        }

        // Debug: Log each product's category
        console.log('Fetched Cart Items:', res.data.items.length);
      } catch (error) {
        toast.error('Failed to load cart');
        console.error(error);
        // Clear both local and context cart on error
        setItems([]);
        clearContextCart();
      }
    };

    fetchCart();
  }, [userId, setContextItems, clearContextCart]);

  // Update quantity in backend
  const updateQuantity = async (productId: string, quantity: number) => {
    setIsLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (quantity <= 0) {
        setItemToDelete(productId);
        setShowDeleteConfirm(true);
        setIsLoading(prev => ({ ...prev, [productId]: false }));
        return;
      }

      const res = await axios.put('https://peghouse.in/api/cart/update', {
        userId,
        productId,
        quantity,
      });

      const updatedItems = res.data.cart.items.map((item: any) => ({
        ...item,
        category: item.productId?.category || null,
        name: item.productId?.name || item.name,
        image: item.productId?.image || item.image,
        price: item.productId?.price || item.price,
        productId: item.productId?._id || item.productId,
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

      // If no items left, clear context
      if (res.data.cart.items.length === 0) {
        clearContextCart();
      }
      
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
      setIsLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    setShowDeleteConfirm(false);
    setIsLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const res = await axios.delete('https://peghouse.in/api/cart/remove', {
        data: { userId, productId },
      });
      
      const updatedItems = res.data.cart.items.map((item: any) => ({
        ...item,
        category: item.productId?.category || null,
        name: item.productId?.name || item.name,
        image: item.productId?.image || item.image,
        price: item.productId?.price || item.price,
        productId: item.productId?._id || item.productId,
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

      // If no items left, clear context
      if (res.data.cart.items.length === 0) {
        clearContextCart();
      }
      
      // Track Remove from Cart event for Facebook Pixel
      if (window && (window as any).fbq) {
        (window as any).fbq('track', 'RemoveFromCart', {
          content_type: 'product',
          content_ids: [productId],
          currency: 'INR'
        });
      }
      
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Error removing item:', error);
    } finally {
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

  // Drinks Fee (20%)
  const drinksFee = items.reduce((sum, item) => {
    const category = item?.category;
    const price = typeof item.price === 'string' ? Number(item.price.replace(/[^\d.]/g, '')) : item.price;
    const quantity = typeof item.quantity === 'string' ? Number(item.quantity.replace(/[^\d.]/g, '')) : item.quantity;

    if (category === 'Drinks') {
      return sum + (Number(price) || 0) * (Number(quantity) || 1) * 0.20;
    }

    return sum;
  }, 0);

  let shipping = total > 500 ? 0 : 100;
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
                const itemId = item.productId?._id || item.productId;
                const itemLoading = isLoading[itemId] || false;
                
                return (
                  <div key={itemId} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 mb-6">
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
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </p>

                        {item.category === 'Drinks' && (
                          <p className="text-sm text-red-600 mt-1">
                            + ₹{(Number(item.price) * Number(item.quantity) * 0.20).toFixed(2)} Service Fee (20%)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mt-4 sm:mt-0 justify-between sm:justify-end sm:space-x-6">
                      <div className="flex items-center">
                        <button
                          className="p-2 rounded-l-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                          onClick={() => updateQuantity(itemId, Number(item.quantity) - 1)}
                          disabled={itemLoading}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-5 w-5 text-gray-700" />
                        </button>
                        <span className="px-4 py-2 font-medium text-center bg-white border-t border-b border-gray-300 min-w-[40px]">
                          {itemLoading ? '...' : item.quantity}
                        </span>
                        <button
                          className="p-2 rounded-r-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                          onClick={() => updateQuantity(itemId, Number(item.quantity) + 1)}
                          disabled={itemLoading}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-5 w-5 text-gray-700" />
                        </button>
                      </div>
                      <button
                        className="flex items-center px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors ml-4"
                        onClick={() => {
                          setItemToDelete(itemId);
                          setShowDeleteConfirm(true);
                        }}
                        disabled={itemLoading}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-b-lg">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Service Fee (20%)</span>
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

        {/* <p style={{ display: 'none' }}>
          Sound file should be placed at: {process.env.PUBLIC_URL}/notification-sound.mp3
        </p> */}
      </div>
    </div>
  );
};

export default Cart;
