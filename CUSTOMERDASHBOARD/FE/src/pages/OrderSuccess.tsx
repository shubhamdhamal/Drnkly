import React from 'react';
import { useNavigate } from 'react-router-dom';

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h1 style={{ fontSize: '28px', margin: '20px 0' }}>Your order has been placed successfully</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
  
      </div>

      <button 
        className="button button-primary"
        onClick={() => navigate('/order-history')}
        style={{ margin: '10px 0' }}
      >
        Track Order
      </button>

      <button 
        className="button button-secondary"
        onClick={() => navigate('/products')}
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default OrderSuccess;