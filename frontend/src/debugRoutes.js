// Debug script for route testing
// This can be imported temporarily in the App.js to test route functionality

export const debugRoutes = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log("=== DEBUG ROUTES ===");
  console.log("Token exists:", !!token);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("User data:", userData);
      console.log("User role:", userData.role);
      
      // Check if user has admin role
      console.log("Is admin:", userData.role === 'admin');
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  } else {
    console.log("No user data found");
  }
  
  return true;
};