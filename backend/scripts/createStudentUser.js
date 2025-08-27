const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createStudentUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const email = 'student@hostelhaven.com';
    const password = 'Student@123!';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      console.log(`✅ User with email ${email} already exists`);
      console.log(`Updating password for: ${existingUser.name} (${existingUser.email})`);
      
      // Update password
      existingUser.password = password;
      await existingUser.save();
      
      console.log(`✅ Password updated successfully for ${existingUser.email}`);
      console.log(`New password: ${password}`);
    } else {
      console.log(`Creating new user with email: ${email}`);
      
      // Create new user
      const newUser = new User({
        name: 'Student User',
        email: email,
        password: password,
        role: 'student',
        phoneNumber: '9876543210',
        year: 1,
        branch: 'Computer Science',
        college: 'Hostel Haven College'
      });
      
      await newUser.save();
      
      console.log(`✅ User created successfully:`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Password: ${password}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating/updating user:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
createStudentUser();
