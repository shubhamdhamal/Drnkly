import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, Mail, Lock, Phone, Send, Shield, ChevronRight } from 'lucide-react';

function App() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => /^[0-9]*$/.test(e.target.value) && setOtp(e.target.value);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-forgot-otp', { email });
      setSuccess(res.data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP.');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-forgot-otp', { email, otp });
      setSuccess(res.data.message);
      setResetToken(res.data.token);
      setStep('newPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!mobile || !newPassword || !confirmPassword) return setError('All fields are required');
    if (mobile.length !== 10) return setError('Mobile must be 10 digits.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        mobile,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${resetToken}` }
      });
      setSuccess(res.data.message);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleBack = () => {
    setError(''); setSuccess('');
    setStep(step === 'newPassword' ? 'otp' : 'email');
  };

  const handleResendOTP = async () => {
    setError(''); setSuccess('');
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/send-forgot-otp', { email });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally { 
      setIsLoading(false); 
    }
  };

  const stepProgress = {
    email: 33,
    otp: 66,
    newPassword: 100
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-red-200/40 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'otp' && 'Check your email for the verification code'}
              {step === 'newPassword' && 'Create your new secure password'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span className={step === 'email' ? 'text-orange-600 font-medium' : ''}>Email</span>
              <span className={step === 'otp' ? 'text-orange-600 font-medium' : ''}>Verify</span>
              <span className={step === 'newPassword' ? 'text-orange-600 font-medium' : ''}>Password</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stepProgress[step]}%` }}
              ></div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:shadow-3xl">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start space-x-3 bg-red-50/80 backdrop-blur-sm text-red-700 px-5 py-4 rounded-2xl border border-red-100 animate-shake">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 flex items-start space-x-3 bg-green-50/80 backdrop-blur-sm text-green-700 px-5 py-4 rounded-2xl border border-green-100 animate-bounce">
                <Check size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail size={20} className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-700 font-medium"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Verification Code</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium mb-4"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back to Email
                </button>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200 text-center text-2xl font-bold tracking-widest text-gray-700"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      <span>Verify Code</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={handleResendOTP} 
                    disabled={isLoading}
                    className="text-orange-600 text-sm font-semibold hover:text-orange-700 hover:underline transition-all duration-200 disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            )}

            {/* New Password Step */}
            {step === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium mb-4"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back to Verification
                </button>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <Phone size={20} className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => /^\d{0,10}$/.test(e.target.value) && setMobile(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-700 font-medium"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock size={20} className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-700 font-medium"
                      placeholder="Create new password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock size={20} className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-700 font-medium"
                      placeholder="Confirm new password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <button 
                onClick={() => window.location.reload()} 
                className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-all duration-200"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default App;
