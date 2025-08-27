const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  branch: String,
  college: String,
  year: Number,
  phoneNumber: String,
  roomNumber: Number,
  room: Number,
  role: { type: String, default: 'student' },
  password: String
});

const User = mongoose.model('User', userSchema);

// Room schema
const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  capacity: Number,
  currentOccupancy: { type: Number, default: 0 },
  purpose: String,
  specialPurpose: Boolean
});

const Room = mongoose.model('Room', roomSchema);

async function checkRoom10Data() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🔍 CHECKING ROOM 10 DATA...\n');
    
    // Check Room 10 details
    const room10 = await Room.findOne({ roomNumber: 10 });
    console.log('🏠 Room 10 Details:');
    if (room10) {
      console.log(`   Room Number: ${room10.roomNumber}`);
      console.log(`   Capacity: ${room10.capacity}`);
      console.log(`   Current Occupancy: ${room10.currentOccupancy}`);
      console.log(`   Purpose: ${room10.purpose}`);
    } else {
      console.log('   Room 10 not found in database!');
    }
    
    // Check all students assigned to Room 10
    console.log('\n👥 Students assigned to Room 10:');
    
    // Check by roomNumber field
    const studentsByRoomNumber = await User.find({ 
      role: 'student', 
      roomNumber: 10 
    });
    console.log(`\n📊 Students with roomNumber = 10: ${studentsByRoomNumber.length}`);
    studentsByRoomNumber.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.email})`);
      console.log(`      roomNumber: ${student.roomNumber}`);
      console.log(`      room: ${student.room}`);
      console.log(`      studentId: ${student.studentId}`);
      console.log('');
    });
    
    // Check by room field
    const studentsByRoom = await User.find({ 
      role: 'student', 
      room: 10 
    });
    console.log(`📊 Students with room = 10: ${studentsByRoom.length}`);
    studentsByRoom.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.email})`);
      console.log(`      roomNumber: ${student.roomNumber}`);
      console.log(`      room: ${student.room}`);
      console.log(`      studentId: ${student.studentId}`);
      console.log('');
    });
    
    // Check combined (either roomNumber OR room = 10)
    const allRoom10Students = await User.find({ 
      role: 'student', 
      $or: [
        { roomNumber: 10 },
        { room: 10 }
      ]
    });
    console.log(`📊 All students in Room 10 (roomNumber OR room = 10): ${allRoom10Students.length}`);
    allRoom10Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.email})`);
      console.log(`      roomNumber: ${student.roomNumber}`);
      console.log(`      room: ${student.room}`);
      console.log(`      studentId: ${student.studentId}`);
      console.log(`      year: ${student.year}`);
      console.log(`      college: ${student.college}`);
      console.log('');
    });
    
    // Check if there are students with similar names
    console.log('\n🔍 Checking for students with names containing "jack" or "ranga":');
    const jackStudents = await User.find({ 
      role: 'student',
      name: { $regex: /jack/i }
    });
    const rangaStudents = await User.find({ 
      role: 'student',
      name: { $regex: /ranga/i }
    });
    
    console.log(`Students with "jack" in name: ${jackStudents.length}`);
    jackStudents.forEach(student => {
      console.log(`   - ${student.name} -> Room ${student.roomNumber || student.room || 'None'}`);
    });
    
    console.log(`Students with "ranga" in name: ${rangaStudents.length}`);
    rangaStudents.forEach(student => {
      console.log(`   - ${student.name} -> Room ${student.roomNumber || student.room || 'None'}`);
    });
    
    console.log('\n✅ Room 10 data check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

checkRoom10Data();
