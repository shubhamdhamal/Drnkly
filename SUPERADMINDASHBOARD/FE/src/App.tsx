import React, { useState, useEffect } from 'react';
import {
  Menu, Home, Users, AlertCircle, Truck as TruckDelivery,
  BarChart2, Settings, Bell, FileText, DollarSign
} from 'lucide-react';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VendorManagement from './components/VendorManagement';
import CustomerMonitoring from './components/CustomerMonitoring';
import IssueManagement from './components/IssueManagement';
import TrackOrders from './components/TrackOrders';
import Analytics from './components/Analytics';
import PaymentSettings from './components/PaymentSettings';
import Reports from './components/Reports';
import Payouts from './components/Payouts';

interface NavStats {
  vendors: number;
  customers: number;
  issues: number;
  orders: number;
  reports: number;
  payouts: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isSuperAdminLoggedIn') === 'true';
  });

  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('currentPage') || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New vendor registration", unread: true },
    { id: 2, message: "Order #123 delivered", unread: true },
    { id: 3, message: "Customer complaint resolved", unread: true }
  ]);

const [navStats, setNavStats] = useState<NavStats>({
  vendors: 0,
  customers: 0,
  issues: 0,
  orders: 0,
  reports: 0,
  payouts: 0
});



useEffect(() => {
  const fetchSidebarStats = async () => {
    try {
      const token = localStorage.getItem('superadminToken');

      

      const response = await fetch(`https://admin.peghouse.in/api/admin/sidebar-stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sidebar stats fetch failed:', errorText);
        return;
      }

      const data = await response.json();
      
      setNavStats({
        vendors: data.vendors,
        customers: data.customers,
        issues: data.issues,
        orders: data.orders,
        reports: data.reports,
        payouts: data.payouts
      });
    } catch (error) {
      console.error('Error fetching sidebar stats:', error);
    }
  };

  fetchSidebarStats();
}, []);



  useEffect(() => {
    const handleClickOutsideSidebar = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      if (sidebar && menuButton &&
        !sidebar.contains(event.target as Node) &&
        !menuButton.contains(event.target as Node) &&
        isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideSidebar);
    return () => document.removeEventListener('mousedown', handleClickOutsideSidebar);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutsideNotifications = (event: MouseEvent) => {
      const panel = document.getElementById('notification-panel');
      const button = document.getElementById('notification-button');
      if (panel && button &&
        !panel.contains(event.target as Node) &&
        !button.contains(event.target as Node) &&
        showNotifications) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotifications);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotifications);
  }, [showNotifications]);

  const handleLogin = () => {
    localStorage.setItem('isSuperAdminLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isSuperAdminLoggedIn');
    localStorage.removeItem('currentPage');
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setShowNotifications(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'vendors': return <VendorManagement />;
      case 'customers': return <CustomerMonitoring />;
      case 'issues': return <IssueManagement />;
      case 'orders': return <TrackOrders />;
      case 'analytics': return <Analytics />;
      case 'settings': return <PaymentSettings />;
      case 'reports': return <Reports />;
      case 'payouts': return <Payouts />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <button
            id="menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Liquor Delivery Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            id="notification-button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded relative"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>

        {showNotifications && (
          <div
            id="notification-panel"
            className="absolute right-4 top-14 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  onClick={markAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Layout Container */}
      <div className="flex pt-14 h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <div
          id="sidebar"
          className={`fixed lg:static inset-y-14 left-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64 lg:w-64`}
        >
          <nav className="h-full overflow-y-auto">
            <NavItem icon={<Home />} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => handleNavigation('dashboard')} count={null} />
            <NavItem icon={<Users />} label="Vendors" active={currentPage === 'vendors'} onClick={() => handleNavigation('vendors')} count={navStats.vendors} />
            <NavItem icon={<AlertCircle />} label="Issues" active={currentPage === 'issues'} onClick={() => handleNavigation('issues')} count={navStats.issues} />
            <NavItem icon={<TruckDelivery />} label="Orders" active={currentPage === 'orders'} onClick={() => handleNavigation('orders')} count={navStats.orders} />
            <NavItem icon={<Users />} label="Customers" active={currentPage === 'customers'} onClick={() => handleNavigation('customers')} count={navStats.customers} />
            <NavItem icon={<BarChart2 />} label="Analytics" active={currentPage === 'analytics'} onClick={() => handleNavigation('analytics')} count={null} />
            <NavItem icon={<FileText />} label="Reports" active={currentPage === 'reports'} onClick={() => handleNavigation('reports')} count={navStats.reports} />
            <NavItem icon={<DollarSign />} label="Payouts" active={currentPage === 'payouts'} onClick={() => handleNavigation('payouts')} count={navStats.payouts} />
            <NavItem icon={<Settings />} label="Settings" active={currentPage === 'settings'} onClick={() => handleNavigation('settings')} count={null} />
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 h-full">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count: number | null;
}

function NavItem({ icon, label, active, onClick, count }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-100 ${active ? 'bg-gray-100 text-blue-600' : ''}`}
    >
      <div className="flex items-center">
        <span className="mr-4">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== null && (
        <span className={`px-2 py-1 rounded-full text-xs ${active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default App;
