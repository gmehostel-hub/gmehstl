// Quick database seeding script using backend infrastructure
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../backend/.env' });

// Simple seeding function
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Import models after connection
    const User = require('../backend/models/User');
    const Room = require('../backend/models/Room');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('✅ Data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@hostelhaven.com',
      password: 'Admin@123!',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin created:', admin.email);

    // Create warden user
    console.log('👤 Creating warden user...');
    const warden = await User.create({
      name: 'Hostel Warden',
      email: 'warden@hostelhaven.com',
      password: 'Warden@123!',
      role: 'warden',
      isVerified: true
    });
    console.log('✅ Warden created:', warden.email);

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
        switch(i) {
          case 1: purpose = 'Cooking Staff Room'; break;
          case 8: purpose = 'Digital Lab 1'; break;
          case 15: purpose = 'Book Library'; break;
          case 16: purpose = 'Warden Office'; break;
          case 17: purpose = 'Store Room'; break;
          case 31: purpose = 'Digital Lab 2'; break;
        }
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
      { name: 'Raj Kumar', email: 'raj@student.com', swdId: 'SWD001', branch: 'Computer Science' },
      { name: 'Priya Sharma', email: 'priya@student.com', swdId: 'SWD002', branch: 'Electronics' },
      { name: 'Amit Patel', email: 'amit@student.com', swdId: 'SWD003', branch: 'Mechanical' }
    ];

    for (const studentData of students) {
      await User.create({
        ...studentData,
        password: 'Student@123!',
        role: 'student',
        isVerified: true,
        year: '2',
        college: 'GME College',
        stream: 'Engineering',
        phoneNumber: '9876543210'
      });
    }
    console.log(`✅ Created ${students.length} students`);

    console.log('\n🎉 Database seeding completed!');
    console.log('🔑 Login credentials:');
    console.log('   Admin: admin@hostelhaven.com / Admin@123!');
    console.log('   Warden: warden@hostelhaven.com / Warden@123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
