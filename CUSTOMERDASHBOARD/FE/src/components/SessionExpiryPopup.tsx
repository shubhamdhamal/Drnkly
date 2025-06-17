import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Clock } from 'lucide-react';
import { SESSION_EXPIRED_EVENT } from '../utils/sessionManager';
import { sessionManager } from '../utils/sessionManager';

const SessionExpiryPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsVisible(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  // Update countdown when popup is visible
  useEffect(() => {
    if (!isVisible) return;

    const updateCountdown = () => {
      const time = sessionManager.getFormattedRemainingTime();
      setRemainingTime(time);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleOk = () => {
    setIsVisible(false);
    navigate('/login');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Session Expired</h2>
          </div>
          <button
            onClick={handleOk}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Session Time Remaining:</span>
            <span className="font-mono font-bold text-lg">{remainingTime}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Your session has expired due to inactivity. Please log in again to continue using the application.
        </p>

        <button
          onClick={handleOk}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SessionExpiryPopup; 