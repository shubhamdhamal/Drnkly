import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Issue {
  _id: string;
  category: string;
  description: string;
  file?: string;
  orderOrTransactionId?: string;
  priority?: string;
  contactEmail?: string;
  contactPhone?: string;
  receiveUpdates?: boolean;
  createdAt: string;
}

interface Update {
  time: string;
  status: string;
  active: boolean;
}

const IssueTracking: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [updatesData, setUpdatesData] = useState<Record<string, Update[]>>({});

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('https://vendor.peghouse.in/api/issues/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch issues');

        const data = await res.json();
        const fetchedIssues: Issue[] = data.issues;

        setIssues(fetchedIssues);

        const updates: Record<string, Update[]> = {};
        fetchedIssues.forEach((issue) => {
          updates[issue._id] = [
            {
              time: 'Now',
              status: `${issue.category} submitted by user`,
              active: true,
            },
          ];
        });
        setUpdatesData(updates);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    fetchIssues();
  }, []);

  const handleViewUpdate = () => {
    navigate('/issue-report');
  };

  const selectedIssue = issues.find((i) => i._id === selectedTicket);
  const selectedUpdates = selectedTicket ? updatesData[selectedTicket] || [] : [];

  return (
    <div className="w-full px-4 sm:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 sm:p-10 font-sans">
        <h2 className="text-3xl font-bold mb-6 text-center">Issue Tracking</h2>

        <div>
          <h3 className="text-xl font-semibold mb-3">My Issues</h3>
          <div className="border rounded-lg divide-y">
            {issues.map((issue) => (
              <button
                key={issue._id}
                onClick={() => setSelectedTicket(issue._id)}
                className={`flex justify-between items-center p-4 text-sm sm:text-base w-full text-left hover:bg-gray-50 transition ${
                  selectedTicket === issue._id ? 'bg-gray-100' : ''
                }`}
              >
                <div>
                  <p className="text-gray-600 font-medium">
                    Ticket ID <span className="font-bold text-black">{issue._id}</span>
                  </p>
                  <p className="text-black">{issue.category}</p>
                  <p className="text-gray-500">
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-gray-200 text-gray-700">
                    Pending
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedIssue && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Issue Details</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Category:</strong> {selectedIssue.category}</p>
              <p><strong>Description:</strong> {selectedIssue.description}</p>
              {selectedIssue.orderOrTransactionId && (
                <p><strong>Order/Transaction ID:</strong> {selectedIssue.orderOrTransactionId}</p>
              )}
              {selectedIssue.priority && (
                <p><strong>Priority:</strong> {selectedIssue.priority}</p>
              )}
              {selectedIssue.contactEmail && (
                <p><strong>Contact Email:</strong> {selectedIssue.contactEmail}</p>
              )}
              {selectedIssue.contactPhone && (
                <p><strong>Contact Phone:</strong> {selectedIssue.contactPhone}</p>
              )}
              <p>
                <strong>Receive Updates:</strong>{' '}
                {selectedIssue.receiveUpdates ? 'Yes' : 'No'}
              </p>
              {selectedIssue.file && (
                <p>
                  <strong>Attached File:</strong>{' '}
                  <a
                    href={`https://vendor.peghouse.in/${selectedIssue.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
                  </a>
                </p>
              )}
              <p>
                <strong>Created At:</strong>{' '}
                {new Date(selectedIssue.createdAt).toLocaleString()}
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Status Updates</h3>
            <ul className="space-y-4">
              {selectedUpdates.map((u, i) => (
                <li key={i} className="flex items-start gap-4 text-sm">
                  <div
                    className={`mt-1 w-3 h-3 rounded-full ${
                      u.active ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div>
                    <p className="text-gray-500 font-semibold">{u.time}</p>
                    <p className="text-gray-800">{u.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleViewUpdate}
          className="w-full mt-8 bg-gray-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
        >
          View/Update the Issue
        </button>
      </div>
    </div>
  );
};

export default IssueTracking;
