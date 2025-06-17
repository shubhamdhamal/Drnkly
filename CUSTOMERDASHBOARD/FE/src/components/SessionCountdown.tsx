import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Move } from 'lucide-react';
import { sessionManager } from '../utils/sessionManager';

const SessionCountdown: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const [isWarning, setIsWarning] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const countdownRef = useRef<HTMLDivElement>(null);

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

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('sessionCountdownPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Error loading countdown position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = (newPosition: { x: number, y: number }) => {
    localStorage.setItem('sessionCountdownPosition', JSON.stringify(newPosition));
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (countdownRef.current) {
      const rect = countdownRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && countdownRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport bounds
      const maxX = window.innerWidth - (countdownRef.current.offsetWidth || 200);
      const maxY = window.innerHeight - (countdownRef.current.offsetHeight || 60);
      
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));
      
      const newPosition = { x: constrainedX, y: constrainedY };
      setPosition(newPosition);
      savePosition(newPosition);
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Don't show if no session
  if (!sessionManager.isSessionValid()) {
    return null;
  }

  return (
    <div 
      ref={countdownRef}
      className={`fixed z-50 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 cursor-move select-none ${
        isWarning 
          ? 'bg-red-100 border border-red-300 text-red-700' 
          : 'bg-blue-100 border border-blue-300 text-blue-700'
      } ${isDragging ? 'shadow-2xl scale-105' : 'hover:shadow-xl'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <Move size={12} className="text-gray-500 opacity-50" />
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