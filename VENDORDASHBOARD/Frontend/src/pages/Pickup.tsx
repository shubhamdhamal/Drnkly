import React, { useEffect, useState, useRef } from 'react';
import { Package, Truck, CheckCircle, Users } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface PickupOrder {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerAddress: string;
  totalAmount: number;
  readyTime: string;
  handoverStatus: 'pending' | 'handedOver';
  acceptedAt?: string;
  groupId?: string;
}

interface GroupedOrder {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  items: PickupOrder[];
  totalAmount: number;
  readyTime: string;
  handoverStatus: 'pending' | 'handedOver';
  acceptedAt?: string;
}

const Pickup: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const groupOrdersByCustomer = (orders: PickupOrder[]): GroupedOrder[] => {
    const grouped = orders.reduce((acc: { [key: string]: GroupedOrder }, order) => {
      const key = order.orderNumber;
      
      if (!acc[key]) {
        acc[key] = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerAddress: order.customerAddress,
          items: [],
          totalAmount: 0,
          readyTime: order.readyTime,
          handoverStatus: 'pending',
          acceptedAt: order.acceptedAt
        };
      }
      
      acc[key].items.push(order);
      acc[key].totalAmount += order.price * order.quantity;
      
      if (order.handoverStatus === 'handedOver') {
        acc[key].handoverStatus = 'handedOver';
      }
      
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:5000/ws/pickup');
    
    wsRef.current.onmessage = (event) => {
      const updatedOrder = JSON.parse(event.data);
      handleOrderUpdate(updatedOrder);
    };

    fetchPickupOrders();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleOrderUpdate = (updatedOrder: PickupOrder) => {
    setOrders(prev => {
      const updatedOrders = [...prev];
      const existingOrderIndex = updatedOrders.findIndex(o => 
        o.orderNumber === updatedOrder.orderNumber && 
        o.productId === updatedOrder.productId
      );
      
      if (existingOrderIndex === -1) {
        updatedOrders.unshift(updatedOrder);
      } else {
        updatedOrders[existingOrderIndex] = updatedOrder;
      }
      
      setGroupedOrders(groupOrdersByCustomer(updatedOrders));
      
      return updatedOrders;
    });
  };

  const fetchPickupOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/vendor/ready-for-pickup', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const filteredOrders = res.data.orders.filter((order: PickupOrder) => 
        order.handoverStatus !== 'handedOver'
      );
      
      const sortedOrders = filteredOrders.sort((a: PickupOrder, b: PickupOrder) => {
        const timeA = a.acceptedAt ? new Date(a.acceptedAt).getTime() : new Date(a.readyTime).getTime();
        const timeB = b.acceptedAt ? new Date(b.acceptedAt).getTime() : new Date(b.readyTime).getTime();
        return timeB - timeA;
      });
      
      setOrders(sortedOrders);
      setGroupedOrders(groupOrdersByCustomer(sortedOrders));
    } catch (err) {
      console.error('Failed to fetch pickup orders', err);
      toast.error('Failed to load pickup orders');
    }
  };

  const handleGroupHandover = async (groupedOrder: GroupedOrder) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const handoverPromises = groupedOrder.items.map(item => 
        axios.put(
          `http://localhost:5000/api/vendor/orders/handover`,
          { 
            productId: item.productId, 
            orderNumber: item.orderNumber 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(handoverPromises);
      
      setOrders(prev => prev.filter(order => 
        !groupedOrder.items.some(item => 
          item.orderNumber === order.orderNumber && 
          item.productId === order.productId
        )
      ));
      
      setGroupedOrders(prev => prev.filter(group => 
        group.orderNumber !== groupedOrder.orderNumber
      ));
      
      toast.success('Order group handed over to delivery successfully!');
        
    } catch (err) {
      console.error('Error handing over order group', err);
      toast.error('Failed to hand over the order group');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }}>Ready for Pickup</h1>

      {groupedOrders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '24px' }}>No orders ready for pickup</p>
      ) : (
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 0 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {groupedOrders.map((group, idx) => (
              <div key={group.orderNumber} style={{ 
                padding: '20px',
                background: group.handoverStatus === 'handedOver' ? '#e8f5e9' : '#f5f5f5',
                borderRadius: '12px',
                border: group.handoverStatus === 'handedOver' ? '1px solid #4caf50' : '1px solid #e0e0e0',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '18px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#1976d2'
                      }}>
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Order #{idx + 1} - {group.orderNumber}</span>
                        {group.handoverStatus === 'handedOver' && (
                          <span style={{ 
                            background: '#4caf50',
                            color: 'white',
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            HANDED OVER
                          </span>
                        )}
                      </div>
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px 0' }}>
                      Customer: {group.customerName}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      <strong>Total Amount:</strong> ₹{group.totalAmount.toFixed(2)}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      <strong>Ready by:</strong> {new Date(group.readyTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>

                <div style={{ 
                  marginTop: '16px',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  overflow: 'hidden'
                }}>
                  {group.items.map((item, itemIdx) => (
                    <div key={item.productId} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: itemIdx % 2 === 0 ? '#f8f9fa' : '#fff',
                      borderBottom: itemIdx < group.items.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 500 }}>{item.quantity}x {item.name}</span>
                        <span style={{ color: '#666' }}>₹{item.price}</span>
                      </div>
                      <span style={{ 
                        color: item.handoverStatus === 'handedOver' ? '#4caf50' : '#666',
                        fontSize: '14px'
                      }}>
                        {item.handoverStatus === 'handedOver' ? 'Handed Over' : 'Pending'}
                      </span>
                    </div>
                  ))}
              </div>

                {group.handoverStatus !== 'handedOver' && (
                  <div style={{ marginTop: '16px' }}>
                <Button
                      icon={<Truck className="w-4 h-4" />}
                  className="w-full"
                      onClick={() => handleGroupHandover(group)}
                >
                      Hand Over All Items to Delivery
                </Button>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes highlight {
            0%, 100% { background-color: #fff; }
            50% { background-color: #e3f2fd; }
          }
        `}
      </style>
    </div>
  );
};

export default Pickup;