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

async function listStudentsByRoom() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('📊 FETCHING STUDENT AND ROOM DATA...\n');
    
    // Fetch all students and rooms
    const allStudents = await User.find({ role: 'student' }).sort({ roomNumber: 1, name: 1 });
    const allRooms = await Room.find({}).sort({ roomNumber: 1 });
    
    console.log(`Total Students Found: ${allStudents.length}`);
    console.log(`Total Rooms Found: ${allRooms.length}\n`);
    
    // Group students by room
    const studentsByRoom = {};
    allStudents.forEach(student => {
      const roomNum = student.roomNumber || student.room;
      if (roomNum) {
        if (!studentsByRoom[roomNum]) {
          studentsByRoom[roomNum] = [];
        }
        studentsByRoom[roomNum].push(student);
      }
    });
    
    console.log('🏠 DETAILED ROOM-WISE STUDENT LIST');
    console.log('=' .repeat(100));
    
    // Display each room with its students
    const occupiedRooms = Object.keys(studentsByRoom).sort((a, b) => Number(a) - Number(b));
    
    occupiedRooms.forEach(roomNum => {
      const students = studentsByRoom[roomNum];
      const room = allRooms.find(r => r.roomNumber === Number(roomNum));
      
      console.log(`\n🏠 ROOM ${roomNum}`);
      console.log(`📏 Capacity: ${room ? room.capacity : 6} students`);
      console.log(`👥 Current Occupancy: ${students.length}/${room ? room.capacity : 6}`);
      console.log(`🎯 Purpose: ${room ? room.purpose : 'Regular'}`);
      if (room && room.specialPurpose) {
        console.log(`⭐ Special Purpose Room`);
      }
      console.log('-' .repeat(80));
      
      students.forEach((student, index) => {
        console.log(`\n  ${index + 1}. 👤 ${student.name.toUpperCase()}`);
        console.log(`     🆔 Student ID: ${student.studentId}`);
        console.log(`     📧 Email: ${student.email}`);
        console.log(`     📚 Branch: ${student.branch} | Year: ${student.year}`);
        console.log(`     🏫 College: ${student.college}`);
        console.log(`     📞 Phone: ${student.phoneNumber}`);
        console.log(`     🏠 Room Assignment: ${student.roomNumber || student.room}`);
      });
      
      console.log('\n' + '=' .repeat(80));
    });
    
    // Display empty rooms
    const emptyRooms = allRooms.filter(room => !studentsByRoom[room.roomNumber]);
    if (emptyRooms.length > 0) {
      console.log(`\n🏠 EMPTY ROOMS (${emptyRooms.length} rooms)`);
      console.log('-' .repeat(50));
      emptyRooms.forEach(room => {
        console.log(`Room ${room.roomNumber}: ${room.purpose} (Capacity: ${room.capacity})`);
      });
    }
    
    // Summary Statistics
    console.log(`\n📈 SUMMARY STATISTICS`);
    console.log('=' .repeat(50));
    console.log(`📊 Total Students: ${allStudents.length}`);
    console.log(`🏠 Total Rooms: ${allRooms.length}`);
    console.log(`🏘️ Occupied Rooms: ${occupiedRooms.length}`);
    console.log(`🏠 Empty Rooms: ${emptyRooms.length}`);
    console.log(`📊 Average Occupancy: ${(allStudents.length / occupiedRooms.length).toFixed(1)} students per occupied room`);
    console.log(`📊 Overall Utilization: ${((allStudents.length / (allRooms.length * 6)) * 100).toFixed(1)}%`);
    
    // Branch-wise distribution
    const branchStats = {};
    allStudents.forEach(student => {
      branchStats[student.branch] = (branchStats[student.branch] || 0) + 1;
    });
    
    console.log(`\n📚 BRANCH-WISE DISTRIBUTION`);
    console.log('-' .repeat(30));
    Object.keys(branchStats).sort().forEach(branch => {
      console.log(`${branch}: ${branchStats[branch]} students`);
    });
    
    // Year-wise distribution
    const yearStats = {};
    allStudents.forEach(student => {
      yearStats[student.year] = (yearStats[student.year] || 0) + 1;
    });
    
    console.log(`\n🎓 YEAR-WISE DISTRIBUTION`);
    console.log('-' .repeat(25));
    Object.keys(yearStats).sort().forEach(year => {
      console.log(`Year ${year}: ${yearStats[year]} students`);
    });
    
    // College-wise distribution
    const collegeStats = {};
    allStudents.forEach(student => {
      collegeStats[student.college] = (collegeStats[student.college] || 0) + 1;
    });
    
    console.log(`\n🏫 COLLEGE-WISE DISTRIBUTION`);
    console.log('-' .repeat(30));
    Object.keys(collegeStats).sort().forEach(college => {
      console.log(`${college}: ${collegeStats[college]} students`);
    });
    
    // Room occupancy distribution
    const occupancyStats = {};
    occupiedRooms.forEach(roomNum => {
      const count = studentsByRoom[roomNum].length;
      occupancyStats[count] = (occupancyStats[count] || 0) + 1;
    });
    
    console.log(`\n🏠 ROOM OCCUPANCY DISTRIBUTION`);
    console.log('-' .repeat(35));
    Object.keys(occupancyStats).sort().forEach(occupancy => {
      console.log(`${occupancy} students: ${occupancyStats[occupancy]} rooms`);
    });
    
    console.log('\n🎉 STUDENT LISTING COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

listStudentsByRoom();
