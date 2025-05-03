import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Customer {
  id: number;
  name: string;
  location: string;
  coordinates: [number, number];
  performance: 'Excellent' | 'Good' | 'Poor';
  status: 'Verified' | 'Pending';
  idProof: string | null;  // Path to the uploaded file (ID proof)
}

function CustomerMonitoring() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('https://admin.drnkly.in/api/customers');
        const formatted = res.data.customers.map((user: any) => ({
          id: user._id,
          name: user.name,
          location: user.address || 'Unknown',
          coordinates: [18.5204, 73.8567], // Placeholder coordinates
          performance: 'Good',
          status: user.status || 'Pending',
          idProof: user.idProof, // Add the file path here
        }));
        setCustomers(formatted);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    setShowMap(false);
  };

  const handleLocationClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowMap(true);
  };

  const handlePerformanceChange = (customerId: number, newPerformance: 'Excellent' | 'Good' | 'Poor') => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? { ...customer, performance: newPerformance }
        : customer
    ));
  };

  const handleAccept = async (customerId: string) => {
    try {
      const response = await axios.put(`https://admin.drnkly.in/api/customers/accept/${customerId}`);
      alert(response.data.message); // Show success message
      setCustomers(customers.map((customer) =>
        customer.id === customerId ? { ...customer, status: 'Verified' } : customer
      ));
    } catch (error) {
      console.error('Error accepting verification:', error);
    }
  };

  const handleReject = async (customerId: string) => {
    try {
      const response = await axios.put(`https://admin.drnkly.in/api/customers/reject/${customerId}`);
      alert(response.data.message); // Show success message
      setCustomers(customers.map((customer) =>
        customer.id === customerId ? { ...customer, status: 'Rejected' } : customer
      ));
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  return (
    <div className="p-6">
      {/* -------- Original Section: Customer Monitoring -------- */}
      <h2 className="text-2xl font-bold mb-6">Customer Monitoring</h2>
      <div className="bg-white rounded-lg shadow mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Performance</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="border-b">
                <td className="p-4 flex items-center">
                  <User className="mr-2" size={20} />
                  {customer.name}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleLocationClick(customer)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <MapPin className="mr-2" size={20} />
                    {customer.location}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {['Excellent', 'Good', 'Poor'].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handlePerformanceChange(customer.id, rating as any)}
                        className={`rating-option px-2 py-1 rounded ${
                          customer.performance === rating
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleViewDetails(customer)}
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

      {/* -------- New Section: Shop Verification Table -------- */}
      <h2 className="text-2xl font-bold mb-6">Customer Verification Status</h2>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left bg-gray-50">
              <th className="p-4">Customer Name</th>
              <th className="p-4">License</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((shop) => (
              <tr key={shop.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{shop.name}</td>
                <td className="p-4">
                  {/* Add the download link for the ID Proof */}
                  {shop.idProof && (
                    <a 
                      href={`https://admin.drnkly.in${shop.idProof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download
                    >
                      Download ID Proof
                    </a>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    shop.status === 'Verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {shop.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleAccept(shop.id)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    title="Accept"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleReject(shop.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    title="Reject"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => handleViewDetails(shop)}
                    className="bg-blue-100 text-blue-700 px-4 py-1 rounded hover:bg-blue-200"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------- Modal -------- */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Customer Details</h3>
            <div className="mb-4">
              <p><strong>Name:</strong> {selectedCustomer.name}</p>
              <p><strong>Location:</strong> {selectedCustomer.location}</p>
              <p><strong>Performance:</strong> {selectedCustomer.performance}</p>
              <p><strong>Status:</strong> {selectedCustomer.status}</p>
              {/* Show the file link in the modal */}
              {selectedCustomer.idProof && (
                <p>
                  <strong>ID Proof:</strong> 
                  <a href={`https://admin.drnkly.in${selectedCustomer.idProof}`} target="_blank" rel="noopener noreferrer">
                    View ID Proof
                  </a>
                </p>
              )}
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

      {/* -------- Map -------- */}
      {showMap && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90vw] max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Location: {selectedCustomer.location}</h3>
            <MapContainer
              center={selectedCustomer.coordinates}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={selectedCustomer.coordinates}>
                <Popup>
                  {selectedCustomer.name} <br />
                  {selectedCustomer.location}
                </Popup>
              </Marker>
            </MapContainer>
            <button
              onClick={() => setShowMap(false)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
            >
              Close Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMonitoring;
