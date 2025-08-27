import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import StudentDashboard from './student/StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based dashboard rendering
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'warden':
      return <Navigate to="/warden/rooms" replace />;
    case 'student':
      return <Navigate to="/my-room" replace />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">Invalid user role</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
