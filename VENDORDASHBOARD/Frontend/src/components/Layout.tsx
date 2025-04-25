import React from 'react';
import {
  Menu,
  Store,
  Package,
  Clock,
  ShoppingBag,
  Truck,
  Wallet,
  User,
  AlertCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { icon: Store, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Clock, label: 'Availability', path: '/availability' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Truck, label: 'Ready for Pickup', path: '/pickup' },
    { icon: Wallet, label: 'Payouts', path: '/payouts' },
    { icon: User, label: 'Delivery Partner', path: '/delivery-partners' },

    // ✅ Added new items below
    { icon: AlertCircle, label: 'Report Issue', path: '/issue-report' },
    { icon: AlertCircle, label: 'Track Issue', path: '/issue-tracking' }
  ];

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="menu-button"
          aria-label="Toggle menu"
        >
          <Menu />
        </button>
        <div className="header-logo">
          <div className="logo-icon">
            <Store />
          </div>
          <h1>Liquor Shop</h1>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-container">
            <div className="logo-badge">
              <Store />
            </div>
            <div className="logo-text">
              <h1>Liquor Shop</h1>
              <p>Vendor Portal</p>
            </div>
          </div>
        </div>

        <nav className="nav-container">
          <div className="nav-items">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {isActive && <div className="active-indicator" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Content Area */}
      <div className="content-area">
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;
