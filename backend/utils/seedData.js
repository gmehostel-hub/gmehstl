require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Book = require('../models/Book');
const Placement = require('../models/Placement');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Seed Rooms first
const seedRooms = async () => {
  try {
    // Clear existing rooms
    await Room.deleteMany({});
    
    const rooms = [];
    
    // Create all 31 rooms
    for (let i = 1; i <= 31; i++) {
      const room = new Room({
        roomNumber: i,
        // Special purpose rooms are handled by the pre-save middleware
        capacity: 6 // Ensure all rooms have capacity of 6
      });
      
      await room.save();
      rooms.push(room);
    }
    
    console.log(`Seeded ${rooms.length} rooms`);
    return rooms;
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async (rooms) => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hostel.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Create warden user
    const warden = await User.create({
      name: 'Warden User',
      email: 'warden@hostel.com',
      password: 'warden123',
      role: 'warden'
    });

    // Create sample student users
    const students = [];
    const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
    const colleges = ['Engineering College A', 'Engineering College B', 'Arts College', 'Science College'];
    
    // Get regular rooms (non-special purpose)
    const regularRooms = rooms.filter(room => !room.specialPurpose);
    
    // Create exactly 6 students for each regular room
    let studentCounter = 1;
    
    for (const room of regularRooms) {
      // Create 6 students for this room
      for (let i = 0; i < 6; i++) {
        const year = Math.floor(Math.random() * 4) + 1;
        const branch = branches[Math.floor(Math.random() * branches.length)];
        const college = colleges[Math.floor(Math.random() * colleges.length)];
        
        const student = await User.create({
          name: `Student ${studentCounter}`,
          email: `student${studentCounter}@hostel.com`,
          password: 'student123',
          role: 'student',
          studentId: `STU${2023000 + studentCounter}`,
          phoneNumber: `${9000000000 + studentCounter}`.substring(0, 10),
          year,
          branch,
          college,
          roomNumber: room.roomNumber
        });
        
        students.push(student);
        studentCounter++;
      }
      
      // Update room with student IDs and occupancy
      room.students = students.slice(studentCounter - 6, studentCounter).map(student => student._id);
      room.currentOccupancy = 6;
      await room.save();
    }
    
    console.log(`Seeded ${students.length} students, 1 admin, and 1 warden`);
    return { admin, warden, students };
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Seed Books
const seedBooks = async () => {
  try {
    // Clear existing books
    await Book.deleteMany({});
    
    const books = [];
    const bookTitles = [
      'Introduction to Algorithms',
      'Clean Code',
      'Design Patterns',
      'The Pragmatic Programmer',
      'Artificial Intelligence: A Modern Approach',
      'Computer Networks',
      'Database System Concepts',
      'Operating System Concepts',
      'Compilers: Principles, Techniques, and Tools',
      'Introduction to the Theory of Computation',
      'Discrete Mathematics and Its Applications',
      'Calculus: Early Transcendentals',
      'Physics for Scientists and Engineers',
      'Organic Chemistry',
      'Principles of Economics',
      'To Kill a Mockingbird',
      '1984',
      'Pride and Prejudice',
      'The Great Gatsby',
      'The Catcher in the Rye'
    ];
    
    const authors = [
      'Thomas H. Cormen',
      'Robert C. Martin',
      'Erich Gamma',
      'Andrew Hunt',
      'Stuart Russell',
      'Andrew S. Tanenbaum',
      'Abraham Silberschatz',
      'Abraham Silberschatz',
      'Alfred V. Aho',
      'Michael Sipser',
      'Kenneth H. Rosen',
      'James Stewart',
      'Raymond A. Serway',
      'Paula Y. Bruice',
      'N. Gregory Mankiw',
      'Harper Lee',
      'George Orwell',
      'Jane Austen',
      'F. Scott Fitzgerald',
      'J.D. Salinger'
    ];
    
    for (let i = 0; i < 20; i++) {
      const book = await Book.create({
        title: bookTitles[i],
        author: authors[i],
        bookId: `BK${1000 + i}`,
        price: Math.floor(Math.random() * 500) + 100, // Random price between 100 and 600
        available: true
      });
      
      books.push(book);
    }
    
    console.log(`Seeded ${books.length} books`);
    return books;
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

// Seed Placements
const seedPlacements = async (students) => {
  try {
    // Clear existing placements
    await Placement.deleteMany({});
    
    const placements = [];
    const companies = [
      'Google',
      'Microsoft',
      'Amazon',
      'Apple',
      'Facebook',
      'Netflix',
      'IBM',
      'Intel',
      'Oracle',
      'Adobe'
    ];
    
    // Create placements for 40% of students
    const placedStudentsCount = Math.floor(students.length * 0.4);
    const placedStudents = students.slice(0, placedStudentsCount);
    
    for (const student of placedStudents) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const packageOffered = (Math.floor(Math.random() * 50) + 10) * 100000; // Random package between 10-60 LPA
      
      const placement = await Placement.create({
        student: student._id,
        companyName: company,
        packageOffered,
        status: 'placed',
        jobRole: 'Software Engineer'
      });
      
      placements.push(placement);
    }
    
    // Create 'in process' placements for 20% of remaining students
    const inProcessCount = Math.floor((students.length - placedStudentsCount) * 0.2);
    const inProcessStudents = students.slice(placedStudentsCount, placedStudentsCount + inProcessCount);
    
    for (const student of inProcessStudents) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      
      const placement = await Placement.create({
        student: student._id,
        companyName: company,
        status: 'in process',
        jobRole: 'Software Engineer'
      });
      
      placements.push(placement);
    }
    
    // Remaining students are 'not placed'
    const notPlacedStudents = students.slice(placedStudentsCount + inProcessCount);
    
    for (const student of notPlacedStudents) {
      const placement = await Placement.create({
        student: student._id,
        status: 'not placed'
      });
      
      placements.push(placement);
    }
    
    console.log(`Seeded ${placements.length} placements`);
    return placements;
  } catch (error) {
    console.error('Error seeding placements:', error);
    process.exit(1);
  }
};

// Run seeding (Complete data for proper display)
const seedAll = async () => {
  try {
    // Seed rooms first
    const rooms = await seedRooms();
    
    // Seed users (admin, warden, and students)
    const { admin, warden, students } = await seedUsers(rooms);
    
    // Seed books for library management
    const books = await seedBooks();
    
    console.log('Database seeding completed successfully!');
    console.log('Created users:');
    console.log('- Admin:', admin.email);
    console.log('- Warden:', warden.email);
    console.log(`- Students: ${students ? students.length : 0} students created`);
    console.log(`- Rooms: ${rooms.length} rooms created`);
    console.log(`- Books: ${books.length} books created`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();