require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected for checking data');
  
  try {
    // Check rooms
    const rooms = await Room.find().populate('students');
    console.log('Total rooms:', rooms.length);
    
    const regularRooms = rooms.filter(r => !r.specialPurpose);
    console.log('Regular rooms:', regularRooms.length);
    console.log('Special purpose rooms:', rooms.length - regularRooms.length);
    
    console.log('\nSample room occupancy:');
    regularRooms.slice(0, 5).forEach(r => {
      console.log(`Room ${r.roomNumber}: ${r.currentOccupancy} students, Capacity: ${r.capacity}`);
    });
    
    // Check students
    const students = await User.find({ role: 'student' });
    console.log('\nTotal students:', students.length);
    
    // Check room distribution
    const roomDistribution = {};
    for (const student of students) {
      if (!roomDistribution[student.roomNumber]) {
        roomDistribution[student.roomNumber] = 0;
      }
      roomDistribution[student.roomNumber]++;
    }
    
    console.log('\nRoom distribution (students per room):');
    Object.keys(roomDistribution).sort((a, b) => a - b).forEach(roomNumber => {
      console.log(`Room ${roomNumber}: ${roomDistribution[roomNumber]} students`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});