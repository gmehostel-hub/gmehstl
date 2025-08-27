const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const updateStudentPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Set a common password for all students
    const newPassword = 'Student@123!';
    
    // Hash the password manually
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Find all student users
    const students = await User.find({ role: 'student' });
    
    console.log(`Found ${students.length} student accounts:`);
    
    for (const student of students) {
      console.log(`\nUpdating password for: ${student.name} (${student.email})`);
      
      // Update password directly in database to bypass validation
      await User.updateOne(
        { _id: student._id },
        { 
          password: hashedPassword,
          passwordChangedAt: new Date()
        }
      );
      
      console.log(`✅ Password updated successfully`);
    }
    
    console.log(`\n🎉 All student passwords updated successfully!`);
    console.log(`\n📋 Student Login Credentials:`);
    
    for (const student of students) {
      console.log(`\n👤 ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: ${newPassword}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
updateStudentPasswords();
