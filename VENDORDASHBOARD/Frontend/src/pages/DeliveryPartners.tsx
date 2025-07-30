import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const DeliveryPartners: React.FC = () => {
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_BASE_URL}/api/del/delivery-partners`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  setDeliveryPartners(response.data.deliveryPartners);
      } catch (error) {
        console.error('Error fetching delivery partners:', error);
      }
    };

    fetchDeliveryPartners();
  }, []);

  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="delivery-partner-list">
        <div className="header-container">
          <h2 className="form-title">Delivery Partners</h2>
        </div>

        <div className="partner-list-container">
          {deliveryPartners.map((partner, index) => (
            <div key={index} className="partner-card">
              <div className="partner-info">
                <h3>{partner.name}</h3>
                <Button onClick={() => handleViewDetails(partner)} className="view-button">
                  View
                </Button>
              </div>
              <p>Email: {partner.email}</p>
              <p>Phone: {partner.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPartner && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{selectedPartner.name}'s Details</h3>
            <p><strong>Email:</strong> {selectedPartner.email}</p>
            <p><strong>Phone:</strong> {selectedPartner.phone}</p>
            <p><strong>Username:</strong> {selectedPartner.username}</p>
            <p><strong>Area:</strong> {selectedPartner.area}</p>
            <p><strong>Aadhar Card:</strong> {selectedPartner.aadharCard || 'Not Provided'}</p>
            <p><strong>Driving License:</strong> {selectedPartner.drivingLicense || 'Not Provided'}</p>
            <Button onClick={() => setShowModal(false)} className="close-button">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .delivery-partner-list {
          padding: 24px;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 0;
        }

        .partner-list-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .partner-card {
          padding: 20px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .partner-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .partner-info h3 {
          font-size: 18px;
          margin: 0;
        }

        .view-button {
          background-color: #007BFF;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
          font-size: 14px;
        }

        .view-button:hover {
          background-color: #0056b3;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-box {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
        }

        .close-button {
          padding: 8px 16px;
          font-size: 14px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 20px;
        }

        .close-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </Layout>
  );
};

export default DeliveryPartners;
