const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updatePassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find user by email
    const email = 'student@hostelhaven.com';
    const newPassword = 'Student@123!';
    
    console.log(`Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);
    
    // Update password - the pre-save middleware will handle hashing
    user.password = newPassword;
    await user.save();
    
    console.log(`✅ Password updated successfully for ${user.email}`);
    console.log(`New password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    
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
updatePassword();
