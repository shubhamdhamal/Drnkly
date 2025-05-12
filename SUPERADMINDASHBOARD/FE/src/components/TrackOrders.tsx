import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  items: string[];
  status: 'pending' | 'paid';
  total: number;
}

function TrackOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://admin.peghouse.in/api/orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="text-green-500" />;
      default:
        return <Truck className="text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Track Orders</h2>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="border-b">
                <td className="p-4">#{index + 1}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </div>
                </td>
                <td className="p-4">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="mb-4">
              <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong></p>
              <ul className="list-disc ml-6">
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrders;
