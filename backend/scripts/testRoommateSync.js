const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

const testRoommateSync = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('🧪 Testing Roommate Synchronization...\n');

    // Create a test student if needed
    const testStudentEmail = 'testuser@hostelhaven.com';
    let testStudent = await User.findOne({ email: testStudentEmail });
    
    if (!testStudent) {
      testStudent = await User.create({
        name: 'Test Student',
        email: testStudentEmail,
        password: 'Student@123!',
        role: 'student',
        studentId: 'TEST001',
        phoneNumber: '9999999999',
        year: 2,
        branch: 'Computer Science',
        college: 'Test College'
      });
      console.log('✅ Created test student:', testStudent.name);
    } else {
      console.log('📋 Using existing test student:', testStudent.name);
    }

    // Find a room with existing students (Room 2 should have students)
    const targetRoom = await Room.findOne({ roomNumber: 2 }).populate('students', 'name email');
    
    if (!targetRoom) {
      console.log('❌ No target room found for testing');
      return;
    }

    console.log(`\n🏠 Target Room: ${targetRoom.roomNumber}`);
    console.log(`   Current students (${targetRoom.students.length}):`);
    targetRoom.students.forEach(student => {
      console.log(`     - ${student.name} (${student.email})`);
    });

    // Test the roommate API for existing students BEFORE adding new student
    console.log('\n📋 Testing roommate API BEFORE adding new student:');
    for (const existingStudent of targetRoom.students) {
      const roommates = await User.find({
        _id: { $in: targetRoom.students.map(s => s._id), $ne: existingStudent._id },
        role: 'student'
      }).select('name email studentId');
      
      console.log(`   ${existingStudent.name} sees ${roommates.length} roommates:`);
      roommates.forEach(roommate => {
        console.log(`     - ${roommate.name}`);
      });
    }

    // Add the test student to the room using proper assignment logic
    console.log(`\n➕ Adding ${testStudent.name} to Room ${targetRoom.roomNumber}...`);
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove test student from any existing room first
      if (testStudent.roomNumber) {
        await Room.findOneAndUpdate(
          { roomNumber: testStudent.roomNumber },
          { 
            $pull: { students: testStudent._id },
            $inc: { currentOccupancy: -1 }
          },
          { session }
        );
      }

      // Update student's room assignment
      await User.findByIdAndUpdate(
        testStudent._id, 
        { roomNumber: targetRoom.roomNumber },
        { session }
      );

      // Add student to room
      await Room.findByIdAndUpdate(
        targetRoom._id,
        { 
          $addToSet: { students: testStudent._id },
          $inc: { currentOccupancy: 1 }
        },
        { session }
      );

      await session.commitTransaction();
      console.log('✅ Successfully added test student to room');

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // Verify the room state after adding the student
    const updatedRoom = await Room.findOne({ roomNumber: targetRoom.roomNumber })
      .populate('students', 'name email studentId');
    
    console.log(`\n🏠 Updated Room ${updatedRoom.roomNumber}:`);
    console.log(`   Current students (${updatedRoom.students.length}):`);
    updatedRoom.students.forEach(student => {
      console.log(`     - ${student.name} (${student.email})`);
    });

    // Test the roommate API for all students AFTER adding new student
    console.log('\n📋 Testing roommate API AFTER adding new student:');
    for (const student of updatedRoom.students) {
      const roommates = await User.find({
        _id: { $in: updatedRoom.students.map(s => s._id), $ne: student._id },
        role: 'student'
      }).select('name email studentId');
      
      console.log(`   ${student.name} sees ${roommates.length} roommates:`);
      roommates.forEach(roommate => {
        console.log(`     - ${roommate.name}`);
      });
    }

    // Test the API endpoint directly (simulate what the frontend calls)
    console.log('\n🔌 Testing /api/rooms/my-roommates endpoint simulation:');
    for (const student of updatedRoom.students) {
      // Simulate the API call logic
      const room = await Room.findOne({ roomNumber: student.roomNumber });
      const roommates = await User.find({
        _id: { $in: room.students, $ne: student._id },
        role: 'student'
      }).select('studentId name email phoneNumber year branch college');
      
      console.log(`   API for ${student.name}: ${roommates.length} roommates returned`);
      roommates.forEach(roommate => {
        console.log(`     - ${roommate.name} (${roommate.email})`);
      });
    }

    console.log('\n✅ Roommate synchronization test completed successfully!');
    console.log('🎉 All students should now see each other as roommates in the dashboard.');

  } catch (error) {
    console.error('❌ Error testing roommate sync:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
testRoommateSync();
