import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Please wait while we verify your authentication...</p>
    </div>
  );
};

export default LoadingSpinner;
