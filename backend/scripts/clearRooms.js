const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');

async function clearRooms() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/hostel_management');
    console.log('Connected to MongoDB');

    // Update all students to have no room
    const userResult = await User.updateMany(
      { role: 'student', roomNumber: { $exists: true, $ne: null } },
      { $unset: { roomNumber: 1 } }
    );
    console.log(`Updated ${userResult.modifiedCount} students to have no room`);

    // Update all rooms to have no students and zero occupancy
    const roomResult = await Room.updateMany(
      {},
      { $set: { students: [], currentOccupancy: 0 } }
    );
    console.log(`Updated ${roomResult.modifiedCount} rooms to have no students`);

    console.log('All students removed from rooms successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearRooms();