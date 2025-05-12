import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Issue {
  _id: string;
  category: string;
  description: string;
  file?: string;
  orderOrTransactionId?: string;
  priority: 'Low' | 'Medium' | 'High';
  contactEmail: string;
  contactPhone: string;
  receiveUpdates: boolean;
  createdAt: string;
  status: 'pending' | 'resolved' | 'escalated';
}

const IssueManagement: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('https://admin.peghouse.in/api/issues');
      setIssues(res.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const updateStatus = async (id: string, status: 'resolved' | 'escalated') => {
    try {
      const res = await axios.put(`https://admin.peghouse.in/api/issues/${id}/status`, { status });
      setIssues(prev => prev.map(issue => (issue._id === id ? res.data : issue)));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleResolve = (id: string) => {
    updateStatus(id, 'resolved');
  };

  const handleEscalate = (id: string) => {
    updateStatus(id, 'escalated');
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Issue Management</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-b">
                <td className="p-4">{issue.category}</td>
                <td className="p-4">{issue.description}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                    issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    issue.status === 'escalated' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolve(issue._id)}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleEscalate(issue._id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <AlertTriangle size={20} />
                    </button>
                    <button
                      onClick={() => handleViewDetails(issue)}
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

      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Issue Details</h3>
            <div className="mb-4 space-y-2">
              <p><strong>Category:</strong> {selectedIssue.category}</p>
              <p><strong>Description:</strong> {selectedIssue.description}</p>
              <p><strong>Priority:</strong> {selectedIssue.priority}</p>
              <p><strong>Status:</strong> {selectedIssue.status}</p>
              <p><strong>Email:</strong> {selectedIssue.contactEmail}</p>
              <p><strong>Phone:</strong> {selectedIssue.contactPhone}</p>
              <p><strong>Receive Updates:</strong> {selectedIssue.receiveUpdates ? 'Yes' : 'No'}</p>
              <p><strong>Created:</strong> {new Date(selectedIssue.createdAt).toLocaleString()}</p>
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
};

export default IssueManagement;
