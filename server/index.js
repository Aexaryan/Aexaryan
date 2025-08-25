const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const { trackAnalytics, trackPerformance, trackGeographicData, trackDeviceInfo } = require('./middleware/analytics');

// Import security middleware
const {
  sanitizeInput,
  rateLimiters,
  speedLimiter,
  helmetConfig,
  limitRequestSize,
  securityHeaders,
  securityLogging,
  mongoSanitize,
  hpp
} = require('./middleware/security');

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();

// Security middleware - Optimized for development
app.use(helmetConfig);
app.use(securityHeaders);

// Skip heavy security features in development for better performance
if (process.env.NODE_ENV !== 'development') {
  app.use(securityLogging);
  app.use(limitRequestSize);
  app.use(sanitizeInput);
  app.use(mongoSanitize());
  app.use(hpp());
} else {
  // Lightweight security for development
  app.use(sanitizeInput);
  app.use(mongoSanitize());
}

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware for analytics
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Analytics tracking middleware - TEMPORARILY DISABLED due to timeout issues
// app.use(trackAnalytics);
// app.use(trackPerformance);
// app.use(trackGeographicData);
// app.use(trackDeviceInfo);

// Serve static files from uploads directory (if needed for other uploads)
app.use('/uploads', express.static('uploads'));

// Rate limiting and speed limiting - Optimized for development
if (process.env.NODE_ENV === 'development') {
  // More lenient rate limiting for development
  app.use(rateLimiters.general);
} else {
  // Full rate limiting for production
  app.use(rateLimiters.general);
  app.use(speedLimiter);
}

// Routes with security middleware - Optimized for development
if (process.env.NODE_ENV === 'development') {
  // Reduced rate limiting for development
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/talents', require('./routes/talents'));
  app.use('/api/castings', require('./routes/castings'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/messages', require('./routes/messages'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/identification', require('./routes/identification'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/blogs', require('./routes/blogs'));
  app.use('/api/news', require('./routes/news'));
  app.use('/api/writer', require('./routes/writer'));
} else {
  // Full rate limiting for production
  app.use('/api/auth', rateLimiters.auth, require('./routes/auth'));
  app.use('/api/talents', require('./routes/talents'));
  app.use('/api/castings', require('./routes/castings'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/upload', rateLimiters.upload, require('./routes/upload'));
  app.use('/api/messages', require('./routes/messages'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/identification', require('./routes/identification'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/blogs', require('./routes/blogs'));
  app.use('/api/news', require('./routes/news'));
  app.use('/api/writer', require('./routes/writer'));
}

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided, running without database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Casting Platform API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'خطایی در سرور رخ داده است!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'مسیر مورد نظر یافت نشد' });
});

const PORT = process.env.PORT || 5001;

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🎬 Casting Platform Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });
});

module.exports = { app };