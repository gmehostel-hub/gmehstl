const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

const assignStudentsToRooms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('🏠 Assigning students to rooms...\n');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students to assign`);

    if (students.length === 0) {
      console.log('❌ No students found to assign');
      return;
    }

    // Ensure we have some rooms available (create room 2 and 3 if they don't exist)
    const roomNumbers = [2, 3, 4]; // Using regular rooms (not special purpose)
    
    for (const roomNum of roomNumbers) {
      const existingRoom = await Room.findOne({ roomNumber: roomNum });
      if (!existingRoom) {
        await Room.create({
          roomNumber: roomNum,
          capacity: 6,
          currentOccupancy: 0,
          students: [],
          specialPurpose: false,
          purpose: 'Regular'
        });
        console.log(`✅ Created Room ${roomNum}`);
      }
    }

    // Assign students to rooms
    let currentRoomIndex = 0;
    let studentsInCurrentRoom = 0;
    const maxStudentsPerRoom = 3; // Assign max 3 students per room for testing

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const roomNumber = roomNumbers[currentRoomIndex];

      console.log(`\n👤 Assigning ${student.name} to Room ${roomNumber}`);

      // Start a transaction for data consistency
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update student's room number
        await User.findByIdAndUpdate(
          student._id,
          { roomNumber: roomNumber },
          { session }
        );

        // Add student to room's students array and update occupancy
        await Room.findOneAndUpdate(
          { roomNumber: roomNumber },
          { 
            $addToSet: { students: student._id },
            $inc: { currentOccupancy: 1 }
          },
          { session }
        );

        await session.commitTransaction();
        console.log(`✅ ${student.name} assigned to Room ${roomNumber}`);

        studentsInCurrentRoom++;

        // Move to next room if current room has enough students
        if (studentsInCurrentRoom >= maxStudentsPerRoom && currentRoomIndex < roomNumbers.length - 1) {
          currentRoomIndex++;
          studentsInCurrentRoom = 0;
          console.log(`🔄 Moving to Room ${roomNumbers[currentRoomIndex]} for next assignments`);
        }

      } catch (error) {
        await session.abortTransaction();
        console.error(`❌ Failed to assign ${student.name}:`, error.message);
      } finally {
        session.endSession();
      }
    }

    // Display final assignments
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL ROOM ASSIGNMENTS:');
    console.log('='.repeat(60));

    const rooms = await Room.find({ roomNumber: { $in: roomNumbers } })
      .populate('students', 'name email studentId branch year');

    for (const room of rooms) {
      console.log(`\n🏠 Room ${room.roomNumber}:`);
      console.log(`   Capacity: ${room.capacity}, Current Occupancy: ${room.currentOccupancy}`);
      
      if (room.students.length > 0) {
        console.log(`   Students (${room.students.length}):`);
        room.students.forEach((student, index) => {
          console.log(`     ${index + 1}. ${student.name}`);
          console.log(`        Email: ${student.email}`);
          console.log(`        Student ID: ${student.studentId || 'Not assigned'}`);
          console.log(`        Branch: ${student.branch || 'Not specified'}`);
          console.log(`        Year: ${student.year || 'Not specified'}`);
        });
      } else {
        console.log('   No students assigned');
      }
    }

    console.log('\n🎉 Room assignments completed successfully!');
    console.log('Now students can see their roommates in the dashboard.');

  } catch (error) {
    console.error('❌ Error assigning students to rooms:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
assignStudentsToRooms();
