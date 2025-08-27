import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import WardenDashboard from './warden/WardenDashboard';
import { Navigate } from 'react-router-dom';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Show appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'warden') {
    return <WardenDashboard />;
  } else {
    // For students and any other roles, redirect to /my-room
    return <Navigate to="/my-room" replace />;
  }
};

export default RoleBasedDashboard;