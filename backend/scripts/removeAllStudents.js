const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Function to login and get token
async function loginAsAdmin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',  // Replace with actual admin email
      password: 'password123'      // Replace with actual admin password
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to remove all students from rooms
async function removeAllStudentsFromRooms(token) {
  try {
    const response = await axios.delete('http://localhost:5000/api/rooms/remove-all-students', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    
    console.log('Removing all students from rooms...');
    await removeAllStudentsFromRooms(token);
    
    console.log('Operation completed successfully!');
  } catch (error) {
    console.error('Script failed:', error.message);
  }
}

// Run the script
main();