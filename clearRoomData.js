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

async function clearRoomData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🗑️ CLEARING ALL ROOM-RELATED STUDENT DATA...\n');
    
    // Get current statistics before clearing
    const studentsBeforeClear = await User.find({ role: 'student' });
    const roomsBeforeClear = await Room.find({});
    
    console.log(`📊 BEFORE CLEARING:`);
    console.log(`   Total Students: ${studentsBeforeClear.length}`);
    console.log(`   Total Rooms: ${roomsBeforeClear.length}`);
    console.log(`   Occupied Rooms: ${roomsBeforeClear.filter(r => r.currentOccupancy > 0).length}\n`);
    
    // Option 1: Delete all students completely
    console.log('🗑️ Deleting all student records...');
    const deletedStudents = await User.deleteMany({ role: 'student' });
    console.log(`✅ Deleted ${deletedStudents.deletedCount} student records\n`);
    
    // Reset all room occupancies to 0
    console.log('🔄 Resetting all room occupancies to 0...');
    const updatedRooms = await Room.updateMany(
      {}, 
      { $set: { currentOccupancy: 0 } }
    );
    console.log(`✅ Reset occupancy for ${updatedRooms.modifiedCount} rooms\n`);
    
    // Verify the clearing
    const studentsAfterClear = await User.find({ role: 'student' });
    const roomsAfterClear = await Room.find({});
    
    console.log('📊 AFTER CLEARING:');
    console.log(`   Total Students: ${studentsAfterClear.length}`);
    console.log(`   Total Rooms: ${roomsAfterClear.length}`);
    console.log(`   Occupied Rooms: ${roomsAfterClear.filter(r => r.currentOccupancy > 0).length}`);
    console.log(`   Empty Rooms: ${roomsAfterClear.filter(r => r.currentOccupancy === 0).length}\n`);
    
    // Display room status
    console.log('🏠 ROOM STATUS AFTER CLEARING:');
    console.log('-'.repeat(50));
    roomsAfterClear.forEach(room => {
      console.log(`Room ${room.roomNumber}: ${room.currentOccupancy}/${room.capacity} (${room.purpose})`);
    });
    
    console.log('\n✅ SUCCESS: All room-related student data has been cleared!');
    console.log('🎯 You can now add new students to rooms with a fresh start.');
    console.log('💡 All rooms are now empty and ready for new assignments.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

clearRoomData();
