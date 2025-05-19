import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
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
import { CartProvider } from './context/CartContext';
// import ChatBox from './pages/Chatbox'; // Add the ChatBox import
import './styles/global.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false); // State to control chat visibility

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-1 pb-20"> {/* Space for bottom nav */}
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-age" element={<AgeVerification />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/issue-report" element={<IssueReport />} />
              <Route path="/issue-tracking" element={<IssueTracking />} /> {/* ✅ NEW */}
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
