import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus } from 'lucide-react';
//import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = 100.0;
  const platform = 12.0;
  const gst = 5.00;
  const gstAmount = (orderTotal * gst) / 100;
  const total = orderTotal + deliveryCharges + platform + gstAmount;

  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
  
      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
  
    fetchCart();
  }, []);

  const handleCashOnDelivery = async () => {
    const orderId = localStorage.getItem('latestOrderId');
    if (!orderId) return alert('No order ID found. Please place an order first.');

    try {
      const res = await axios.put(
        `https://peghouse.in/api/orders/${orderId}/cod`,
        { paymentMethod: 'COD' }
      );

      if (res.data.success) {
        navigate('/order-success');
      } else {
        alert('Failed to place COD order. Please try again.');
      }
    } catch (err) {
      console.error('COD error:', err);
      alert('Something went wrong while placing the order.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <button onClick={() => navigate('/checkout')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">Payment</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Cash on Delivery Section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="p-4 border-2 border-[#cd6839] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Cash on Delivery</h3>
                <p className="text-gray-600 text-sm mt-1">Pay when your order arrives</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-[#cd6839] text-white rounded-full">
                ₹
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total</span>
              <span className="font-semibold">₹{orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charges</span>
              <span className="font-semibold">₹{deliveryCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-semibold">₹{platform.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (5%)</span>
              <span className="font-semibold">₹{((orderTotal) * 0.05).toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handleCashOnDelivery}
          className="w-full bg-[#cd6839] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#b55a31] transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Payment;
