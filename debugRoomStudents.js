const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./backend/models/User');
const Room = require('./backend/models/Room');

async function debugRoomStudents() {
  try {
    console.log('🔍 Debugging Room-Student Assignments...\n');
    
    // Get all students
    const students = await User.find({ role: 'student' }).select('name email roomNumber room');
    console.log('📊 All Students in Database:');
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email}): roomNumber=${student.roomNumber}, room=${student.room}`);
    });
    
    console.log('\n🏠 Room 10 Analysis:');
    const room10Students = students.filter(student => 
      student.roomNumber === 10 || student.room === 10 || 
      (student.room && typeof student.room === 'object' && student.room.roomNumber === 10)
    );
    
    console.log(`Found ${room10Students.length} students assigned to Room 10:`);
    room10Students.forEach(student => {
      console.log(`  ✅ ${student.name} - ${student.email}`);
    });
    
    // Check Room 10 details
    const room10 = await Room.findOne({ roomNumber: 10 });
    if (room10) {
      console.log(`\n🏠 Room 10 Details:`);
      console.log(`  - Capacity: ${room10.capacity}`);
      console.log(`  - Current Occupancy: ${room10.currentOccupancy}`);
      console.log(`  - Purpose: ${room10.purpose}`);
    }
    
    // Check for data inconsistencies
    console.log('\n⚠️ Checking for Data Inconsistencies:');
    const studentsWithoutRoom = students.filter(s => !s.roomNumber && !s.room);
    console.log(`Students without room assignment: ${studentsWithoutRoom.length}`);
    
    const studentsWithRoom = students.filter(s => s.roomNumber || s.room);
    console.log(`Students with room assignment: ${studentsWithRoom.length}`);
    
    // Show room distribution
    console.log('\n📈 Room Distribution:');
    const roomCounts = {};
    students.forEach(student => {
      const room = student.roomNumber || student.room;
      if (room) {
        roomCounts[room] = (roomCounts[room] || 0) + 1;
      }
    });
    
    Object.keys(roomCounts).sort((a, b) => Number(a) - Number(b)).forEach(room => {
      console.log(`  Room ${room}: ${roomCounts[room]} students`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugRoomStudents();
