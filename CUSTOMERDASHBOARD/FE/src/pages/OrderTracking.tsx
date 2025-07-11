import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
  const navigate = useNavigate();

  // Hardcoded order data (Replace with dynamic data in a real app)
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '999012',
    productName: 'Kiwi Fruit',
    price: 'Rs.160',
    rating: 0, // Rating out of 5
    tracking: [
      { status: 'Order Accepted by Vendor', color: 'orange', description: 'We have received your order.' },
      { status: 'Order HandedOver', color: 'green', description: 'We have confirmed your order.' },
      { status: 'Order Accepted by Delivery Boy ', color: 'green', description: 'We are preparing your order.' },
      { status: 'Delivered', color: 'gray', description: 'Your order is ready for shipping.' },
      
    ]
  });

  // Check if the last status is Delivered
  const isDelivered = orderDetails.tracking[orderDetails.tracking.length - 1].status === 'Delivered';


  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      {/* Header */}
      <div className="bg-green-600 p-4 rounded-lg flex items-center justify-between mb-6">
        <ArrowLeft className="text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-2xl font-bold text-white">Track Order</h1>
      </div>

      {/* Order Tracking Timeline */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Track Order</h3>
        {orderDetails.tracking.map((update, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white 
                ${update.color === 'green' ? 'bg-green-500' : 
                 update.color === 'orange' ? 'bg-orange-500' : 
                 update.color === 'gray' ? 'bg-gray-300' : 
                 update.color === 'blue' ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <span className="text-xl font-semibold">{index + 1}</span>
            </div>

            {/* Vertical line */}
            {index < orderDetails.tracking.length - 1 && (
              <div className="w-2 h-12 bg-gray-300 mx-2"></div>
            )}

            <div>
              <p className="text-lg font-medium text-gray-800">{update.status}</p>
              {update.description && <p className="mt-2 text-sm text-gray-600">{update.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Estimated Delivery Time */}
      {!isDelivered && (
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">Estimated Delivery Time:</p>
          <p className="text-gray-700">Your order is expected to be delivered within 30-40 minutes. Please check the tracking timeline for updates.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
