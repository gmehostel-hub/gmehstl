const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./backend/models/User');
const Room = require('./backend/models/Room');

async function debugStudentRoomAssignments() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get all students
    console.log('📊 STUDENT ROOM ASSIGNMENTS:');
    console.log('=' .repeat(50));
    
    const students = await User.find({ role: 'student' }).select('name email roomNumber room');
    
    console.log(`Total students found: ${students.length}\n`);
    
    // Group students by room
    const roomGroups = {};
    const unassignedStudents = [];
    
    students.forEach(student => {
      const roomNum = student.roomNumber || student.room;
      if (roomNum) {
        if (!roomGroups[roomNum]) {
          roomGroups[roomNum] = [];
        }
        roomGroups[roomNum].push(student);
      } else {
        unassignedStudents.push(student);
      }
    });
    
    // Display room assignments
    console.log('🏠 ROOM-WISE STUDENT DISTRIBUTION:');
    console.log('-'.repeat(40));
    
    Object.keys(roomGroups).sort((a, b) => Number(a) - Number(b)).forEach(roomNum => {
      console.log(`\n📍 Room ${roomNum} (${roomGroups[roomNum].length} students):`);
      roomGroups[roomNum].forEach(student => {
        console.log(`  - ${student.name} (${student.email})`);
        console.log(`    roomNumber: ${student.roomNumber}, room: ${student.room}`);
      });
    });
    
    if (unassignedStudents.length > 0) {
      console.log(`\n❌ UNASSIGNED STUDENTS (${unassignedStudents.length}):`);
      unassignedStudents.forEach(student => {
        console.log(`  - ${student.name} (${student.email})`);
      });
    }
    
    // Check specific rooms mentioned in the issue
    console.log('\n🎯 SPECIFIC ROOM ANALYSIS:');
    console.log('-'.repeat(30));
    
    [10, 5, 12].forEach(roomNum => {
      const studentsInRoom = students.filter(s => 
        Number(s.roomNumber) === roomNum || Number(s.room) === roomNum
      );
      console.log(`\nRoom ${roomNum}: ${studentsInRoom.length} students`);
      studentsInRoom.forEach(s => {
        console.log(`  ✅ ${s.name} - roomNumber: ${s.roomNumber}, room: ${s.room}`);
      });
    });
    
    // Check room occupancy vs actual assignments
    console.log('\n🔍 ROOM OCCUPANCY VS ACTUAL ASSIGNMENTS:');
    console.log('-'.repeat(45));
    
    const rooms = await Room.find({}).select('roomNumber currentOccupancy capacity');
    
    for (const room of rooms) {
      const actualStudents = students.filter(s => 
        Number(s.roomNumber) === room.roomNumber || Number(s.room) === room.roomNumber
      );
      
      const mismatch = room.currentOccupancy !== actualStudents.length;
      
      console.log(`Room ${room.roomNumber}: Occupancy=${room.currentOccupancy}, Actual=${actualStudents.length} ${mismatch ? '⚠️ MISMATCH' : '✅'}`);
      
      if (mismatch && actualStudents.length > 0) {
        console.log(`  Actual students: ${actualStudents.map(s => s.name).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

debugStudentRoomAssignments();
