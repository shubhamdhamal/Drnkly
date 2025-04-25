import React, { useState } from 'react';

const categories = [
  'Order Issues',
  'Payment Issues',
  'Delivery Issues',
  'Product Quality Issues',
  'Technical Issues',
  'Other',
];

const IssueReport: React.FC = () => {
  const [category, setCategory] = useState('Order Issues');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updates, setUpdates] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    if (file) formData.append('file', file);
    formData.append('orderOrTransactionId', transactionId);
    formData.append('priority', priority);
    formData.append('contactEmail', email);
    formData.append('contactPhone', phone);
    formData.append('receiveUpdates', updates.toString());
  
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Login required to report an issue.');
        return;
      }
  
      const response = await fetch('http://localhost:5000/api/issues/report', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Include token for authentication
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Issue submitted successfully!');
        setCategory('Order Issues');
        setDescription('');
        setTransactionId('');
        setPriority('Medium');
        setEmail('');
        setPhone('');
        setFile(null);
        setUpdates(false);
      } else {
        alert(data.error || 'Failed to submit issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Something went wrong. Please try again.');
    }
  };
  

  return (
    <div className="w-full px-4 sm:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Report an Issue</h1>
        <p className="text-gray-500 mb-6 text-sm">Please select the category of your issue and provide the details.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold text-gray-700 block mb-2">Issue Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-2">Issue Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-blue-500"
              placeholder="Describe your issue here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="file-upload" className="inline-block cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200">
              📎 Upload File
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <input
            type="text"
            placeholder="Order ID or Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
          />

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Priority Level</label>
            <div className="flex gap-6 text-sm">
              {['Low', 'Medium', 'High'].map((level) => (
                <label key={level} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="priority"
                    value={level}
                    checked={priority === level}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Contact Details <span className="text-gray-400 text-sm">(Optional)</span></label>
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={updates}
              onChange={() => setUpdates(!updates)}
              className="accent-blue-600"
            />
            <label className="text-gray-700">Receive updates about this issue</label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all text-sm"
          >
            Submit Issue
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueReport;