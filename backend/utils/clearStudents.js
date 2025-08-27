const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
require('dotenv').config();

const clearStudentData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');

    // Remove all students (keep admin and warden)
    const deletedStudents = await User.deleteMany({ role: 'student' });
    console.log(`✅ Deleted ${deletedStudents.deletedCount} students`);

    // Clear all room assignments and reset occupancy
    const updatedRooms = await Room.updateMany(
      {},
      {
        $unset: { students: 1 },
        $set: { currentOccupancy: 0 }
      }
    );
    console.log(`✅ Cleared assignments from ${updatedRooms.modifiedCount} rooms`);

    // Verify the cleanup
    const remainingStudents = await User.countDocuments({ role: 'student' });
    const remainingUsers = await User.countDocuments();
    const emptyRooms = await Room.countDocuments({ currentOccupancy: 0 });
    const totalRooms = await Room.countDocuments();

    console.log('\n📊 Cleanup Summary:');
    console.log(`- Students remaining: ${remainingStudents}`);
    console.log(`- Total users remaining: ${remainingUsers} (admin + warden)`);
    console.log(`- Empty rooms: ${emptyRooms}/${totalRooms}`);
    console.log(`- All rooms are now ready for real student assignments!`);

    console.log('\n🎉 Student data cleanup completed successfully!');
    console.log('You can now add real students through the admin interface.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the cleanup
clearStudentData();
