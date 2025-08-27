import axios from 'axios';
import { secureStorage } from './securityUtils';

// Create axios instance with base configuration
const api = axios.create({
  // Remove baseURL to use React's proxy configuration
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors or non-JSON responses
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Backend server is not running or not accessible');
      error.message = 'Unable to connect to server. Please ensure the backend is running.';
      return Promise.reject(error);
    }

    // Handle cases where response is HTML instead of JSON (proxy errors)
    if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<html>')) {
      console.error('Received HTML response instead of JSON - likely a proxy or routing error');
      error.message = 'Server returned an unexpected response. Please check your connection.';
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      secureStorage.clearToken();
      window.location.href = '/login';
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      error.message = 'Server error occurred. Please try again later.';
    }

    // Handle client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error('Client error:', error.response.status, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
