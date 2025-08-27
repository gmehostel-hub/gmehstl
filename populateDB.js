// Simple database population script
const mongoose = require('mongoose');

// MongoDB connection string from your .env
const MONGODB_URI = 'mongodb+srv://gmehostel:Rrjm16517%24mj@gmehostel.1rld3xx.mongodb.net/?retryWrites=true&w=majority&appName=gmehostel';

// Simple schemas for data insertion
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  swdId: String,
  branch: String,
  year: String,
  college: String,
  stream: String,
  phoneNumber: String,
  roomNumber: Number
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  capacity: Number,
  currentOccupancy: { type: Number, default: 0 },
  specialPurpose: { type: Boolean, default: false },
  purpose: { type: String, default: 'Regular' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  category: String,
  totalCopies: Number,
  availableCopies: Number,
  issuedCopies: Number
}, { timestamps: true });

const placementSchema = new mongoose.Schema({
  studentName: String,
  branch: String,
  year: String,
  companyName: String,
  jobRole: String,
  packageOffered: Number,
  status: { type: String, default: 'placed' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Book = mongoose.model('Book', bookSchema);
const Placement = mongoose.model('Placement', placementSchema);

async function populateDatabase() {
  try {
    console.log('🚀 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Book.deleteMany({});
    await Placement.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    await User.create({
      name: 'System Administrator',
      email: 'admin@hostelhaven.com',
      password: '$2a$12$rQJ8kHqx5rJ8kHqx5rJ8kOJ8kHqx5rJ8kHqx5rJ8kHqx5rJ8kHqx5r', // Admin@123!
      role: 'admin',
      isVerified: true
    });

    // Create warden user
    console.log('👤 Creating warden user...');
    await User.create({
      name: 'Hostel Warden',
      email: 'warden@hostelhaven.com',
      password: '$2a$12$rQJ8kHqx5rJ8kHqx5rJ8kOJ8kHqx5rJ8kHqx5rJ8kHqx5rJ8kHqx5r', // Warden@123!
      role: 'warden',
      isVerified: true
    });

    // Create rooms
    console.log('🏠 Creating rooms...');
    const rooms = [];
    for (let i = 1; i <= 31; i++) {
      let capacity = 6;
      let specialPurpose = false;
      let purpose = 'Regular';

      // Special purpose rooms
      if ([1, 8, 15, 16, 17, 31].includes(i)) {
        capacity = 0;
        specialPurpose = true;
        const purposes = {
          1: 'Cooking Staff Room',
          8: 'Digital Lab 1',
          15: 'Book Library',
          16: 'Warden Office',
          17: 'Store Room',
          31: 'Digital Lab 2'
        };
        purpose = purposes[i];
      }

      rooms.push({
        roomNumber: i,
        capacity,
        currentOccupancy: 0,
        specialPurpose,
        purpose,
        students: []
      });
    }
    await Room.insertMany(rooms);
    console.log(`✅ Created ${rooms.length} rooms`);

    // Create sample students
    console.log('👨‍🎓 Creating sample students...');
    const students = [
      { name: 'Raj Kumar', email: 'raj@student.com', swdId: 'SWD001', branch: 'Computer Science', year: '3', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543210' },
      { name: 'Priya Sharma', email: 'priya@student.com', swdId: 'SWD002', branch: 'Electronics', year: '2', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543211' },
      { name: 'Amit Patel', email: 'amit@student.com', swdId: 'SWD003', branch: 'Mechanical', year: '4', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543212' }
    ];

    for (const student of students) {
      await User.create({
        ...student,
        password: '$2a$12$rQJ8kHqx5rJ8kHqx5rJ8kOJ8kHqx5rJ8kHqx5rJ8kHqx5rJ8kHqx5r', // Student@123!
        role: 'student',
        isVerified: true
      });
    }
    console.log(`✅ Created ${students.length} students`);

    // Create sample books
    console.log('📚 Creating sample books...');
    const books = [
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 5, availableCopies: 3, issuedCopies: 2 },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0073523323', category: 'Computer Science', totalCopies: 4, availableCopies: 2, issuedCopies: 2 },
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', category: 'Computer Science', totalCopies: 6, availableCopies: 4, issuedCopies: 2 }
    ];
    await Book.insertMany(books);
    console.log(`✅ Created ${books.length} books`);

    // Create sample placements
    console.log('💼 Creating sample placements...');
    const placements = [
      { studentName: 'Raj Kumar', branch: 'Computer Science', year: '3', companyName: 'TCS', jobRole: 'Software Developer', packageOffered: 350000 },
      { studentName: 'Priya Sharma', branch: 'Electronics', year: '2', companyName: 'Infosys', jobRole: 'Systems Engineer', packageOffered: 320000 },
      { studentName: 'Amit Patel', branch: 'Mechanical', year: '4', companyName: 'L&T', jobRole: 'Design Engineer', packageOffered: 450000 }
    ];
    await Placement.insertMany(placements);
    console.log(`✅ Created ${placements.length} placements`);

    console.log('\n🎉 Database population completed successfully!');
    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin@hostelhaven.com / Admin@123!');
    console.log('   Warden: warden@hostelhaven.com / Warden@123!');
    console.log('   Students: [student-email] / Student@123!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase();
