import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  handoverStatus: string;
  deliveryStatus: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://drnkly.in/api/orders/user/${userId}`);
        setOrders(res.data.orders);
      } catch (error) {
        setError('Error fetching orders. Please try again later.');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleTrackOrderClick = (orderId: string) => {
    setActiveTrackingOrderId((prevId) => (prevId === orderId ? null : orderId));  
  };

  const getStatusColor = (status: string, handoverStatus: string, deliveryStatus: string) => {
    if (status === 'accepted' || handoverStatus === 'handedOver' || deliveryStatus === 'delivered') {
      return 'bg-green-500'; // Green for completed status
    } else if (status === 'pending' || handoverStatus === 'pending' || deliveryStatus === 'pending') {
      return 'bg-orange-500'; // Orange for pending status
    } else {
      return 'bg-gray-300'; // Gray for default
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white shadow-sm rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-800 mb-1">Order #{order._id.slice(-5)}</h2>
                <ul className="text-sm text-gray-700 mb-2 list-disc ml-4">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className={`text-sm font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                </p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                <p className="font-bold text-lg mt-1">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTrackOrderClick(order._id)}  // Toggle tracking visibility
                  className="text-sm bg-white border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
                >
                  {activeTrackingOrderId === order._id ? 'Hide Tracking' : 'Track Order'}
                </button>
              </div>
            </div>

            {/* Show tracking details if the order is selected */}
            {activeTrackingOrderId === order._id && (
              <div className="mt-6">
                {/* Vertical Track the steps with lines connecting the circles */}
                <div className="flex flex-col items-start space-y-2 pl-4">
                  {/* Step 1 */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStatusColor(order.items[0].status, order.items[0].handoverStatus, order.items[0].deliveryStatus)}`}>
                      1
                    </div>
                    <div className="flex flex-col ml-4">
                      <p className="font-semibold text-gray-800">Vendor Status: {order.items[0].status}</p>
                      <p className="text-sm text-gray-600">We have received your order.</p>
                    </div>
                  </div>
                  <div className="w-1 h-12 bg-gray-300"></div>

                  {/* Step 2 */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStatusColor(order.items[0].handoverStatus, order.items[0].status, order.items[0].deliveryStatus)}`}>
                      2
                    </div>
                    <div className="flex flex-col ml-4">
                      <p className="font-semibold text-gray-800">Handover to Delivery Boy: {order.items[0].handoverStatus}</p>
                      <p className="text-sm text-gray-600">We have confirmed your order.</p>
                    </div>
                  </div>
                  <div className="w-1 h-12 bg-gray-300"></div>

                  {/* Step 3 */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStatusColor(order.items[0].deliveryStatus, order.items[0].status, order.items[0].handoverStatus)}`}>
                      3
                    </div>
                    <div className="flex flex-col ml-4">
                      <p className="font-semibold text-gray-800">Delivery Status: {order.items[0].deliveryStatus}</p>
                      <p className="text-sm text-gray-600">We are preparing your order.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-100 rounded-lg mt-6">
                  <p className="text-lg font-semibold text-gray-800">Estimated Delivery Time:</p>
                  <p className="text-gray-700">Your order is expected to be delivered within 45 minutes. Please check the tracking timeline for updates.</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
