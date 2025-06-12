import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Wine,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SESSION_TIMEOUT = 60 * 60 * 1000;

function App() {
  const navigate = useNavigate();

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [hasDrinkingLicense, setHasDrinkingLicense] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Govt. Regulations.');
      setIsLoading(false);
      return;
    }

    const identifier = loginMethod === 'mobile' ? mobile : email;

    if (!identifier || (loginMethod === 'mobile' && identifier.length !== 10)) {
      setError('Please enter a valid mobile number or email.');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://peghouse.in/api/auth/login', {
        identifier,
        password,
      });

      if (response.data.message === 'Login successful') {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user._id);
        localStorage.removeItem('isSkippedLogin');
        localStorage.removeItem('oldMonkOfferShown');
        window.dispatchEvent(new Event('storage'));

        if (localStorage.getItem('locationGranted') === 'true') {
          navigate('/dashboard');
        } else {
          setShowLocationPopup(true);
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg === 'User not found') {
        setError('No account found with this email or mobile number.');
      } else if (msg === 'Invalid credentials') {
        setError('Incorrect credentials. Please try again.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://peghouse.in/api/auth/google';
  };

  const handleSkipLogin = () => {
    localStorage.setItem('isSkippedLogin', 'true');
    setIsSkipped(true);
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
  };

  const handleLocationAccess = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          localStorage.setItem(
            'userLocation',
            JSON.stringify({
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            })
          );
          localStorage.setItem('locationGranted', 'true');
          setLocationError('Location retrieved successfully!');
          setShowLocationPopup(false);
          navigate('/dashboard');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Unable to get your location. Please enable location access.');
          setTimeout(() => setShowLocationPopup(false), 2000);
        }
      );
    } else {
      setLocationError('Location not supported by your browser.');
      setTimeout(() => setShowLocationPopup(false), 2000);
    }
  };

  const handleSkipLocation = () => {
    setShowLocationPopup(false);
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-48 h-48 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-20 right-10 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-4 left-20 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-3 relative z-10">
        <div className="w-full max-w-md">
          {/* Header Section - Compact */}
          <div className="text-center mb-4 animate-fade-in-up">
            <div className="relative mb-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your premium account</p>
          </div>

          {/* Main Card - Compact */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 animate-fade-in-up animation-delay-200">
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-xl animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Login Method Toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginMethod('mobile')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    loginMethod === 'mobile'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    loginMethod === 'email'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Email
                </button>
              </div>

              {/* Mobile Input - Show only when mobile is selected */}
              {loginMethod === 'mobile' && (
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-orange-600 transition-colors">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 placeholder-gray-400"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={handleMobileChange}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Email Input - Show only when email is selected */}
              {loginMethod === 'email' && (
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-orange-600 transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 placeholder-gray-400"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Password Input - Always show */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-orange-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 placeholder-gray-400"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Checkboxes - Compact */}
              <div className="space-y-3">
                <label className="flex items-start space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={hasDrinkingLicense}
                      onChange={(e) => setHasDrinkingLicense(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-md border-2 transition-all duration-200 ${hasDrinkingLicense ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {hasDrinkingLicense && <CheckCircle className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-blue-500" />
                    I have a valid License of Drinking
                  </span>
                </label>

                <label className="flex items-start space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) setShowTermsPopup(true);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-md border-2 transition-all duration-200 ${agreedToTerms ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {agreedToTerms && <CheckCircle className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center">
                    <Globe className="w-3 h-3 mr-1 text-orange-500" />
                    I agree to Terms & Govt. Regulations *
                  </span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Sign In</span>
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/80 text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="group-hover:text-gray-900 transition-colors">Sign in with Google</span>
              </button>
            </form>

            {/* Skip Login Button */}
            {!isSkipped && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleSkipLogin}
                  className="text-orange-600 font-semibold hover:text-orange-700 hover:underline text-sm transition-all duration-200 px-3 py-1 rounded-lg hover:bg-orange-50"
                >
                  Skip Login and Proceed →
                </button>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-4 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                New to Liqkart?{' '}
                <button 
                  onClick={() => navigate('/signup')} 
                  className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors"
                >
                  Create Account
                </button>
              </p>
              <p>
                <button 
                  onClick={() => navigate('/forgot-password')} 
                  className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors text-sm"
                >
                  Forgot Password?
                </button>
              </p>
            </div>
          </div>

          {/* Health Warning - Compact */}
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in-up animation-delay-400">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 font-semibold mb-1">
                🚭 Alcohol & Smoking Health Warning
              </p>
              <p className="text-red-600 text-sm">
                तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Access Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/20 animate-scale-in">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 transform rotate-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enable Location</h3>
              <p className="text-gray-600 text-sm">
                Allow access to your location to find nearby stores and get better delivery estimates.
              </p>
            </div>

            {locationError && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-start">
                <CheckCircle className="shrink-0 mr-2 mt-0.5 text-blue-500" size={18} />
                <p className="text-sm font-medium">{locationError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleLocationAccess}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
              >
                📍 Allow Location Access
              </button>
              <button
                onClick={handleSkipLocation}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full text-left overflow-y-auto max-h-[90vh] border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-orange-500" />
                Terms & Regulations
              </h2>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-2">📋 Terms & Conditions</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>1. Age Verification:</strong> Must be 21+ years old (Hard Liquor) or 25+ years (All Liquor) as per Maharashtra excise rules.</p>
                  <p><strong>2. ID Verification:</strong> Government ID mandatory at delivery.</p>
                  <p><strong>3. No Intoxicated Sales:</strong> Delivery refused to intoxicated persons.</p>
                  <p><strong>4. Dry Area Restriction:</strong> No delivery in prohibition zones.</p>
                  <p><strong>5. Time Restrictions:</strong> Delivery only during 11 AM - 11 PM.</p>
                  <p><strong>6. Quantity Limits:</strong> Max 3L IMFL or 9L beer per transaction.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">⚖️ Government Rules & Excise Acts</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Maharashtra: Age 21</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Delhi: Age 25</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Karnataka: Age 21</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span>Gujarat: Banned</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Liquor License Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter License Number if available"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-md border-2 transition-all duration-200 ${isTermsChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                    {isTermsChecked && <CheckCircle className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" />}
                  </div>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  I confirm I'm of legal age and agree to all terms above.
                </span>
              </label>
            </div>

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-600 font-semibold">
                🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे
              </p>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  if (isTermsChecked) {
                    setAgreedToTerms(true);
                    setShowTermsPopup(false);
                  }
                }}
                disabled={!isTermsChecked}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                  isTermsChecked
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-[1.02] shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✅ AGREE AND CONTINUE
              </button>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default App;
