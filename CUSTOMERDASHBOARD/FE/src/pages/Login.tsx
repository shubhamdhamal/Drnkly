import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, AlertCircle } from 'lucide-react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  // New checkboxes states
  const [hasDrinkingLicense, setHasDrinkingLicense] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSkipped, setIsSkipped] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation for checkboxes
    if (!hasDrinkingLicense || !agreedToTerms) {
      setError('Please confirm you have a drinking license and agree to the terms.');
      return;
    }
  
    // Validate user input
    if (!mobile || !password) {
      setError('Please enter both mobile number and password');
      return;
    }
  
    // Make the API call to login
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { mobile, password });
  
      if (response.data.message === 'Login successful') {
        // ✅ Status Check
        const status = response.data.user.status;
  
        if (status === 'Pending') {
          setError('🕒 Your account is pending verification. Please wait for admin approval.');
          return;
        } else if (status === 'Rejected') {
          setError('❌ Your account has been rejected due to government rules.');
          return;
        }
  
        // Store JWT token
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user._id);
  
        // ✅ Location check
        if (localStorage.getItem('locationGranted') === 'true') {
          navigate('/dashboard');
        } else {
          setShowLocationPopup(true);
        }
      }
    } catch (error) {
      const msg = (error as any).response?.data?.message;
  
      if (msg === 'User not found') {
        setError('No account found with this mobile number.');
      } else if (msg === 'Invalid credentials') {
        setError('Incorrect mobile number or password.');
      } else if (msg === 'Your account is pending verification. Please wait for approval.') {
        setError('🕒 Your account is pending verification. Please wait for admin approval.');
      } else if (msg === 'Your account has been rejected due to government regulations.') {
        setError('❌ Your account has been rejected due to government rules.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };
  
  

  const handleLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
  
          console.log("Location retrieved:", latitude, longitude); // ✅ Add this line
  
          localStorage.setItem("userLocation", JSON.stringify({
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          }));
  
          localStorage.setItem("locationGranted", "true");
  
          setLocationError(`Location retrieved: Latitude ${latitude}, Longitude ${longitude}`);
          setShowLocationPopup(false);
  
          // ✅ Only navigate once location is successfully stored
          navigate('/dashboard');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Unable to get your location. Please enable location access to continue.');
          setTimeout(() => {
            setShowLocationPopup(false);
            navigate('/dashboard');
          }, 2000);
        }
      );
    } else {
      setLocationError('Location services are not supported by your browser.');
      setTimeout(() => {
        setShowLocationPopup(false);
        navigate('/dashboard');
      }, 2000);
    }
  };
  
  

  const handleSkipLocation = () => {
    setShowLocationPopup(false);
    navigate('/dashboard');
  };
  const handleSkipLogin = () => {
    setIsSkipped(true);
    navigate('/dashboard'); // Navigate directly to dashboard without login
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Wine size={48} className="mx-auto text-[#cd6839]" />
            <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-6 flex items-start space-x-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Drinking License */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="license"
                checked={hasDrinkingLicense}
                onChange={(e) => setHasDrinkingLicense(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="license" className="text-sm text-gray-700">
                I have a valid License of Drinking
              </label>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setShowTermsPopup(true); // Show Terms Popup when checked
                }}
                className="w-4 h-4"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                I agree to Terms & Govt. Regulations
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31] transition-colors"
            >
              Login
            </button>
          </form>
{/* Skip Login Button */}
{!isSkipped && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkipLogin}
                className="text-[#cd6839] font-semibold hover:underline text-sm"
              >
                Skip Login and Proceed
              </button>
            </div>
          )}
          <p className="mt-6 text-center">
            New to Liqkart?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-[#cd6839] font-semibold hover:underline"
            >
              Create Account
            </button>
            {/* Alcohol Health Warning Banner */}
<div className="py-4 px-2 flex justify-center items-center">
  <img
    src="../src/pages/photo1.jpeg"
    alt="Alcohol is Dangerous Warning"
    className="w-[500px] h-[100px] object-cover"
  />
</div>
          </p>
        </div>
      </div>

      {/* Location Access Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Enable Location</h3>
            <p className="text-gray-600 mb-6">
              Allow access to your location to find nearby stores and get better delivery estimates.
            </p>

            {locationError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
                <AlertCircle className="shrink-0 mr-2 mt-0.5" size={20} />
                <p className="text-sm">{locationError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleLocationAccess}
                className="w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31] transition-colors"
              >
                Allow Location Access
              </button>
              <button
                onClick={handleSkipLocation}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-left overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-2 text-center">Terms & Regulations</h2>
            
            {/* Terms & Conditions Content */}
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Terms & Conditions:</strong></p>
              <p>
                By accessing this app, you affirm you're of legal drinking age. Use of this app in restricted states or by underage users is punishable by law. If you're a business, you must have a valid license.
              </p>
            </div>
            
            {/* Declaration Section */}
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Declaration:</strong></p>
              <p>Liquor License No. (if any)</p>
              <input
                type="text"
                placeholder="Enter License Number (if any)"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
              />
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label className="text-sm text-gray-700">
                  I confirm I’m of legal age and agree to all terms above.
                </label>
              </div>
            </div>

            {/* Government Rules & Excise Acts */}
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Government Rules & Excise Acts:</strong></p>
              <ul className="list-disc pl-5">
                <li>✔ Maharashtra: Age 21</li>
                <li>✔ Delhi: Age 25</li>
                <li>✔ Karnataka: Age 21</li>
                <li>✔ Tamil Nadu: Only TASMAC allowed</li>
                <li>✔ Gujarat: Alcohol banned</li>
                <li>✔ Telangana: Excise Act applies</li>
              </ul>
            </div>

            {/* Health Message */}
            <div className="text-center">
              <p className="text-lg text-red-600 font-semibold">
                🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे ❤️🍀
              </p>
            </div>

            {/* Actions */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsPopup(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-2"
              >
                AGREE AND CONTINUE
              </button>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
