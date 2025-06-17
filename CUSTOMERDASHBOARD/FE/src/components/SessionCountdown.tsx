import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { sessionManager } from '../utils/sessionManager';

const SessionCountdown: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const time = sessionManager.getFormattedRemainingTime();
      setRemainingTime(time);
      
      // Show warning when less than 5 minutes remaining
      const remainingMs = sessionManager.getRemainingTime();
      setIsWarning(remainingMs < 5 * 60 * 1000 && remainingMs > 0);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show if no session
  if (!sessionManager.isSessionValid()) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isWarning 
        ? 'bg-red-100 border border-red-300 text-red-700' 
        : 'bg-blue-100 border border-blue-300 text-blue-700'
    }`}>
      {isWarning ? (
        <AlertTriangle size={16} className="animate-pulse" />
      ) : (
        <Clock size={16} />
      )}
      <span className="text-sm font-mono font-semibold">
        {remainingTime}
      </span>
    </div>
  );
};

export default SessionCountdown; 