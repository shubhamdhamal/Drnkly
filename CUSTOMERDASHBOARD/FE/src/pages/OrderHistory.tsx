import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X } from 'lucide-react';

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
  couponCode?: string; // Added couponCode to the interface
  orderNumber?: string;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const userId = localStorage.getItem('userId');
  const previousOrdersRef = useRef<Order[]>([]);

  // Function to check for new orders
  const checkForNewOrders = (currentOrders: Order[]) => {
    if (previousOrdersRef.current.length === 0) {
      previousOrdersRef.current = currentOrders;
      return;
    }

    const latestOrder = currentOrders[0];
    const previousLatestOrder = previousOrdersRef.current[0];

    if (latestOrder && previousLatestOrder && latestOrder._id !== previousLatestOrder._id) {
      setNewOrder(latestOrder);
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }

    previousOrdersRef.current = currentOrders;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`https://peghouse.in/api/orders/user/${userId}`);
        const data: any = res.data;
        const sortedOrders = data.orders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        checkForNewOrders(sortedOrders);
      } catch (error) {
        setError('Error fetching orders. Please try again later.');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
      // Set up polling for new orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
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

  // Returns color for each step based on step index and order item status
  const getStepColor = (stepIndex: number, item: OrderItem) => {
    // Step 1: Vendor Status
    if (stepIndex === 1) {
      if (item.status === 'accepted') return 'bg-green-500';
      if (item.status === 'pending') return 'bg-orange-500';
      return 'bg-gray-300';
    }
    // Step 2: Handover
    if (stepIndex === 2) {
      if (item.handoverStatus === 'handedOver') return 'bg-green-500';
      if (item.status === 'accepted' && item.handoverStatus === 'pending') return 'bg-orange-500';
      return 'bg-gray-300';
    }
    // Step 3: Delivery
    if (stepIndex === 3) {
      if (item.deliveryStatus === 'delivered') return 'bg-green-500';
      if (item.handoverStatus === 'handedOver' && item.deliveryStatus === 'pending') return 'bg-orange-500';
      return 'bg-gray-300';
    }
    return 'bg-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-80 px-3 py-">
      {/* Notification Popup */}
      
      <div className="flex justify-center mb-6">

<div 
        className="cursor-pointer inline-block"
        onClick={() => navigate('/dashboard')}
      >
         <img
  src="/finallogo.png"
  alt="Drnkly Logo"
  className="h-20 md:h-28 lg:h-38 mx-auto object-contain"
/>

      </div>

</div>
      
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={order._id} className="bg-white shadow-sm rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
             <h2 className="font-semibold text-gray-800 mb-1">
  Order #{orders.length - index} - {order.orderNumber}
</h2>
                <ul className="text-sm text-gray-700 mb-2 list-disc ml-4">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className={`text-sm font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'CASH ON DELIVERY'}
                </p>
                {order.couponCode && (
                  <p className="text-green-600 text-sm">Coupon: {order.couponCode}</p>
                )}
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                <p className="font-bold text-lg mt-1">
  ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}
</p>

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
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStepColor(1, order.items[0])}`}>
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
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStepColor(2, order.items[0])}`}>
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
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getStepColor(3, order.items[0])}`}>
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
