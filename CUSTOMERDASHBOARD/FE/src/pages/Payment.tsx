import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);
  const [transactionId, setTransactionId] = useState<string>(''); // New state for transaction ID
  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false); // New state for cash on delivery

  // 🔁 Fetch vendor cart items
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error('Cart fetch error:', err);
      }
    };

    fetchCart();
  }, []);

  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate 35% fee on Drinks only
  const drinksFee = items.reduce((sum, item) => {
    const isDrink = item.productId?.category === 'Drinks';
    if (isDrink) {
      return sum + item.price * item.quantity * 0.35;
    }
    return sum;
  }, 0);

  const deliveryCharges = 100.0;
  const platform = 12.0;
  const gst = 18.0;
  const gstAmount = (orderTotal + drinksFee) * gst / 100;
  const total = orderTotal + drinksFee + deliveryCharges + platform + gstAmount;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = localStorage.getItem('latestOrderId');
    if (!orderId) return alert('No order ID found. Please place an order first.');

    if (!isScreenshotUploaded && !transactionId && !isCashOnDelivery) {
      return alert('Please either upload the screenshot, provide the transaction ID, or select Cash on Delivery.');
    }

    try {
      // Send the request to backend
      const res = await axios.put(
        `https://peghouse.in/api/orders/${orderId}/pay`,
        {
          screenshotUploaded: isScreenshotUploaded,
          paymentProof: isScreenshotUploaded ? 'placeholder.jpg' : '', // Send a dummy payment proof
          transactionId: transactionId || null,
          isCashOnDelivery, // Send the cash on delivery status
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.data.message === 'Payment status updated successfully') {
        navigate('/order-success');
      } else {
        console.error("Payment failed:", res.data);
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err.response ? err.response.data : err);
      alert('Something went wrong while submitting payment.');
    }
  };

  // Handle checkbox toggling
  const handleCheckboxChange = (type: 'screenshot' | 'cod') => {
    if (type === 'screenshot') {
      setIsScreenshotUploaded(true);
      setIsCashOnDelivery(false);
    } else {
      setIsScreenshotUploaded(false);
      setIsCashOnDelivery(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate('/checkout')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">Payment</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 md:px-8 md:py-10">
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

        {/* Transaction ID and Screenshot Upload Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Enter Transaction ID or Upload Screenshot</h2>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={isCashOnDelivery} // Disable if COD is selected
          />
          <div className="mt-4">
            <input
              type="checkbox"
              id="paymentScreenshotCheckbox"
              checked={isScreenshotUploaded}
              onChange={() => handleCheckboxChange('screenshot')}
              disabled={isCashOnDelivery} // Disable if COD is selected
            />
            <label
              htmlFor="paymentScreenshotCheckbox"
              className="ml-2 text-gray-700"
            >
              I have Entered the Transaction ID or Uploaded the Payment Screenshot
            </label>
          </div>
        </div>

        {/* Cash on Delivery Checkbox */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <input
            type="checkbox"
            id="cashOnDeliveryCheckbox"
            checked={isCashOnDelivery}
            onChange={() => handleCheckboxChange('cod')}
            disabled={isScreenshotUploaded} // Disable if screenshot or transaction is selected
          />
          <label
            htmlFor="cashOnDeliveryCheckbox"
            className="ml-2 text-gray-700"
          >
            Cash on Delivery
          </label>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total</span>
              <span className="font-semibold">₹{orderTotal.toFixed(2)}</span>
            </div>
            {/* Other summary details */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          onClick={handlePaymentSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          disabled={!isScreenshotUploaded && !transactionId && !isCashOnDelivery}
        >
          Submit Payment
        </button>
      </div>
    </div>
  );
};

export default Payment;
