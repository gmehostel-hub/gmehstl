const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const updateStudentPassword = async () => {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected to MongoDB');
    
    // Get the database and collection
    const db = client.db(); // Uses default database from connection string
    const usersCollection = db.collection('users');
    
    // Find the student user
    const email = 'student@hostelhaven.com';
    const newPassword = 'Student@123!';
    
    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await usersCollection.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      
      // Let's see what users exist
      console.log('🔍 Checking all users in database...');
      const allUsers = await usersCollection.find({}).toArray();
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role || 'no role'})`);
      });
      return;
    }
    
    console.log('✅ User found:', user.name);
    console.log('📝 Current user details:');
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Room Number:', user.roomNumber || 'Not assigned');
    
    // Hash the new password
    console.log('🔐 Hashing new password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password
    console.log('💾 Updating password in database...');
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    if (updateResult.modifiedCount === 1) {
      console.log('✅ Password updated successfully!');
      console.log('📧 New login credentials:');
      console.log('  - Email:', email);
      console.log('  - Password:', newPassword);
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password);
      
      if (passwordMatch) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
      }
    } else {
      console.log('❌ Password update failed!');
    }
    
  } catch (error) {
    console.error('💥 Error updating password:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      console.log('🔌 Closing database connection...');
      await client.close();
    }
    console.log('👋 Done!');
  }
};

// Run the script
updateStudentPassword();
