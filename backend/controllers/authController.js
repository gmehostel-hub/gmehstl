const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { generateToken, generateAuthResponse } = require('../utils/jwtUtils');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

// Enhanced login rate limiter per IP - DISABLED
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many login attempts from this IP, please try again in 15 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   skipSuccessfulRequests: true
// });

// Dummy middleware to replace rate limiter
const loginLimiter = (req, res, next) => next();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, year, branch, college, roomNumber, phoneNumber } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Enhanced input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Sanitize and normalize inputs
    const sanitizedEmail = validator.normalizeEmail(email.toLowerCase().trim());
    const sanitizedName = validator.escape(name.trim());
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Validate role
    const userRole = role || 'student';
    const allowedRoles = ['admin', 'warden', 'student'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Enhanced validation for students
    if (userRole === 'student') {
      if (!roomNumber || !college || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Room number, college, and phone number are required for student registration'
        });
      }
      
      // Validate phone number
      if (!validator.isMobilePhone(phoneNumber, 'en-IN')) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Indian mobile number'
        });
      }
    }
    
    // Only allow admin registration from specific IPs or with admin approval
    if (userRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin registration requires special authorization'
      });
    }
    
    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      role: userRole,
      studentId,
      year,
      branch,
      college,
      roomNumber,
      phoneNumber,
      emailVerified: process.env.NODE_ENV !== 'production' // Auto-verify in development
    });
    
    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();
    
    // Log registration
    console.log(`[SECURITY] New user registration: ${sanitizedEmail} (${userRole}) from IP: ${clientIP} at ${new Date().toISOString()}`);
    
    // In a real application, send verification email here
    // await sendVerificationEmail(user.email, verificationToken);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error(`[SECURITY ERROR] Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Enhanced input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Sanitize email (REMOVED problematic normalization)
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Check if user exists and get security fields
    const user = await User.findOne({ email: sanitizedEmail })
      .select('+password +loginAttempts +lockUntil +accountLocked +emailVerified');
    
    if (!user) {
      // Simulate password comparison time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if email is verified (disabled for development)
    if (!user.emailVerified && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }
    
    // Check if account is locked - DISABLED
    // if (user.isLocked) {
    //   const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    //   return res.status(423).json({
    //     success: false,
    //     message: `Account is temporarily locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
    //   });
    // }
    
    // Check if password matches (this will handle login attempts internally)
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Log failed login attempt
      console.log(`[SECURITY ALERT] Failed login attempt for ${sanitizedEmail} from IP: ${clientIP} at ${new Date().toISOString()}`);
      
      // Login attempt tracking and lockout disabled - simple error message
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }
    
    // Successful login - update last login info
    await user.updateLastLogin(clientIP);
    
    // Log successful login
    console.log(`[SECURITY] Successful login for ${sanitizedEmail} from IP: ${clientIP} at ${new Date().toISOString()}`);
    
    // Generate token and send response
    const authResponse = generateAuthResponse(user);
    
    // Set secure HTTP-only cookie
    res.cookie('authToken', authResponse.body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.status(authResponse.statusCode).json(authResponse.body);
  } catch (error) {
    console.error(`[SECURITY ERROR] Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get OTP
    const otp = user.getOtp();
    await user.save({ validateBeforeSave: false });

    const message = `Your One-Time Password (OTP) for password reset is: ${otp}. It is valid for 5 minutes.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Password Reset OTP',
        text: message
      });

      res.status(200).json({ success: true, data: 'OTP sent to email' });
    } catch (err) {
      console.error('Error sending OTP email:', err);
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    // Hash the provided OTP
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOtp,
      otpExpire: { $gt: Date.now() }
    }).select('+otp');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or OTP has expired' });
    }

    // Set new password and clear OTP fields
    user.password = password;
    user.markModified('password'); // Ensure the pre-save hook is triggered
    user.otp = undefined;
    user.otpExpire = undefined;

    try {
      await user.save();
    } catch (saveError) {
      // Specifically handle the password validation error from the pre-save hook
      if (saveError.message && saveError.message.includes('Password must contain')) {
        return res.status(400).json({ success: false, message: saveError.message });
      }
      // Re-throw other save errors to be caught by the main catch block
      throw saveError;
    }

    // Send back a token for auto-login
    const authResponse = generateAuthResponse(user);
    res.status(authResponse.statusCode).json(authResponse.body);
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Generate token and send response
    const authResponse = generateAuthResponse(user);
    res.status(authResponse.statusCode).json(authResponse.body);
  } catch (error) {
    next(error);
  }
};