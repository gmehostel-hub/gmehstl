const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', 'backend', '.env') });

// Import models
const User = require(path.resolve(__dirname, '..', 'backend', 'models', 'User'));
const Room = require(path.resolve(__dirname, '..', 'backend', 'models', 'Room'));
const Book = require(path.resolve(__dirname, '..', 'backend', 'models', 'Book'));
const Placement = require(path.resolve(__dirname, '..', 'backend', 'models', 'Placement'));

// Connect to MongoDB
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
  console.log('✅ Connected to MongoDB Atlas');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Book.deleteMany({});
    await Placement.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Admin User (password will be hashed by the model pre-save middleware)
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@hostelhaven.com',
      password: 'Admin@123!',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create Warden User (password will be hashed by the model pre-save middleware)
    console.log('👤 Creating warden user...');
    const wardenUser = await User.create({
      name: 'Hostel Warden',
      email: 'warden@hostelhaven.com',
      password: 'Warden@123!',
      role: 'warden',
      isVerified: true
    });
    console.log('✅ Warden user created:', wardenUser.email);

    // Create Rooms (1-31)
    console.log('🏠 Creating rooms...');
    const rooms = [];
    for (let i = 1; i <= 31; i++) {
      let capacity, purpose, specialPurpose;
      
      // Set special purpose rooms
      switch(i) {
        case 1:
          capacity = 0;
          purpose = 'Cooking Staff Room';
          specialPurpose = true;
          break;
        case 8:
          capacity = 0;
          purpose = 'Digital Lab 1';
          specialPurpose = true;
          break;
        case 15:
          capacity = 0;
          purpose = 'Book Library';
          specialPurpose = true;
          break;
        case 16:
          capacity = 0;
          purpose = 'Warden Office';
          specialPurpose = true;
          break;
        case 17:
          capacity = 0;
          purpose = 'Store Room';
          specialPurpose = true;
          break;
        case 31:
          capacity = 0;
          purpose = 'Digital Lab 2';
          specialPurpose = true;
          break;
        default:
          capacity = Math.floor(Math.random() * 7); // 0 to 6
          purpose = 'Regular';
          specialPurpose = false;
      }

      rooms.push({
        roomNumber: i,
        capacity: capacity,
        currentOccupancy: 0,
        specialPurpose: specialPurpose,
        purpose: purpose,
        students: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Create Sample Students
    console.log('👨‍🎓 Creating sample students...');
    const students = [];
    const sampleStudents = [
      { name: 'Raj Kumar', email: 'raj.kumar@student.com', swdId: 'SWD001', branch: 'Computer Science', year: '3', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543210' },
      { name: 'Priya Sharma', email: 'priya.sharma@student.com', swdId: 'SWD002', branch: 'Electronics', year: '2', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543211' },
      { name: 'Amit Patel', email: 'amit.patel@student.com', swdId: 'SWD003', branch: 'Mechanical', year: '4', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543212' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@student.com', swdId: 'SWD004', branch: 'Civil', year: '1', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543213' },
      { name: 'Vikram Singh', email: 'vikram.singh@student.com', swdId: 'SWD005', branch: 'MBBS', year: '2', college: 'Medical College', stream: 'Medical', phoneNumber: '9876543214' },
      { name: 'Anita Gupta', email: 'anita.gupta@student.com', swdId: 'SWD006', branch: 'Computer Science', year: '3', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543215' },
      { name: 'Rohit Jain', email: 'rohit.jain@student.com', swdId: 'SWD007', branch: 'Electronics', year: '4', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543216' },
      { name: 'Kavya Nair', email: 'kavya.nair@student.com', swdId: 'SWD008', branch: 'Mechanical', year: '2', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543217' }
    ];

    for (let i = 0; i < sampleStudents.length; i++) {
      const student = sampleStudents[i];
      
      // Assign to available rooms
      const availableRoom = createdRooms.find(room => 
        !room.specialPurpose && 
        room.capacity > 0 && 
        room.currentOccupancy < room.capacity
      );

      const studentData = {
        ...student,
        password: 'Student@123!', // Will be hashed by model pre-save middleware
        role: 'student',
        isVerified: true,
        roomNumber: availableRoom ? availableRoom.roomNumber : null
      };

      const createdStudent = await User.create(studentData);
      students.push(createdStudent);

      // Update room occupancy
      if (availableRoom) {
        await Room.findByIdAndUpdate(availableRoom._id, {
          $push: { students: createdStudent._id },
          $inc: { currentOccupancy: 1 }
        });
      }
    }
    console.log(`✅ Created ${students.length} sample students`);

    // Create Sample Books
    console.log('📚 Creating sample books...');
    const books = [
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 5, availableCopies: 3, issuedCopies: 2 },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0073523323', category: 'Computer Science', totalCopies: 4, availableCopies: 2, issuedCopies: 2 },
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', category: 'Computer Science', totalCopies: 6, availableCopies: 4, issuedCopies: 2 },
      { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'Computer Science', totalCopies: 3, availableCopies: 1, issuedCopies: 2 },
      { title: 'Digital Electronics', author: 'Morris Mano', isbn: '978-0132543033', category: 'Electronics', totalCopies: 4, availableCopies: 3, issuedCopies: 1 },
      { title: 'Mechanical Engineering Design', author: 'Joseph Edward Shigley', isbn: '978-0073398204', category: 'Mechanical', totalCopies: 3, availableCopies: 2, issuedCopies: 1 },
      { title: 'Structural Analysis', author: 'Russell C. Hibbeler', isbn: '978-0134382593', category: 'Civil', totalCopies: 5, availableCopies: 4, issuedCopies: 1 },
      { title: 'Gray\'s Anatomy', author: 'Henry Gray', isbn: '978-0443066849', category: 'Medical', totalCopies: 2, availableCopies: 1, issuedCopies: 1 }
    ];

    const createdBooks = await Book.insertMany(books.map(book => ({
      ...book,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    console.log(`✅ Created ${createdBooks.length} sample books`);

    // Create Sample Placements
    console.log('💼 Creating sample placements...');
    const placements = [
      { studentName: 'Raj Kumar', branch: 'Computer Science', year: '3', companyName: 'TCS', jobRole: 'Software Developer', packageOffered: 350000 },
      { studentName: 'Priya Sharma', branch: 'Electronics', year: '2', companyName: 'Infosys', jobRole: 'Systems Engineer', packageOffered: 320000 },
      { studentName: 'Amit Patel', branch: 'Mechanical', year: '4', companyName: 'L&T', jobRole: 'Design Engineer', packageOffered: 450000 },
      { studentName: 'Anita Gupta', branch: 'Computer Science', year: '3', companyName: 'Wipro', jobRole: 'Software Engineer', packageOffered: 380000 },
      { studentName: 'Rohit Jain', branch: 'Electronics', year: '4', companyName: 'Accenture', jobRole: 'Technology Analyst', packageOffered: 420000 }
    ];

    const createdPlacements = await Placement.insertMany(placements.map(placement => ({
      ...placement,
      status: 'placed',
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    console.log(`✅ Created ${createdPlacements.length} sample placements`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👤 Users: ${students.length + 2} (${students.length} students, 1 admin, 1 warden)`);
    console.log(`   🏠 Rooms: ${createdRooms.length} (${createdRooms.filter(r => !r.specialPurpose).length} regular, ${createdRooms.filter(r => r.specialPurpose).length} special purpose)`);
    console.log(`   📚 Books: ${createdBooks.length}`);
    console.log(`   💼 Placements: ${createdPlacements.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@hostelhaven.com / Admin@123!');
    console.log('   Warden: warden@hostelhaven.com / Warden@123!');
    console.log('   Students: [student-email] / Student@123!');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
});
