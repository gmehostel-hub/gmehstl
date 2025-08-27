require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected for adding test student'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const addTestStudent = async () => {
  try {
    // Check if test student already exists
    const existingStudent = await User.findOne({ email: 'teststudent@hostel.com' });
    
    if (existingStudent) {
      console.log('Test student already exists!');
      console.log('Login Credentials:');
      console.log('Email: teststudent@hostel.com');
      console.log('Password: test123');
      console.log('Role: student');
      process.exit(0);
    }

    // Find an available room (preferably with some space)
    const availableRoom = await Room.findOne({ 
      currentOccupancy: { $lt: 6 },
      specialPurpose: { $ne: true }
    });

    if (!availableRoom) {
      console.log('No available rooms found. Creating student without room assignment.');
    }

    // Create test student
    const testStudent = await User.create({
      name: 'Test Student',
      email: 'teststudent@hostel.com',
      password: 'test123',
      role: 'student',
      studentId: 'TEST2024001',
      phoneNumber: '9876543210',
      year: 2,
      branch: 'CSE',
      college: 'Engineering College A',
      roomNumber: availableRoom ? availableRoom.roomNumber : null
    });

    // If room is available, assign student to room
    if (availableRoom) {
      availableRoom.students.push(testStudent._id);
      availableRoom.currentOccupancy += 1;
      await availableRoom.save();
      console.log(`Test student assigned to room ${availableRoom.roomNumber}`);
    }

    console.log('✅ Test student created successfully!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('Email: teststudent@hostel.com');
    console.log('Password: test123');
    console.log('Role: student');
    console.log('');
    console.log('👤 STUDENT DETAILS:');
    console.log('Name: Test Student');
    console.log('Student ID: TEST2024001');
    console.log('Branch: CSE');
    console.log('Year: 2nd Year');
    console.log('Phone: 9876543210');
    console.log(`Room: ${availableRoom ? availableRoom.roomNumber : 'Not assigned'}`);

  } catch (error) {
    console.error('Error creating test student:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTestStudent();
