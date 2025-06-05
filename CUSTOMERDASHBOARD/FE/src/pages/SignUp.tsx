import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ArrowRight, AlertCircle, Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false); // This controls the visibility of the info modal
  const [showTermsModal, setShowTermsModal] = useState(false); // Modal for Terms & Conditions
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
   
   // Name validation for first and last name
   const validateNameWithoutSpace = (name: string) => {
    const nameParts = name.trim().split(' ');

    // Ensure there are exactly two parts (first name and last name)
    if (nameParts.length !== 2) {
      return false;
    }

    const firstName = nameParts[0];
    const lastName = nameParts[1];

    const nameRegex = /^[A-Za-z]{2,}$/; // Only letters, at least two characters

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Check if the user agreed to the terms and conditions
    if (!agreed) {
      setError('You must agree to the terms and conditions to continue');
      return;
    }
  
    
  
  
    // Validate Name (First name and Last name together in one field)
    if (!formData.name || !validateNameWithoutSpace(formData.name)) {
      setError('Please enter your first name and last name together without space (e.g., John Doe).');
      return;
    }
    // Validate Email
    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
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
  
    // ✅ If all validations passed, Prepare the data for submission
    const finalData = new FormData();
    Object.entries(formData).forEach(([key, val]) => finalData.append(key, val));
    Object.entries(extraData).forEach(([key, val]) => finalData.append(key, String(val)));
  
    try {
      // Submit the form data to the backend
      const res = await axios.post('https://peghouse.in/api/auth/signup', finalData, {
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
  
  const handleGoogleSignUp = async () => {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to sign up with Google. Please try again.');
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
          <p className="text-sm text-gray-500">Step {step} of 4</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded flex items-center">
            <AlertCircle className="mr-2" /> <span>{error}</span>
          </div>
        )}

        {/* Add Google Sign-Up Button before the form */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or sign up with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
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
            </>
          )}

          {step === 2 && (
            <>
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
                        idProof: null,
                        selfDeclaration: false
                      }));
                    }
                  }}
                />
              </div>
              
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label>Age Verification</label>
                <p className="text-sm text-gray-600 mt-1">
                  By continuing, you confirm that you are of legal drinking age as per your state regulations.
                </p>
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
            </>
          )}

        {step === 4 && (
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
      <label>Email</label>
      <input
        type="email"
        className="w-full border px-3 py-2 rounded"
        placeholder="Email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
      />
      {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
        <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
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



    {/* Terms Modal Trigger */}
    <div className="mt-2 flex items-center space-x-2">
  <input
    type="checkbox"
    checked={agreed}
    readOnly
    onClick={() => setShowTermsModal(true)} // ✅ Always open Terms modal on click
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


    {/* ✅ Show message only after Submit */}
    {isSubmitted && (
      <p
        className="text-sm text-green-700 font-medium mt-4 cursor-pointer hover:underline"
        onClick={() => setShowInfo(true)}
      >
        ✅ Account will be verified within 24 hours
      </p>
    )}
  </>
)}


          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
            )}
            {step < 4 ? (
           <button
           type="button"
           onClick={() => {
             if (step === 1) {
               if (!extraData.state || !extraData.city) {
                 setError('Please select both State and City to continue.');
                 return;
               }
             }
             if (step === 2) {
               if (!extraData.dob ) {
                 setError('Please enter valid Date of Birth');
                 return;
               }
             }
             if (step === 3) {
               if (!extraData.selfDeclaration) {
                 setError('Please confirm your legal drinking age.');
                 return;
               }
             }
             // If no validation errors, move to next step
             setError('');
             setStep(step + 1);
           }}
           className="ml-auto px-4 py-2 bg-orange-500 text-white rounded flex items-center space-x-1"
         >
           <span>Continue</span>
           <ArrowRight size={18} />
         </button>
         
            ) : (
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            )}
          </div>
        </form>

{/* ✅ Info Modal */}
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

        {/* ✅ Terms Modal */}
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
