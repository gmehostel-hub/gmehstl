import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Make sure we're using the correct AuthContext
import ProtectedRoute from './components/ProtectedRoute';

// Mobile Optimization Styles
import './styles/mobile-optimizations.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import LoginTest from './pages/LoginTest';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';

// Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import RoleBasedDashboard from './pages/RoleBasedDashboard';

// Admin Pages
import ManageRooms from './pages/admin/ManageRooms';
import ManageBooks from './pages/admin/ManageBooks';
import ManagePlacements from './pages/admin/StandalonePlacements';
import ManageFeedback from './pages/admin/StandaloneFeedback';

// Student Pages
import Profile from './pages/student/Profile';

// Standalone Student Pages (to prevent redirections)
import MyRoom from './pages/student/MyRoom';
import StandaloneFeedback from './pages/student/StandaloneFeedback';
import StandaloneLibrary from './pages/student/StandaloneLibrary';
import StandaloneMyPlacement from './pages/student/StandaloneMyPlacement';
import StandaloneMyBooks from './pages/student/StandaloneMyBooks';

// Warden Pages
import WardenRooms from './pages/warden/WardenRooms';
import WardenFeedback from './pages/warden/WardenFeedback';
import WardenLibrary from './pages/warden/WardenLibrary';
import WardenPlacements from './pages/warden/WardenPlacements';
import WardenDashboard from './pages/warden/WardenDashboard';

const App = React.memo(() => {
  const { isAuthenticated, loading } = useAuth();
  
  // Prevent rapid re-renders during loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Landing Page - Show only if not authenticated */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/my-room" replace /> : <LandingPage />
      } />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/my-room" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/my-room" replace /> : <Register />
        } />
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/my-room" replace /> : <ForgotPassword />
        } />
        <Route path="/verify-otp" element={
          isAuthenticated ? <Navigate to="/my-room" replace /> : <VerifyOtp />
        } />
        <Route path="/test" element={<LoginTest />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        {/* Dashboard - Require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes - Require authentication */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/rooms" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageRooms />
          </ProtectedRoute>
        } />
        <Route path="/admin/rooms/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageRooms />
          </ProtectedRoute>
        } />
        <Route path="/admin/books" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageBooks />
          </ProtectedRoute>
        } />

        {/* Admin Placements - Require authentication */}
        <Route path="/admin/placements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManagePlacements />
          </ProtectedRoute>
        } />
        <Route path="/admin/placements/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManagePlacements />
          </ProtectedRoute>
        } />
        {/* Admin Feedback - Require authentication */}
        <Route path="/admin/feedback" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageFeedback />
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageFeedback />
          </ProtectedRoute>
        } />
        
        {/* Student Routes - Require authentication */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/my-room" element={
          <ProtectedRoute>
            <MyRoom />
          </ProtectedRoute>
        } />
        <Route path="/my-room/*" element={
          <ProtectedRoute>
            <MyRoom />
          </ProtectedRoute>
        } />
        <Route path="/my-books" element={
          <ProtectedRoute>
            <StandaloneMyBooks />
          </ProtectedRoute>
        } />
        <Route path="/my-books/*" element={
          <ProtectedRoute>
            <StandaloneMyBooks />
          </ProtectedRoute>
        } />

        <Route path="/student/placements" element={
          <ProtectedRoute>
            <StandaloneMyPlacement />
          </ProtectedRoute>
        } />
        <Route path="/student/placements/*" element={
          <ProtectedRoute>
            <StandaloneMyPlacement />
          </ProtectedRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute>
            <StandaloneFeedback />
          </ProtectedRoute>
        } />
        <Route path="/feedback/*" element={
          <ProtectedRoute>
            <StandaloneFeedback />
          </ProtectedRoute>
        } />
        <Route path="/student/library" element={
          <ProtectedRoute>
            <StandaloneLibrary />
          </ProtectedRoute>
        } />
        <Route path="/student/library/*" element={
          <ProtectedRoute>
            <StandaloneLibrary />
          </ProtectedRoute>
        } />
        
        {/* Warden Routes - Require authentication */}
        <Route path="/warden/dashboard" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/warden/dashboard/*" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/warden/rooms" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenRooms />
          </ProtectedRoute>
        } />
        <Route path="/warden/feedback" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenFeedback />
          </ProtectedRoute>
        } />
        <Route path="/warden/library" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenLibrary />
          </ProtectedRoute>
        } />
        <Route path="/warden/placements" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenPlacements />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all - redirect to landing page for unauthenticated users */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/my-room" replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
});

export default App;