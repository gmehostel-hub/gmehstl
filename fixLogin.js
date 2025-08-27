// Fix login issue by creating users with properly hashed passwords
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://gmehostel:Rrjm16517%24mj@gmehostel.1rld3xx.mongodb.net/?retryWrites=true&w=majority&appName=gmehostel';

// User schema (simplified)
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

const User = mongoose.model('User', userSchema);

async function fixLoginIssue() {
  try {
    console.log('🚀 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Delete existing users to recreate with proper passwords
    console.log('🧹 Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Existing users cleared');

    // Hash passwords properly
    console.log('🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('Admin@123!', 12);
    const wardenPassword = await bcrypt.hash('Warden@123!', 12);
    const studentPassword = await bcrypt.hash('Student@123!', 12);
    console.log('✅ Passwords hashed');

    // Create admin user with properly hashed password
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@hostelhaven.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin user created:', admin.email);

    // Create warden user with properly hashed password
    console.log('👤 Creating warden user...');
    const warden = await User.create({
      name: 'Hostel Warden',
      email: 'warden@hostelhaven.com',
      password: wardenPassword,
      role: 'warden',
      isVerified: true
    });
    console.log('✅ Warden user created:', warden.email);

    // Create sample students with properly hashed passwords
    console.log('👨‍🎓 Creating sample students...');
    const students = [
      { name: 'Raj Kumar', email: 'raj@student.com', swdId: 'SWD001', branch: 'Computer Science', year: '3', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543210' },
      { name: 'Priya Sharma', email: 'priya@student.com', swdId: 'SWD002', branch: 'Electronics', year: '2', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543211' },
      { name: 'Amit Patel', email: 'amit@student.com', swdId: 'SWD003', branch: 'Mechanical', year: '4', college: 'GME College', stream: 'Engineering', phoneNumber: '9876543212' }
    ];

    for (const student of students) {
      await User.create({
        ...student,
        password: studentPassword,
        role: 'student',
        isVerified: true
      });
    }
    console.log(`✅ Created ${students.length} students`);

    console.log('\n🎉 Login fix completed successfully!');
    console.log('🔑 Login Credentials (Updated):');
    console.log('   Admin: admin@hostelhaven.com / Admin@123!');
    console.log('   Warden: warden@hostelhaven.com / Warden@123!');
    console.log('   Students: [student-email] / Student@123!');
    console.log('\n✅ You should now be able to login successfully!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing login:', error);
    process.exit(1);
  }
}

fixLoginIssue();
