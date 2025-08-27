const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

const checkRoomAssignments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('='.repeat(50));

    // Check rooms with students
    const rooms = await Room.find({}).populate('students', 'name email roomNumber studentId');
    
    console.log('📋 ROOMS WITH STUDENT ASSIGNMENTS:');
    console.log('='.repeat(50));
    
    let totalAssignedStudents = 0;
    rooms.forEach(room => {
      if (room.students.length > 0) {
        console.log(`\n🏠 Room ${room.roomNumber} (${room.purpose}):`);
        console.log(`   Capacity: ${room.capacity}, Current: ${room.currentOccupancy}`);
        console.log(`   Students (${room.students.length}):`);
        room.students.forEach(student => {
          console.log(`     - ${student.name} (${student.email})`);
          console.log(`       Student ID: ${student.studentId || 'Not assigned'}`);
          console.log(`       Room in User record: ${student.roomNumber || 'Not set'}`);
        });
        totalAssignedStudents += room.students.length;
      }
    });

    if (totalAssignedStudents === 0) {
      console.log('❌ No students are currently assigned to any rooms');
    }

    // Check students and their room assignments
    console.log('\n' + '='.repeat(50));
    console.log('👥 ALL STUDENTS AND THEIR ROOM ASSIGNMENTS:');
    console.log('='.repeat(50));
    
    const students = await User.find({ role: 'student' }, 'name email roomNumber studentId');
    
    students.forEach(student => {
      console.log(`\n👤 ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Student ID: ${student.studentId || 'Not assigned'}`);
      console.log(`   Room Number: ${student.roomNumber || '❌ Not assigned'}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   Total Students: ${students.length}`);
    console.log(`   Students with Room Assignments: ${students.filter(s => s.roomNumber).length}`);
    console.log(`   Students without Room Assignments: ${students.filter(s => !s.roomNumber).length}`);
    console.log(`   Total Rooms with Students: ${rooms.filter(r => r.students.length > 0).length}`);

  } catch (error) {
    console.error('❌ Error checking room assignments:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
checkRoomAssignments();
