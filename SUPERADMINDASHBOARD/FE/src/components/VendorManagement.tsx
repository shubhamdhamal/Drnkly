import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X } from 'lucide-react';

interface Vendor {
  _id: string;
  businessName: string;
  license: string;  // License file path
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vendors');
      setVendors(res.data.vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  // On component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Approve or reject vendor
  const updateStatus = async (id: string, status: 'verified' | 'rejected') => {
    try {
      const res = await axios.put(`http://localhost:5000/api/vendor/${id}/status`, { status });
      if (res.status === 200) {
        fetchVendors(); // Refresh UI
      } else {
        alert('Status update failed');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Server error occurred');
    }
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Vendors</h2>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Shop Name</th>
              <th className="p-4 text-left">License</th> {/* License Column */}
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id} className="border-b">
                <td className="p-4">{vendor.businessName}</td>
                <td className="p-4">
                  {/* Add the download link for the license file */}
                  {vendor.license && (
                    <a 
                      href={`http://localhost:5000/uploads/${vendor.license}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download
                    >
                      Download License
                    </a>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      vendor.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : vendor.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {vendor.verificationStatus.charAt(0).toUpperCase() +
                      vendor.verificationStatus.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(vendor._id, 'verified')}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => updateStatus(vendor._id, 'rejected')}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => handleViewDetails(vendor)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Vendor Details</h3>
            <div className="mb-4">
              <p><strong>Shop Name:</strong> {selectedVendor.businessName}</p>
              <p><strong>License:</strong> {selectedVendor.license}</p>
              {/* Show the download link for the license file in the modal */}
              {selectedVendor.license && (
                <p>
                  <strong>Download License:</strong> 
                  <a 
                    href={`http://localhost:5000/uploads/${selectedVendor.license}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                  >
                    Download License File
                  </a>
                </p>
              )}
              <p><strong>Status:</strong> {selectedVendor.verificationStatus}</p>
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

export default VendorManagement;
