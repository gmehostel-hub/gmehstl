const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  otp: {
    type: String,
    select: false
  },
  otpExpire: {
    type: Date,
    select: false
  },
  passwordHistory: {
    type: [String],
    default: [],
    select: false
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'warden', 'student'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    required: function() { return this.role === 'student'; }
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: function() { return this.role === 'student'; },
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  year: {
    type: Number,
    min: 1,
    max: 5,
    required: function() { return this.role === 'student'; }
  },
  branch: {
    type: String,
    trim: true,
    required: function() { return this.role === 'student'; }
  },
  college: {
    type: String,
    trim: true,
    required: function() { return this.role === 'student'; }
  },
  roomNumber: {
    type: Number,
    ref: 'Room',
    required: function() { return this.role === 'student'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Check for strong password before hashing
  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.password);
  if (!isStrongPassword) {
    return next(new Error('Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character'));
  }
  try {
    // Check password history to prevent reuse of last 5 passwords
    if (this.passwordHistory && this.passwordHistory.length > 0) {
      for (let oldPassword of this.passwordHistory) {
        const isReused = await bcrypt.compare(this.password, oldPassword);
        if (isReused) {
          const error = new Error('Cannot reuse any of the last 5 passwords');
          error.name = 'ValidationError';
          return next(error);
        }
      }
    }
    
    // Generate salt with configurable rounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Store current password in history before hashing new one
    if (this.password && !this.isNew) {
      this.passwordHistory = this.passwordHistory || [];
      this.passwordHistory.push(this.password);
      // Keep only last 5 passwords
      if (this.passwordHistory.length > 5) {
        this.passwordHistory = this.passwordHistory.slice(-5);
      }
    }
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password with account lockout logic
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If account is locked, don't attempt password comparison
  if (this.isLocked) {
    return false;
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // If password matches, reset login attempts and update last login
  if (isMatch) {
    // Reset login attempts if they exist - DISABLED
    // if (this.loginAttempts > 0) {
    //   await this.updateOne({
    //     loginAttempts: 0,
    //     $unset: { lockUntil: 1 },
    //     accountLocked: false
    //   });
    // }
    return true;
  }
  
  // Password didn't match, increment login attempts - DISABLED
  // await this.incLoginAttempts();
  return false;
};

// Method to increment login attempts and lock account if necessary - DISABLED
userSchema.methods.incLoginAttempts = async function() {
  // Login attempts tracking disabled - no-op function
  return Promise.resolve();
  
  // Original code disabled:
  // const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  // const lockTime = parseInt(process.env.LOCKOUT_TIME) * 60 * 1000 || 15 * 60 * 1000; // 15 minutes
  // 
  // // If we have a previous lock that has expired, restart at 1
  // if (this.lockUntil && this.lockUntil < Date.now()) {
  //   return this.updateOne({
  //     $unset: { lockUntil: 1 },
  //     $set: { loginAttempts: 1, accountLocked: false }
  //   });
  // }
  // 
  // const updates = { $inc: { loginAttempts: 1 } };
  // 
  // // If we have reached max attempts and it's not locked already, lock the account
  // if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
  //   updates.$set = {
  //     lockUntil: Date.now() + lockTime,
  //     accountLocked: true
  //   };
  // }
  // 
  // return this.updateOne(updates);
};

// Method to update last login information
userSchema.methods.updateLastLogin = async function(ipAddress) {
  this.lastLogin = Date.now();
  this.lastLoginIP = ipAddress;
  await this.save();
};

// Method to generate OTP
userSchema.methods.getOtp = function () {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to otp field
  this.otp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire time to 5 minutes
  this.otpExpire = Date.now() + 5 * 60 * 1000;

  // Return the plain text OTP
  return otp;
};

// Method to generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expire time (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Static method to find user by reset token
userSchema.statics.findByResetToken = function(resetToken) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

// Static method to find user by email verification token
userSchema.statics.findByVerificationToken = function(verificationToken) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;