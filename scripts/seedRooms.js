const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import the Room model
const Room = require('../backend/models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Delete all existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');
    
    // Create rooms (1-31)
    const rooms = [];
    
    for (let i = 1; i <= 31; i++) {
      rooms.push({
        roomNumber: i,
        capacity: 6, // Default capacity
        currentOccupancy: 0, // Set occupancy to 0
        // specialPurpose and purpose will be set by the pre-save middleware
      });
    }
    
    // Insert rooms into the database
    const createdRooms = await Room.insertMany(rooms);
    console.log(`Successfully created ${createdRooms.length} rooms with 0 occupancy`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
});
