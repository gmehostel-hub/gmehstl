const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';

async function fixRoom10Students() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Find all students assigned to room 10
  const students = await User.find({ roomNumber: 10, role: 'student' });
  if (!students.length) {
    console.log('No students found for room 10.');
    return;
  }
  const studentIds = students.map(s => s._id);
  console.log('Student IDs for room 10:', studentIds);

  // Update the Room document
  const room = await Room.findOneAndUpdate(
    { roomNumber: 10 },
    { $set: { students: studentIds, currentOccupancy: studentIds.length } },
    { new: true }
  );

  if (!room) {
    console.log('Room 10 not found!');
  } else {
    console.log('Updated Room 10:', room);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixRoom10Students().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});