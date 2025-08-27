import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Stable auth check function
  const checkAuthStatus = useCallback(async () => {
    if (initialized) return; // Prevent multiple calls
    
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token || !savedUser) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Parse saved user data
      let userData;
      try {
        userData = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Use saved user data immediately to prevent flickering
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      setInitialized(true);
      
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, initialized]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data?.success) {
        const { token, user } = data;
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);

        return { success: true, user };
      }

      return {
        success: false,
        message: data?.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Network error. Please try again.',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  }), [user, isAuthenticated, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};