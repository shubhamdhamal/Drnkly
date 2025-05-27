import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ArrowRight, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [extraData, setExtraData] = useState({
    state: '',
    city: '',
    dob: '',
    aadhaar: '',
    selfDeclaration: false,
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    special: false
  });

  const allowedAlcoholStates: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Goa': ['Panaji', 'Margao'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Mangalore'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Telangana': ['Hyderabad', 'Warangal'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar'],
    'Haryana': ['Gurgaon', 'Faridabad', 'Panipat'],
    'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala'],
    'Assam': ['Guwahati', 'Dibrugarh', 'Silchar'],
    'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital'],
    'Jammu & Kashmir': ['Srinagar', 'Jammu'],
    'Ladakh': ['Leh', 'Kargil'],
  };

  // Validate name with first and last name
  const validateNameWithoutSpace = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length !== 2) {
      return false;
    }
    const firstName = nameParts[0];
    const lastName = nameParts[1];
    const nameRegex = /^[A-Za-z]{2,}$/;
    return nameRegex.test(firstName) && nameRegex.test(lastName);
  };
  
  const validateMobile = (mobile: string) => {
    return /^\d{10}$/.test(mobile);
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password as it changes
  useEffect(() => {
    setPasswordRequirements({
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    });
  }, [formData.password]);

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(req => req === true);
  };

  const sendOtp = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    try {
      setError('');
      // Replace with your actual API endpoint
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: formData.email
      });
      
      if (response.data.success) {
        setOtpSent(true);
        setError('');
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP entered by the user
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    
    try {
      setError('');
      // Call your backend API to verify OTP
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });
      
      if (response.data.success) {
        setOtpVerified(true);
        setError('');
        setStep(3); // Move to step 3 after OTP verification
        
        // Add a success message
        toast.success('OTP verified successfully!', {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Check if the user agreed to the terms and conditions
    if (!agreed) {
      setError('You must agree to the terms and conditions to continue');
      return;
    }
  
    // Validate Name (First name and Last name together in one field)
    if (!formData.name || !validateNameWithoutSpace(formData.name)) {
      setError('Please enter your first name and last name (e.g., John Doe).');
      return;
    }
    
    // Validate Mobile
    if (!formData.mobile || !validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
  
    // Validate Passwords
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill both password fields.');
      return;
    }
  
    if (!isPasswordValid()) {
      setError('Password does not meet all requirements.');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    // Prepare the data for submission
    const finalData = new FormData();
    Object.entries(formData).forEach(([key, val]) => finalData.append(key, val));
    Object.entries(extraData).forEach(([key, val]) => finalData.append(key, String(val)));
  
    try {
      // Submit the form data to the backend
      const res = await axios.post('http://localhost:5000/api/auth/signup', finalData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log(res.data);
  
      // After successful submission
      setIsSubmitted(true);
      setShowInfo(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-white shadow rounded-full flex items-center justify-center">
            <Wine size={28} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mt-4">User Registration</h2>
          <p className="text-sm text-gray-500">Step {step} of 3</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded flex items-center">
            <AlertCircle className="mr-2" /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="px-4 py-2 bg-orange-500 text-white rounded flex items-center space-x-1"
                >
                  <span>Send OTP</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label>Enter OTP sent to {formData.email}</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) {
                      setOtp(value);
                    }
                  }}
                  maxLength={6}
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="px-4 py-2 bg-orange-500 text-white rounded flex items-center space-x-1"
                >
                  <span>Verify OTP</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="First Name and Last Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formData.name && !validateNameWithoutSpace(formData.name) && (
                  <p className="text-red-500 text-xs mt-1">Enter the First Name and Last Name.</p>
                )}
              </div>

              <div>
                <label>Mobile</label>
                <input
                  type="tel"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setFormData({ ...formData, mobile: value });
                    }
                  }}
                />
                {formData.mobile && formData.mobile.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1">Mobile number must be exactly 10 digits.</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                
                {/* Password requirements */}
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-medium text-gray-700">Password must contain:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center space-x-2">
                      {passwordRequirements.length ? 
                        <Check size={16} className="text-green-500" /> : 
                        <X size={16} className="text-red-500" />}
                      <span className={passwordRequirements.length ? "text-green-600" : "text-red-500"}>
                        At least 8 characters
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      {passwordRequirements.uppercase ? 
                        <Check size={16} className="text-green-500" /> : 
                        <X size={16} className="text-red-500" />}
                      <span className={passwordRequirements.uppercase ? "text-green-600" : "text-red-500"}>
                        At least one uppercase letter (A-Z)
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      {passwordRequirements.lowercase ? 
                        <Check size={16} className="text-green-500" /> : 
                        <X size={16} className="text-red-500" />}
                      <span className={passwordRequirements.lowercase ? "text-green-600" : "text-red-500"}>
                        At least one lowercase letter (a-z)
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      {passwordRequirements.special ? 
                        <Check size={16} className="text-green-500" /> : 
                        <X size={16} className="text-red-500" />}
                      <span className={passwordRequirements.special ? "text-green-600" : "text-red-500"}>
                        At least one special character (@, #, $, etc.)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div>
                <label>State</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.state}
                  onChange={(e) =>
                    setExtraData({ ...extraData, state: e.target.value, city: '' })
                  }
                >
                  <option value="">-- Select State --</option>
                  {Object.keys(allowedAlcoholStates).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>City</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.city}
                  onChange={(e) =>
                    setExtraData({ ...extraData, city: e.target.value })
                  }
                  disabled={!extraData.state}
                >
                  <option value="">-- Select City --</option>
                  {extraData.state &&
                    allowedAlcoholStates[extraData.state].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label>DOB</label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.dob}
                  onChange={(e) => {
                    const dob = e.target.value;
                    const today = new Date();
                    const birthDate = new Date(dob);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }

                    if (age >= 21) {
                      setExtraData(prev => ({
                        ...prev,
                        dob: dob
                      }));
                    } else {
                      alert('Your age is less than 21. You are not allowed to register.');
                      setExtraData(prev => ({
                        ...prev,
                        dob: '',
                        selfDeclaration: false
                      }));
                    }
                  }}
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={extraData.selfDeclaration}
                    onChange={() =>
                      setExtraData({
                        ...extraData,
                        selfDeclaration: !extraData.selfDeclaration,
                      })
                    }
                  />
                  <span>I confirm I am of legal drinking age</span>
                </label>
              </div>

              {/* Terms Modal Trigger */}
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  readOnly
                  onClick={() => setShowTermsModal(true)}
                />
                <span className="text-sm text-gray-800">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </div>

              {/* Show message only after Submit */}
              {isSubmitted && (
                <p
                  className="text-sm text-green-700 font-medium mt-4 cursor-pointer hover:underline"
                  onClick={() => setShowInfo(true)}
                >
                  ✅ Account will be verified within 24 hours
                </p>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 text-center shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Registration Complete</h3>
              <p className="text-sm text-gray-600">
                Your account has been created successfully. You will be redirected to the login page shortly.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-left overflow-y-auto max-h-[90vh]">
              <h2 className="text-lg font-bold mb-2 text-center">Terms & Conditions (English)</h2>
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
              <h3 className="text-sm text-gray-700 mb-4"><strong>Government Rules & Excise Acts:</strong></h3>
              <ul className="list-disc pl-5">
                <li>✔ Maharashtra: Age 21</li>
                <li>✔ Delhi: Age 25</li>
                <li>✔ Karnataka: Age 21</li>
                <li>✔ Tamil Nadu: Only TASMAC allowed</li>
                <li>✔ Gujarat: Alcohol banned</li>
                <li>✔ Telangana: Excise Act applies</li>
              </ul>
              <p className="text-sm text-gray-700 mb-4">
                🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे ❤🍀
              </p>
              <div className="text-center">
              <button
                onClick={() => {
                  setAgreed(true);
                  setError(''); // clear error
                  setShowTermsModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-2"
              >
                Agree & Continue
              </button>

                <button
                  onClick={() => setShowTermsModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignUp;
