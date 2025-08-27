// Authentication helper utility
export const checkAuthToken = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    console.warn('No authentication token or user data found');
    return false;
  }
  
  try {
    // Parse user data to check if it's valid
    const userData = JSON.parse(user);
    if (!userData.role || !userData.email) {
      console.warn('Invalid user data structure');
      return false;
    }
    
    // Check if token looks like a JWT (basic format check)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Token does not appear to be a valid JWT');
      return false;
    }
    
    console.log('Authentication token validation passed');
    return true;
  } catch (error) {
    console.error('Error validating authentication:', error);
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Authentication data cleared');
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const isAdmin = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
