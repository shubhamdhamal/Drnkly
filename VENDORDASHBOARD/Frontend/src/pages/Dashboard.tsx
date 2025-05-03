import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, IndianRupeeIcon } from 'lucide-react';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // States for products and vendor data
  const [products, setProducts] = useState<any[]>([]);

  // Fetch the products for the logged-in vendor
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.get('https://drnkly.in/vendor/api/vendor/products', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Filter products with price greater than 100
          const filteredProducts = response.data.products.filter((product: any) => product.price > 100);
          setProducts(filteredProducts);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const stats = [
    { 
      title: 'Total Sales', 
      value: '₹45,231', 
      icon: IndianRupeeIcon, 
      changeType: 'positive',
      description: 'vs. last month' 
    },
    { 
      title: 'Active Orders', 
      value: '25', 
      icon: ShoppingBag, 
      changeType: 'positive',
      description: 'vs. last week',
      path: '/orders'
    },
    { 
      title: 'Products', 
      value: '156', 
      icon: Package,
      changeType: 'negative',
      description: 'vs. last month',
      path: '/products'
    },
    { 
      title: 'Revenue', 
      value: '₹12,234', 
      icon: TrendingUp,
      changeType: 'positive',
      description: 'vs. last month'
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="w-full sm:w-auto px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow ${stat.path ? 'cursor-pointer' : ''}`}
              onClick={() => stat.path && navigate(stat.path)}
            >
              <div className="flex items-center justify-between">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {/* Removed change text */}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <p className="text-sm text-gray-600 mt-1">Best performing products this month</p>
          </div>
          <div className="divide-y">
            {products.map((product, index) => (
              <div key={index} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{product.price} units sold</p>
                  </div>
                  <span className="font-semibold">₹{product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;