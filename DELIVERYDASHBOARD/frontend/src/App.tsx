import React, { useEffect, useState } from 'react';
import { Package, Home, User, Bell, X, Star, IndianRupee } from 'lucide-react';
import Modal from 'react-modal';
import './index.css';

Modal.setAppElement('#root');

interface DeliveryBoy {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  aadharCard: File | null;
  drivingLicense: File | null;
  area: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  amount: number;
  status: 'pending' | 'accepted' | 'delivering' | 'completed';
  date: string;
  otp?: string;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface Rating {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  feedback: string;
  date: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    area: ''
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'New order available in your area',
      time: '5 mins ago',
      read: false
    },
    {
      id: '2',
      message: 'Your last delivery was rated 5 stars!',
      time: '1 hour ago',
      read: false
    }
  ]);

  const [ratings, setRatings] = useState<Rating[]>([{
    id: '1',
    customerId: 'CUST1',
    customerName: 'Rahul Sharma',
    rating: 5,
    feedback: 'Very professional and punctual delivery!',
    date: '2024-03-15'
  }]);

  const [orders, setOrders] = useState<Order[]>([]);

  const areas = [
    'Hinjewadi Phase 1',
    'Hinjewadi Phase 2',
    'Hinjewadi Phase 3',
    'Wakad',
    'Pimpri-Chinchwad',
    'Aundh',
    'Baner',
    'Ravet'
  ];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setUserProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          area: data.area || ''
        });
      } else {
        showToast(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Error fetching profile');
    }
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
  
        const res = await fetch('http://localhost:5000/api/orders/handedOver', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const data = await res.json();
        console.log("Fetched Orders: ", data);  // Debugging line
        if (res.ok) {
          setOrders(data);  // Save the fetched orders into the state
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
  
    fetchOrders(); // Call the fetch function when the component mounts
  }, []);


  const handleOtpSubmit = () => {
    const order = orders.find(o => o.id === currentOrderId);
    if (order && order.otp === otp) {
      setOrders(orders.map(o => {
        if (o.id === currentOrderId) {
          return { ...o, status: 'completed' };
        }
        return o;
      }));
      setShowOtpModal(false);
      setOtp('');
      showToast('Order delivered successfully!');
    } else {
      showToast('Invalid OTP. Please try again.');
    }
  };
// Handle order actions (accept, decline, deliver)
const handleItemAction = async (orderId: string, itemId: string, action: 'accept' | 'decline' | 'deliver' | 'reject') => {
  if (action === 'accept') {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${itemId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === itemId) {
                  return {
                    ...item,
                    deliveryBoyStatus: 'accepted',
                  };
                }
                return item;
              }),
            };
          }
          return order;
        }));
        showToast('Item accepted successfully!');
      } else {
        showToast(data.message || 'Failed to accept the item');
      }
    } catch (error) {
      console.error('Error accepting item:', error);
      showToast('Error accepting item');
    }
  } else if (action === 'decline') {
    setOrders(orders.filter(order => order._id !== orderId)); 
    showToast('Item rejected');
  } else if (action === 'reject') {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${itemId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === itemId) {
                  return {
                    ...item,
                    deliveryBoyStatus: 'rejected',
                  };
                }
                return item;
              }),
            };
          }
          return order;
        }));
        showToast('Item rejected successfully!');
      } else {
        showToast(data.message || 'Failed to reject the item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      showToast('Error rejecting item');
    }
  } else if (action === 'deliver') {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${itemId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === itemId) {
                  return {
                    ...item,
                    deliveryStatus: 'delivered',
                  };
                }
                return item;
              }),
            };
          }
          return order;
        }));
        showToast('Item delivered successfully!');
      } else {
        showToast(data.message || 'Failed to mark as delivered');
      }
    } catch (error) {
      console.error('Error marking item as delivered:', error);
      showToast('Error marking item as delivered');
    }
  }
};


  
  
  
  
  
  
  
  
  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          showToast('Logged in successfully!');
          setIsLoggedIn(true);
          fetchUserProfile();
        } else {
          showToast(data.message || 'Login failed.');
        }
      } catch (error) {
        console.error('Login Error:', error);
        showToast('Server error occurred during login.');
      }
    };
    

    return (
      <div className="auth-container">
        <h2 className="auth-title">Delivery Partner Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={() => setShowLogin(false)} className="link-button">
            Register here
          </button>
        </p>
      </div>
    );
  };

  const RegisterForm = () => {
    const [formData, setFormData] = useState<DeliveryBoy>({
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      aadharCard: null,
      drivingLicense: null,
      area: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
    
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('area', formData.area);
      if (formData.aadharCard) {
        formDataToSend.append('aadharCard', formData.aadharCard);
      }
      if (formData.drivingLicense) {
        formDataToSend.append('drivingLicense', formData.drivingLicense);
      }
    
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          body: formDataToSend
        });
    
        const data = await response.json();
        if (response.ok) {
          showToast('Registration successful! Please login.');
          setShowLogin(true);
        } else {
          showToast(data.message || 'Registration failed.');
        }
      } catch (error) {
        console.error('Registration Error:', error);
        showToast('Server error occurred during registration.');
      }
    };
    

    return (
      <div className="auth-container">
        <h2 className="auth-title">Delivery Partner Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              required
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Area</label>
            <select
              required
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="area-select"
            >
              <option value="">Select an area</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Aadhar Card</label>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              required
              onChange={(e) => setFormData({ ...formData, aadharCard: e.target.files?.[0] || null })}
            />
          </div>
          <div className="form-group">
            <label>Driving License</label>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              required
              onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.files?.[0] || null })}
            />
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p className="auth-switch">
          Already have an account?{' '}
          <button onClick={() => setShowLogin(true)} className="link-button">
            Login here
          </button>
        </p>
      </div>
    );
  };

  const Dashboard = () => {
    return (
      <div className="dashboard">
        <header className="header">
          <div className="logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
            <Package size={24} />
            DeliveryApp
          </div>
          <div className="profile-mini">
            <div className="notification-wrapper">
              <Bell 
                size={20} 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markNotificationsAsRead();
                }}
                style={{ cursor: 'pointer' }}
              />
              {notifications.some(n => !n.read) && <span className="notification-badge" />}
              {showNotifications && (
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <X size={20} onClick={() => setShowNotifications(false)} style={{ cursor: 'pointer' }} />
                  </div>
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <i
   className="fa fa-user" 
   style={{ cursor: 'pointer' }}
   onClick={() => setActiveTab('profile')}
/>

          </div>
        </header>

        {activeTab === 'home' && (
          <>
            <div className="welcome-section">
              <h2>Welcome Back 👋</h2>
              <p>Here's your delivery dashboard</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                <h3>Pending Orders</h3>
                <h2>{orders.filter(o => o.status === 'pending').length}</h2>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('earnings')} style={{ cursor: 'pointer' }}>
                <h3>Today's Earnings</h3>
                <h2>₹540</h2>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('ratings')} style={{ cursor: 'pointer' }}>
                <h3>Customer Rating</h3>
                <h2>4.8</h2>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                <h3>Completed</h3>
                <h2>{orders.filter(o => o.status === 'completed').length}</h2>
              </div>
            </div>
          </>
        )}

{activeTab === 'orders' && (
  <div className="order-list">
    <div className="order-tabs">
      <button 
        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => setActiveTab('orders')}
      >
        Pending Orders
      </button>
    </div>

    {/* Filter and display orders with 'handoverStatus' of 'handedOver' */}
    {orders.filter(order =>
      order.items.some(item => item.handoverStatus === 'handedOver')
    ).map(order => (
      <div key={order._id} className="order-item">
        <div className="order-header">
          <span className="order-id">#{order.orderNumber}</span>
        </div>

        <div>{order.deliveryAddress.fullName}</div>
        <div>{order.deliveryAddress.street},{order.deliveryAddress.city}, {order.deliveryAddress.pincode},{order.deliveryAddress.state}, {order.deliveryAddress.phone}</div>

        {/* Iterate over each item in the order and display its details */}
        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={index} className="order-item-details">
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-price">₹{item.price}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>

              <div className="order-actions">
                {item.deliveryBoyStatus === 'accepted' ? (
                  <>
                    <button className="btn-accepted" disabled>
                      Accepted
                    </button>

                    {item.deliveryStatus === 'pending' && (
                      <button
                        className="btn-delivered"
                        onClick={() => handleItemAction(order._id, item._id, 'deliver')}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {item.deliveryStatus === 'delivered' && (
                      <button className="btn-delivered" disabled>
                        Delivered
                      </button>
                    )}
                  </>
                ) : item.deliveryBoyStatus === 'rejected' ? (
                  <button className="btn-rejected" disabled>
                    Rejected
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-accept"
                      onClick={() => handleItemAction(order._id, item._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleItemAction(order._id, item._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}











        {activeTab === 'ratings' && (
          <div className="ratings-container">
            <h2>Customer Ratings & Feedback</h2>
            <div className="ratings-summary">
              <div className="rating-big">
                <Star size={32} className="star-icon" />
                <span>4.8</span>
              </div>
              <p>Average Rating</p>
            </div>
            <div className="ratings-list">
              {ratings.map(rating => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-header">
                    <span className="customer-name">{rating.customerName}</span>
                    <div className="rating-stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={index < rating.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="rating-feedback">{rating.feedback}</p>
                  <small className="rating-date">{rating.date}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="earnings-container">
            <h2>Your Earnings</h2>
            <div className="earnings-card">
              <h3>Today's Earnings</h3>
              <h2>₹540</h2>
            </div>
            <div className="earnings-card">
              <h3>Weekly Earnings</h3>
              <h2>₹3,750</h2>
            </div>
            <div className="earnings-card">
              <h3>Monthly Earnings</h3>
              <h2>₹15,000</h2>
            </div>
            <div className="earnings-history">
              <h3>Recent Earnings</h3>
              <div className="earnings-list">
                {orders
                  .filter(order => order.status === 'completed')
                  .map(order => (
                    <div key={order.id} className="earnings-item">
                      <div className="earnings-details">
                        <span>Order #{order.id}</span>
                        <span>{order.date}</span>
                      </div>
                      <span className="earnings-amount">₹{order.amount}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div className="profile-header">
       
              {isEditingProfile ? (
                <div className="edit-profile-form">
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="edit-input"
                  />
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="edit-input"
                  />
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="edit-input"
                  />
                  <select
                    value={userProfile.area}
                    onChange={(e) => setUserProfile({ ...userProfile, area: e.target.value })}
                    className="edit-input"
                  >
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <h2>{userProfile.name}</h2>
                  <p>{userProfile.email}</p>
                  <p>{userProfile.phone}</p>
                  <p>Area: {userProfile.area}</p>
                </>
              )}
            </div>
            <div className="profile-stats">
              <div>
                <h3>150</h3>
                <p>Deliveries</p>
              </div>
              <div>
                <h3>₹15000</h3>
                <p>Earnings</p>
              </div>
              <div>
                <h3>4.8</h3>
                <p>Rating</p>
              </div>
            </div>
            <div className="profile-actions">
              {isEditingProfile ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setIsEditingProfile(false);
                    showToast('Profile updated successfully!');
                  }}
                >
                  Save Changes
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              )}
              <button className="btn btn-decline" onClick={() => setIsLoggedIn(false)}>Logout</button>
            </div>
          </div>
        )}

        <nav className="nav-bar">
          <a
            href="#"
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={20} />
            <span>Orders</span>
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <IndianRupee size={20} />
            <span>Earnings</span>
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </a>
        </nav>

        <Modal
          isOpen={showOtpModal}
          onRequestClose={() => setShowOtpModal(false)}
          className="otp-modal"
          overlayClassName="modal-overlay"
        >
          <h2>Enter Delivery OTP</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 4-digit OTP"
            className="otp-input"
            autoFocus
          />

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleOtpSubmit}>
              Verify OTP
            </button>
            <button className="btn btn-decline" onClick={() => setShowOtpModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    );
  };

  return (
    <>
      {!isLoggedIn ? (
        showLogin ? <LoginForm /> : <RegisterForm />
      ) : (
        <Dashboard />
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

export default App;