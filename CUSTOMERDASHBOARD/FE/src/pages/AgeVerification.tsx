import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, AlertCircle, Info, Wine, ShieldAlert } from 'lucide-react';

function AgeVerification() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [error, setError] = useState('');
  const [showAgeError, setShowAgeError] = useState(false);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDateOfBirth(selectedDate);
    setError('');
    setShowAgeError(false);

    if (selectedDate) {
      const age = calculateAge(selectedDate);
      if (age < 25) {
        setShowAgeError(true);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleVerify = () => {
    if (!dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 25) {
      setShowAgeError(true);
      return;
    }

    if (!selectedFile) {
      setError('Please upload your ID document');
      return;
    }

    navigate('/signup');
  };

  // Calculate max date (25 years ago from today)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 25);
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gray-100"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float ${6 + i}s ease-in-out infinite`,
              opacity: 0.4 - i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm px-4 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <Wine className="text-gray-800 mr-2" size={24} />
          <h1 className="text-xl font-semibold">Age Verification</h1>
        </div>
      </div>

      <div 
        className="max-w-md mx-auto px-4 py-8 space-y-6"
        style={{
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        {/* Info Card */}
        <div 
          className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg transform hover:scale-[1.02] transition-all"
          style={{
            animation: 'slideUp 0.5s ease-out 0.1s both'
          }}
        >
          <div className="flex items-start">
            <ShieldAlert className="text-blue-600 shrink-0 mt-1 mr-3" size={24} />
            <div>
              <p className="text-gray-700 mb-2">
                You must be at least 25 years old to access this service.
              </p>
              <p className="text-sm text-gray-500">
                Please verify your age by providing your date of birth and a valid government-issued ID.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {(error || showAgeError) && (
          <div 
            className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <AlertCircle className="shrink-0 mr-3 mt-0.5" size={20} />
            <p className="text-sm">
              {showAgeError 
                ? "You must be at least 25 years old to use this service."
                : error}
            </p>
          </div>
        )}

        {/* Date of Birth Input */}
        <div 
          className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg"
          style={{
            animation: 'slideUp 0.5s ease-out 0.2s both'
          }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={handleDateChange}
            max={getMaxDate()}
            className={`w-full px-4 py-3 rounded-xl border transition-all
              ${showAgeError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
          />
          {showAgeError && (
            <p className="mt-2 text-sm text-red-600">
              You must be at least 25 years old to continue.
            </p>
          )}
        </div>

        {/* File Upload */}
        <div 
          className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg"
          style={{
            animation: 'slideUp 0.5s ease-out 0.3s both'
          }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Government ID Upload
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex flex-col items-center">
                <Upload 
                  className="text-gray-400 group-hover:text-blue-500 transition-colors mb-3" 
                  size={32}
                  style={{
                    animation: 'float 3s ease-in-out infinite'
                  }}
                />
                <p className="text-sm font-medium text-gray-700">Click to upload ID</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max. 5MB)</p>
              </div>
            </button>
          ) : (
            <div className="bg-blue-50/50 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Upload className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-red-100 rounded-full transition-colors group"
              >
                <X size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* ID Requirements */}
        <div 
          className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg"
          style={{
            animation: 'slideUp 0.5s ease-out 0.4s both'
          }}
        >
          <button
            onClick={() => setShowRequirements(!showRequirements)}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            {showRequirements ? 'Hide' : 'Show'} ID requirements
          </button>

          {showRequirements && (
            <div 
              className="mt-4 space-y-4"
              style={{
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              <h3 className="font-medium">Acceptable ID Documents:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {[ 'Aadhar Card','Pan Card','Driving License'].map((id, index) => (
                  <li 
                    key={id}
                    className="flex items-center"
                    style={{
                      animation: `slideRight 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    {id}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600">
                Make sure your ID is valid and not expired. The photo must be clear and all information must be legible.
              </p>
            </div>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={showAgeError}
          className={`w-full py-4 rounded-xl font-semibold transform transition-all shadow-lg
            ${showAgeError
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] hover:shadow-xl'}`}
          style={{
            animation: 'slideUp 0.5s ease-out 0.5s both'
          }}
        >
          Verify Age
        </button>

        <p 
          className="text-center"
          style={{
            animation: 'slideUp 0.5s ease-out 0.6s both'
          }}
        >
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-all"
          >
            Already verified? Proceed to the app
          </button>
        </p>
      </div>
      {/* 🚨 Simple Health Warning */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-2 z-50">
        <p className="text-center text-red-500 text-sm font-bold">
        🚭 मद्यपान या धूम्रपान सेहत के लिए हानिकारक है 🔞🚫
        </p>
      </div>
   
    </div>
  );
}

export default AgeVerification;