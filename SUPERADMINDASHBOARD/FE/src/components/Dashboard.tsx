import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Store, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DashboardStats {
  totalVendors: number;
  pendingApprovals: number;
  activeOrders: number;
  verifiedVendors: number;
}

interface VendorApplication {
  id: string;
  businessName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  documentsCount: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    pendingApprovals: 0,
    activeOrders: 0,
    verifiedVendors: 0,
  });

  const [recentApplications, setRecentApplications] = useState<VendorApplication[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://admin.peghouse.in/api/dashboard-stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      }
    };

    const fetchVendors = async () => {
      try {
        const res = await axios.get('https://admin.peghouse.in/api/recent-vendors');
        setRecentApplications(Array.isArray(res.data.vendors) ? res.data.vendors : []);
      } catch (error) {
        console.error('Failed to load recent vendor applications', error);
        setRecentApplications([]); // fallback to avoid undefined
      }
    };
    

    fetchStats();
    fetchVendors();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manage vendors and orders</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{stats.totalVendors}</h2>
              <p className="text-gray-600">Total Vendors</p>
              <p className="text-sm text-green-600">+3 this month</p>
            </div>
            <Store className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{stats.pendingApprovals}</h2>
              <p className="text-gray-600">Pending Approvals</p>
              <p className="text-sm text-yellow-600">5 new today</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{stats.activeOrders}</h2>
              <p className="text-gray-600">Active Orders</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <Clock className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{stats.verifiedVendors}</h2>
              <p className="text-gray-600">Verified Vendors</p>
              <p className="text-sm text-blue-600">90% approval rate</p>
            </div>
            <CheckCircle className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Vendor Applications</h2>
          <button className="text-blue-600 hover:text-blue-800">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Vendor ID</th>
                <th className="text-left py-3 px-4">Business Name</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Applied Date</th>
                <th className="text-left py-3 px-4">Documents</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
  {Array.isArray(recentApplications) && recentApplications.length > 0 ? (
    recentApplications.map((app) => (
      <tr key={app.id} className="border-b">
        <td className="py-3 px-4">{app.id}</td>
        <td className="py-3 px-4">{app.businessName}</td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded-full text-sm ${
            app.status === 'Approved' ? 'bg-green-100 text-green-800' :
            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {app.status}
          </span>
        </td>
        <td className="py-3 px-4">{app.appliedDate}</td>
        <td className="py-3 px-4">{app.documentsCount} files</td>
        <td className="py-3 px-4">
          <button className="text-blue-600 hover:text-blue-800">Review</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={6} className="text-center text-gray-500 py-4">No recent applications found.</td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
