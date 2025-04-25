import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/availability" element={<Layout><Availability /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/pickup" element={<Layout><Pickup /></Layout>} />
        <Route path="/payouts" element={<Layout><Payouts /></Layout>} />
        <Route path="/map" element={<MapView />} />
        <Route path="/delivery-partners" element={<DeliveryPartners />} />
        <Route path="/profile" element={<Profile />} />

        {/* ✅ New Pages */}
        <Route path="/issue-report" element={<Layout><IssueReport /></Layout>} />
        <Route path="/issue-tracking" element={<Layout><IssueTracking /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
