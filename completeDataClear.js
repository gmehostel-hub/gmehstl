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

async function completeDataClear() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🗑️ PERFORMING COMPLETE DATA CLEAR...\n');
    
    // Step 1: Delete ALL students (multiple attempts with different criteria)
    console.log('🗑️ Step 1: Deleting all student records...');
    
    // Delete by role
    const deleteByRole = await User.deleteMany({ role: 'student' });
    console.log(`   Deleted by role: ${deleteByRole.deletedCount} records`);
    
    // Delete any remaining users with student-like properties
    const deleteByStudentId = await User.deleteMany({ studentId: { $exists: true } });
    console.log(`   Deleted by studentId: ${deleteByStudentId.deletedCount} records`);
    
    // Delete any users with room assignments
    const deleteByRoom = await User.deleteMany({ 
      $or: [
        { roomNumber: { $exists: true } },
        { room: { $exists: true } }
      ]
    });
    console.log(`   Deleted by room assignment: ${deleteByRoom.deletedCount} records`);
    
    // Delete any users with branch field (student indicator)
    const deleteByBranch = await User.deleteMany({ branch: { $exists: true } });
    console.log(`   Deleted by branch: ${deleteByBranch.deletedCount} records`);
    
    // Step 2: Reset ALL room occupancies to 0
    console.log('\n🔄 Step 2: Resetting all room occupancies...');
    const resetRooms = await Room.updateMany(
      {}, 
      { 
        $set: { currentOccupancy: 0 },
        $unset: { students: "" } // Remove any students array if exists
      }
    );
    console.log(`   Reset ${resetRooms.modifiedCount} rooms to 0 occupancy`);
    
    // Step 3: Verify complete clearing
    console.log('\n🔍 Step 3: Verifying complete clearing...');
    
    const remainingStudents = await User.find({ role: 'student' });
    const remainingWithStudentId = await User.find({ studentId: { $exists: true } });
    const remainingWithRoom = await User.find({ 
      $or: [
        { roomNumber: { $exists: true } },
        { room: { $exists: true } }
      ]
    });
    
    console.log(`   Remaining students by role: ${remainingStudents.length}`);
    console.log(`   Remaining with studentId: ${remainingWithStudentId.length}`);
    console.log(`   Remaining with room assignment: ${remainingWithRoom.length}`);
    
    // Step 4: Check room status
    const allRooms = await Room.find({});
    const occupiedRooms = allRooms.filter(r => r.currentOccupancy > 0);
    
    console.log(`\n🏠 Room Status:`);
    console.log(`   Total rooms: ${allRooms.length}`);
    console.log(`   Occupied rooms: ${occupiedRooms.length}`);
    console.log(`   Empty rooms: ${allRooms.length - occupiedRooms.length}`);
    
    if (occupiedRooms.length > 0) {
      console.log('\n⚠️ ROOMS STILL SHOWING OCCUPANCY:');
      occupiedRooms.forEach(r => {
        console.log(`   Room ${r.roomNumber}: ${r.currentOccupancy}/${r.capacity}`);
      });
      
      // Force reset these rooms
      await Room.updateMany(
        { currentOccupancy: { $gt: 0 } },
        { $set: { currentOccupancy: 0 } }
      );
      console.log('   ✅ Force reset all occupied rooms to 0');
    }
    
    // Final verification
    const finalStudentCount = await User.countDocuments({ role: 'student' });
    const finalOccupiedRooms = await Room.countDocuments({ currentOccupancy: { $gt: 0 } });
    
    console.log('\n✅ FINAL VERIFICATION:');
    console.log(`   Students remaining: ${finalStudentCount}`);
    console.log(`   Occupied rooms: ${finalOccupiedRooms}`);
    
    if (finalStudentCount === 0 && finalOccupiedRooms === 0) {
      console.log('\n🎉 SUCCESS: All student data completely cleared!');
      console.log('💡 All rooms are now empty and ready for new assignments.');
    } else {
      console.log('\n⚠️ WARNING: Some data may still remain. Manual cleanup may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

completeDataClear();
