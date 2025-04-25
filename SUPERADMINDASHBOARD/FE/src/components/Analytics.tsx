import React, { useState } from 'react';
import { BarChart, LineChart, Activity } from 'lucide-react';

const monthlyOrdersData = {
  2022: [20, 35, 40, 50, 65, 55, 30, 70, 60, 80, 75, 90],
  2023: [25, 42, 48, 39, 45, 72, 63, 77, 69, 80, 84, 100],
  2024: [65, 59, 80, 81, 56, 55, 40, 78, 82, 88, 91, 97],
};

const customerGrowthData = {
  2022: Array.from({ length: 300 }, () => Math.floor(Math.random() * 101)),
  2023: Array.from({ length: 300 }, () => Math.floor(Math.random() * 101)),
  2024: Array.from({ length: 300 }, () => Math.floor(Math.random() * 101)),
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Analytics() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeIcon, setActiveIcon] = useState(null);

  const monthlyOrders = monthlyOrdersData[selectedYear];
  const customerGrowth = customerGrowthData[selectedYear];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 📊 Monthly Orders */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg shadow-xl text-white overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Orders</h3>
            <div className="flex items-center gap-2">
              <BarChart className="text-cyan-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-700 bg-gray-800 text-white rounded px-2 py-1 text-sm"
              >
                {Object.keys(monthlyOrdersData).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end gap-4 h-72 min-w-[900px]">
            {monthlyOrders.map((value, index) => {
              const maxOrder = Math.max(...monthlyOrders);
              const height = (value / maxOrder) * 160 + 40;
              return (
                <div key={index} className="flex flex-col items-center w-12">
                  <span className="text-xs mb-1 text-gray-300">{value}</span>
                  <div className="w-full bg-gradient-to-t from-blue-900 via-blue-500 to-blue-300 rounded-t" style={{ height }}></div>
                  <span className="text-xs mt-1 text-gray-400">{months[index]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 💰 Revenue Distribution */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-xl text-white flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-4">Revenue Distribution</h3>
          <div className="relative w-60 h-60 flex items-center justify-center">
            <div className="absolute w-full h-full border-2 border-cyan-400 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute w-48 h-48 border border-cyan-300 rounded-full"></div>
            <div className="text-center z-10">
              <p className="text-sm uppercase text-cyan-400 tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold">₹1,20,000</p>
            </div>
            {[
              { key: 'enterprise', icon: '💼', angle: 270 },
              { key: 'sales', icon: '📈', angle: 30 },
              { key: 'product', icon: '🛒', angle: 150 },
            ].map(({ key, icon, angle }) => {
              const radius = 120;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              return (
                <div key={key}
                  onClick={() => setActiveIcon(activeIcon === key ? null : key)}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg transition ${
                    activeIcon === key ? 'bg-cyan-500 scale-110' : 'bg-cyan-700'
                  }`}>{icon}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-sm text-gray-300 text-center">
            {activeIcon === 'enterprise' && <p>💼 Enterprise Services — 30%</p>}
            {activeIcon === 'sales' && <p>📈 Sales Growth — 40%</p>}
            {activeIcon === 'product' && <p>🛒 Product Revenue — 30%</p>}
          </div>
          <div className="mt-2 text-xs text-gray-400">100%</div>
        </div>

        {/* 👥 Customer Growth (300 Customers) */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Customer Growth (300 Customers)</h3>
            <div className="flex gap-2">
              <LineChart className="text-green-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
              >
                {Object.keys(customerGrowthData).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-72 overflow-x-auto">
            <div className="flex items-end gap-2 min-w-[1500px]">
              {customerGrowth.map((value, index) => {
                const height = (value / 100) * 200 + 20;
                const isLast = index === customerGrowth.length - 1;
                return (
                  <div key={index} className="flex flex-col items-center text-white relative">
                    <div className="w-4 bg-gradient-to-t from-blue-900 via-green-500 to-green-300 rounded-t shadow-md" style={{ height }}></div>
                    <span className="text-[10px] mt-1">C{index + 1}</span>
                    {isLast && <div className="absolute -top-6 animate-walk text-xl">🧍</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[400px] h-[120px] bg-cyan-400 opacity-10 rounded-full blur-3xl z-0"></div>
        </div>

        {/* 💡 Lightbulb Issue Resolution */}
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Issue Resolution Process</h3>

          <div className="flex justify-center gap-10 overflow-x-auto">
            {[
              { title: "Make Decision", icon: "💡", active: true },
              { title: "Generate Idea", icon: "💭" },
              { title: "Define", icon: "📝" },
              { title: "Recognize", icon: "🔍" },
              { title: "Evaluate", icon: "📊" },
              { title: "Implement", icon: "🚀" },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="h-16 w-1 bg-gray-400"></div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md ${
                  step.active ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.icon}
                </div>
                <p className={`text-sm font-semibold mt-2 ${step.active ? 'text-lime-600' : 'text-gray-700'}`}>{step.title}</p>
                <p className="text-xs text-gray-500 text-center w-24">Lorem ipsum dolor sit amet.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
