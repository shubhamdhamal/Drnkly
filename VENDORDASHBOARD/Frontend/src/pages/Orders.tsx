import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Search } from 'lucide-react';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          transactionId: order.transactionId || '',   // Add this line to fetch transactionId
          paymentProof: order.paymentProof || '',
          createdAt: order.createdAt,
        }));

        setOrders(fetchedOrders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
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

  const filteredOrders = orders.filter((order) => {
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

  if (loading) return <p style={{ textAlign: 'center' }}>Loading orders...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
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

      {filteredOrders.map((order, index) => (
        <div
          key={order.id}
          style={{
            background: '#fff',
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
