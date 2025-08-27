const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const setStudentPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Set a common password for all students
    const newPassword = 'Student@123!';
    
    // Find all student users
    const students = await User.find({ role: 'student' });
    
    console.log(`Found ${students.length} student accounts:`);
    
    for (const student of students) {
      console.log(`\nUpdating password for: ${student.name} (${student.email})`);
      
      // Update password - the pre-save middleware will handle hashing
      student.password = newPassword;
      await student.save();
      
      console.log(`✅ Password updated successfully`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: ${newPassword}`);
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
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
setStudentPasswords();
