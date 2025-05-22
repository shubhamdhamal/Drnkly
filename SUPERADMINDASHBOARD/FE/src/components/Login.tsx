import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import axios from 'axios';

interface LoginProps {
  onLogin: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!email) {
      return 'Email or mobile number is required';
    }
    if (!emailRegex.test(email) && !phoneRegex.test(email)) {
      return 'Please enter a valid email or 10-digit mobile number';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    setErrors({ email: emailError, password: passwordError });
    return;
  }

  try {
    const res = await axios.post('http://localhost5003/api/superadmin/login', {
      emailOrMobile: email,
      password,
    });

    // Store JWT token and admin info
    localStorage.setItem('superadminToken', res.data.token);
    localStorage.setItem('superadmin', JSON.stringify(res.data.admin));

    setEmail('');
    setPassword('');
    setErrors({});

    onLogin();
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Login failed. Please try again.';
    setErrors({ general: msg });
  }
};


  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="text-2xl font-bold mb-6 text-center">Super Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Email or Mobile</label>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email or mobile"
              />
            </div>
            {errors.email && <p className="error-message text-red-500">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>
            {errors.password && <p className="error-message text-red-500">{errors.password}</p>}
          </div>

          {errors.general && <p className="error-message text-red-600 mt-2">{errors.general}</p>}

          <button type="submit" className="submit-button mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
