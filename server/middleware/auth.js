const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: '../.env' });

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'دسترسی غیر مجاز - توکن یافت نشد' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'دسترسی غیر مجاز - کاربر یافت نشد' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'دسترسی غیر مجاز - توکن نامعتبر' });
  }
};

// Optional auth middleware that doesn't fail if no token is provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Middleware to check if user is a talent
const requireTalent = (req, res, next) => {
  if (req.user.role !== 'talent') {
    return res.status(403).json({ error: 'دسترسی محدود - فقط برای استعدادها' });
  }
  next();
};

// Middleware to check if user is a casting director
const requireCastingDirector = (req, res, next) => {
  if (req.user.role !== 'casting_director') {
    return res.status(403).json({ error: 'دسترسی محدود - فقط برای کارگردانان کستینگ' });
  }
  next();
};

// Middleware to check if user is a journalist/writer
const requireJournalist = (req, res, next) => {
  if (req.user.role !== 'journalist') {
    return res.status(403).json({ error: 'دسترسی محدود - فقط برای نویسندگان' });
  }
  next();
};

// Middleware to check if user profile is complete
const requireCompleteProfile = async (req, res, next) => {
  try {
    let profile;
    
    if (req.user.role === 'talent') {
      profile = await require('../models/TalentProfile').findOne({ user: req.user._id });
    } else if (req.user.role === 'casting_director') {
      profile = await require('../models/CastingDirectorProfile').findOne({ user: req.user._id });
    }
    
    if (!profile) {
      return res.status(400).json({ 
        error: 'لطفاً ابتدا پروفایل خود را تکمیل کنید',
        requiresProfile: true 
      });
    }
    
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({ error: 'خطا در بررسی پروفایل' });
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireTalent,
  requireCastingDirector,
  requireJournalist,
  requireCompleteProfile
};