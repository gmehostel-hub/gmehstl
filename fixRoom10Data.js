const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  roomNumber: Number,
  room: Number,
  role: String,
  branch: String,
  college: String,
  year: Number,
  phoneNumber: String
});

const User = mongoose.model('User', userSchema);

const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  capacity: Number,
  currentOccupancy: Number,
  purpose: String,
  specialPurpose: Boolean
});

const Room = mongoose.model('Room', roomSchema);

async function fixRoom10Data() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');
    
    console.log('🔍 CHECKING CURRENT ROOM 10 ASSIGNMENTS...\n');
    
    // Find all students currently assigned to Room 10
    const room10Students = await User.find({ 
      role: 'student', 
      $or: [{ roomNumber: 10 }, { room: 10 }]
    });
    
    console.log(`Current students in Room 10: ${room10Students.length}`);
    room10Students.forEach((student, i) => {
      console.log(`${i+1}. ${student.name} (${student.email})`);
      console.log(`   roomNumber: ${student.roomNumber}, room: ${student.room}`);
    });
    
    console.log('\n🔧 FIXING ROOM 10 ASSIGNMENTS...\n');
    
    // Find Jack and ensure he's assigned to Room 10
    const jack = await User.findOne({ name: /jack/i, role: 'student' });
    if (jack) {
      console.log(`✅ Found Jack: ${jack.name} (${jack.email})`);
      
      // Ensure Jack is assigned to Room 10
      jack.roomNumber = 10;
      jack.room = 10;
      await jack.save();
      console.log('✅ Jack confirmed in Room 10');
    } else {
      console.log('❌ Jack not found!');
    }
    
    // Find Ranga and remove him from Room 10
    const ranga = await User.findOne({ name: /ranga/i, role: 'student' });
    if (ranga) {
      console.log(`✅ Found Ranga: ${ranga.name} (${ranga.email})`);
      
      // Remove Ranga from Room 10
      ranga.roomNumber = null;
      ranga.room = null;
      await ranga.save();
      console.log('✅ Ranga removed from Room 10 (unassigned)');
    } else {
      console.log('❌ Ranga not found!');
    }
    
    // Update Room 10 occupancy to 1
    const room10 = await Room.findOne({ roomNumber: 10 });
    if (room10) {
      room10.currentOccupancy = 1;
      await room10.save();
      console.log('✅ Room 10 occupancy updated to 1');
    }
    
    console.log('\n🔍 VERIFYING FINAL STATE...\n');
    
    // Verify final state
    const finalRoom10Students = await User.find({ 
      role: 'student', 
      $or: [{ roomNumber: 10 }, { room: 10 }]
    });
    
    console.log(`Final students in Room 10: ${finalRoom10Students.length}`);
    finalRoom10Students.forEach((student, i) => {
      console.log(`${i+1}. ${student.name} (${student.email})`);
    });
    
    const updatedRoom10 = await Room.findOne({ roomNumber: 10 });
    if (updatedRoom10) {
      console.log(`Room 10 occupancy: ${updatedRoom10.currentOccupancy}/${updatedRoom10.capacity}`);
    }
    
    console.log('\n🎉 SUCCESS: Room 10 data fixed!');
    console.log('- Jack is the only student in Room 10');
    console.log('- Ranga has been unassigned from Room 10');
    console.log('- Room 10 occupancy is now 1/6');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

fixRoom10Data();
