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

// Additional students for rooms 11-31
const moreStudents = [
  // Room 11
  { name: 'Shreya Patel', email: 'shreya@test.com', studentId: 'SWD030', branch: 'CSE', college: 'Tech Institute', year: 4, phone: '9876543239', room: 11 },
  { name: 'Harsh Gupta', email: 'harsh@test.com', studentId: 'SWD031', branch: 'IT', college: 'Tech Institute', year: 3, phone: '9876543240', room: 11 },
  { name: 'Ritika Singh', email: 'ritika@test.com', studentId: 'SWD032', branch: 'ECE', college: 'Eng College', year: 2, phone: '9876543241', room: 11 },
  
  // Room 12
  { name: 'Nikhil Sharma', email: 'nikhil@test.com', studentId: 'SWD033', branch: 'MECH', college: 'Eng College', year: 1, phone: '9876543242', room: 12 },
  { name: 'Pallavi Kumar', email: 'pallavi@test.com', studentId: 'SWD034', branch: 'CIVIL', college: 'Eng College', year: 4, phone: '9876543243', room: 12 },
  
  // Room 13
  { name: 'Arpit Jain', email: 'arpit@test.com', studentId: 'SWD035', branch: 'CSE', college: 'Tech Institute', year: 3, phone: '9876543244', room: 13 },
  { name: 'Sakshi Reddy', email: 'sakshi@test.com', studentId: 'SWD036', branch: 'IT', college: 'Tech Institute', year: 2, phone: '9876543245', room: 13 },
  { name: 'Mohit Yadav', email: 'mohit@test.com', studentId: 'SWD037', branch: 'ECE', college: 'Eng College', year: 1, phone: '9876543246', room: 13 },
  { name: 'Ishita Mishra', email: 'ishita@test.com', studentId: 'SWD038', branch: 'MECH', college: 'Eng College', year: 4, phone: '9876543247', room: 13 },
  
  // Room 14
  { name: 'Yash Tiwari', email: 'yash@test.com', studentId: 'SWD039', branch: 'CIVIL', college: 'Eng College', year: 3, phone: '9876543248', room: 14 },
  { name: 'Tanvi Gupta', email: 'tanvi@test.com', studentId: 'SWD040', branch: 'CSE', college: 'Tech Institute', year: 2, phone: '9876543249', room: 14 },
  { name: 'Abhishek Patel', email: 'abhishek@test.com', studentId: 'SWD041', branch: 'IT', college: 'Tech Institute', year: 1, phone: '9876543250', room: 14 },
  
  // Room 15
  { name: 'Priyanka Singh', email: 'priyanka@test.com', studentId: 'SWD042', branch: 'ECE', college: 'Eng College', year: 4, phone: '9876543251', room: 15 },
  { name: 'Vishal Kumar', email: 'vishal@test.com', studentId: 'SWD043', branch: 'MECH', college: 'Eng College', year: 3, phone: '9876543252', room: 15 },
  { name: 'Aditi Sharma', email: 'aditi@test.com', studentId: 'SWD044', branch: 'CIVIL', college: 'Eng College', year: 2, phone: '9876543253', room: 15 },
  
  // Room 16
  { name: 'Rohit Joshi', email: 'rohit.j@test.com', studentId: 'SWD045', branch: 'CSE', college: 'Tech Institute', year: 1, phone: '9876543254', room: 16 },
  { name: 'Snehal Das', email: 'snehal@test.com', studentId: 'SWD046', branch: 'IT', college: 'Tech Institute', year: 4, phone: '9876543255', room: 16 },
  
  // Room 17
  { name: 'Kiran Verma', email: 'kiran@test.com', studentId: 'SWD047', branch: 'ECE', college: 'Eng College', year: 3, phone: '9876543256', room: 17 },
  { name: 'Pooja Singh', email: 'pooja.s@test.com', studentId: 'SWD048', branch: 'MECH', college: 'Eng College', year: 2, phone: '9876543257', room: 17 },
  { name: 'Rajat Gupta', email: 'rajat@test.com', studentId: 'SWD049', branch: 'CIVIL', college: 'Eng College', year: 1, phone: '9876543258', room: 17 },
  
  // Room 18
  { name: 'Nidhi Patel', email: 'nidhi@test.com', studentId: 'SWD050', branch: 'CSE', college: 'Tech Institute', year: 4, phone: '9876543259', room: 18 },
  { name: 'Saurabh Kumar', email: 'saurabh@test.com', studentId: 'SWD051', branch: 'IT', college: 'Tech Institute', year: 3, phone: '9876543260', room: 18 },
  { name: 'Ritu Sharma', email: 'ritu@test.com', studentId: 'SWD052', branch: 'ECE', college: 'Eng College', year: 2, phone: '9876543261', room: 18 },
  { name: 'Deepak Singh', email: 'deepak.s@test.com', studentId: 'SWD053', branch: 'MECH', college: 'Eng College', year: 1, phone: '9876543262', room: 18 },
  
  // Room 19
  { name: 'Kavita Jain', email: 'kavita@test.com', studentId: 'SWD054', branch: 'CIVIL', college: 'Eng College', year: 4, phone: '9876543263', room: 19 },
  { name: 'Ankit Yadav', email: 'ankit@test.com', studentId: 'SWD055', branch: 'CSE', college: 'Tech Institute', year: 3, phone: '9876543264', room: 19 },
  
  // Room 20
  { name: 'Shweta Mishra', email: 'shweta@test.com', studentId: 'SWD056', branch: 'IT', college: 'Tech Institute', year: 2, phone: '9876543265', room: 20 },
  { name: 'Manoj Tiwari', email: 'manoj@test.com', studentId: 'SWD057', branch: 'ECE', college: 'Eng College', year: 1, phone: '9876543266', room: 20 },
  { name: 'Sunita Gupta', email: 'sunita.g@test.com', studentId: 'SWD058', branch: 'MECH', college: 'Eng College', year: 4, phone: '9876543267', room: 20 }
];

async function addMoreStudents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected!\n');
    
    console.log('Adding more students to rooms 11-20...');
    for (const s of moreStudents) {
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
    const allStudents = await User.find({ role: 'student' });
    
    for (const room of rooms) {
      const count = allStudents.filter(s => s.roomNumber === room.roomNumber).length;
      room.currentOccupancy = count;
      await room.save();
      if (count > 0) {
        console.log(`Room ${room.roomNumber}: ${count}/${room.capacity}`);
      }
    }
    
    console.log('\n=== UPDATED ROOM-STUDENT LIST ===');
    const roomGroups = {};
    allStudents.forEach(s => {
      if (!roomGroups[s.roomNumber]) roomGroups[s.roomNumber] = [];
      roomGroups[s.roomNumber].push(s);
    });
    
    Object.keys(roomGroups).sort((a,b) => a-b).forEach(roomNum => {
      console.log(`\nROOM ${roomNum} (${roomGroups[roomNum].length} students):`);
      roomGroups[roomNum].forEach((s, i) => {
        console.log(`  ${i+1}. ${s.name} (${s.studentId}) - ${s.branch} Year ${s.year}`);
      });
    });
    
    console.log(`\nSUCCESS! Total students now: ${allStudents.length}`);
    console.log(`Occupied rooms: ${Object.keys(roomGroups).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

addMoreStudents();
