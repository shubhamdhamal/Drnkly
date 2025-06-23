import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ArrowRight, AlertCircle, Eye, EyeOff, Check, X, Mail, MapPin, Calendar, Shield, User, Phone, Lock, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    special: false
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpInputRef = React.useRef<HTMLInputElement>(null);
  const [signupMethod, setSignupMethod] = useState<'email' | 'google'>('email');

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

  const validateNameWithoutSpace = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length !== 2) return false;
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
    if (!agreed) {
      setError('You must agree to the terms and conditions to continue');
      return;
    }
    
    if (!formData.name || !validateNameWithoutSpace(formData.name)) {
      setError('Please enter your first name and last name together (e.g., John Doe).');
      return;
    }
    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.mobile || !validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
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
      setSignupMethod('google');
      // Redirect to Google OAuth endpoint
      window.location.href = 'https://peghouse.in/api/auth/google';
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to sign up with Google. Please try again.');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setOtpSuccess('OTP sending...');

      // API call to send OTP
      const response = await axios.post('https://peghouse.in/api/auth/send-otp', {
        email: formData.email
      });

      // Check if OTP was sent successfully
      if (response.data.success) {
        setIsOtpSent(true);
        setOtpSent(true);
        setError('');
        setOtpSuccess('✅ OTP sent to your email!');
        
        // Focus on OTP input field after a slight delay
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 100);
      }
    } catch (err) {
      // Clear success message and set error message
      setOtpSuccess('');
      setError(err.response?.data?.message || 'Error sending OTP. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otp.length > 0) {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please Enter OTP');
      return;
    }

    try {
      setOtpSuccess('Verifying OTP...');
      const response = await axios.post('https://peghouse.in/api/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });
      
      if (response.data.success) {
        setIsOtpVerified(true);
        setOtpVerified(true);
        setOtpError('');
        setError('');
        setOtpSuccess('✅ OTP Verified Successfully!');
        
        // Automatically move to step 2 after successful verification
        setTimeout(() => {
          setOtpSuccess('');
          setStep(2);
        }, 1000);
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please Try Again');
      setOtpSuccess('');
    }
  };

  const getStepIcon = (stepNumber: number) => {
    const icons = [Mail, MapPin, Shield, User];
    const Icon = icons[stepNumber - 1];
    return <Icon size={20} />;
  };

  const getStepTitle = (stepNumber: number) => {
    const titles = ['Email Verification', 'Location & Age', 'Age Confirmation', 'Complete Profile'];
    return titles[stepNumber - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg rounded-2xl flex items-center justify-center mb-4 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Wine size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm mb-6">Join our premium community</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > stepNumber ? <Check size={16} /> : getStepIcon(stepNumber)}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${
                    step > stepNumber ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{getStepTitle(step)}</h2>
          <p className="text-sm text-gray-500">Step {step} of 4</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center animate-fadeIn">
            <AlertCircle className="mr-3 flex-shrink-0" size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Email Verification */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Google Sign Up */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <img 
                      src="https://www.google.com/favicon.ico" 
                      alt="Google" 
                      className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                    />
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with email</span>
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setIsOtpSent(false);
                          setIsOtpVerified(false);
                          setOtpSent(false);
                          setOtpVerified(false);
                          setOtp('');
                          setOtpSuccess('');
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!formData.email || !validateEmail(formData.email)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        !formData.email || !validateEmail(formData.email)
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 active:scale-95'
                      }`}
                    >
                      Send OTP
                    </button>
                  </div>
                  {formData.email && !validateEmail(formData.email) && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <X size={14} className="mr-1" />
                      Please enter a valid email address
                    </p>
                  )}
                  {otpSuccess && (
                    <p className="text-green-600 text-sm mt-2 flex items-center animate-fadeIn">
                      <CheckCircle size={16} className="mr-2" />
                      {otpSuccess}
                    </p>
                  )}
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="space-y-4 animate-slideIn">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <Mail className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                        <p className="text-blue-700 text-sm">
                          Please enter the OTP sent to your email address
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Enter OTP
                      </label>
                      <div className="flex gap-3">
                        <input
                          ref={otpInputRef}
                          type="text"
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 text-center text-lg font-mono tracking-widest"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          onKeyPress={handleKeyPress}
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={!otp}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            !otp
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:scale-105 active:scale-95'
                          }`}
                        >
                          Verify
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-red-500 text-xs mt-2 flex items-center">
                          <X size={14} className="mr-1" />
                          {otpError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Location & DOB */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-orange-500" />
                    State
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    value={extraData.state}
                    onChange={(e) =>
                      setExtraData({ ...extraData, state: e.target.value, city: '' })
                    }
                  >
                    <option value="">Select your state</option>
                    {Object.keys(allowedAlcoholStates).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-orange-500" />
                    City
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
                    value={extraData.city}
                    onChange={(e) =>
                      setExtraData({ ...extraData, city: e.target.value })
                    }
                    disabled={!extraData.state}
                  >
                    <option value="">Select your city</option>
                    {extraData.state &&
                      allowedAlcoholStates[extraData.state].map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar size={16} className="mr-2 text-orange-500" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
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
                        setExtraData(prev => ({ ...prev, dob: dob }));
                      } else {
                        alert('You must be at least 21 years old to register.');
                        setExtraData(prev => ({
                          ...prev,
                          dob: '',
                          selfDeclaration: false
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Age Verification */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <Shield className="text-amber-600 mr-3 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">Age Verification Required</h3>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        By continuing, you confirm that you are of legal drinking age as per your state regulations. 
                        This is mandatory for alcohol delivery services.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={extraData.selfDeclaration}
                        onChange={() =>
                          setExtraData({
                            ...extraData,
                            selfDeclaration: !extraData.selfDeclaration,
                          })
                        }
                        className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      {extraData.selfDeclaration && (
                        <Check className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" />
                      )}
                    </div>
                    <span className="text-gray-800 font-medium group-hover:text-orange-800 transition-colors duration-200">
                      I confirm that I am of legal drinking age (21+ years)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Complete Profile */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <User size={16} className="mr-2 text-orange-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="First Name Last Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formData.name && !validateNameWithoutSpace(formData.name) && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <X size={14} className="mr-1" />
                      Please enter both first and last name
                    </p>
                  )}
                </div>

                {/* Email (Disabled) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Mail size={16} className="mr-2 text-green-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-green-200 bg-green-50 text-gray-600 cursor-not-allowed"
                      value={formData.email}
                      disabled
                    />
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Phone size={16} className="mr-2 text-orange-500" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        setFormData({ ...formData, mobile: value });
                      }
                    }}
                  />
                  {formData.mobile && formData.mobile.length !== 10 && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <X size={14} className="mr-1" />
                      Mobile number must be exactly 10 digits
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Lock size={16} className="mr-2 text-orange-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-700 mb-2 text-sm">Password Requirements:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: 'length', text: 'At least 8 characters' },
                          { key: 'uppercase', text: 'One uppercase letter (A-Z)' },
                          { key: 'lowercase', text: 'One lowercase letter (a-z)' },
                          { key: 'special', text: 'One special character (@, #, $, etc.)' }
                        ].map(({ key, text }) => (
                          <div key={key} className="flex items-center space-x-2">
                            {passwordRequirements[key as keyof typeof passwordRequirements] ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span className={`text-sm ${
                              passwordRequirements[key as keyof typeof passwordRequirements] 
                                ? "text-green-600" : "text-red-500"
                            }`}>
                              {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Lock size={16} className="mr-2 text-orange-500" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <X size={14} className="mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4">
                  <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all duration-300">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={agreed}
                          readOnly
                          onClick={() => setShowTermsModal(true)}
                          className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        {agreed && (
                          <Check className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-gray-800 group-hover:text-orange-800 transition-colors duration-200">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-orange-600 underline hover:text-orange-800 font-medium"
                          >
                            Terms & Conditions
                          </button>
                        </span>
                      </div>
                    </label>
                  </div>

                  {isSubmitted && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                      <p className="text-green-700 text-sm flex items-center">
                        <CheckCircle className="mr-2" size={16} />
                        Account will be verified within 24 hours
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      if (signupMethod === 'google') {
                        setStep(4);
                        return;
                      }
                      if (!isOtpVerified) {
                        setError('Please verify your OTP to continue.');
                        return;
                      }
                    }
                    if (step === 2) {
                      if (!extraData.state || !extraData.city || !extraData.dob) {
                        setError('Please fill in all required fields (State, City, and DOB).');
                        return;
                      }
                    }
                    if (step === 3) {
                      if (!extraData.selfDeclaration) {
                        setError('Please confirm your legal drinking age.');
                        return;
                      }
                    }
                    setError('');
                    setStep(step + 1);
                  }}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <span>Create Account</span>
                  <Check size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl animate-scaleIn">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You will be redirected to the login page shortly.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-center text-gray-800">Terms & Conditions</h2>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96 space-y-4 text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">1. Age Verification & Legal Drinking Age:</h3>
                  <p>The customer must confirm they are 21 years or older (Hard Liquor Prohibited) or 25 years or older (for All liquor) as per Maharashtra excise rules. Age verification via government ID (Aadhaar, PAN, Driving License, Passport) is mandatory before delivery.</p>
                  
                  <h3 className="font-semibold text-gray-800">2. Prohibition of Sale to Intoxicated Persons:</h3>
                  <p>Liquor will not be delivered to anyone who appears intoxicated at the time of delivery.</p>
                  
                  <h3 className="font-semibold text-gray-800">3. Prohibition of Sale in Dry Areas:</h3>
                  <p>Liquor cannot be sold or delivered in dry areas (where prohibition is enforced). The customer must confirm their delivery location is not in a dry zone.</p>
                  
                  <h3 className="font-semibold text-gray-800">4. Restricted Timings for Sale & Delivery:</h3>
                  <p>Liquor delivery is allowed only during permitted hours (typically 11 AM to 11 PM in most areas, subject to local regulations).</p>
                  
                  <h3 className="font-semibold text-gray-800">5. Quantity Restrictions:</h3>
                  <p>Customers cannot purchase beyond the permissible limit (e.g., 3 liters of IMFL or 9 liters of beer per person per transaction). Bulk purchases may require additional permits.</p>
                  
                  <h3 className="font-semibold text-gray-800">6. No Resale or Supply to Minors:</h3>
                  <p>The customer must agree not to resell liquor and not to supply it to minors (under 21/25).</p>
                  
                  <h3 className="font-semibold text-gray-800">7. Valid ID Proof Required at Delivery:</h3>
                  <p>The delivery agent will verify the customer's original ID at the time of delivery. If ID is not provided, the order will be cancelled.</p>
                  
                  <h3 className="font-semibold text-gray-800">8. No Returns or Refunds for Sealed Liquor Bottles:</h3>
                  <p>Once liquor is sold, returns or refunds are not permitted unless the product is damaged/spoiled (as per excise rules).</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-center text-amber-800 font-medium">
                    🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे ❤🍀
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setAgreed(true);
                    setError('');
                    setShowTermsModal(false);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  I Agree & Continue
                </button>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
          
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}

export default SignUp;
