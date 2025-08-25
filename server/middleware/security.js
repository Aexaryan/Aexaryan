const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const crypto = require('crypto');
const helmet = require('helmet');

// Input sanitization middleware - Optimized for performance
const sanitizeInput = (req, res, next) => {
  // Skip sanitization for GET requests to improve performance
  if (req.method === 'GET') {
    return next();
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Simplified sanitization for better performance
        req.body[key] = req.body[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    });
  }

  // Sanitize query parameters only for potentially dangerous operations
  if (req.query && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      }
    });
  }

  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'داده‌های ورودی نامعتبر است',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('ایمیل معتبر وارد کنید'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک، عدد و کاراکتر خاص باشد'),
  
  name: body('firstName', 'lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage('نام باید بین 2 تا 50 کاراکتر و فقط شامل حروف باشد'),
  
  phone: body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('شماره تلفن معتبر وارد کنید'),
  
  text: body('title', 'description', 'content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('متن باید بین 1 تا 1000 کاراکتر باشد'),
  
  url: body('website', 'socialMedia')
    .optional()
    .isURL()
    .withMessage('لینک معتبر وارد کنید')
};

// Rate limiting configurations - Optimized for development
const rateLimiters = {
  // General API rate limiting - More lenient for development
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 10000 requests per windowMs (increased for development)
    message: {
      error: 'درخواست‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Authentication rate limiting - More lenient for development
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 login attempts per windowMs (increased for development)
    message: {
      error: 'تلاش‌های ورود شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Registration rate limiting - More lenient for development
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // limit each IP to 200 registration attempts per hour (increased for development)
    message: {
      error: 'تلاش‌های ثبت نام شما بیش از حد مجاز است. لطفاً 1 ساعت صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload rate limiting - More lenient for development
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 uploads per 15 minutes (increased for development)
    message: {
      error: 'آپلود فایل‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
};

// Speed limiting - Disabled for development to improve performance
const speedLimiter = (req, res, next) => {
  // Skip speed limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Only apply speed limiting in production
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // allow 100 requests per 15 minutes, then...
    delayMs: () => 200, // Fixed: Use function that returns delay value
    validate: { delayMs: false } // Disable validation warning
  })(req, res, next);
};

// Enhanced helmet configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CSRF token generation middleware
const generateCSRFToken = (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ error: 'خطا در تولید توکن امنیتی' });
  }
};

// CSRF token validation middleware
const validateCSRFToken = (req, res, next) => {
  try {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token) {
      return res.status(403).json({ error: 'توکن امنیتی یافت نشد' });
    }
    
    // For now, we'll accept any token (in production, you'd validate against stored tokens)
    // This is a simplified implementation for demonstration
    next();
  } catch (error) {
    console.error('CSRF validation error:', error);
    res.status(403).json({ error: 'خطا در اعتبارسنجی توکن امنیتی' });
  }
};

// Request size limiting
const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'], 10);
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({ error: 'حجم درخواست بیش از حد مجاز است' });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// IP whitelist middleware (for admin routes)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }
    
    console.warn(`Blocked access attempt from IP: ${clientIP}`);
    res.status(403).json({ error: 'دسترسی غیر مجاز' });
  };
};

// Request logging for security monitoring - Optimized for performance
const securityLogging = (req, res, next) => {
  // Skip detailed logging in development for better performance
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Only log suspicious activities and errors
    if (res.statusCode >= 400) {
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || 'anonymous'
      };
      
      console.warn('Security Warning:', logData);
    }
    
    // Log slow requests (> 1000ms) for performance monitoring
    if (duration > 1000) {
      console.warn('Slow Request:', {
        url: req.url,
        method: req.method,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
};

module.exports = {
  sanitizeInput,
  handleValidationErrors,
  commonValidations,
  rateLimiters,
  speedLimiter,
  helmetConfig,
  generateCSRFToken,
  validateCSRFToken,
  limitRequestSize,
  securityHeaders,
  ipWhitelist,
  securityLogging,
  mongoSanitize,
  hpp
};
