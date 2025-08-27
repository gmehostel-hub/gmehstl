const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

const checkRoomData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');

    // Check room data
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    const students = await User.find({ role: 'student' });

    console.log('\n📊 Current Database State:');
    console.log(`- Total rooms: ${rooms.length}`);
    console.log(`- Total students: ${students.length}`);

    console.log('\n🏠 Room Occupancy Status:');
    rooms.forEach(room => {
      console.log(`Room ${room.roomNumber}: ${room.currentOccupancy || 0}/${room.capacity} students`);
      if (room.students && room.students.length > 0) {
        console.log(`  - Has students array with ${room.students.length} entries`);
      }
    });

    // Check for any inconsistencies
    const roomsWithStudents = rooms.filter(room => room.students && room.students.length > 0);
    const roomsWithOccupancy = rooms.filter(room => room.currentOccupancy > 0);

    if (roomsWithStudents.length > 0 || roomsWithOccupancy.length > 0) {
      console.log('\n⚠️  Issues Found:');
      if (roomsWithStudents.length > 0) {
        console.log(`- ${roomsWithStudents.length} rooms still have students arrays`);
      }
      if (roomsWithOccupancy.length > 0) {
        console.log(`- ${roomsWithOccupancy.length} rooms still have occupancy > 0`);
      }
    } else {
      console.log('\n✅ All rooms are properly empty!');
    }

  } catch (error) {
    console.error('❌ Error checking room data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

checkRoomData();
