const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Room = require('../models/Room');
const Book = require('../models/Book');
const Placement = require('../models/Placement');
const Feedback = require('../models/Feedback');

const checkDatabaseData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check Users collection
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const wardenCount = await User.countDocuments({ role: 'warden' });
    const studentCount = await User.countDocuments({ role: 'student' });

    console.log('\n📊 USER DATA:');
    console.log(`Total Users: ${userCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Wardens: ${wardenCount}`);
    console.log(`Students: ${studentCount}`);

    // Check Rooms collection
    const roomCount = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ currentOccupancy: { $gt: 0 } });
    const availableRooms = await Room.countDocuments({ 
      $expr: { $lt: ['$currentOccupancy', '$capacity'] },
      specialPurpose: { $ne: true }
    });
    const specialPurposeRooms = await Room.countDocuments({ specialPurpose: true });

    console.log('\n🏠 ROOM DATA:');
    console.log(`Total Rooms: ${roomCount}`);
    console.log(`Occupied Rooms: ${occupiedRooms}`);
    console.log(`Available Rooms: ${availableRooms}`);
    console.log(`Special Purpose Rooms: ${specialPurposeRooms}`);

    // Check Books collection
    const bookCount = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ available: true });
    const issuedBooks = await Book.countDocuments({ available: false });

    console.log('\n📚 LIBRARY DATA:');
    console.log(`Total Books: ${bookCount}`);
    console.log(`Available Books: ${availableBooks}`);
    console.log(`Issued Books: ${issuedBooks}`);

    // Check Placements collection
    const placementCount = await Placement.countDocuments();
    const placements = await Placement.find({});
    const uniqueCompanies = [...new Set(placements.map(p => p.company))].length;

    console.log('\n💼 PLACEMENT DATA:');
    console.log(`Total Placements: ${placementCount}`);
    console.log(`Unique Companies: ${uniqueCompanies}`);

    // Check Feedback collection
    const feedbackCount = await Feedback.countDocuments();
    const pendingFeedbacks = await Feedback.countDocuments({ response: { $exists: false } });
    const respondedFeedbacks = await Feedback.countDocuments({ response: { $exists: true } });

    console.log('\n💬 FEEDBACK DATA:');
    console.log(`Total Feedbacks: ${feedbackCount}`);
    console.log(`Pending Feedbacks: ${pendingFeedbacks}`);
    console.log(`Responded Feedbacks: ${respondedFeedbacks}`);

    // Sample some data
    console.log('\n🔍 SAMPLE DATA:');
    const sampleUsers = await User.find({}).limit(3).select('name email role');
    console.log('Sample Users:', sampleUsers);

    const sampleRooms = await Room.find({}).limit(3).select('roomNumber capacity currentOccupancy');
    console.log('Sample Rooms:', sampleRooms);

    const sampleBooks = await Book.find({}).limit(3).select('title author available');
    console.log('Sample Books:', sampleBooks);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

checkDatabaseData();
