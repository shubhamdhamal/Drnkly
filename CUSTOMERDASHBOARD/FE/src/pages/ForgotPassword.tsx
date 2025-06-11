import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, Mail } from 'lucide-react';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
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
      const res = await axios.post('https://peghouse.in/api/auth/send-forgot-otp', { email });
      res.data.success ? (setSuccess('OTP sent successfully.'), setStep('otp')) : setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP.');
    setIsLoading(true);
    try {
      const res = await axios.post('https://peghouse.in/api/auth/verify-forgot-otp', { email, otp });
      if (res.data.success) {
        setSuccess('OTP verified successfully!');
        setResetToken(res.data.token);
        setStep('newPassword');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!mobile || !newPassword || !confirmPassword) return setError('All fields are required');
    if (mobile.length !== 10) return setError('Mobile must be 10 digits.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (!resetToken) return setError('Unauthorized attempt. Please verify OTP again.');
    setIsLoading(true);
    try {
      const res = await axios.post(
        'https://peghouse.in/api/auth/reset-password',
        { email, mobile, newPassword },
        { headers: { Authorization: `Bearer ${resetToken}` } }
      );
      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally { setIsLoading(false); }
  };

  const handleBack = () => {
    setError(''); setSuccess('');
    setStep(step === 'newPassword' ? 'otp' : 'email');
  };

  const handleResendOTP = async () => {
    setError(''); setSuccess('');
    setIsLoading(true);
    try {
      const res = await axios.post('https://peghouse.in/api/auth/send-forgot-otp', { email });
      res.data.success ? setSuccess('OTP resent successfully.') : setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/finallogo.png" alt="Logo" className="h-24 mx-auto object-contain" />
          <h1 className="text-2xl font-bold mt-4">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Enter your email address to receive an OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'newPassword' && 'Create a new password for your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
            <Check size={20} />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <button type="submit" className="w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31]" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button type="button" onClick={handleBack} className="flex items-center text-gray-600">
              <ArrowLeft size={18} className="mr-1" /> Back
            </button>
            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="Enter OTP"
            />
            <button type="submit" className="w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31]" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center">
              <button type="button" onClick={handleResendOTP} className="text-[#cd6839] text-sm font-medium hover:underline" disabled={isLoading}>
                Didn't receive OTP? Resend
              </button>
            </div>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <button type="button" onClick={handleBack} className="flex items-center text-gray-600">
              <ArrowLeft size={18} className="mr-1" /> Back
            </button>

            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => /^\d{0,10}$/.test(e.target.value) && setMobile(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="10-digit mobile number"
            />

            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200"
                placeholder="New password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200"
                placeholder="Confirm password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="w-full bg-[#cd6839] text-white py-3 rounded-xl font-semibold hover:bg-[#b55a31]" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          Remember your password?{' '}
          <button onClick={() => navigate('/login')} className="text-[#cd6839] font-semibold hover:underline">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
