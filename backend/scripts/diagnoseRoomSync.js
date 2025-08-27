const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
require('dotenv').config();

const diagnoseRoomSync = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('🔍 Diagnosing Room-Student Synchronization Issues...\n');

    // Get all students with room assignments
    const students = await User.find({ role: 'student', roomNumber: { $exists: true, $ne: null } })
      .select('name email studentId roomNumber');
    
    console.log(`Found ${students.length} students with room assignments:`);
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) -> Room ${student.roomNumber}`);
    });

    // Get all rooms with students
    const rooms = await Room.find({ students: { $exists: true, $ne: [] } })
      .populate('students', 'name email studentId roomNumber');

    console.log(`\nFound ${rooms.length} rooms with student assignments:`);
    
    // Check for inconsistencies
    let inconsistenciesFound = false;
    
    for (const room of rooms) {
      console.log(`\n🏠 Room ${room.roomNumber}:`);
      console.log(`   Students in room.students array: ${room.students.length}`);
      console.log(`   Current occupancy: ${room.currentOccupancy}`);
      
      // Check each student in the room
      for (const student of room.students) {
        console.log(`     - ${student.name} (roomNumber in User: ${student.roomNumber})`);
        
        // Check if student's roomNumber matches the room they're assigned to
        if (student.roomNumber !== room.roomNumber) {
          console.log(`       ❌ INCONSISTENCY: Student's roomNumber (${student.roomNumber}) doesn't match room (${room.roomNumber})`);
          inconsistenciesFound = true;
        }
      }
      
      // Check if occupancy matches actual student count
      if (room.currentOccupancy !== room.students.length) {
        console.log(`   ❌ INCONSISTENCY: currentOccupancy (${room.currentOccupancy}) doesn't match students array length (${room.students.length})`);
        inconsistenciesFound = true;
      }
    }

    // Check for orphaned students (students with roomNumber but not in any room's students array)
    console.log('\n🔍 Checking for orphaned students...');
    for (const student of students) {
      const roomWithStudent = await Room.findOne({ 
        roomNumber: student.roomNumber,
        students: student._id 
      });
      
      if (!roomWithStudent) {
        console.log(`❌ ORPHANED STUDENT: ${student.name} has roomNumber ${student.roomNumber} but is not in that room's students array`);
        inconsistenciesFound = true;
      }
    }

    if (!inconsistenciesFound) {
      console.log('\n✅ No synchronization issues found!');
    } else {
      console.log('\n❌ Synchronization issues detected. Running auto-fix...');
      await fixSynchronizationIssues();
    }

  } catch (error) {
    console.error('❌ Error diagnosing room sync:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

const fixSynchronizationIssues = async () => {
  console.log('\n🔧 Fixing synchronization issues...');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get all students with room assignments
    const students = await User.find({ role: 'student', roomNumber: { $exists: true, $ne: null } });
    
    // Clear all room assignments first
    await Room.updateMany({}, { students: [], currentOccupancy: 0 }, { session });
    
    // Group students by room number
    const studentsByRoom = {};
    students.forEach(student => {
      if (!studentsByRoom[student.roomNumber]) {
        studentsByRoom[student.roomNumber] = [];
      }
      studentsByRoom[student.roomNumber].push(student);
    });
    
    // Reassign students to rooms properly
    for (const [roomNumber, roomStudents] of Object.entries(studentsByRoom)) {
      const room = await Room.findOne({ roomNumber: parseInt(roomNumber) });
      if (room) {
        const studentIds = roomStudents.map(s => s._id);
        await Room.findByIdAndUpdate(
          room._id,
          { 
            students: studentIds,
            currentOccupancy: studentIds.length
          },
          { session }
        );
        console.log(`✅ Fixed Room ${roomNumber}: ${studentIds.length} students assigned`);
      }
    }
    
    await session.commitTransaction();
    console.log('✅ Synchronization issues fixed successfully!');
    
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Failed to fix synchronization issues:', error.message);
  } finally {
    session.endSession();
  }
};

// Run the script
diagnoseRoomSync();
