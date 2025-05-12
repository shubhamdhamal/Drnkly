import React, { useEffect, useState } from 'react';
import { Package, Truck } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';

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
  handoverStatus: 'pending' | 'handedOver'; // ✅ Add this
}


const Pickup: React.FC = () => {
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [mapVisibleFor, setMapVisibleFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickupOrders();
  }, []);

  const fetchPickupOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('https://vendor.peghouse.in/api/vendor/ready-for-pickup', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.orders);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch pickup orders', err);
      setLoading(false);
    }
  };

  const handleHandover = async (productId: string, orderNumber: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(
        `https://vendor.peghouse.in/api/vendor/orders/handover`,
        { productId, orderNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Check if the response indicates success
      if (res.status === 200) {
        // 🔄 Update frontend state to reflect status
        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderNumber
              ? {
                  ...order,
                  handoverStatus: 'handedOver', // Update only the relevant order
                }
              : order
          )
        );
      }
    } catch (err) {
      console.error('Error handing over to delivery', err);
    }
  };
  
  
  

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }}>Ready for Pickup</h1>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3>{order.orderNumber}</h3>
                  <p>{order.customerName}</p>
                </div>
                <Package />
              </div>

              <ul style={{ marginTop: '10px', fontSize: '14px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{order.name}</span>
                  <span>x{order.quantity}</span>
                </li>
              </ul>

              <div style={{ marginTop: '12px' }}>
                <p>Total: ₹{order.totalAmount}</p>
                <p>Ready by: {new Date(order.readyTime).toLocaleTimeString()}</p>
                <Button
  icon={<Truck />}
  className="w-full"
  disabled={order.handoverStatus === 'handedOver'}
  onClick={() => handleHandover(order.productId, order.orderNumber)}
>
  {order.handoverStatus === 'handedOver' ? 'Already Handed Over' : 'Hand Over to Delivery'}
</Button>


              </div>

              {mapVisibleFor === order.orderNumber && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Delivery Route:</h4>
                  <iframe
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(order.customerAddress)}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pickup;