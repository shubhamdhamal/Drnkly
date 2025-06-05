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
  status: 'pending' | 'accepted' | 'rejected' | 'handedOver';
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
  readyForPickup?: boolean;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrdersCountRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Setup WebSocket connection for real-time updates
    wsRef.current = new WebSocket('ws://localhost:5000/ws/orders');
    
    wsRef.current.onmessage = (event) => {
      const newOrder = JSON.parse(event.data);
      handleNewOrder(newOrder);
    };

    const fetchOrders = async () => {
      try {
    const token = localStorage.getItem('authToken');
        const res = await axios.get('https://vendor.peghouse.in/api/vendor/orders', {
          headers: { Authorization: `Bearer ${token}` },
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
          readyForPickup: order.readyForPickup || false,
        }));

        setOrders(fetchedOrders);
        lastOrdersCountRef.current = fetchedOrders.length;
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      }
    };

    fetchOrders();
    requestNotificationPermission();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleNewOrder = (newOrder: Order) => {
    setOrders(prev => {
      // Remove the order if it already exists
      const filteredOrders = prev.filter(o => o.id !== newOrder.id);
      
      // Add new order at the beginning of the array
      const updatedOrders = [newOrder, ...filteredOrders];
      
      // Set as new order for notification
      setNewOrders(prevNew => [newOrder, ...prevNew]);
      showOrderNotification([newOrder]);
      
      return updatedOrders;
    });
  };

  // Add a helper function to check if this is the last pending item in an order
  const isLastPendingItem = (order: Order, currentItemId: string): boolean => {
    const pendingItems = order.items.filter(item => item.status === 'pending');
    return pendingItems.length === 1 && pendingItems[0].productId === currentItemId;
  };

  // Update the updateOrderStatus function
  const updateOrderStatus = async (
    orderId: string,
    productId: string,
    status: 'accepted' | 'rejected' | 'handedOver'
  ) => {
    const token = localStorage.getItem('authToken');

    try {
      // Find the current order
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        toast.error('Order not found');
        return;
      }

      // If accepting an item, check if it's the last pending item
      const shouldRedirectToPickup = status === 'accepted' && isLastPendingItem(currentOrder, productId);

      // Update the status
      const response = await axios.put(
        `https://vendor.peghouse.in/api/vendor/orders/${orderId}/status`,
        { productId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the order in the state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.productId === productId ? { ...item, status } : item
                  ),
                  // If this was the last pending item and it was accepted, mark as ready for pickup
                  readyForPickup: shouldRedirectToPickup ? true : order.readyForPickup
                }
              : order
          )
        );

        // If this was the last pending item and it was accepted, handle pickup
        if (shouldRedirectToPickup) {
          // Mark order as ready for pickup
          const pickupResponse = await axios.put(
            `http://localhost:5000/api/vendor/orders/${orderId}/ready-for-pickup`,
            { 
              orderId: orderId, 
              orderNumber: currentOrder.orderNumber,
              status: 'accepted'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (pickupResponse.status === 200) {
            toast.success('Order accepted and ready for pickup!');
            
            // Navigate to pickup page
            navigate('/pickup');
          }
        } else if (status === 'accepted') {
          // If it's not the last item, just show a success message
          toast.success('Item accepted successfully!');
        } else if (status === 'handedOver') {
          toast.success('Order handed over to delivery successfully!');
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update order status');
    }
  };

  const toggleView = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  // Update the liveOrders filter logic
  const liveOrders = orders.filter(order => {
    // Show orders that have any pending items or are partially accepted
    const hasPendingItems = order.items.some(item => item.status === 'pending');
    const hasAcceptedItems = order.items.some(item => item.status === 'accepted');
    const hasNoHandedOverItems = !order.items.some(item => item.status === 'handedOver');
    const isNotReadyForPickup = !order.readyForPickup;
    
    // Only show orders that:
    // 1. Have pending items OR are partially accepted
    // 2. Have no handed-over items
    // 3. Are not ready for pickup
    return ((hasPendingItems || hasAcceptedItems) && hasNoHandedOverItems && isNotReadyForPickup);
  }).filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  }).sort((a, b) => {
    // First check if either order is new
    const aIsNew = newOrders.some(newOrder => newOrder.id === a.id);
    const bIsNew = newOrders.some(newOrder => newOrder.id === b.id);
    
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pastOrders = orders.filter(order => {
    // Show orders that have any handed over items or are all rejected
    const hasHandedOverItems = order.items.some(item => item.status === 'handedOver');
    const allItemsRejected = order.items.every(item => item.status === 'rejected');
    
    return hasHandedOverItems || allItemsRejected;
  }).filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const firstOrder = newOrders[0];
      const itemsSummary = firstOrder.items
        .filter(item => item.status === 'pending')
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', ');
      
      message = pendingCount === 1 
        ? `${firstOrder.customerName} ने ऑर्डर केली आहे: ${itemsSummary}` 
        : `${pendingCount} नवीन ऑर्डर्स आल्या आहेत!`;
    } else {
      message = orderCount === 1 
        ? `${newOrders[0].customerName} ची नवीन ऑर्डर: ${newOrders[0].orderNumber}` 
        : `${orderCount} नवीन ऑर्डर्स आल्या आहेत!`;
    }
    
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto-hide notification after 30 seconds instead of 15
    setTimeout(() => {
      setShowNotification(false);
    }, 30000); // 30 seconds
    
    // Try to use browser notifications if allowed
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Drnkly - नवीन ऑर्डर आली आहे!", {
        body: message,
        icon: "/logo.png"
      });
    }

    // Play notification sound
    if (audioRef.current) {
      // Reset the audio to the beginning
      audioRef.current.currentTime = 0;
      
      // Play the sound multiple times for better attention
      let playCount = 0;
      const maxPlays = 3;
      
      const playSound = () => {
        if (playCount < maxPlays) {
          audioRef.current?.play().catch(err => console.error("Failed to play sound:", err));
          playCount++;
        }
      };
      
      // Play immediately
      playSound();
      
      // Play again after 3 seconds
      setTimeout(playSound, 3000);
      
      // Play one more time after 6 seconds
      setTimeout(playSound, 6000);
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

  // Update the handleOrderAccept function
  const handleOrderAccept = async (order: Order) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Update all pending items to accepted
      const updatePromises = order.items
        .filter(item => item.status === 'pending')
        .map(item => updateOrderStatus(order.id, item.productId, 'accepted'));
      
      await Promise.all(updatePromises);
      
      // After all items are accepted, mark order as ready for pickup
      const response = await axios.put(
        `http://localhost:5000/api/vendor/orders/${order.id}/ready-for-pickup`,
        { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          status: 'accepted'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        // Update local state to remove the order from live orders
        setOrders(prev => prev.map(o => 
          o.id === order.id 
            ? { ...o, readyForPickup: true }
            : o
        ));
        
        toast.success('Order accepted and ready for pickup!');
        
        // Navigate to pickup page
        navigate('/pickup');
      }
    } catch (err) {
      console.error('Failed to accept order', err);
      toast.error('Failed to accept order');
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

  // Check if any item in an order is handed over
  const hasAnyHandedOverItem = (order: Order) => {
    return order.items.some(item => item.status === 'handedOver');
  };

  // Check if all items in an order are handed over
  const areAllItemsHandedOver = (order: Order) => {
    return order.items.every(item => item.status === 'handedOver');
  };

  // Function to handle handover of all items in an order
  const handleOrderHandover = async (order: Order) => {
    try {
      // Update all accepted items to handed over
      const updatePromises = order.items
        .filter(item => item.status === 'accepted')
        .map(item => updateOrderStatus(order.id, item.productId, 'handedOver'));
      
      await Promise.all(updatePromises);
      toast.success('Order handed over to delivery successfully!');
    } catch (err) {
      console.error('Failed to hand over order', err);
      toast.error('Failed to hand over order');
    }
  };

  // Function to handle rejection of all items in an order
  const handleOrderReject = async (order: Order) => {
    try {
      // Update all pending items to rejected
      const updatePromises = order.items
        .filter(item => item.status === 'pending')
        .map(item => updateOrderStatus(order.id, item.productId, 'rejected'));
      
      await Promise.all(updatePromises);
      toast.success('Order rejected successfully!');
    } catch (err) {
      console.error('Failed to reject order', err);
      toast.error('Failed to reject order');
    }
  };

  // Function to get order status
  const getOrderStatus = (order: Order) => {
    if (areAllItemsHandedOver(order)) return 'Handed Over';
    if (areAllItemsAccepted(order)) return 'Ready for Pickup';
    if (hasAnyPendingItem(order)) return 'Pending';
    if (order.items.some(item => item.status === 'rejected')) return 'Partially Rejected';
    return 'Processing';
  };

  // Function to get order status color
  const getOrderStatusColor = (order: Order) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'Handed Over': return '#4caf50';
      case 'Ready for Pickup': return '#2196f3';
      case 'Pending': return '#ff9800';
      case 'Partially Rejected': return '#f44336';
      default: return '#666';
    }
  };

  // Function to get order background color
  const getOrderBackgroundColor = (order: Order) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'Handed Over': return '#e8f5e9';
      case 'Ready for Pickup': return '#e3f2fd';
      case 'Pending': return '#fff3e0';
      case 'Partially Rejected': return '#ffebee';
      default: return '#f9f9f9';
    }
  };

  // Function to render order items
  const renderOrderItems = (order: Order) => {
    const pendingItems = order.items.filter(item => item.status === 'pending');
    const acceptedItems = order.items.filter(item => item.status === 'accepted');
    
    return (
      <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
        {pendingItems.length > 0 && acceptedItems.length > 0 && (
          <div style={{ 
            background: '#e3f2fd', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            marginBottom: '12px',
            fontSize: '14px',
            color: '#1976d2'
          }}>
            {pendingItems.length} items pending acceptance
          </div>
        )}
        
        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              marginBottom: '10px',
              padding: '8px',
              background: item.status === 'handedOver' ? '#e8f5e9' : 
                         item.status === 'accepted' ? '#e3f2fd' :
                         item.status === 'pending' ? '#fff3e0' : '#ffebee',
              borderRadius: '4px'
            }}
          >
            <span>
              {item.quantity}x {item.name}
              <span
                style={{
                  marginLeft: '12px',
                  fontStyle: 'italic',
                  color: item.status === 'handedOver' ? '#4caf50' :
                         item.status === 'accepted' ? '#2196f3' :
                         item.status === 'pending' ? '#ff9800' : '#f44336'
                }}
              >
                ({item.status})
              </span>
            </span>
            <span>₹{item.price}</span>
          </div>
        ))}
      </div>
    );
  };

  // Function to render order actions
  const renderOrderActions = (order: Order) => {
    return (
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => toggleView(order.id)}
        >
          {expandedOrderId === order.id ? 'Hide' : 'View'}
        </Button>

        {hasAnyPendingItem(order) && (
          <>
            <Button
              variant="primary"
              icon={<Check className="w-4 h-4" />}
              onClick={() => handleOrderAccept(order)}
            >
              Accept All
            </Button>
            <Button
              variant="danger"
              icon={<X className="w-4 h-4" />}
              onClick={() => handleOrderReject(order)}
            >
              Reject All
            </Button>
          </>
        )}

        {areAllItemsAccepted(order) && !hasAnyHandedOverItem(order) && (
          <Button
            variant="primary"
            icon={<Truck className="w-4 h-4" />}
            onClick={() => handleOrderHandover(order)}
          >
            Hand Over All
          </Button>
        )}
      </div>
    );
  };

  // Function to render order card
  const renderOrderCard = (order: Order, index: number, isPastOrder: boolean = false) => {
    const hasHandedOverItems = order.items.some(item => item.status === 'handedOver');
    const hasRejectedItems = order.items.some(item => item.status === 'rejected');
    const allItemsHandedOver = order.items.every(item => item.status === 'handedOver');
    const allItemsRejected = order.items.every(item => item.status === 'rejected');
    const hasPendingItems = order.items.some(item => item.status === 'pending');
    const hasAcceptedItems = order.items.some(item => item.status === 'accepted');

    return (
      <div
        key={order.id}
        id={`order-${order.id}`}
        className={`${newOrders.some(newOrder => newOrder.id === order.id) ? 'new-order' : ''} ${isPastOrder ? 'past-order' : 'live-order'}`}
        style={{
          background: allItemsHandedOver ? '#e8f5e9' : 
                     allItemsRejected ? '#ffebee' :
                     hasHandedOverItems ? '#f1f8e9' : '#f9f9f9',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 0 8px rgba(0,0,0,0.05)',
          border: newOrders.some(newOrder => newOrder.id === order.id) 
            ? '2px solid #ff5722' 
            : isPastOrder 
              ? '1px solid #e0e0e0'
              : '1px solid transparent',
          opacity: isPastOrder ? 0.9 : 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              #{index + 1} - {order.orderNumber}
              {newOrders.some(newOrder => newOrder.id === order.id) && (
                <span style={{ 
                  background: '#ff5722',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  NEW
                </span>
              )}
              {allItemsHandedOver && (
                <span style={{ 
                  background: '#4caf50',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  COMPLETED
                </span>
              )}
              {allItemsRejected && (
                <span style={{ 
                  background: '#f44336',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  REJECTED
                </span>
              )}
              {hasHandedOverItems && hasRejectedItems && (
                <span style={{ 
                  background: '#ff9800',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  PARTIALLY COMPLETED
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
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  marginBottom: '10px',
                  padding: '8px',
                  background: item.status === 'handedOver' ? '#e8f5e9' : 
                             item.status === 'rejected' ? '#ffebee' : '#f5f5f5',
                  borderRadius: '4px',
                  opacity: isPastOrder ? 0.9 : 1
                }}
              >
                <span>
                  {item.quantity}x {item.name}
                  <span style={{
                    marginLeft: '12px',
                    fontStyle: 'italic',
                    color: item.status === 'handedOver' ? '#4caf50' :
                           item.status === 'rejected' ? '#f44336' : '#666'
                  }}>
                    ({item.status})
                  </span>
                </span>
                <span>₹{item.price}</span>
                {!isPastOrder && item.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => updateOrderStatus(order.id, item.productId, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => updateOrderStatus(order.id, item.productId, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {!isPastOrder && item.status === 'accepted' && (
                  <Button
                    variant="primary"
                    icon={<Truck className="w-4 h-4" />}
                    onClick={() => updateOrderStatus(order.id, item.productId, 'handedOver')}
                  >
                    Hand Over
                  </Button>
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
            {expandedOrderId === order.id ? 'Hide' : 'View Details'}
          </Button>

          {!isPastOrder && hasPendingItems && (
            <>
              <Button
                variant="primary"
                icon={<Check className="w-4 h-4" />}
                onClick={() => handleOrderAccept(order)}
              >
                Accept All
              </Button>
              <Button
                variant="danger"
                icon={<X className="w-4 h-4" />}
                onClick={() => handleOrderReject(order)}
              >
                Reject All
              </Button>
            </>
          )}

          {!isPastOrder && hasAcceptedItems && !hasHandedOverItems && (
            <Button
              variant="primary"
              icon={<Truck className="w-4 h-4" />}
              onClick={() => handleOrderHandover(order)}
            >
              Hand Over All
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

  // Add styles for past orders
  const styles = `
    .past-order {
      transition: all 0.3s ease;
    }
    
    .past-order:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .past-order {
      animation: fadeIn 0.5s ease-out;
    }
  `;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <style>{styles}</style>
      {/* Add notification sound */}
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />
      
      {/* Notification popup with longer display time */}
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
            animation: 'slideIn 0.3s ease-out, blinking 4s infinite', // Slower blinking
            fontSize: '16px',
            fontWeight: 'bold',
            border: '2px solid #fff',
            minWidth: '300px' // Ensure notification has minimum width
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
            animation: swing 2s infinite ease-in-out; // Slower bell swing
          }
          
          .new-order {
            animation: fadeIn 0.5s ease-out;
          }
          
          .highlight-order {
            animation: highlight 3s ease-in-out; // Longer highlight duration
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* Header with search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Orders</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Input
            placeholder="Search by Order ID, Customer or Item..."
            icon={<Search className="w-5 h-5 text-gray-400" />}
            style={{ minWidth: '250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Live Orders Section */}
      <div style={{ 
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e3f2fd'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#4caf50',
            animation: 'pulse 2s infinite'
          }} />
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600,
            color: '#1976d2',
            margin: 0
          }}>
            Live Orders
          </h2>
        </div>

        {liveOrders.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '32px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '15px'
          }}>
            No live orders at the moment
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {liveOrders.map((order, index) => renderOrderCard(order, index))}
          </div>
        )}
      </div>

      {/* Past Orders Section */}
      <div style={{ 
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #f5f5f5'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#9e9e9e'
          }} />
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600,
            color: '#666',
            margin: 0
          }}>
            Past Orders
          </h2>
        </div>

        {pastOrders.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '32px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '15px'
          }}>
            No past orders available
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {pastOrders.map((order, index) => renderOrderCard(order, index, true))}
          </div>
        )}
      </div>

      {/* Add new styles */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .live-order {
            transition: all 0.3s ease;
          }
          
          .live-order:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .past-order {
            transition: all 0.3s ease;
            opacity: 0.9;
          }
          
          .past-order:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default Orders;
