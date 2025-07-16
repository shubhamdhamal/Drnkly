import React, { useState } from 'react';
import axios from 'axios';

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

    const userId = localStorage.getItem('userId');
    const vendorId = localStorage.getItem('vendorId');

    if (userId && userId !== 'undefined') formData.append('userId', userId);
    if (vendorId && vendorId !== 'undefined') formData.append('vendorId', vendorId);

    formData.append('category', category.trim());
    formData.append('description', description);
  
    if (file) formData.append('file', file);
    formData.append('orderOrTransactionId', transactionId);
    formData.append('priority', priority.trim());
    formData.append('contactEmail', email);
    formData.append('contactPhone', phone);
    formData.append('receiveUpdates', updates.toString());

    try {
      const res = await axios.post('https://peghouse.in/api/issues/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Issue submitted successfully!');
      console.log(res.data);

      // Optional: Reset form after successful submission
      setDescription('');
      setFile(null);
      setTransactionId('');
      setPriority('Medium');
      setEmail('');
      setPhone('');
      setUpdates(false);
    } catch (err: any) {
      console.error('❌ Failed to submit issue:', err);
      alert('Submission failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Report an Issue</h2>

      <label className="block font-medium mb-1">Category</label>
      <div className="flex flex-wrap gap-3 mb-3">
        {categories.map(cat => (
          <label key={cat}>
            <input
              type="radio"
              name="category"
              value={cat.trim()}
              checked={category === cat}
              onChange={(e) => setCategory(e.target.value.trim())}
            />
            {cat}
          </label>
        ))}
      </div>

      <textarea
        className="w-full border p-2 mb-3"
        rows={4}
        placeholder="Issue Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3"
      />

      <input
        className="w-full border p-2 mb-3"
        placeholder="Order ID / Transaction ID"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
      />

      <label className="block font-medium mb-1">Priority</label>
      <div className="flex gap-4 mb-3">
        {['Low', 'Medium', 'High'].map(level => (
          <label key={level}>
            <input
              type="radio"
              name="priority"
              value={level.trim()}
              checked={priority === level}
              onChange={(e) => setPriority(e.target.value.trim())}
            />
            {level}
          </label>
        ))}
      </div>

      <input
        className="w-full border p-2 mb-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3"
        type="tel"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={updates} onChange={() => setUpdates(!updates)} />
        Receive updates about this issue
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Submit Issue
      </button>
    </form>
  );
};

export default IssueReport;
