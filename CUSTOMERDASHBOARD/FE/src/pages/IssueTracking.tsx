import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const issues = [
  {
    id: 4352,
    subject: 'Login Problem',
    date: 'Apr 23, 2024',
    status: 'Pending',
    priority: '',
    updates: [
      { time: '10:32 AM', status: 'Waiting for user response', active: true },
      { time: '09:15 AM', status: 'Support is reviewing your case', active: false },
      { time: 'Yesterday', status: 'Issue submitted', active: false },
    ],
  },
  {
    id: 5098,
    subject: 'Billing Issue',
    date: 'Apr 22, 2024',
    status: 'In Progress',
    priority: 'In Progress',
    updates: [
      { time: '12:00 PM', status: 'Issue escalated to billing team', active: true },
      { time: '10:00 AM', status: 'Billing query acknowledged', active: false },
    ],
  },
  {
    id: 3721,
    subject: 'Account Support',
    date: 'Apr 20, 2024',
    status: 'Resolved',
    priority: 'Medium',
    updates: [
      { time: '2:15 PM', status: 'Issue resolved', active: true },
      { time: '11:00 AM', status: 'Account verified', active: false },
    ],
  },
  {
    id: 3220,
    subject: 'Bug Report',
    date: 'Apr 18, 2024',
    status: 'Closed',
    priority: 'High',
    updates: [
      { time: '1:45 PM', status: 'Bug marked as fixed', active: true },
      { time: 'Yesterday', status: 'Reported to dev team', active: false },
    ],
  },
];

const IssueTracking = () => {
  const navigate = useNavigate();
  const [selectedIssueId, setSelectedIssueId] = useState(issues[0].id); // default to first issue

  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId);

  const handleUpdate = (ticketId: number) => {
    setSelectedIssueId(ticketId);
    // Optionally: navigate(`/issue/${ticketId}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 mb-24 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-center">Issue Tracking</h2>

      <h3 className="text-lg font-semibold mb-2">My Issues</h3>
      <div className="border rounded-lg divide-y">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3 text-sm"
          >
            <div>
              <p className="text-gray-600 font-medium">
                Ticket ID <span className="font-bold text-black">{issue.id}</span>
              </p>
              <p className="text-black">{issue.subject}</p>
              <p className="text-gray-500">{issue.date}</p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              {issue.status === 'Pending' && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                  Pending
                </span>
              )}
              {issue.status === 'In Progress' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                  In Progress
                </span>
              )}
              {issue.status === 'Resolved' && (
                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                  Medium
                </span>
              )}
              {issue.status === 'Closed' && (
                <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                  High
                </span>
              )}

              <button
                onClick={() => handleUpdate(issue.id)}
                className="mt-1 px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-900 transition"
              >
                View/Update
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Issue Status Updates</h3>
      <ul className="space-y-3">
        {selectedIssue?.updates.map((u, i) => (
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
    </div>
  );
};

export default IssueTracking;
