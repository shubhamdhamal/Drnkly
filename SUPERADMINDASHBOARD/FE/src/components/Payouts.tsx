import React, { useState } from 'react';
import { DollarSign, Calendar, ArrowDownRight } from 'lucide-react';

interface Payout {
  id: string;
  vendorName: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

function Payouts() {
  const [payouts] = useState<Payout[]>([
    {
      id: 'P1',
      vendorName: 'City Spirits',
      amount: 1250.0,
      status: 'Completed',
      date: '2024-03-15',
    },
    {
      id: 'P2',
      vendorName: 'Wine World',
      amount: 890.5,
      status: 'Pending',
      date: '2024-03-14',
    },
    {
      id: 'P3',
      vendorName: 'Beer Haven',
      amount: 1575.25,
      status: 'Failed',
      date: '2024-03-13',
    },
  ]);

  const [activeBreakdown, setActiveBreakdown] = useState<null | 'total' | 'pending' | 'failed'>(null);

  const handleCardClick = (type: 'total' | 'pending' | 'failed') => {
    setActiveBreakdown(prev => (prev === type ? null : type)); // Toggle same, close others
  };

  const pendingPayouts = payouts.filter(p => p.status === 'Pending');
  const failedPayouts = payouts.filter(p => p.status === 'Failed');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Vendor Payouts</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Payouts */}
        <div
          onClick={() => handleCardClick('total')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer border border-transparent hover:border-blue-200 hover:bg-blue-50 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Payouts</p>
              <h3 className="text-2xl font-bold">₹15,750.25</h3>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>

        {/* Pending Amount */}
        <div
          onClick={() => handleCardClick('pending')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer border border-transparent hover:border-blue-200 hover:bg-blue-50 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending Amount</p>
              <h3 className="text-2xl font-bold">₹2,890.50</h3>
            </div>
            <Calendar className="text-yellow-500" size={32} />
          </div>
        </div>

        {/* Failed Transactions */}
        <div
          onClick={() => handleCardClick('failed')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer border border-transparent hover:border-blue-200 hover:bg-blue-50 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Failed Transactions</p>
              <h3 className="text-2xl font-bold">{failedPayouts.length}</h3>
            </div>
            <ArrowDownRight className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Conditionally Rendered Breakdown */}
      {activeBreakdown === 'total' && (
        <BreakdownSection title="Payout Breakdown" data={payouts} />
      )}
      {activeBreakdown === 'pending' && (
        <BreakdownSection title="Pending Payouts" data={pendingPayouts} emptyMessage="No pending payouts." />
      )}
      {activeBreakdown === 'failed' && (
        <BreakdownSection title="Failed Payouts" data={failedPayouts} emptyMessage="No failed payouts." />
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Transaction ID</th>
                  <th className="text-left py-3 px-4">Vendor</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b">
                    <td className="py-3 px-4">{payout.id}</td>
                    <td className="py-3 px-4">{payout.vendorName}</td>
                    <td className="py-3 px-4">${payout.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        payout.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        payout.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{payout.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable table section
const BreakdownSection = ({
  title,
  data,
  emptyMessage = "No records found.",
}: {
  title: string;
  data: Payout[];
  emptyMessage?: string;
}) => (
  <div className="bg-white rounded-lg shadow mb-6">
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Transaction ID</th>
              <th className="text-left py-3 px-4">Vendor</th>
              <th className="text-left py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-3 px-4 text-gray-500">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((payout) => (
                <tr key={payout.id} className="border-b">
                  <td className="py-3 px-4">{payout.id}</td>
                  <td className="py-3 px-4">{payout.vendorName}</td>
                  <td className="py-3 px-4">${payout.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      payout.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      payout.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{payout.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Payouts;
