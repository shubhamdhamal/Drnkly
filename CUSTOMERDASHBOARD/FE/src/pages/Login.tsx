import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);  // Set default to true to check it by default

  // New checkboxes states
  const [hasDrinkingLicense, setHasDrinkingLicense] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSkipped, setIsSkipped] = useState(false);
  
  // Handle mobile number change and restrict to 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and restrict the length to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation only for Terms agreement
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Govt. Regulations.');
      return;
    }
  
    // Mobile number length validation
    if (!mobile || mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
  
    // Validate user input
    if (!password) {
      setError('Please enter your password.');
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
        
        // Make sure to remove the skipped login flag if it exists
        localStorage.removeItem('isSkippedLogin');
        
        // Reset the Old Monk offer shown flag to ensure they see it on this login
        localStorage.removeItem('oldMonkOfferShown');
        
        console.log('Login successful, localStorage updated:', { 
          token: true, 
          userId: true, 
          skipped: false 
        });
        
        // Dispatch a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
  
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
    
    // Clear any existing auth tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    
    // Set the skip login flag
    localStorage.setItem('isSkippedLogin', 'true');
    
    console.log('Login skipped, localStorage updated:', { 
      token: false, 
      userId: false, 
      skipped: true 
    });
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    navigate('/dashboard'); // Navigate directly to dashboard without login
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
          <img
  src="/finallogo.png"
  alt="Drnkly Logo"
  className="h-24 md:h-32 lg:h-40 mx-auto object-contain"
/>

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
                onChange={handleMobileChange}
              />
            </div>

            <div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>
  <input
    type={showPassword ? "text" : "password"}
    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  {/* Eye Icon */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
    tabIndex={-1} // to prevent focusing the button on tab
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

            {/* Drinking License - keep but not mandatory */}
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

            {/* Terms & Conditions - mandatory */}
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

            {/* Add Google Sign-In Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              Sign in with Google
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
          </p>
          
          {/* Forgot Password Link */}
          <p className="mt-2 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-[#cd6839] font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </p>
            {/* Alcohol Health Warning Banner */}
<div className="py-4 px-2 flex justify-center items-center">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/1/10/Alcohol_warning_India.png"
    alt="Alcohol is Dangerous Warning"
    className="w-[500px] h-[100px] object-cover"
  />
</div>
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
        <p className="text-sm text-gray-700 mb-4">
              1. Age Verification & Legal Drinking Age:The customer must confirm they are 21 years or older (Hard Liquor Prohibited) or 25 years or older (for All liquor) as per Maharashtra excise rules.Age verification via government ID (Aadhaar, PAN, Driving License, Passport) is mandatory before delivery.  </p>
              <p className="text-sm text-gray-700 mb-4">
              2. Prohibition of Sale to Intoxicated Persons:Liquor will not be delivered to anyone who appears intoxicated at the time of delivery.            </p>
              <p className="text-sm text-gray-700 mb-4">
              3. Prohibition of Sale in Dry Areas:Liquor cannot be sold or delivered in dry areas (where prohibition is enforced). The customer must confirm their delivery location is not in a dry zone.            </p>
            
              <p className="text-sm text-gray-700 mb-4">
              4. Restricted Timings for Sale & Delivery:Liquor delivery is allowed only during permitted hours (typically 11 AM to 11 PM in most areas, subject to local regulations).          </p>
              <p className="text-sm text-gray-700 mb-4">
              5. Quantity Restrictions:Customers cannot purchase beyond the permissible limit (e.g., 3 liters of IMFL or 9 liters of beer per person per transaction). Bulk purchases may require additional permits.          </p>
              <p className="text-sm text-gray-700 mb-4">
              6. No Resale or Supply to Minors:The customer must agree not to resell liquor and not to supply it to minors (under 21/25).         </p>
              <p className="text-sm text-gray-700 mb-4">
              7. Valid ID Proof Required at Delivery:The delivery agent will verify the customer's original ID at the time of delivery. If ID is not provided, the order will be cancelled. </p> 
              <p className="text-sm text-gray-700 mb-4">
              8. No Returns or Refunds for Sealed Liquor Bottles:Once liquor is sold, returns or refunds are not permitted unless the product is damaged/spoiled (as per excise rules).
              </p>
             <p className="text-sm text-gray-700 mb-4">
             9. Compliance with Local Municipal & Police Regulations:The customer must ensure that liquor consumption at their location complies with local laws (e.g., no consumption in public places).</p>
             <p className="text-sm text-gray-700 mb-4">
             10. Liability Disclaimer:The business is not responsible for misuse, overconsumption, or illegal resale by the customer.</p>
<p className="text-sm text-gray-700 mb-4">
11. Right to Refuse Service
      The business reserves the right to cancel orders if:
            The customer fails age verification.
            The delivery location is in a dry area or restricted zone.
            Suspicion of fraudulent activity.</p>
<p className="text-sm text-gray-700 mb-4">
             12. Data Privacy & Use of Customer Information:Customer ID and personal data will be stored as per excise department requirements and may be shared with authorities if required.
</p>
<p className="text-sm text-gray-700 mb-4">
13. Mandatory Compliance with Maharashtra Excise Laws:The customer agrees that the sale is governed by the Maharashtra Prohibition Act, 1949, and any violation may lead to legal action.</p>
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
            checked={isTermsChecked} // Bind to isTermsChecked
            onChange={(e) => setIsTermsChecked(e.target.checked)} // Update the state on change
            className="mt-1"
          />
          <label className="text-sm text-gray-700">
            I confirm I'm of legal age and agree to all terms above.
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
          🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे 
        </p>
      </div>

      {/* Actions */}
      <div className="text-center mt-4">
      <button
        onClick={() => {
          if (isTermsChecked) {  // ✅ Only proceed if checkbox is checked
            setAgreedToTerms(true);
            setShowTermsPopup(false);
          }
        }}
        disabled={!isTermsChecked} // ✅ Disable button if not checked
        className={`px-6 py-2 rounded mr-2 ${
          isTermsChecked
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
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