const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Test endpoint to create users
router.post('/create-users', async (req, res) => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123!', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hostelhaven.com',
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true
    });
    
    // Create warden user
    const wardenPassword = await bcrypt.hash('Warden@123!', 12);
    const warden = await User.create({
      name: 'Warden User',
      email: 'warden@hostelhaven.com',
      password: wardenPassword,
      role: 'warden',
      isEmailVerified: true
    });
    
    // Create student user
    const studentPassword = await bcrypt.hash('Student@123!', 12);
    const student = await User.create({
      name: 'Student User',
      email: 'student@hostelhaven.com',
      password: studentPassword,
      role: 'student',
      isEmailVerified: true,
      studentId: 'STU001',
      year: 2,
      branch: 'Computer Science',
      college: 'Tech College'
    });
    
    res.json({
      success: true,
      message: 'Users created successfully!',
      users: [
        { email: admin.email, role: admin.role },
        { email: warden.email, role: warden.role },
        { email: student.email, role: student.role }
      ],
      credentials: {
        admin: { email: 'admin@hostelhaven.com', password: 'Admin@123!' },
        warden: { email: 'warden@hostelhaven.com', password: 'Warden@123!' },
        student: { email: 'student@hostelhaven.com', password: 'Student@123!' }
      }
    });
  } catch (error) {
    console.error('Error creating users:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating users',
      error: error.message
    });
  }
});

// Test endpoint to check if users exist
router.get('/check-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking users',
      error: error.message
    });
  }
});

module.exports = router;
