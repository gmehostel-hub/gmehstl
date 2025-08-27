import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
          setLoading(false);
          return;
        }

        // Verify token with backend
        const { data } = await api.get('/api/auth/me');

        if (data) {
          if (data && data.success && data.data) {
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid response');
          }
        } else {
          throw new Error('Token invalid');
        }
      } catch (err) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });

      if (data && data.success) {
        const { token, user } = data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return {
          success: false,
          message: data?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Network error. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
