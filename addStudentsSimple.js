const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Simple User schema
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

// Simple Room schema
const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  capacity: Number,
  currentOccupancy: { type: Number, default: 0 },
  purpose: String,
  specialPurpose: Boolean
});

const Room = mongoose.model('Room', roomSchema);

// Compact dummy data
const students = [
  { name: 'Arjun Sharma', email: 'arjun@test.com', studentId: 'SWD001', branch: 'CSE', college: 'Tech Institute', year: 2, phone: '9876543210', room: 1 },
  { name: 'Priya Patel', email: 'priya@test.com', studentId: 'SWD002', branch: 'IT', college: 'Tech Institute', year: 1, phone: '9876543211', room: 1 },
  { name: 'Rahul Kumar', email: 'rahul@test.com', studentId: 'SWD003', branch: 'ECE', college: 'Eng College', year: 3, phone: '9876543212', room: 2 },
  { name: 'Sneha Singh', email: 'sneha@test.com', studentId: 'SWD004', branch: 'MECH', college: 'Eng College', year: 2, phone: '9876543213', room: 2 },
  { name: 'Amit Gupta', email: 'amit@test.com', studentId: 'SWD005', branch: 'CIVIL', college: 'Eng College', year: 1, phone: '9876543214', room: 2 },
  { name: 'Kavya Reddy', email: 'kavya@test.com', studentId: 'SWD006', branch: 'CSE', college: 'Tech Institute', year: 4, phone: '9876543215', room: 3 },
  { name: 'Vikram Joshi', email: 'vikram@test.com', studentId: 'SWD007', branch: 'IT', college: 'Tech Institute', year: 3, phone: '9876543216', room: 3 },
  { name: 'Ananya Das', email: 'ananya@test.com', studentId: 'SWD008', branch: 'ECE', college: 'Eng College', year: 2, phone: '9876543217', room: 4 },
  { name: 'Rohit Verma', email: 'rohit@test.com', studentId: 'SWD009', branch: 'MECH', college: 'Eng College', year: 4, phone: '9876543218', room: 4 },
  { name: 'Pooja Agarwal', email: 'pooja@test.com', studentId: 'SWD010', branch: 'CIVIL', college: 'Eng College', year: 1, phone: '9876543219', room: 4 },
  { name: 'Karan Mehta', email: 'karan@test.com', studentId: 'SWD011', branch: 'CSE', college: 'Tech Institute', year: 3, phone: '9876543220', room: 4 },
  { name: 'Riya Sharma', email: 'riya@test.com', studentId: 'SWD012', branch: 'IT', college: 'Tech Institute', year: 2, phone: '9876543221', room: 5 },
  { name: 'Aditya Singh', email: 'aditya@test.com', studentId: 'SWD013', branch: 'ECE', college: 'Eng College', year: 1, phone: '9876543222', room: 5 },
  { name: 'Nisha Patel', email: 'nisha@test.com', studentId: 'SWD014', branch: 'MECH', college: 'Eng College', year: 4, phone: '9876543223', room: 5 },
  { name: 'Sanjay Kumar', email: 'sanjay@test.com', studentId: 'SWD015', branch: 'CIVIL', college: 'Eng College', year: 3, phone: '9876543224', room: 6 },
  { name: 'Meera Jain', email: 'meera@test.com', studentId: 'SWD016', branch: 'CSE', college: 'Tech Institute', year: 2, phone: '9876543225', room: 6 },
  { name: 'Deepak Yadav', email: 'deepak@test.com', studentId: 'SWD017', branch: 'IT', college: 'Tech Institute', year: 1, phone: '9876543226', room: 7 },
  { name: 'Swati Mishra', email: 'swati@test.com', studentId: 'SWD018', branch: 'ECE', college: 'Eng College', year: 4, phone: '9876543227', room: 7 },
  { name: 'Rajesh Tiwari', email: 'rajesh@test.com', studentId: 'SWD019', branch: 'MECH', college: 'Eng College', year: 2, phone: '9876543228', room: 7 },
  { name: 'Anjali Gupta', email: 'anjali@test.com', studentId: 'SWD020', branch: 'CIVIL', college: 'Eng College', year: 3, phone: '9876543229', room: 7 },
  { name: 'Manish Sharma', email: 'manish@test.com', studentId: 'SWD021', branch: 'CSE', college: 'Tech Institute', year: 1, phone: '9876543230', room: 8 },
  { name: 'Sunita Singh', email: 'sunita@test.com', studentId: 'SWD022', branch: 'IT', college: 'Tech Institute', year: 4, phone: '9876543231', room: 8 },
  { name: 'Gaurav Patel', email: 'gaurav@test.com', studentId: 'SWD023', branch: 'ECE', college: 'Eng College', year: 3, phone: '9876543232', room: 8 },
  { name: 'Divya Reddy', email: 'divya@test.com', studentId: 'SWD024', branch: 'MECH', college: 'Eng College', year: 2, phone: '9876543233', room: 9 },
  { name: 'Suresh Kumar', email: 'suresh@test.com', studentId: 'SWD025', branch: 'CIVIL', college: 'Eng College', year: 1, phone: '9876543234', room: 9 },
  { name: 'Neha Agarwal', email: 'neha@test.com', studentId: 'SWD026', branch: 'CSE', college: 'Tech Institute', year: 4, phone: '9876543235', room: 10 },
  { name: 'Akash Joshi', email: 'akash@test.com', studentId: 'SWD027', branch: 'IT', college: 'Tech Institute', year: 3, phone: '9876543236', room: 10 },
  { name: 'Preeti Das', email: 'preeti@test.com', studentId: 'SWD028', branch: 'ECE', college: 'Eng College', year: 2, phone: '9876543237', room: 10 },
  { name: 'Varun Verma', email: 'varun@test.com', studentId: 'SWD029', branch: 'MECH', college: 'Eng College', year: 1, phone: '9876543238', room: 10 }
];

async function addStudents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected!\n');
    
    // Clear existing students
    await User.deleteMany({ role: 'student' });
    console.log('Cleared existing students\n');
    
    // Add students
    console.log('Adding students...');
    for (const s of students) {
      await User.create({
        name: s.name,
        email: s.email,
        studentId: s.studentId,
        branch: s.branch,
        college: s.college,
        year: s.year,
        phoneNumber: s.phone,
        roomNumber: s.room,
        room: s.room,
        role: 'student',
        password: 'password123'
      });
      console.log(`Added: ${s.name} -> Room ${s.room}`);
    }
    
    // Update room occupancies
    console.log('\nUpdating room occupancies...');
    const rooms = await Room.find({});
    for (const room of rooms) {
      const count = students.filter(s => s.room === room.roomNumber).length;
      room.currentOccupancy = count;
      await room.save();
      console.log(`Room ${room.roomNumber}: ${count}/${room.capacity}`);
    }
    
    console.log('\n=== ROOM-STUDENT LIST ===');
    const roomGroups = {};
    students.forEach(s => {
      if (!roomGroups[s.room]) roomGroups[s.room] = [];
      roomGroups[s.room].push(s);
    });
    
    Object.keys(roomGroups).sort((a,b) => a-b).forEach(roomNum => {
      console.log(`\nROOM ${roomNum}:`);
      roomGroups[roomNum].forEach((s, i) => {
        console.log(`  ${i+1}. ${s.name} (${s.studentId}) - ${s.branch} Year ${s.year}`);
      });
    });
    
    console.log('\nSUCCESS! Students added to rooms.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

addStudents();
