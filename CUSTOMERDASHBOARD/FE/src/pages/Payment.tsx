import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);

  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryCharges = 100.0;
  const platform = 12.0;
  const gst = 5.00;
  const gstAmount = (orderTotal * gst) / 100;
  const total = orderTotal + deliveryCharges + platform + gstAmount;

  // 🔁 Fetch vendor cart items
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = localStorage.getItem('latestOrderId');
    if (!orderId) return alert('No order ID found. Please place an order first.');

    if (!isScreenshotUploaded) return alert('Please acknowledge that the payment screenshot has been uploaded.');

    try {
      // Send only the checkbox state (no screenshot file)
      const res = await axios.put(
        `https://peghouse.in/api/orders/${orderId}/pay`,
        {
          screenshotUploaded: isScreenshotUploaded, // Sending only checkbox confirmation
        },
        {
          headers: {
            'Content-Type': 'application/json' // Make sure to send the correct content type
          }
        }
      );

      if (res.data.message === 'Payment successful') {
        navigate('/order-success');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong while submitting payment.');
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
        {/* QR Section */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Scan QR to Pay</h2>
          <img
            src="/qr.jpg" // Assuming vendor server runs on port 5001
            alt="Admin QR Code"
            className="mx-auto w-48 h-48 object-contain border border-gray-200 rounded-lg shadow"
          />
          <p className="text-sm text-gray-500 mt-2">Use any UPI app to scan & pay</p>
        </div>

        {/* Screenshot Upload Link */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Screenshot</h2>
          <p className="mb-4 text-gray-600">
            Please confirm that you have uploaded the payment screenshot here:
          </p>
          <a
            href="https://drive.google.com/drive/folders/1i09WZAT0qd57MV9KMecAI6Rdvcon7TUF?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Payment Screenshot Folder
          </a>
          <div className="mt-4">
            <input
              type="checkbox"
              id="paymentScreenshotCheckbox"
              checked={isScreenshotUploaded}
              onChange={() => setIsScreenshotUploaded(!isScreenshotUploaded)}
            />
            <label
              htmlFor="paymentScreenshotCheckbox"
              className="ml-2 text-gray-700"
            >
              I have uploaded the payment screenshot
            </label>
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
                <span className="text-xl font-semibold">₹{(orderTotal + 100 + 12 + (orderTotal) * 0.05).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          onClick={handlePaymentSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Submit Payment
        </button>
      </div>
    </div>
  );
};

export default Payment;
