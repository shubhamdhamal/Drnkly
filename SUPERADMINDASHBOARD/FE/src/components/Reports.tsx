import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  fileUrl: string;
}

function Reports() {
  const allReports: Report[] = [
    {
      id: '1',
      name: 'Monthly Sales Report',
      type: 'Sales',
      date: '2024-03-15',
      size: '2.5 MB',
      fileUrl: '/pdfs/monthly-sales-report.pdf',
    },
    {
      id: '2',
      name: 'Vendor Performance',
      type: 'Vendor',
      date: '2024-03-14',
      size: '1.8 MB',
      fileUrl: '/pdfs/vendor-performance.pdf',
    },
    {
      id: '3',
      name: 'Customer Analytics',
      type: 'Analytics',
      date: '2024-03-13',
      size: '3.2 MB',
      fileUrl: '/pdfs/customer-analytics.pdf',
    },
  ];

  const [selectedType, setSelectedType] = useState('All');
  const [showFilter, setShowFilter] = useState(false);

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const handleFilterChange = (value: string) => {
    setSelectedType(value);
    setShowFilter(false); // auto-close filter box
  };

  const filteredReports =
    selectedType === 'All'
      ? allReports
      : allReports.filter((r) => r.type === selectedType);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <Filter size={20} className="mr-2" />
            Filter Reports
          </button>

          {showFilter && (
            <select
              className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-md px-3 py-2 text-sm"
              value={selectedType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Sales">Sales</option>
              <option value="Vendor">Vendor</option>
              <option value="Analytics">Analytics</option>
            </select>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileText className="text-blue-500 mr-3" size={24} />
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.type}</p>
                  </div>
                </div>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() =>
                    handleDownload(report.fileUrl, `${report.name}.pdf`)
                  }
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Generated: {report.date}</span>
                <span>{report.size}</span>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No reports found for "{selectedType}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
