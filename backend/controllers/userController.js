const User = require('../models/User');
const Room = require('../models/Room');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

/**
 * Generate a secure random password that meets User model requirements
 * @returns {String} A secure password
 */
const generateSecurePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@$!%*?&'; // Only symbols allowed by User model validation
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters from allowed set
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Send welcome email with password to new student
 * @param {Object} user - User object with email and name
 * @param {String} password - Generated password
 */
const sendWelcomeEmail = async (user, password) => {
  const subject = 'Welcome to Hostel Management System - Your Login Credentials';
  
  const text = `
    Dear ${user.name},

    Welcome to the Hostel Management System! Your account has been successfully created.

    Your login credentials are:
    Email: ${user.email}
    Password: ${password}

    Please change your password after your first login for security purposes.

    If you have any questions, please contact the hostel administration.

    Best regards,
    Hostel Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Welcome to Hostel Management System</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      
      <p>Welcome to the Hostel Management System! Your account has been successfully created.</p>
      
      <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #495057;">Your Login Credentials:</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
      </div>
      
      <p>If you have any questions, please contact the hostel administration.</p>
      
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { role, year, branch, college, roomNumber, unassigned, email, studentId } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (college) filter.college = college;
    if (email) filter.email = email;
    if (studentId) filter.studentId = studentId;

    // Handle roomNumber filter specially
    if (unassigned === 'true' || roomNumber === 'null') {
      filter.roomNumber = { $exists: false }; // Find users with no room assigned
    } else if (roomNumber === 'undefined') {
      filter.roomNumber = { $exists: false }; // Another way to find users with no room
    } else if (roomNumber) {
      // Convert to number if it's a valid number
      const roomNum = parseInt(roomNumber);
      if (!isNaN(roomNum)) {
        filter.roomNumber = roomNum;
      }
    }
    
    const users = await User.find(filter).sort('name');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
/**
 * @desc    Get current logged in user
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
  try {
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Validate required fields for student role
    if (req.body.role === 'student') {
      if (!req.body.college) {
        return res.status(400).json({
          success: false,
          message: 'College name is required for students'
        });
      }
      
      if (!req.body.phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for students'
        });
      }
      
      // Validate phone number format
      if (!/^\d{10}$/.test(req.body.phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits without spaces or dashes'
        });
      }
      
      // If creating a student with a room number, check if room exists and has capacity
      if (req.body.roomNumber) {
        const room = await Room.findOne({ roomNumber: req.body.roomNumber });
        
        if (!room) {
          return res.status(404).json({
            success: false,
            message: `Room not found with number ${req.body.roomNumber}`
          });
        }
        
        if (room.specialPurpose) {
          return res.status(400).json({
            success: false,
            message: `Room ${req.body.roomNumber} is a special purpose room and cannot be assigned to students`
          });
        }
        
        if (!room.isAvailable()) {
          return res.status(400).json({
            success: false,
            message: `Room ${req.body.roomNumber} is at full capacity`
          });
        }
      }
    }
    
    // Handle auto-generated password for students
    let generatedPassword = null;
    console.log('🔍 Debug: Request body before processing:', req.body);
    console.log('🔍 Debug: autoGeneratePassword =', req.body.autoGeneratePassword);
    console.log('🔍 Debug: role =', req.body.role);
    console.log('🔍 Debug: password =', req.body.password);
    
    if (req.body.role === 'student' && req.body.autoGeneratePassword) {
      console.log('🔐 Generating password for student with autoGeneratePassword flag');
      generatedPassword = generateSecurePassword();
      req.body.password = generatedPassword;
    } else if (req.body.role === 'student' && !req.body.password) {
      console.log('🔐 Generating password for student without password');
      generatedPassword = generateSecurePassword();
      req.body.password = generatedPassword;
    }
    
    // Remove autoGeneratePassword from request body as it's not part of User model
    delete req.body.autoGeneratePassword;
    
    console.log('🔍 Debug: Request body after processing:', req.body);
    console.log('🔍 Debug: Generated password:', generatedPassword);
    
    const user = await User.create(req.body);
    
    // If student was created with a room number, update the room
    if (user.role === 'student' && user.roomNumber) {
      await Room.findOneAndUpdate(
        { roomNumber: user.roomNumber },
        { 
          $push: { students: user._id },
          $inc: { currentOccupancy: 1 }
        }
      );
    }
    
    // Send welcome email with password if auto-generated
    if (generatedPassword) {
      try {
        await sendWelcomeEmail(user, generatedPassword);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the user creation if email fails
      }
    }
    
    res.status(201).json({
      success: true,
      data: user,
      message: generatedPassword ? 'Student created successfully! Password has been sent to their email.' : 'User created successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Find user
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    // Validate required fields for student role
    if (user.role === 'student') {
      if (req.body.role === 'student' && !req.body.college) {
        return res.status(400).json({
          success: false,
          message: 'College name is required for students'
        });
      }
      
      if (req.body.role === 'student' && !req.body.phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for students'
        });
      }
      
      // Validate phone number format if provided
      if (req.body.role === 'student' && req.body.phoneNumber && !/^\d{10}$/.test(req.body.phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits without spaces or dashes'
        });
      }
      
      // Check if room assignment is changing for a student
      if (req.body.roomNumber && user.roomNumber !== req.body.roomNumber) {
        // Remove from old room if exists
        if (user.roomNumber) {
          await Room.findOneAndUpdate(
            { roomNumber: user.roomNumber },
            { 
              $pull: { students: user._id },
              $inc: { currentOccupancy: -1 }
            }
          );
        }
      
        // Check if new room exists and has capacity
        const newRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
        
        if (!newRoom) {
          return res.status(404).json({
            success: false,
            message: `Room not found with number ${req.body.roomNumber}`
          });
        }
        
        if (newRoom.specialPurpose) {
          return res.status(400).json({
            success: false,
            message: `Room ${req.body.roomNumber} is a special purpose room and cannot be assigned to students`
          });
        }
        
        if (!newRoom.isAvailable()) {
          return res.status(400).json({
            success: false,
            message: `Room ${req.body.roomNumber} is at full capacity`
          });
        }
        
        // Add to new room
        await Room.findOneAndUpdate(
          { roomNumber: req.body.roomNumber },
          { 
            $push: { students: user._id },
            $inc: { currentOccupancy: 1 }
          }
        );
      }
    }
    
    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    // If deleting a student with a room assignment, update the room
    if (user.role === 'student' && user.roomNumber) {
      await Room.findOneAndUpdate(
        { roomNumber: user.roomNumber },
        { $pull: { students: user._id } }
      );
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};