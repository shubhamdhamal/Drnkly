import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Store, Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailOrPhone(value);
  };

  const isEmail = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const isPhone = (input: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (emailOrPhone.trim() === '') {
      setError('Email or mobile number is required.');
      setIsLoading(false);
      return;
    }

    if (/^\d+$/.test(emailOrPhone)) {
      // Only numbers entered => validate as mobile number
      if (!isPhone(emailOrPhone)) {
        setError('Please enter a valid 10-digit mobile number.');
        setIsLoading(false);
        return;
      }
    } else {
      // Contains text/symbols => validate as email
      if (!isEmail(emailOrPhone)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
    }

    if (password.trim() === '') {
      setError('Password is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://vendor.drnkly.com/api/vendor/login', {
        emailOrPhone,
        password,
      });

      const token = response.data.token;

      if (token) {
        localStorage.setItem('authToken', token);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials.');
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'An error occurred.');
      } else {
        setError('An error occurred.');
      }
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Store className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your vendor account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email or Phone Input */}
          <Input
            label="Mobile number"
            type="text"
            required
            placeholder="Enter your mobile number"
            value={emailOrPhone}
            onChange={handleEmailOrPhoneChange}
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            icon={<LogIn className="w-5 h-5" />}
            className="w-full"
          >
            Sign in
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register as a vendor
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
