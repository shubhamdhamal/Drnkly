import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CartItem } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const isPaymentDetailsProvided = isScreenshotUploaded || transactionId.trim().length > 0;

  const handleCashOnDeliveryChange = () => {
    if (!isCashOnDelivery) {
      setIsCashOnDelivery(true);
      setTransactionId('');
      setIsScreenshotUploaded(false);
    }
  };

  const handleOnlinePaymentSelect = () => {
    setIsCashOnDelivery(false);
  };

  const handleTransactionIdChange = (value: string) => {
    setTransactionId(value);
    if (value.trim().length > 0) {
      setIsCashOnDelivery(false);
    }
  };

  const handleScreenshotChange = (value: boolean) => {
    setIsScreenshotUploaded(value);
    if (value) {
      setIsCashOnDelivery(false);
    }
  };

  // Handle screenshot file upload
  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setIsScreenshotUploaded(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    const pendingOrderData = localStorage.getItem('pendingOrderData');
    if (pendingOrderData) {
      try {
        const orderData = JSON.parse(pendingOrderData);
        setPendingOrder(orderData);
      } catch (err) {
        console.error('Failed to parse pending order data:', err);
        alert('There was an issue with your order. Please try again.');
        navigate('/checkout');
      }
    } else {
      alert('No order information found. Please complete the checkout process first.');
      navigate('/checkout');
    }

    const coupon = localStorage.getItem('appliedCoupon');
    const discount = parseFloat(localStorage.getItem('discountAmount') || '0');
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);

    if (paymentMethodRef.current) {
      setTimeout(() => {
        paymentMethodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [navigate]);

const getDrinksFeeRate = () => {
  const now = new Date();
  const indianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = indianTime.getHours();

  // Apply 100% between 11 PM (23) to 2 AM (2)
  return (hour >= 23 || hour < 2) ? 1.0 : 0.20;
};


  const drinksFeeRate = getDrinksFeeRate();
  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const drinksFee = items.reduce((sum, item) => {
    const isDrink = item.productId?.category === 'Drinks';
    if (isDrink) {
      return sum + item.price * item.quantity * drinksFeeRate;
    }
    return sum;
  }, 0);

  const deliveryCharges = orderTotal > 500 ? 0 : 100;
  const platform = 12.0;
  const gst = 18.0;
  const gstAmount = (orderTotal + drinksFee) * gst / 100;
  const total = orderTotal + drinksFee + deliveryCharges + platform + gstAmount;

  const isOnlinePaymentValid = isScreenshotUploaded || transactionId.trim().length > 0;
  const isFormValid = (isOnlinePaymentValid && !isCashOnDelivery) || (isCashOnDelivery && !isOnlinePaymentValid);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingOrder) {
      alert('No order information found. Please complete the checkout process first.');
      navigate('/checkout');
      return;
    }

    if (!isFormValid) {
      return alert('Please either provide payment details (transaction ID or screenshot) or select Cash on Delivery.');
    }

    try {
      setIsLoading(true);

      const finalOrderData = {
        userId: pendingOrder.userId,
        address: pendingOrder.address,
        items: pendingOrder.items,
        totalAmount: finalTotal,
        couponCode: appliedCoupon || null,
        discountAmount: discountAmount || 0
      };

      const createOrderResponse = await axios.post('https://peghouse.in/api/orders', finalOrderData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!createOrderResponse.data?.order?._id) {
        throw new Error('Failed to create order');
      }

      const orderId = createOrderResponse.data.order._id;
      localStorage.setItem('latestOrderId', orderId);

      const paymentResponse = await axios.put(
        `https://peghouse.in/api/orders/${orderId}/pay`,
        {
          screenshotUploaded: isScreenshotUploaded,
          paymentProof: isScreenshotUploaded ? 'placeholder.jpg' : '',
          transactionId: transactionId || null,
          isCashOnDelivery,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (paymentResponse.data.message === 'Payment status updated successfully') {
        localStorage.removeItem('pendingOrderData');
        const userId = localStorage.getItem('userId');
        if (userId) {
          await axios.post('https://peghouse.in/api/cart/clear', { userId });
          localStorage.removeItem('cartItems');
          if (typeof window !== "undefined") {
            const event = new CustomEvent("clearCartContext");
            window.dispatchEvent(event);
          }
        }
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('discountAmount');
        navigate('/order-success');
      } else {
        console.error("Payment failed:", paymentResponse.data);
        alert('Payment failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Order/Payment error:', err?.response?.data || err);
      alert('Something went wrong while processing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const finalTotal = total - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate('/checkout')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">Payment</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 md:px-8 md:py-6">
        <div
          ref={paymentMethodRef}
          className="bg-white rounded-xl p-5 mb-6 shadow-lg animate-pulse-once border-2 border-blue-100"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Select Payment Method</h2>
          <div className="flex flex-col gap-4">
            <label className={`flex items-center p-4 border-2 rounded-lg ${!isCashOnDelivery ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="radio"
                name="paymentMethod"
                checked={!isCashOnDelivery}
                onChange={handleOnlinePaymentSelect}
                className="w-5 h-5 mr-4 accent-blue-600"
              />
              <span className="font-medium text-lg">Online Payment</span>
            </label>

            <label className={`flex items-center p-4 border-2 rounded-lg ${isCashOnDelivery ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input
                type="radio"
                name="paymentMethod"
                checked={isCashOnDelivery}
                onChange={handleCashOnDeliveryChange}
                className="w-5 h-5 mr-4 accent-blue-600"
              />
              <span className="font-medium text-lg">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {!isCashOnDelivery && (
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Scan QR to Pay</h2>
            <img
              src="/qr.jpg"
              alt="Admin QR Code"
              className="mx-auto w-48 h-48 object-contain border border-gray-200 rounded-lg shadow"
            />
            <p className="text-sm text-gray-500 mt-2">Use any UPI app to scan & pay</p>
          </div>
        )}

        {!isCashOnDelivery && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="mb-4">
              <label htmlFor="transactionId" className="block text-gray-700 mb-2">Enter Transaction ID</label>
              <input
                id="transactionId"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Transaction ID"
                value={transactionId}
                onChange={(e) => handleTransactionIdChange(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-gray-700 mb-2">Payment Screenshot (OPTIONAL)</h3>
              <label htmlFor="paymentScreenshotUpload" className="text-blue-600 underline cursor-pointer block mb-2">
                UPLOAD PAYMENT SCREENSHOT HERE
              </label>
              <input
                id="paymentScreenshotUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotFileChange}
              />
              {screenshotPreview && (
                <div className="mt-2">
                  <img src={screenshotPreview} alt="Screenshot Preview" className="w-32 h-32 object-contain border rounded" />
                </div>
              )}
              <div className="mt-4">
                <input
                  type="checkbox"
                  id="paymentScreenshotCheckbox"
                  checked={isScreenshotUploaded}
                  onChange={() => handleScreenshotChange(!isScreenshotUploaded)}
                  disabled={!!screenshotFile}
                />
                <label htmlFor="paymentScreenshotCheckbox" className="ml-2 text-gray-700">
                  I have Entered the Transaction ID or Uploaded the Payment Screenshot
                </label>
              </div>
            </div>

            <div className={`text-sm mt-2 ${isPaymentDetailsProvided ? 'text-green-600' : 'text-gray-500'}`}>
              {isPaymentDetailsProvided ? '✓ Payment details provided' : ''}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Drinks Service Fee ({drinksFeeRate * 100}%)</span>
              <span className="font-semibold">₹{drinksFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
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
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 mt-1 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Cancellation Policy</h3>
          <p className="text-gray-600 text-sm">
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </p>
        </div>

        <button
          onClick={handlePaymentSubmit}
          disabled={!isFormValid || isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isFormValid && !isLoading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Processing...' : 'Place Order & Submit Payment'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
