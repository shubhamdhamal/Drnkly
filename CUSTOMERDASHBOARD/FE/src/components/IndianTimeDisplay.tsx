
import React, { useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

const IndianTimeDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const indianTime = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(now);
        setCurrentTime(indianTime);
      } catch (error) {
        console.error('Time update error:', error);
        setCurrentTime('Error');
      }
    };

    updateTime(); // Update immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 120; // Smaller component width
      const maxY = window.innerHeight - 60; // Smaller component height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  return (
    <div
      className="fixed z-50 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-xl p-2 min-w-[100px] border border-white/20">
        <div className="text-center">
          <div className="text-xs font-medium mb-1 opacity-90">IST Time</div>
          <div className="text-sm font-bold font-mono tracking-wide">
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndianTimeDisplay; 
