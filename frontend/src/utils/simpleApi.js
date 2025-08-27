import axios from 'axios';

// Create a simple API client without redirects
const simpleApi = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
simpleApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid dependency issues
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor that DOES NOT redirect
simpleApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error but don't redirect
    console.error('API response error:', error);
    
    // Return a rejected promise with the error
    return Promise.reject(error);
  }
);

export default simpleApi;