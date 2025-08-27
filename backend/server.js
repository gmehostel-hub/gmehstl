require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

console.log('🚀 Starting Hostel Management System Backend...');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookRoutes = require('./routes/bookRoutes');
const placementRoutes = require('./routes/placementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const testRoutes = require('./routes/testRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// CORS configuration
const allowedOrigins = [
  'https://hostel-management-frontend.vercel.app',
  'https://hostel-management-frontend-*.vercel.app',
  'https://hostel-management-frontend-*-gmehostel-4665s-projects.vercel.app'
];

// Add default development origins
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  );
}

// Add CORS_ORIGINS from environment if it exists
if (process.env.CORS_ORIGINS) {
  const origins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  origins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('Allowed CORS origins:', allowedOrigins);

// Development CORS configuration (more permissive)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or matches a pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Convert allowed origin to regex if it contains *
      if (allowedOrigin.includes('*')) {
        const regexPattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
        return regexPattern.test(origin);
      }
      return origin === allowedOrigin;
    });

    if (!isAllowed) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-access-token'],
  exposedHeaders: ['x-access-token'],
  maxAge: 86400 // 24 hours
};

// Rate limiting - DISABLED
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs
//   message: 'Too many authentication attempts, please try again later.'
// });

// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });

// Dummy middleware to replace rate limiters
const authLimiter = (req, res, next) => next();
const generalLimiter = (req, res, next) => next();

// Security logging middleware
const securityLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Data sanitization middleware
const sanitizeData = (req, res, next) => {
  mongoSanitize()(req, res, () => {
    xss()(req, res, next);
  });
};

// Input validation middleware - DISABLED
// const validateInput = hpp();
const validateInput = (req, res, next) => next(); // Dummy middleware

// Apply security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);
app.use(securityLogger);

// Body parsing with size limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 20 // Limit number of parameters
}));

// Cookie parser for secure cookie handling
app.use(cookieParser());

// Data sanitization middleware - DISABLED
// app.use(sanitizeData);

// Input validation and sanitization - DISABLED
// app.use(validateInput);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Management System API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Hostel Management System API',
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Start server
  const server = app.listen(PORT, () => {
    console.log('🚀 ===================================');
    console.log(`🏠 Hostel Management System Server`);
    console.log(`🌐 Running on port ${PORT}`);
    console.log(`🔒 Security features enabled`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log('🚀 ===================================');
  });

  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});