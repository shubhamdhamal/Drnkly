import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AgeVerification from './pages/AgeVerification';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import IssueReport from './pages/IssueReport';     // ✅ Already Added
import IssueTracking from './pages/IssueTracking'; // ✅ NEW
import Blog from './pages/Blog'; // ✅ Added Blog import
import Navigation from './components/Navigation';
import SessionExpiryPopup from './components/SessionExpiryPopup';
import { CartProvider } from './context/CartContext';
// import ChatBox from './pages/Chatbox'; // Add the ChatBox import
import { sessionManager } from './utils/sessionManager';
import { useScrollToTop } from './utils/scrollToTop';
import './styles/global.css';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isSessionValid = sessionManager.isSessionValid();
      const isSkipped = localStorage.getItem('isSkippedLogin') === 'true';
      if (!isSessionValid && !isSkipped) {
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Component to handle scroll restoration
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false); // State to control chat visibility

  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-gray-50">
          <SessionExpiryPopup />
          <main className="flex-1 pb-20"> {/* Space for bottom nav */}
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-age" element={<AgeVerification />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/order-success" element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } />
              <Route path="/order-history" element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } />
              <Route path="/order-tracking/:orderNumber" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/issue-report" element={
                <ProtectedRoute>
                  <IssueReport />
                </ProtectedRoute>
              } />
              <Route path="/issue-tracking" element={
                <ProtectedRoute>
                  <IssueTracking />
                </ProtectedRoute>
              } /> {/* ✅ NEW */}
              <Route path="/blog" element={<Blog />} /> {/* ✅ Added Blog route */}
            </Routes>
          </main>
          {/* Pass the isChatOpen and setIsChatOpen to Navigation component */}
          <Navigation isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
