const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Import models
const User = require('./backend/models/User');
const Room = require('./backend/models/Room');

// Dummy student data
const dummyStudents = [
  // Room 1 students
  { name: 'Arjun Sharma', email: 'arjun.sharma@student.com', studentId: 'SWD001', branch: 'Computer Science', college: 'Tech Institute', year: 2, phoneNumber: '9876543210', roomNumber: 1 },
  { name: 'Priya Patel', email: 'priya.patel@student.com', studentId: 'SWD002', branch: 'Information Technology', college: 'Tech Institute', year: 1, phoneNumber: '9876543211', roomNumber: 1 },
  
  // Room 2 students
  { name: 'Rahul Kumar', email: 'rahul.kumar@student.com', studentId: 'SWD003', branch: 'Electronics', college: 'Engineering College', year: 3, phoneNumber: '9876543212', roomNumber: 2 },
  { name: 'Sneha Singh', email: 'sneha.singh@student.com', studentId: 'SWD004', branch: 'Mechanical', college: 'Engineering College', year: 2, phoneNumber: '9876543213', roomNumber: 2 },
  { name: 'Amit Gupta', email: 'amit.gupta@student.com', studentId: 'SWD005', branch: 'Civil', college: 'Engineering College', year: 1, phoneNumber: '9876543214', roomNumber: 2 },
  
  // Room 3 students
  { name: 'Kavya Reddy', email: 'kavya.reddy@student.com', studentId: 'SWD006', branch: 'Computer Science', college: 'Tech Institute', year: 4, phoneNumber: '9876543215', roomNumber: 3 },
  { name: 'Vikram Joshi', email: 'vikram.joshi@student.com', studentId: 'SWD007', branch: 'Information Technology', college: 'Tech Institute', year: 3, phoneNumber: '9876543216', roomNumber: 3 },
  
  // Room 4 students
  { name: 'Ananya Das', email: 'ananya.das@student.com', studentId: 'SWD008', branch: 'Electronics', college: 'Engineering College', year: 2, phoneNumber: '9876543217', roomNumber: 4 },
  { name: 'Rohit Verma', email: 'rohit.verma@student.com', studentId: 'SWD009', branch: 'Mechanical', college: 'Engineering College', year: 4, phoneNumber: '9876543218', roomNumber: 4 },
  { name: 'Pooja Agarwal', email: 'pooja.agarwal@student.com', studentId: 'SWD010', branch: 'Civil', college: 'Engineering College', year: 1, phoneNumber: '9876543219', roomNumber: 4 },
  { name: 'Karan Mehta', email: 'karan.mehta@student.com', studentId: 'SWD011', branch: 'Computer Science', college: 'Tech Institute', year: 3, phoneNumber: '9876543220', roomNumber: 4 },
  
  // Room 5 students
  { name: 'Riya Sharma', email: 'riya.sharma@student.com', studentId: 'SWD012', branch: 'Information Technology', college: 'Tech Institute', year: 2, phoneNumber: '9876543221', roomNumber: 5 },
  { name: 'Aditya Singh', email: 'aditya.singh@student.com', studentId: 'SWD013', branch: 'Electronics', college: 'Engineering College', year: 1, phoneNumber: '9876543222', roomNumber: 5 },
  { name: 'Nisha Patel', email: 'nisha.patel@student.com', studentId: 'SWD014', branch: 'Mechanical', college: 'Engineering College', year: 4, phoneNumber: '9876543223', roomNumber: 5 },
  
  // Room 6 students
  { name: 'Sanjay Kumar', email: 'sanjay.kumar@student.com', studentId: 'SWD015', branch: 'Civil', college: 'Engineering College', year: 3, phoneNumber: '9876543224', roomNumber: 6 },
  { name: 'Meera Jain', email: 'meera.jain@student.com', studentId: 'SWD016', branch: 'Computer Science', college: 'Tech Institute', year: 2, phoneNumber: '9876543225', roomNumber: 6 },
  
  // Room 7 students
  { name: 'Deepak Yadav', email: 'deepak.yadav@student.com', studentId: 'SWD017', branch: 'Information Technology', college: 'Tech Institute', year: 1, phoneNumber: '9876543226', roomNumber: 7 },
  { name: 'Swati Mishra', email: 'swati.mishra@student.com', studentId: 'SWD018', branch: 'Electronics', college: 'Engineering College', year: 4, phoneNumber: '9876543227', roomNumber: 7 },
  { name: 'Rajesh Tiwari', email: 'rajesh.tiwari@student.com', studentId: 'SWD019', branch: 'Mechanical', college: 'Engineering College', year: 2, phoneNumber: '9876543228', roomNumber: 7 },
  { name: 'Anjali Gupta', email: 'anjali.gupta@student.com', studentId: 'SWD020', branch: 'Civil', college: 'Engineering College', year: 3, phoneNumber: '9876543229', roomNumber: 7 },
  
  // Room 8 students
  { name: 'Manish Sharma', email: 'manish.sharma@student.com', studentId: 'SWD021', branch: 'Computer Science', college: 'Tech Institute', year: 1, phoneNumber: '9876543230', roomNumber: 8 },
  { name: 'Sunita Singh', email: 'sunita.singh@student.com', studentId: 'SWD022', branch: 'Information Technology', college: 'Tech Institute', year: 4, phoneNumber: '9876543231', roomNumber: 8 },
  { name: 'Gaurav Patel', email: 'gaurav.patel@student.com', studentId: 'SWD023', branch: 'Electronics', college: 'Engineering College', year: 3, phoneNumber: '9876543232', roomNumber: 8 },
  
  // Room 9 students
  { name: 'Divya Reddy', email: 'divya.reddy@student.com', studentId: 'SWD024', branch: 'Mechanical', college: 'Engineering College', year: 2, phoneNumber: '9876543233', roomNumber: 9 },
  { name: 'Suresh Kumar', email: 'suresh.kumar@student.com', studentId: 'SWD025', branch: 'Civil', college: 'Engineering College', year: 1, phoneNumber: '9876543234', roomNumber: 9 },
  
  // Room 10 students
  { name: 'Neha Agarwal', email: 'neha.agarwal@student.com', studentId: 'SWD026', branch: 'Computer Science', college: 'Tech Institute', year: 4, phoneNumber: '9876543235', roomNumber: 10 },
  { name: 'Akash Joshi', email: 'akash.joshi@student.com', studentId: 'SWD027', branch: 'Information Technology', college: 'Tech Institute', year: 3, phoneNumber: '9876543236', roomNumber: 10 },
  { name: 'Preeti Das', email: 'preeti.das@student.com', studentId: 'SWD028', branch: 'Electronics', college: 'Engineering College', year: 2, phoneNumber: '9876543237', roomNumber: 10 },
  { name: 'Varun Verma', email: 'varun.verma@student.com', studentId: 'SWD029', branch: 'Mechanical', college: 'Engineering College', year: 1, phoneNumber: '9876543238', roomNumber: 10 },
  
  // Additional students for other rooms (11-31)
  { name: 'Shreya Patel', email: 'shreya.patel@student.com', studentId: 'SWD030', branch: 'Civil', college: 'Engineering College', year: 4, phoneNumber: '9876543239', roomNumber: 11 },
  { name: 'Harsh Gupta', email: 'harsh.gupta@student.com', studentId: 'SWD031', branch: 'Computer Science', college: 'Tech Institute', year: 3, phoneNumber: '9876543240', roomNumber: 11 },
  { name: 'Ritika Singh', email: 'ritika.singh@student.com', studentId: 'SWD032', branch: 'Information Technology', college: 'Tech Institute', year: 2, phoneNumber: '9876543241', roomNumber: 12 },
  { name: 'Nikhil Sharma', email: 'nikhil.sharma@student.com', studentId: 'SWD033', branch: 'Electronics', college: 'Engineering College', year: 1, phoneNumber: '9876543242', roomNumber: 12 },
  { name: 'Pallavi Kumar', email: 'pallavi.kumar@student.com', studentId: 'SWD034', branch: 'Mechanical', college: 'Engineering College', year: 4, phoneNumber: '9876543243', roomNumber: 13 },
  { name: 'Arpit Jain', email: 'arpit.jain@student.com', studentId: 'SWD035', branch: 'Civil', college: 'Engineering College', year: 3, phoneNumber: '9876543244', roomNumber: 13 },
  { name: 'Sakshi Reddy', email: 'sakshi.reddy@student.com', studentId: 'SWD036', branch: 'Computer Science', college: 'Tech Institute', year: 2, phoneNumber: '9876543245', roomNumber: 14 },
  { name: 'Mohit Yadav', email: 'mohit.yadav@student.com', studentId: 'SWD037', branch: 'Information Technology', college: 'Tech Institute', year: 1, phoneNumber: '9876543246', roomNumber: 14 },
  { name: 'Ishita Mishra', email: 'ishita.mishra@student.com', studentId: 'SWD038', branch: 'Electronics', college: 'Engineering College', year: 4, phoneNumber: '9876543247', roomNumber: 15 },
  { name: 'Yash Tiwari', email: 'yash.tiwari@student.com', studentId: 'SWD039', branch: 'Mechanical', college: 'Engineering College', year: 3, phoneNumber: '9876543248', roomNumber: 15 },
  { name: 'Tanvi Gupta', email: 'tanvi.gupta@student.com', studentId: 'SWD040', branch: 'Civil', college: 'Engineering College', year: 2, phoneNumber: '9876543249', roomNumber: 16 }
];

async function addDummyStudentsToRooms() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    console.log('🏠 ADDING DUMMY STUDENTS TO ROOMS...\n');
    
    // First, remove all existing students
    console.log('🗑️ Removing existing students...');
    await User.deleteMany({ role: 'student' });
    console.log('✅ Existing students removed\n');
    
    // Add dummy students
    console.log('👥 Adding dummy students...');
    const createdStudents = [];
    
    for (const studentData of dummyStudents) {
      const student = new User({
        ...studentData,
        role: 'student',
        password: 'hashedPassword123' // This would be properly hashed in real implementation
      });
      
      const savedStudent = await student.save();
      createdStudents.push(savedStudent);
      console.log(`  ✅ Added: ${student.name} -> Room ${student.roomNumber}`);
    }
    
    console.log(`\n📊 Total students added: ${createdStudents.length}`);
    
    // Update room occupancies
    console.log('\n🔄 Updating room occupancies...');
    const rooms = await Room.find({});
    
    for (const room of rooms) {
      const studentsInRoom = createdStudents.filter(s => s.roomNumber === room.roomNumber);
      room.currentOccupancy = studentsInRoom.length;
      await room.save();
      console.log(`  🏠 Room ${room.roomNumber}: ${studentsInRoom.length}/${room.capacity} occupancy`);
    }
    
    console.log('\n📋 ROOM-STUDENT ASSIGNMENT LIST:');
    console.log('=' .repeat(80));
    
    // Generate room-wise student list
    const roomStudentList = {};
    createdStudents.forEach(student => {
      if (!roomStudentList[student.roomNumber]) {
        roomStudentList[student.roomNumber] = [];
      }
      roomStudentList[student.roomNumber].push(student);
    });
    
    // Display room-wise assignments
    Object.keys(roomStudentList).sort((a, b) => Number(a) - Number(b)).forEach(roomNum => {
      const students = roomStudentList[roomNum];
      const room = rooms.find(r => r.roomNumber === Number(roomNum));
      
      console.log(`\n🏠 ROOM ${roomNum} (${students.length}/${room?.capacity || 6} occupied):`);
      console.log('-'.repeat(60));
      
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.name}`);
        console.log(`     📧 Email: ${student.email}`);
        console.log(`     🆔 SWD ID: ${student.studentId}`);
        console.log(`     📚 Branch: ${student.branch} | Year: ${student.year}`);
        console.log(`     🏫 College: ${student.college}`);
        console.log(`     📞 Phone: ${student.phoneNumber}`);
        console.log('');
      });
    });
    
    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('=' .repeat(50));
    console.log(`Total Students: ${createdStudents.length}`);
    console.log(`Rooms with Students: ${Object.keys(roomStudentList).length}`);
    console.log(`Empty Rooms: ${rooms.length - Object.keys(roomStudentList).length}`);
    
    const branchCounts = {};
    createdStudents.forEach(student => {
      branchCounts[student.branch] = (branchCounts[student.branch] || 0) + 1;
    });
    
    console.log('\n📊 Students by Branch:');
    Object.keys(branchCounts).forEach(branch => {
      console.log(`  ${branch}: ${branchCounts[branch]} students`);
    });
    
    console.log('\n🎉 SUCCESS: Dummy student data has been added to rooms!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

addDummyStudentsToRooms();
