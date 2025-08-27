const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Import models
const User = require('./backend/models/User');
const Room = require('./backend/models/Room');

async function removeAllStudentsFromRooms() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🏠 REMOVING ALL STUDENTS FROM ALL ROOMS...\n');
    
    // Get all students currently assigned to rooms
    const assignedStudents = await User.find({ 
      role: 'student',
      $or: [
        { roomNumber: { $exists: true, $ne: null } },
        { room: { $exists: true, $ne: null } }
      ]
    }).select('name email roomNumber room');
    
    console.log(`📊 Found ${assignedStudents.length} students currently assigned to rooms:`);
    assignedStudents.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) -> Room: ${student.roomNumber || student.room}`);
    });
    
    if (assignedStudents.length === 0) {
      console.log('✅ No students are currently assigned to rooms. Nothing to remove.');
      return;
    }
    
    console.log('\n🔄 Removing all students from rooms...');
    
    // Remove room assignments from all students
    const updateResult = await User.updateMany(
      { role: 'student' },
      { 
        $unset: { 
          roomNumber: 1,
          room: 1
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} student records`);
    
    // Reset all room occupancies to 0
    console.log('\n🔄 Resetting all room occupancies to 0...');
    const roomUpdateResult = await Room.updateMany(
      {},
      { currentOccupancy: 0 }
    );
    
    console.log(`✅ Updated ${roomUpdateResult.modifiedCount} room records`);
    
    // Verify the changes
    console.log('\n🔍 VERIFICATION:');
    const remainingAssignedStudents = await User.find({ 
      role: 'student',
      $or: [
        { roomNumber: { $exists: true, $ne: null } },
        { room: { $exists: true, $ne: null } }
      ]
    }).select('name email roomNumber room');
    
    console.log(`📊 Students still assigned to rooms: ${remainingAssignedStudents.length}`);
    
    const rooms = await Room.find({}).select('roomNumber currentOccupancy capacity');
    console.log(`📊 Room occupancy status:`);
    rooms.forEach(room => {
      console.log(`  Room ${room.roomNumber}: ${room.currentOccupancy}/${room.capacity}`);
    });
    
    console.log('\n🎉 SUCCESS: All students have been removed from all rooms!');
    console.log('✅ All room occupancies have been reset to 0');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

removeAllStudentsFromRooms();
