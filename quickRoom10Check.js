const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  roomNumber: Number,
  room: Number,
  role: String
});

const User = mongoose.model('User', userSchema);

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');
    
    // Find students in Room 10
    const room10Students = await User.find({ 
      role: 'student', 
      $or: [{ roomNumber: 10 }, { room: 10 }]
    });
    
    console.log(`ROOM 10 STUDENTS FOUND: ${room10Students.length}`);
    room10Students.forEach((student, i) => {
      console.log(`${i+1}. ${student.name} - roomNumber: ${student.roomNumber}, room: ${student.room}`);
    });
    
    // Check Jack specifically
    const jack = await User.findOne({ name: /jack/i, role: 'student' });
    if (jack) {
      console.log(`\nJACK: roomNumber=${jack.roomNumber}, room=${jack.room}`);
    }
    
    // Check Ranga specifically  
    const ranga = await User.findOne({ name: /ranga/i, role: 'student' });
    if (ranga) {
      console.log(`RANGA: roomNumber=${ranga.roomNumber}, room=${ranga.room}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

quickCheck();
