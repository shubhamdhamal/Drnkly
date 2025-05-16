import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false); // New state for Cash on Delivery

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

    // If Cash on Delivery is selected, mark the order as placed without requiring payment details
    if (isCashOnDelivery) {
      try {
        const res = await axios.put(
          `https://peghouse.in/api/orders/${orderId}/pay`,
          {
            paymentMethod: 'Cash on Delivery',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (res.data.message === 'Order placed successfully with COD') {
          navigate('/order-success');
        } else {
          alert('Order placement failed. Please try again.');
        }
      } catch (err) {
        console.error('Order placement error:', err.response ? err.response.data : err);
        alert('Something went wrong while placing your order.');
      }
      return;
    }

    if (!isScreenshotUploaded && !transactionId) {
      return alert('Please either upload the screenshot or provide the transaction ID.');
    }

    try {
      const res = await axios.put(
        `https://peghouse.in/api/orders/${orderId}/pay`,
        {
          screenshotUploaded: isScreenshotUploaded,
          paymentProof: isScreenshotUploaded ? 'placeholder.jpg' : '',
          transactionId: transactionId || null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
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

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Transaction ID Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Enter Transaction ID</h2>
          <p className="mb-4 text-gray-600">
            Please enter your transaction ID here:
          </p>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>

        {/* Screenshot Upload Link */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Payment Screenshot (OPTIONAL)</h2>
          <p className="mb-4 text-gray-600">
            Please confirm that you have uploaded the payment screenshot here:
          </p>
          <a
            href="https://drive.google.com/drive/folders/1i09WZAT0qd57MV9KMecAI6Rdvcon7TUF?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            UPLOAD PAYMENT SCREENSHOT HERE
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
              I have Entered the Transaction ID or Uploaded the Payment Screenshot
            </label>
          </div>
        </div>

        {/* Cash on Delivery Toggle */}
        <div className="mb-6">
          <input
            type="checkbox"
            id="cashOnDeliveryCheckbox"
            checked={isCashOnDelivery}
            onChange={() => setIsCashOnDelivery(!isCashOnDelivery)}
          />
          <label
            htmlFor="cashOnDeliveryCheckbox"
            className="ml-2 text-gray-700"
          >
            Select Cash on Delivery
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
            <div className="flex justify-between">
              <span className="text-gray-600">Drinks Service Fee (35%)</span>
              <span className="font-semibold">₹{drinksFee.toFixed(2)}</span>
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
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
            </div>
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
          disabled={!isCashOnDelivery && !(isScreenshotUploaded || transactionId)}  // Enable if COD or screenshot/transaction ID provided
        >
          Submit Payment
        </button>
      </div>
    </div>
  );
};

export default Payment;
