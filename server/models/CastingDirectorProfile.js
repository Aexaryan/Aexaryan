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

// Virtual for full name
castingDirectorProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name (includes company name if available)
castingDirectorProfileSchema.virtual('displayName').get(function() {
  if (this.companyName) {
    return `${this.fullName} (${this.companyName})`;
  }
  return this.fullName;
});

// Pre-save middleware to sync names with user
castingDirectorProfileSchema.pre('save', async function(next) {
  // Only run this if names are being modified
  if (this.isModified('firstName') || this.isModified('lastName')) {
    try {
      const User = require('./User');
      await User.findByIdAndUpdate(
        this.user,
        { 
          firstName: this.firstName,
          lastName: this.lastName
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error syncing names with user in CastingDirectorProfile:', error);
      // Don't block the save operation
    }
  }
  
  next();
});

// Update the updatedAt field before saving
castingDirectorProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtual fields are serialized
castingDirectorProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CastingDirectorProfile', castingDirectorProfileSchema);