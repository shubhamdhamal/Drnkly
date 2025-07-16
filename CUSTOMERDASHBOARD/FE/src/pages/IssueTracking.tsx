import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Update {
  time: string;
  status: string;
  active: boolean;
}

interface Issue {
  _id: string;
  category: string;
  description: string;
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High';
  status?: 'Pending' | 'In Progress' | 'Resolved' | 'Closed'; // Optional for now
  updates?: Update[]; // Optional for now
}

const IssueTracking = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchIssues = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`https://peghouse.in/api/issues/user/${userId}`);
        setIssues(res.data);
        if (res.data.length > 0) {
          setSelectedIssueId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [userId]);

  const selectedIssue = issues.find((issue) => issue._id === selectedIssueId);

  const handleUpdate = (id: string) => {
    setSelectedIssueId(id);
    // You can optionally navigate to a detailed page
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 mb-24 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-center">Issue Tracking</h2>

      {loading ? (
        <p>Loading...</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-500">No issues reported yet.</p>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-2">My Issues</h3>
          <div className="border rounded-lg divide-y">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3 text-sm"
              >
                <div>
                  <p className="text-gray-600 font-medium">
                    Ticket ID <span className="font-bold text-black">{issue._id.slice(-6)}</span>
                  </p>
                  <p className="text-black">{issue.category}</p>
                  <p className="text-gray-500">{formatDate(issue.createdAt)}</p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {issue.priority === 'Low' && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                      Low Priority
                    </span>
                  )}
                  {issue.priority === 'Medium' && (
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                      Medium Priority
                    </span>
                  )}
                  {issue.priority === 'High' && (
                    <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                      High Priority
                    </span>
                  )}

                  <button
                    onClick={() => handleUpdate(issue._id)}
                    className="mt-1 px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-900 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedIssue && (
            <>
              <h3 className="text-lg font-semibold mt-6 mb-2">Issue Description</h3>
              <p className="text-sm text-gray-700 mb-4">{selectedIssue.description}</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Issue Status Updates</h3>
              <ul className="space-y-3">
                {(selectedIssue.updates || []).map((u, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div
                      className={`mt-1 w-3 h-3 rounded-full ${
                        u.active ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                    <div>
                      <p className="text-gray-500">{u.time}</p>
                      <p className="text-gray-800">{u.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default IssueTracking;
