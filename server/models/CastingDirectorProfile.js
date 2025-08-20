const mongoose = require('mongoose');

const castingDirectorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    enum: ['casting_director', 'producer', 'director', 'talent_agent', 'other'],
    default: 'casting_director'
  },
  
  // Professional Information
  biography: {
    type: String,
    maxlength: 1000
  },
  experience: {
    type: Number, // years of experience
    min: 0,
    max: 50
  },
  specialties: [{
    type: String,
    enum: ['film', 'tv_series', 'commercial', 'theater', 'music_video', 'documentary', 'other']
  }],
  
  // Location
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Iran'
  },
  
  // Contact Information
  phoneNumber: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialMedia: {
    instagram: String,
    telegram: String,
    linkedin: String
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // URLs to verification documents
  }],
  
  // Profile Image
  profileImage: {
    url: String,
    publicId: String
  },
  
  // Stats
  totalCastings: {
    type: Number,
    default: 0
  },
  activeCastings: {
    type: Number,
    default: 0
  },
  successfulCastings: {
    type: Number,
    default: 0
  },
  
  // Settings
  notificationPreferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    newApplications: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
castingDirectorProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CastingDirectorProfile', castingDirectorProfileSchema);