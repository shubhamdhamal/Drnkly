import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, Mail } from 'lucide-react';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle email input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handle OTP input (numeric only)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  // Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://vendor.peghouse.in/api/auth/send-registration-otp', { email });
      if (response.data.message === 'OTP sent to email successfully') {
        setSuccess('OTP sent successfully to your email address.');
        setStep('otp'); // Change the step to 'otp' to show the OTP verification form
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg === 'User not found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      console.error('OTP Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!otp || otp.length < 4) {
    setError('Please enter a valid OTP.');
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post('http://localhost:5000/api/auth/verify-registration-otp', { 
      email, 
      otp 
    });

    if (response.data.message === 'OTP verified successfully') {
      setSuccess('OTP verified successfully!');
      setStep('newPassword'); // Transition to 'newPassword' step
      console.log('Step after OTP verification:', 'newPassword'); // Log to verify the state change
    } else {
      setError(response.data.message || 'Invalid OTP. Please try again.');
    }
  } catch (error: any) {
    setError('Invalid OTP or verification failed. Please try again.');
    console.error('OTP Verification Error:', error);
  } finally {
    setIsLoading(false);
  }
};


  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(''); 

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all the fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        newPassword
      });

      if (response.data.message === 'Password updated successfully') {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      setError('Failed to reset password. Please try again.');
      console.error('Password Reset Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'newPassword') {
      setStep('otp');
    }
    setError('');
    setSuccess('');
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-registration-otp', { email });
      if (response.data.message === 'OTP sent to email successfully') {
        setSuccess('OTP resent successfully to your email address.');
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP Error:', error);
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold mt-4">Forgot Password</h1>
            <p className="text-gray-600 mt-2">
              {step === 'email' && 'Enter your email address to receive an OTP'}
              {step === 'otp' && 'Enter the OTP sent to your email address'}
              {step === 'newPassword' && 'Create a new password for your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-6 flex items-start space-x-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mx-8 mb-6 flex items-start space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
              <Check size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-[#cd6839]"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  <span>Back</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Verification
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Please check your email inbox and spam folder
                </p>
              </div>

              <button
                type="submit"
                className={`w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#cd6839] text-sm font-medium hover:underline"
                  disabled={isLoading}
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password Form */}
{step === 'newPassword' && (
  <form onSubmit={handleResetPassword} className="space-y-4">
    <div className="mb-4">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-[#cd6839]"
      >
        <ArrowLeft size={18} className="mr-1" />
        <span>Back</span>
      </button>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        New Password
      </label>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
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

    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password
      </label>
      <input
        type={showConfirmPassword ? "text" : "password"}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#cd6839]"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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

    <button
      type="submit"
      className={`w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading}
    >
      {isLoading ? 'Resetting Password...' : 'Reset Password'}
    </button>
  </form>
)}


          <p className="mt-6 text-center">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#cd6839] font-semibold hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
