const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register with wallet
router.post('/wallet-register', async (req, res) => {
  try {
    const { address, signature, message, username } = req.body;

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check if user already exists
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (user) {
      return res.status(400).json({ error: 'Wallet already registered' });
    }

    // Create new user
    user = new User({
      username: username || `Player_${address.slice(0, 6)}`,
      walletAddress: address.toLowerCase(),
      level: 1,
      experience: 0,
      gamesPlayed: 0,
      gamesWon: 0
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        level: user.level,
        experience: user.experience
      }
    });
  } catch (error) {
    console.error('Wallet registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login with wallet
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Find user
    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        level: user.level,
        experience: user.experience,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon
      }
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        level: user.level,
        experience: user.experience,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;