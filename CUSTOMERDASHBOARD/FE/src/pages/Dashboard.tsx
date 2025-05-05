import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, User, Settings, LogOut, Wine, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const categories = [
  {
    name: 'Drinks',
    image: 'https://plus.unsplash.com/premium_photo-1671244417901-6d0f50085167?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Snacks',
    image: 'https://plus.unsplash.com/premium_photo-1695558759748-5cad76d7d48e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Soft Drinks',
    image: 'https://images.unsplash.com/photo-1452725210141-07dda20225ec?q=80&w=2152&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Ciggarettes',
    image: 'https://images.unsplash.com/photo-1702306455611-e3360e6ffeee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Glasses & Plates',
    image: 'https://images.unsplash.com/photo-1516600164266-f3b8166ae679?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  }
];

const stores = [
  { id: 1, name: "PK Wines", rating: 4.8, image: "https://images.unsplash.com/photo-1597290282695-edc43d0e7129?w=600&h=400&fit=crop", address: "123 Main St", distance: "0.8 miles", openTime: "10:00 AM - 10:00 PM" },
  { id: 2, name: "Sunrise Family Garden Restaurant", rating: 4.5, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", address: "456 Oak Ave", distance: "1.2 miles", openTime: "11:00 AM - 9:00 PM" }
];

function Dashboard() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(''); // <-- ADD THIS
  const [searchQuery, setSearchQuery] = useState(''); // Store the search query



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear(); // ✅ Clear all data including token and user
    localStorage.removeItem("locationGranted");
    setIsLoggedIn(false);
    navigate('/login');
  };
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('authToken'); // ✅ correct token key
        const userId = localStorage.getItem('userId');
  
        if (token && userId) {
          setIsLoggedIn(true);
  
          const response = await axios.get(`https://drnkly.in/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ SEND token properly
            },
          });
  
          const user = response.data;
          setUserName(user.name);
        }
      } catch (error) {
        console.error('Failed to fetch user info for sidebar', error);
      }
    };
  
    fetchUserName();
  }, []);
  
  

  useEffect(() => {
    const interval = setInterval(() => {
      setSparklePosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update the search query
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`); // Redirect with search query
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>

        <img
         src="/logo2.png"
          alt="Drnkly Logo"
          className="h-32 w-48 object-contain"

        />


            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#cd6839] font-medium hover:underline"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-[#cd6839] text-white px-4 py-2 rounded-full hover:bg-[#b55a31] transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/cart')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>



           {/* Search Bar */}
           <form onSubmit={handleSearchSubmit}>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for drinks..."
                value={searchQuery}
                onChange={handleSearchChange} // Update search query on change
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          onClick={() => navigate('/products')}
          className="relative mb-8 rounded-2xl overflow-hidden shadow-md cursor-pointer group"
        >
          <img
            src="https://report.livingliquidz.com/Content/wp-content/uploads/HomeBanner/Glenwalkbannerwebsite20242121177.jpg"
            alt="The Glenwalk Banner"
            className="w-full h-auto object-cover transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105"
          />
        </div>

        <div className="drink-warning text-center text-[#cd6839] font-bold text-lg md:text-xl hidden md:block mb-8">
          Drink Responsibly – Alcohol consumption is injurious to health 🍷
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.name} onClick={() => navigate('/products')} className="relative overflow-hidden rounded-xl cursor-pointer transform hover:scale-105 transition-transform">
                <img src={category.image} alt={category.name} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-medium">{category.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Nearby Stores</h2>
          <div className="grid gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
                <div className="sm:flex">
                  <div className="sm:w-48 h-48 sm:h-auto">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{store.name}</h3>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1">{store.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{store.address}</p>
                      <p className="text-gray-600">{store.openTime}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{store.distance}</span>
                      <button className="bg-[#cd6839] text-white px-4 py-2 rounded-lg hover:bg-[#b55a31] transition-colors">
                        View Store
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMenu}>
          <div className="absolute top-0 left-0 w-80 h-full bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button onClick={toggleMenu}>
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={24} className="text-gray-600" />
              </div>
              <div className="ml-4">
              <h3 className="font-medium">{userName || 'Guest User'}</h3>
                <p className="text-sm text-gray-600">View Profile</p>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={() => navigate('/profile')} className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <User size={20} className="mr-3" /> My Profile
              </button>
              <button onClick={() => navigate('/order-history')} className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings size={20} className="mr-3" /> Order History
              </button>
              <button onClick={() => navigate('/issue-report')} className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Sparkles size={20} className="mr-3 text-yellow-500" /> Report Issue
              </button>
              <button onClick={() => navigate('/issue-tracking')} className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Sparkles size={20} className="mr-3 text-blue-500" /> Track Issue
              </button>
              <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={20} className="mr-3" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
