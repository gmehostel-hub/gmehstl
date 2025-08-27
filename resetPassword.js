// Simple password reset script
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
const mongoose = require('mongoose');
require('dotenv').config();

async function resetStudentPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'student@hostelhaven.com';
    const newPassword = 'Student@123!';

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      // Show all users
      const allUsers = await User.find({}, 'email role name');
      console.log('Available users:');
      allUsers.forEach(u => console.log(`- ${u.email} (${u.role}) - ${u.name}`));
      return;
    }

    console.log('✅ Found user:', user.name);

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('📧 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

resetStudentPassword();
