import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Availability from './pages/Availability';
import Orders from './pages/Orders';
import Pickup from './pages/Pickup';
import Payouts from './pages/Payouts';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import DeliveryPartners from './pages/DeliveryPartners';

// ✅ New imports
import IssueReport from './pages/IssueReport';
import IssueTracking from './pages/IssueTracking';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    // Always redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  // Session timeout logic (30 minutes)
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }, SESSION_TIMEOUT);
    };

    // List of events to listen for
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <Layout><Products /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/availability" element={
          <ProtectedRoute>
            <Layout><Availability /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout><Orders /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/pickup" element={
          <ProtectedRoute>
            <Layout><Pickup /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/payouts" element={
          <ProtectedRoute>
            <Layout><Payouts /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        } />
        <Route path="/delivery-partners" element={
          <ProtectedRoute>
            <Layout><DeliveryPartners /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />

        {/* ✅ New Pages */}
        <Route path="/issue-report" element={
          <ProtectedRoute>
            <Layout><IssueReport /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/issue-tracking" element={
          <ProtectedRoute>
            <Layout><IssueTracking /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
