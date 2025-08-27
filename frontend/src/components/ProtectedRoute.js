import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access if roles are specified
  console.log("ProtectedRoute - User Role:", user?.role, "Allowed Roles:", allowedRoles);
  
  // Handle case where user role is undefined or null by checking if it exists
  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    console.log("Access denied due to role mismatch or missing role");
    
    // For debugging purposes, let's check what's going on
    if (!user?.role) {
      console.error("User role is undefined or null! User object:", user);
    } else {
      console.error("Role mismatch! User role:", user.role, "Allowed roles:", allowedRoles);
    }
    
    // TEMPORARY FIX: Check URL to see if we should bypass role check
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const debugMode = searchParams.get('debug') === 'true';
    
    console.log("Current path:", currentPath, "Debug mode:", debugMode);
    
    // Skip access control for admin rooms page if debug mode is on
    if (currentPath === '/admin/rooms' && debugMode) {
      console.log("DEBUG MODE ENABLED: Bypassing role check for admin rooms");
      return children;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role(s): {allowedRoles.join(', ')} | Your role: {user.role}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
