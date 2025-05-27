import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  // Track the current step in the password reset process
  const [step, setStep] = useState<number>(1);
  
  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    mobile: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Validate email format
  const isEmailValid = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate OTP (6 digits)
  const isOtpValid = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  };

  // Send OTP to email
  const handleSendOtp = async () => {
    const { email } = formData;
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!isEmailValid(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call for sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpSent(true);
      setSuccess(`OTP sent to ${email}`);
      setTimer(60);
      setStep(2);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const { otp } = formData;
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    if (!isOtpValid(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call for verifying OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('OTP verified successfully');
      setStep(3);
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    const { mobile, newPassword, confirmPassword } = formData;
    
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call for resetting password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Password reset successfully! You can now login with your new password.');
      // Reset form
      setFormData({
        email: '',
        otp: '',
        mobile: '',
        newPassword: '',
        confirmPassword: '',
      });
      setStep(1);
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timer for OTP resend
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Render step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
              <p className="text-gray-600 mt-2">Enter your email to receive a verification code</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send OTP <ArrowRight size={18} className="ml-1" />
                  </span>
                )}
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-gray-600 mt-2">
                Enter the 6-digit code sent to <span className="font-medium">{formData.email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter 6-digit OTP"
                />
                
                <div className="mt-2 flex justify-between items-center text-sm">
                  <button
                    onClick={handleSendOtp}
                    disabled={timer > 0 || loading}
                    className={`text-orange-500 hover:text-orange-600 focus:outline-none ${
                      timer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </button>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    Change Email
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !formData.otp}
                className={`w-full py-2 px-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center ${
                  loading || !formData.otp
                    ? 'bg-orange-300 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Verify OTP <ArrowRight size={18} className="ml-1" />
                  </span>
                )}
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Create New Password</h2>
              <p className="text-gray-600 mt-2">Enter your mobile number and new password</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your mobile number"
                />
              </div>
              
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          {/* Progress steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    step === stepNumber
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : step > stepNumber
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle size={16} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    step === stepNumber
                      ? 'text-orange-500 font-medium'
                      : step > stepNumber
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                >
                  {stepNumber === 1
                    ? 'Email'
                    : stepNumber === 2
                    ? 'Verify'
                    : 'Reset'}
                </span>
              </div>
            ))}
          </div>

          {/* Error and success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600 flex items-center">
              <CheckCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Step content */}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;