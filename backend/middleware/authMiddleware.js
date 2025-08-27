const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const validator = require('validator');

// Middleware to protect routes - verify token with enhanced security
exports.protect = async (req, res, next) => {
  try {
    let token;
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Check multiple sources for token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user with security fields
      const user = await User.findById(decoded.id)
        .select('+passwordChangedAt +accountLocked +lockUntil +lastLoginIP +emailVerified');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is invalid. User not found.'
        });
      }
      
      // Check if user account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.'
        });
      }
      
      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Email verification required. Please verify your email address.'
        });
      }
      
      // Check if password was changed after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'Password was recently changed. Please log in again.'
        });
      }
      
      // Enhanced security: Check if IP has changed significantly (optional)
      if (user.lastLoginIP && process.env.NODE_ENV === 'production') {
        const lastIP = user.lastLoginIP;
        const currentIP = clientIP;
        
        // Simple IP change detection (you might want to implement more sophisticated logic)
        if (lastIP !== currentIP) {
          console.log(`[SECURITY ALERT] IP change detected for user ${user.email}: ${lastIP} -> ${currentIP}`);
          // You could implement additional verification here
        }
      }
      
      // Attach user to request object
      req.user = user;
      req.clientIP = clientIP;
      
      // Log access for sensitive routes
      const sensitiveRoutes = ['/api/admin/', '/api/auth/updatepassword', '/api/users/'];
      const isSensitive = sensitiveRoutes.some(route => req.originalUrl.includes(route));
      
      if (isSensitive) {
        console.log(`[SECURITY] Protected route access: ${user.email} (${user.role}) -> ${req.method} ${req.originalUrl} from ${clientIP}`);
      }
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token.'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please log in again.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed.'
        });
      }
    }
  } catch (error) {
    console.error(`[SECURITY ERROR] Authentication middleware error: ${error.message}`);
    next(error);
  }
};

// Enhanced middleware to restrict access based on roles with logging
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      console.log(`[SECURITY ALERT] Unauthorized access attempt: ${req.user.email} (${req.user.role}) tried to access ${req.method} ${req.originalUrl} requiring roles: ${roles.join(', ')}`);
      
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    // Log successful authorization for admin routes
    if (roles.includes('admin')) {
      console.log(`[SECURITY] Admin access granted: ${req.user.email} -> ${req.method} ${req.originalUrl}`);
    }
    
    next();
  };
};

// Middleware to validate request origin and prevent CSRF
exports.validateOrigin = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Skip origin check for GET requests and API documentation
  if (req.method === 'GET' || req.originalUrl.includes('/api-docs')) {
    return next();
  }
  
  if (!origin) {
    return res.status(403).json({
      success: false,
      message: 'Request origin is required'
    });
  }
  
  const isAllowed = allowedOrigins.some(allowedOrigin => 
    origin.startsWith(allowedOrigin)
  );
  
  if (!isAllowed) {
    console.log(`[SECURITY ALERT] Request from unauthorized origin: ${origin}`);
    return res.status(403).json({
      success: false,
      message: 'Request from unauthorized origin'
    });
  }
  
  next();
};

// Middleware to validate admin operations with additional security
exports.validateAdminOperation = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  // For destructive operations, require additional confirmation
  const destructiveOperations = ['DELETE', 'PUT'];
  const destructivePaths = ['/users/', '/rooms/', '/books/'];
  
  const isDestructive = destructiveOperations.includes(req.method) && 
    destructivePaths.some(path => req.originalUrl.includes(path));
  
  if (isDestructive) {
    const confirmHeader = req.headers['x-admin-confirm'];
    if (confirmHeader !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Destructive operation requires confirmation header: X-Admin-Confirm: confirmed'
      });
    }
    
    console.log(`[SECURITY] Admin destructive operation confirmed: ${req.user.email} -> ${req.method} ${req.originalUrl}`);
  }
  
  next();
};