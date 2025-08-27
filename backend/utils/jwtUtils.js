const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} user - User object with id
 * @returns {String} JWT token
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Generate response with token
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Response object with token and user data
 */
exports.generateAuthResponse = (user, statusCode = 200) => {
  // Generate token
  const token = exports.generateToken(user);
  
  // Remove password from output
  user.password = undefined;
  
  return {
    statusCode,
    body: {
      success: true,
      token,
      user
    }
  };
};