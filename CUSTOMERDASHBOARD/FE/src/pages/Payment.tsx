import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus } from 'lucide-react';
//import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cod'>('qr');

  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryCharges = 100.0;
  const platform = 12.0;
  const gst = 5.00;
  const gstAmount = (orderTotal * gst) / 100;
  const total = orderTotal + deliveryCharges +platform + gstAmount;

  // 🔁 Fetch vendor QR
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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = localStorage.getItem('latestOrderId');
    if (!orderId) return alert('No order ID found. Please place an order first.');

    if (paymentMethod === 'qr' && !screenshot) {
      return alert('Please upload a screenshot to verify payment.');
    }

    try {
      if (paymentMethod === 'qr') {
        const formData = new FormData();
        formData.append('screenshot', screenshot!);
        formData.append('paymentMethod', 'qr');

        const res = await axios.put(
          `https://peghouse.in/api/orders/${orderId}/pay`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (res.data.message === 'Payment successful') {
          navigate('/order-success');
        }
      } else {
        // Handle COD
        const res = await axios.put(
          `https://peghouse.in/api/orders/${orderId}/pay`,
          { paymentMethod: 'cod' }
        );
        
        if (res.data.message === 'Order placed successfully') {
          navigate('/order-success');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong while processing payment.');
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
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'qr'}
                onChange={() => setPaymentMethod('qr')}
                className="h-4 w-4 text-[#cd6839]"
              />
              <span className="ml-3">Pay via QR Code</span>
            </label>
            
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="h-4 w-4 text-[#cd6839]"
              />
              <span className="ml-3">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* QR Section - Only show if QR payment selected */}
        {paymentMethod === 'qr' && (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold mb-2">Scan QR to Pay</h2>
              <img
                src={`https://peghouse.in/uploads/qr.png`}
                alt="Admin QR Code"
                className="mx-auto w-48 h-48 object-contain border border-gray-200 rounded-lg shadow"
              />
              <p className="text-sm text-gray-500 mt-2">Use any UPI app to scan & pay</p>
            </div>

            {/* Screenshot Upload */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Upload Payment Screenshot</h2>
              <h6 className="mb-4"><i>Screenshot should include transaction ID and payment status.</i></h6>
              
              <label className="block cursor-pointer text-blue-600 font-medium mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                <span className="flex items-center gap-2">
                  <ImagePlus size={18} /> Choose Image
                </span>
              </label>
              {previewURL && (
                <img
                  src={previewURL}
                  alt="Payment Proof"
                  className="w-full h-64 object-cover rounded-md border mt-2"
                />
              )}
            </div>
          </>
        )}

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

        {/* Submit Button */}
        <button
          onClick={handlePaymentSubmit}
          className="w-full bg-[#cd6839] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#b55a31] transition-colors"
        >
          {paymentMethod === 'cod' ? 'Place Order' : 'Submit Payment'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
