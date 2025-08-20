const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: 'تمام فیلدهای ضروری را پر کنید' });
    }

    if (!['talent', 'casting_director'].includes(role)) {
      return res.status(400).json({ error: 'نقش کاربری نامعتبر' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'کاربری با این ایمیل قبلاً ثبت نام کرده است' });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role
    });

    await user.save();

    // Create profile based on role
    if (role === 'talent') {
      const talentProfile = new TalentProfile({
        user: user._id,
        firstName,
        lastName,
        artisticName: `${firstName} ${lastName}`,
        dateOfBirth: new Date('1990-01-01'), // Default, user will update
        gender: 'other', // Default, user will update
        city: 'تهران', // Default
        province: 'تهران' // Default
      });
      await talentProfile.save();
    } else {
      const directorProfile = new CastingDirectorProfile({
        user: user._id,
        firstName,
        lastName,
        city: 'تهران', // Default
        province: 'تهران' // Default
      });
      await directorProfile.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'ثبت نام با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'خطا در ثبت نام' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور را وارد کنید' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    let profile = null;
    
    if (req.user.role === 'talent') {
      profile = await TalentProfile.findOne({ user: req.user._id });
    } else if (req.user.role === 'casting_director') {
      profile = await CastingDirectorProfile.findOne({ user: req.user._id });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      },
      profile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات کاربر' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'رمز عبور فعلی و جدید را وارد کنید' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد' });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'رمز عبور فعلی اشتباه است' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'خطا در تغییر رمز عبور' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we just confirm the logout
    res.json({
      success: true,
      message: 'خروج با موفقیت انجام شد'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'خطا در خروج' });
  }
});

module.exports = router;