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
  const isSkippedLogin = localStorage.getItem('isSkippedLogin') === 'true';
  const location = useLocation();

  if (!isAuthenticated && !isSkippedLogin) {
    // Redirect to login if not authenticated and not skipped login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Navigate to="/welcome" replace />} />

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
