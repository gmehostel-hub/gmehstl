import React, { useState, useEffect } from 'react';

const ISTClock = ({ className = '', showDate = true, showSeconds = true }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time in IST (Indian Standard Time)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined
    });
  };

  // Format date in IST
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <i className="fas fa-clock text-primary-600"></i>
        <div>
          <div className="text-lg font-bold text-gray-900">
            {formatTime(currentTime)}
          </div>
          {showDate && (
            <div className="text-sm text-gray-600">
              {formatDate(currentTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ISTClock;
