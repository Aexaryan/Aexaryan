const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    default: 'کستینگ پلت',
    required: true
  },
  supportEmail: {
    type: String,
    default: 'support@castingplatform.com',
    required: true
  },
  maxFileSize: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  timezone: {
    type: String,
    default: 'Asia/Tehran',
    enum: ['Asia/Tehran', 'UTC', 'America/New_York', 'Europe/London']
  },

  // Security Settings
  minPasswordLength: {
    type: Number,
    default: 8,
    min: 6,
    max: 20
  },
  tokenExpiryHours: {
    type: Number,
    default: 24,
    min: 1,
    max: 168 // 1 week
  },
  requireEmailVerification: {
    type: Boolean,
    default: false
  },
  enableTwoFactor: {
    type: Boolean,
    default: false
  },

  // User Management Settings
  maxApplicationsPerDay: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  maxActiveCastings: {
    type: Number,
    default: 5,
    min: 1,
    max: 50
  },
  autoApproveUsers: {
    type: Boolean,
    default: false
  },
  autoApproveCastings: {
    type: Boolean,
    default: false
  },

  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  adminNotifications: {
    type: Boolean,
    default: true
  },
  weeklyReports: {
    type: Boolean,
    default: false
  },

  // System Information
  systemVersion: {
    type: String,
    default: '1.0.0'
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
