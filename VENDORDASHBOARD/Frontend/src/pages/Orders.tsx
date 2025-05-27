import React, { useState, useEffect, useRef } from 'react';
import { Eye, Check, X, Search, Bell, Truck } from 'lucide-react';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Order {
  transactionId: string | null;
  orderNumber: string;
  id: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending';
  paymentProof?: string;
  createdAt: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrdersCountRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        const res = await axios.get('https://vendor.peghouse.in/api/vendor/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedOrders = res.data.orders.map((order: any) => ({
          id: order.orderId,
          orderNumber: order.orderNumber,
          customerName: order.deliveryAddress?.fullName || 'Customer',
          items: order.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            status: item.status || 'pending',
          })),
          totalAmount: order.totalAmount || 0,
          paymentStatus: order.paymentStatus || 'pending',
          transactionId: order.transactionId || '',
          paymentProof: order.paymentProof || '',
          createdAt: order.createdAt,
        }));

        // Check if there are new orders
        const currentOrderIds = orders.map((order: Order) => order.id);
        const newIncomingOrders = fetchedOrders.filter((order: any) => !currentOrderIds.includes(order.id));
        
        // Show notification for new orders - modified to show notifications even on first load
        if (newIncomingOrders.length > 0) {
          // For first load, only show notification if there are pending orders
          const hasPendingOrders = newIncomingOrders.some((order: any) => 
            order.items.some((item: any) => item.status === 'pending')
          );
          
          if (lastOrdersCountRef.current > 0 || hasPendingOrders) {
            // Set new orders for notification
            setNewOrders(newIncomingOrders);
            
            // Show notification
            showOrderNotification(newIncomingOrders);
            
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.error("Failed to play sound:", err));
            }
          }
        }

        setOrders(fetchedOrders);
        lastOrdersCountRef.current = fetchedOrders.length;
        setLoading(false);
        
        // Check if we need to scroll to past orders
        const showPastOrders = localStorage.getItem('showPastOrders');
        if (showPastOrders === 'true') {
          // Clear the flag
          localStorage.removeItem('showPastOrders');
          
          // Wait for the component to render
          setTimeout(() => {
            const pastOrdersElement = document.getElementById('past-orders');
            if (pastOrdersElement) {
              pastOrdersElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    // Initial load and polling setup
    fetchOrders();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Set up polling for new orders (every 30 seconds)
    pollingIntervalRef.current = setInterval(fetchOrders, 30000);
    
    return () => {
      // Clean up interval on component unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    productId: string,
    status: 'accepted' | 'rejected'
  ) => {
    const token = localStorage.getItem('authToken');

    try {
      await axios.put(
        `https://vendor.peghouse.in/api/vendor/orders/${orderId}/status`,
        { productId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.productId === productId ? { ...item, status } : item
                ),
              }
            : order
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const toggleView = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  // Separate orders into current and past
  const currentOrders = orders.filter(order => 
    order.items.some(item => item.status !== 'accepted')
  ).filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === 'All Orders' ||
      order.items.some((item) => item.status === filterStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pastOrders = orders.filter(order => 
    order.items.every(item => item.status === 'accepted')
  ).filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Show notification for new orders - improved notification message
  const showOrderNotification = (newOrders: Order[]) => {
    const orderCount = newOrders.length;
    const pendingCount = newOrders.filter(order => 
      order.items.some(item => item.status === 'pending')
    ).length;
    
    // More detailed notification message
    let message = '';
    if (pendingCount > 0) {
      message = pendingCount === 1 
        ? `New order waiting: ${newOrders[0].orderNumber}` 
        : `${pendingCount} new orders waiting for approval!`;
    } else {
      message = orderCount === 1 
        ? `New order received: ${newOrders[0].orderNumber}` 
        : `${orderCount} new orders received!`;
    }
    
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto-hide notification after 15 seconds (increased from 10)
    setTimeout(() => {
      setShowNotification(false);
    }, 15000);
    
    // Try to use browser notifications if allowed
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Drnkly - नवीन ऑर्डर आली आहे!", {
        body: message,
        icon: "/logo.png" // Add your logo path here
      });
    }
  };

  // Handle notification click - scroll to new orders
  const handleNotificationClick = () => {
    setShowNotification(false);
    if (newOrders.length > 0) {
      // Expand the first new order
      setExpandedOrderId(newOrders[0].id);
      // Scroll to the first new order element
      const orderElement = document.getElementById(`order-${newOrders[0].id}`);
      if (orderElement) {
        orderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add highlight effect
        orderElement.classList.add('highlight-order');
        setTimeout(() => {
          orderElement.classList.remove('highlight-order');
        }, 2000);
      }
    }
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  // Add function to confirm order and move to pickup
  const confirmOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Find the order details
      const orderToConfirm = orders.find(order => order.id === orderId);
      if (!orderToConfirm) {
        toast.error('Order not found');
        return;
      }
      
      // Call API to update order status to ready for pickup
      const response = await axios.put(
        `https://vendor.peghouse.in/api/vendor/orders/${orderId}/ready-for-pickup`,
        { 
          orderId: orderId,
          orderNumber: orderToConfirm.orderNumber
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        // Remove this order from current orders display
        setOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Show success message
        toast.success('Order confirmed and ready for pickup!');
        
        // Navigate to pickup page
        navigate('/pickup');
      }
    } catch (err) {
      console.error('Failed to confirm order', err);
      toast.error('Failed to confirm order');
    }
  };

  // Check if all items in an order are accepted
  const areAllItemsAccepted = (order: Order) => {
    return order.items.every(item => item.status === 'accepted');
  };

  // Check if any item in an order is still pending
  const hasAnyPendingItem = (order: Order) => {
    return order.items.some(item => item.status === 'pending');
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading orders...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Add notification sound */}
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />
      
      {/* Notification popup */}
      {showNotification && (
        <div 
          onClick={handleNotificationClick}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#ff5722',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(255,87,34,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out, blinking 2s infinite',
            fontSize: '16px',
            fontWeight: 'bold',
            border: '2px solid #fff'
          }}
        >
          <Bell size={24} className="notification-bell" />
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{notificationMessage}</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>क्लिक करा आणि पहा</p>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes highlight {
            0%, 100% { background-color: #fff; }
            50% { background-color: #ffecb3; }
          }
          
          @keyframes blinking {
            0%, 100% { box-shadow: 0 4px 15px rgba(255,87,34,0.4); }
            50% { box-shadow: 0 4px 25px rgba(255,87,34,0.8); }
          }
          
          @keyframes swing {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(15deg); }
            60% { transform: rotate(-15deg); }
          }
          
          .notification-bell {
            animation: swing 1s infinite ease-in-out;
          }
          
          .new-order {
            animation: fadeIn 0.5s ease-out;
          }
          
          .highlight-order {
            animation: highlight 1.5s ease-in-out;
          }
        `}
      </style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Orders</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Input
            placeholder="Search by Order ID, Customer or Item..."
            icon={<Search className="w-5 h-5 text-gray-400" />}
            style={{ minWidth: '250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="input-field"
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All Orders</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Current Orders</h2>
      {currentOrders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '24px' }}>No current orders</p>
      ) : (
        currentOrders.map((order, index) => (
          <div
            key={order.id}
            id={`order-${order.id}`}
            className={newOrders.some(newOrder => newOrder.id === order.id) ? 'new-order' : ''}
            style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 0 8px rgba(0,0,0,0.05)',
              border: newOrders.some(newOrder => newOrder.id === order.id) 
                ? '2px solid #ff5722' 
                : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center' }}>
                  #{index + 1} - {order.orderNumber}
                  {newOrders.some(newOrder => newOrder.id === order.id) && (
                    <span style={{ 
                      background: '#ff5722',
                      color: 'white',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      NEW
                    </span>
                  )}
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{order.customerName}</p>
                <p style={{ marginTop: '4px', fontSize: '14px' }}>
                  <strong>Final Total:</strong> ₹{order.totalAmount.toFixed(2)}
                </p>

                {/* Display Transaction ID */}
                {order.transactionId && (
                  <p style={{ marginTop: '4px', fontSize: '14px' }}>
                    <strong>Transaction ID:</strong> {order.transactionId}
                  </p>
                )}

                {/* Display Payment Status */}
                <p style={{ marginTop: '4px', fontSize: '14px' }}>
                  <strong>Payment Status:</strong> {order.paymentStatus}
                </p>
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div
                style={{
                  marginTop: '16px',
                  borderTop: '1px solid #eee',
                  paddingTop: '12px',
                }}
              >
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      marginBottom: '10px',
                    }}
                  >
                    <span>
                      {item.quantity}x {item.name}
                      <span
                        style={{
                          marginLeft: '12px',
                          fontStyle: 'italic',
                          color:
                            item.status === 'accepted'
                              ? 'green'
                              : item.status === 'rejected'
                              ? 'red'
                              : 'gray',
                        }}
                      >
                        ({item.status})
                      </span>
                    </span>
                    <span>₹{item.price}</span>
                    {item.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="primary"
                          icon={<Check className="w-4 h-4" />}
                          onClick={() =>
                            updateOrderStatus(order.id, item.productId, 'accepted')
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          icon={<X className="w-4 h-4" />}
                          onClick={() =>
                            updateOrderStatus(order.id, item.productId, 'rejected')
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => toggleView(order.id)}
              >
                {expandedOrderId === order.id ? 'Hide' : 'View'}
              </Button>
              
              {/* Add Confirm Order button that appears only when all items are accepted */}
              {areAllItemsAccepted(order) && !hasAnyPendingItem(order) && (
                <Button
                  variant="primary"
                  icon={<Truck className="w-4 h-4" />}
                  onClick={() => confirmOrder(order.id)}
                >
                  Confirm Order
                </Button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Past Orders Section */}
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderTop: '1px solid #eee', paddingTop: '24px' }} id="past-orders">Past Orders</h2>
      {pastOrders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '24px' }}>No past orders</p>
      ) : (
        pastOrders.map((order, index) => (
          <div
            key={order.id}
            style={{
              background: '#f9f9f9',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 0 8px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0' }}>
                  #{index + 1} - {order.orderNumber}
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{order.customerName}</p>
                <p style={{ marginTop: '4px', fontSize: '14px' }}>
                  <strong>Final Total:</strong> ₹{order.totalAmount.toFixed(2)}
                </p>

                {/* Display Transaction ID */}
                {order.transactionId && (
                  <p style={{ marginTop: '4px', fontSize: '14px' }}>
                    <strong>Transaction ID:</strong> {order.transactionId}
                  </p>
                )}

                {/* Display Payment Status */}
                <p style={{ marginTop: '4px', fontSize: '14px' }}>
                  <strong>Payment Status:</strong> {order.paymentStatus}
                </p>
                <p style={{ marginTop: '4px', fontSize: '14px', color: 'green' }}>
                  <strong>Status:</strong> Completed
                </p>
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div
                style={{
                  marginTop: '16px',
                  borderTop: '1px solid #eee',
                  paddingTop: '12px',
                }}
              >
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      marginBottom: '10px',
                    }}
                  >
                    <span>
                      {item.quantity}x {item.name}
                      <span
                        style={{
                          marginLeft: '12px',
                          fontStyle: 'italic',
                          color: 'green'
                        }}
                      >
                        (accepted)
                      </span>
                    </span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => toggleView(order.id)}
              >
                {expandedOrderId === order.id ? 'Hide' : 'View'}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
