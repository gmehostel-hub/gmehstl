const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store in memory (for production, use Redis)
    store: rateLimit.MemoryStore
  });
};

// General rate limiter
exports.generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // 100 requests
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for auth routes
exports.authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again in 15 minutes'
);

// Very strict rate limiter for password reset
exports.passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many password reset attempts, please try again in 1 hour'
);

// CORS configuration
exports.corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token']
};

// Security headers middleware
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Data sanitization middleware
exports.sanitizeData = [
  // Prevent NoSQL injection attacks
  mongoSanitize(),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit']
  })
];

// Request logging middleware for security monitoring
exports.securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const method = req.method;
  const url = req.originalUrl;
  
  // Log security-sensitive requests
  const sensitiveRoutes = ['/api/auth/', '/api/admin/', '/api/users/'];
  const isSensitive = sensitiveRoutes.some(route => url.includes(route));
  
  if (isSensitive) {
    console.log(`[SECURITY] ${timestamp} - ${ip} - ${method} ${url} - ${userAgent}`);
  }
  
  // Log failed authentication attempts
  res.on('finish', () => {
    if (url.includes('/api/auth/login') && res.statusCode === 401) {
      console.log(`[SECURITY ALERT] Failed login attempt - ${timestamp} - ${ip} - ${userAgent}`);
    }
  });
  
  next();
};

// Input validation middleware
exports.validateInput = (req, res, next) => {
  // Remove any null bytes
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.replace(/\0/g, '');
    }
    return str;
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            obj[key] = sanitizeString(obj[key]);
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        }
      }
    }
    return obj;
  };
  
  // Sanitize request body, query, and params
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// API key validation for sensitive operations
exports.validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  if (req.path.includes('/api/admin/') && req.method !== 'GET') {
    if (!apiKey || !validApiKeys.includes(apiKey)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing API key for administrative operations'
      });
    }
  }
  
  next();
};

// Prevent timing attacks on authentication
exports.preventTimingAttacks = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const minDuration = 100; // Minimum response time in ms
    
    if (duration < minDuration && req.path.includes('/api/auth/')) {
      // Add artificial delay to prevent timing attacks
      setTimeout(() => {}, minDuration - duration);
    }
  });
  
  next();
};
