import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';

const Availability: React.FC = () => {
  const timeSlots = [
    { id: '1', start: '09:00', end: '11:00' },
    { id: '2', start: '11:00', end: '13:00' },
    { id: '3', start: '14:00', end: '16:00' },
    { id: '4', start: '16:00', end: '18:00' },
  ];

  const [products, setProducts] = useState<any[]>([]);

  // Fetch products for the logged-in vendor from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Get the auth token from localStorage
        if (token) {
          const response = await axios.get('https://vendor.drnkly.com/api/vendor/products', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProducts(response.data.products); // Set the fetched products
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array to fetch products on mount

  const handleToggle = (productId: string, currentStockStatus: boolean) => {
    const updatedStockStatus = !currentStockStatus;
  
    // Update the product state with the new stock status
    const updatedProducts = products.map((product) =>
      product._id === productId
        ? { ...product, inStock: updatedStockStatus }
        : product
    );
    setProducts(updatedProducts);
  };
  
  const handleSaveAvailability = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Get the auth token from localStorage
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const updatedProducts = products.map((product) => ({
        productId: product._id,  // Ensure the product _id is included
        inStock: product.com.inStock,
      }));
  
      // Send updated inStock status for each product to the backend
      const response = await axios.put('https://vendor.drnkly.com/api/products/update-stock', { products: updatedProducts }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('Stock status updated successfully', response);
    } catch (error) {
      console.error('Error saving availability settings:', error);
    }
  };
  
  
  
  


  return (
    <div className="availability-wrapper">
      <h1 className="title">Set Availability</h1>

      <div className="section">
        <h2 className="section-title">Delivery Time Slots</h2>
        <div className="slot-grid">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="slot-card">
              <div className="slot-info">
                <Clock size={18} />
                <span>{slot.start} - {slot.end}</span>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Product Availability</h2>
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div>
                <div className="product-name">{product.name}</div>
                <div className="product-category">{product.category}</div>
              </div>
              <div className="product-actions">
                <span className={`stock-label ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={product.inStock}
                    onChange={() => handleToggle(product._id, product.inStock)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="save-button" onClick={handleSaveAvailability}>
        Save Availability Settings
      </Button>

      <style>{`
        .availability-wrapper {
          padding: 20px;
          font-family: sans-serif;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
        }

        .section-title {
          font-size: 18px;
          margin-bottom: 15px;
        }

        .slot-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .slot-card {
          flex: 1 1 200px;
          border: 1px solid #ddd;
          padding: 12px 16px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slot-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9f9f9;
          padding: 14px 18px;
          border-radius: 6px;
        }

        .product-name {
          font-weight: 600;
        }

        .product-category {
          font-size: 13px;
          color: #777;
        }

        .product-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stock-label {
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 20px;
        }

        .in-stock {
          background: #d1fae5;
          color: #065f46;
        }

        .out-stock {
          background: #fee2e2;
          color: #991b1b;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .switch input:checked + .slider {
          background-color: #4ade80;
        }

        .switch input:checked + .slider:before {
          transform: translateX(20px);
        }

        .save-button {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Availability;
