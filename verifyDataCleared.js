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

async function verifyDataCleared() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🔍 VERIFYING DATABASE STATE...\n');
    
    // Check students
    const students = await User.find({ role: 'student' });
    console.log(`📊 Current Students in Database: ${students.length}`);
    
    if (students.length > 0) {
      console.log('⚠️ STUDENTS STILL EXIST:');
      students.forEach(s => {
        console.log(`  - ${s.name} (${s.studentId}) -> Room ${s.roomNumber || s.room || 'None'}`);
      });
    } else {
      console.log('✅ No students found in database');
    }
    
    // Check rooms
    const rooms = await Room.find({});
    console.log(`\n🏠 Current Rooms in Database: ${rooms.length}`);
    
    const occupiedRooms = rooms.filter(r => r.currentOccupancy > 0);
    console.log(`📊 Occupied Rooms: ${occupiedRooms.length}`);
    console.log(`📊 Empty Rooms: ${rooms.length - occupiedRooms.length}`);
    
    if (occupiedRooms.length > 0) {
      console.log('\n⚠️ ROOMS WITH NON-ZERO OCCUPANCY:');
      occupiedRooms.forEach(r => {
        console.log(`  - Room ${r.roomNumber}: ${r.currentOccupancy}/${r.capacity}`);
      });
    } else {
      console.log('\n✅ All rooms have 0 occupancy');
    }
    
    // Check all users (including non-students)
    const allUsers = await User.find({});
    console.log(`\n👥 Total Users in Database: ${allUsers.length}`);
    
    const usersByRole = {};
    allUsers.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });
    
    console.log('👥 Users by Role:');
    Object.keys(usersByRole).forEach(role => {
      console.log(`  - ${role}: ${usersByRole[role]}`);
    });
    
    console.log('\n🔍 VERIFICATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

verifyDataCleared();
