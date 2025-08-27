const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const adminCredentials = {
  email: 'admin@hostel.com',
  password: 'Admin@123'
};

async function testRoomStudents() {
  try {
    console.log('🧪 Testing Room-Specific Student Filtering...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get all rooms to see available room numbers
    console.log('2️⃣ Fetching all rooms...');
    const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rooms = roomsResponse.data.data || [];
    console.log(`✅ Found ${rooms.length} rooms`);
    
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found. Please add some rooms first.');
      return;
    }

    // Step 3: Test room-specific student filtering for each room
    console.log('\n3️⃣ Testing room-specific student filtering...\n');
    
    for (const room of rooms.slice(0, 3)) { // Test first 3 rooms
      const roomNumber = room.roomNumber;
      console.log(`🏠 Testing Room ${roomNumber}:`);
      
      try {
        // Test the room-specific student API
        const studentsResponse = await axios.get(`${API_BASE_URL}/users?role=student&roomNumber=${roomNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const roomStudents = studentsResponse.data.data || [];
        console.log(`   📊 Room ${roomNumber} has ${roomStudents.length} students`);
        
        if (roomStudents.length > 0) {
          console.log(`   👥 Students in Room ${roomNumber}:`);
          roomStudents.forEach((student, index) => {
            console.log(`      ${index + 1}. ${student.name} (${student.email}) - SWD: ${student.studentId || 'N/A'}`);
          });
        } else {
          console.log(`   🏠 Room ${roomNumber} is empty`);
        }
        
        // Verify that all returned students are actually assigned to this room
        const incorrectStudents = roomStudents.filter(student => {
          const studentRoom = student.roomNumber || student.room;
          return !studentRoom || Number(studentRoom) !== Number(roomNumber);
        });
        
        if (incorrectStudents.length > 0) {
          console.log(`   ❌ ERROR: Found ${incorrectStudents.length} students incorrectly assigned to Room ${roomNumber}:`);
          incorrectStudents.forEach(student => {
            console.log(`      - ${student.name} (assigned to room: ${student.roomNumber || student.room || 'UNASSIGNED'})`);
          });
        } else {
          console.log(`   ✅ All students correctly assigned to Room ${roomNumber}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error fetching students for Room ${roomNumber}:`, error.response?.data?.message || error.message);
      }
      
      console.log(''); // Empty line for readability
    }

    // Step 4: Test with a non-existent room
    console.log('4️⃣ Testing with non-existent room (999)...');
    try {
      const nonExistentResponse = await axios.get(`${API_BASE_URL}/users?role=student&roomNumber=999`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const nonExistentStudents = nonExistentResponse.data.data || [];
      console.log(`   📊 Non-existent room 999 has ${nonExistentStudents.length} students (should be 0)`);
      
      if (nonExistentStudents.length === 0) {
        console.log('   ✅ Correctly returned 0 students for non-existent room');
      } else {
        console.log('   ❌ ERROR: Returned students for non-existent room');
      }
    } catch (error) {
      console.log(`   ❌ Error testing non-existent room:`, error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Room-specific student filtering test completed!');
    console.log('\n📋 Summary:');
    console.log('- The API endpoint `/api/users?role=student&roomNumber=X` should return only students assigned to room X');
    console.log('- When you click "View Details" for a room in the admin panel, it will use this endpoint');
    console.log('- This ensures that only students assigned to that specific room are shown');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testRoomStudents(); 