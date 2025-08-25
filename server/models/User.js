const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['talent', 'casting_director', 'admin', 'journalist'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'inactive'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Identification Approval System
  identificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_submitted'],
    default: 'not_submitted'
  },
  identificationPhoto: {
    url: String,
    uploadedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    publicId: String
  },
  identificationApprovedAt: Date,
  identificationApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Writer/Journalist Profile
  writerProfile: {
    bio: {
      type: String,
      maxlength: [500, 'بیوگرافی نمی‌تواند بیشتر از 500 کاراکتر باشد']
    },
    specialization: {
      type: String,
      maxlength: [100, 'تخصص نمی‌تواند بیشتر از 100 کاراکتر باشد']
    },
    experience: {
      type: Number,
      min: [0, 'تجربه نمی‌تواند منفی باشد']
    },
    profileImage: {
      type: String
    },
    phone: {
      type: String
    },
    website: {
      type: String
    },
    location: {
      type: String
    },
    education: {
      type: String
    },
    awards: {
      type: String
    },
    skills: [{
      type: String
    }],
    isApprovedWriter: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalArticles: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    autoApproval: {
      type: Boolean,
      default: false
    },
    autoApprovalGrantedAt: {
      type: Date
    },
    autoApprovalGrantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for checking if user can publish castings (for directors)
userSchema.virtual('canPublishCastings').get(function() {
  return this.role === 'casting_director' && this.identificationStatus === 'approved';
});

// Virtual for displaying approval badge
userSchema.virtual('hasApprovalBadge').get(function() {
  return this.identificationStatus === 'approved';
});

// Virtual for checking if user can write blogs/news
userSchema.virtual('canWriteContent').get(function() {
  return (this.role === 'journalist' && this.writerProfile?.isApprovedWriter) ||
         (this.role === 'casting_director' && this.identificationStatus === 'approved') ||
         this.role === 'admin';
});

// Virtual for checking if user is an approved writer
userSchema.virtual('isApprovedWriter').get(function() {
  return this.role === 'journalist' && this.writerProfile?.isApprovedWriter;
});

// Virtual for checking if user is a journalist
userSchema.virtual('isJournalist').get(function() {
  return this.role === 'journalist';
});

// Virtual for checking if user has auto-approval for content
userSchema.virtual('hasAutoApproval').get(function() {
  return this.writerProfile?.autoApproval || this.role === 'admin';
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name (prioritizes artistic name for talents)
userSchema.virtual('displayName').get(function() {
  // This will be populated by the profile when needed
  return this.fullName;
});

// Method to get consistent display name based on role and profile
userSchema.methods.getDisplayName = async function() {
  try {
    if (this.role === 'talent') {
      const TalentProfile = require('./TalentProfile');
      const profile = await TalentProfile.findOne({ user: this._id }).select('artisticName firstName lastName');
      if (profile) {
        // For talents, prioritize artistic name, fallback to profile names, then user names
        return profile.artisticName || `${profile.firstName} ${profile.lastName}`.trim() || this.fullName;
      }
    } else if (this.role === 'casting_director') {
      const CastingDirectorProfile = require('./CastingDirectorProfile');
      const profile = await CastingDirectorProfile.findOne({ user: this._id }).select('firstName lastName companyName');
      if (profile) {
        // For directors, use profile names, fallback to user names
        const profileName = `${profile.firstName} ${profile.lastName}`.trim();
        return profileName || this.fullName;
      }
    }
    
    // Default fallback to user names
    return this.fullName;
  } catch (error) {
    console.error('Error getting display name:', error);
    return this.fullName;
  }
};

// Method to sync names with profile
userSchema.methods.syncNamesWithProfile = async function() {
  try {
    if (this.role === 'talent') {
      const TalentProfile = require('./TalentProfile');
      const profile = await TalentProfile.findOne({ user: this._id });
      if (profile) {
        // Update user names to match profile names
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        await this.save();
      }
    } else if (this.role === 'casting_director') {
      const CastingDirectorProfile = require('./CastingDirectorProfile');
      const profile = await CastingDirectorProfile.findOne({ user: this._id });
      if (profile) {
        // Update user names to match profile names
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        await this.save();
      }
    }
  } catch (error) {
    console.error('Error syncing names with profile:', error);
  }
};

// Pre-save middleware to ensure name consistency
userSchema.pre('save', async function(next) {
  // Only run this if names are being modified
  if (this.isModified('firstName') || this.isModified('lastName')) {
    try {
      // Update corresponding profile names
      if (this.role === 'talent') {
        const TalentProfile = require('./TalentProfile');
        await TalentProfile.findOneAndUpdate(
          { user: this._id },
          { 
            firstName: this.firstName,
            lastName: this.lastName
          },
          { new: true }
        );
      } else if (this.role === 'casting_director') {
        const CastingDirectorProfile = require('./CastingDirectorProfile');
        await CastingDirectorProfile.findOneAndUpdate(
          { user: this._id },
          { 
            firstName: this.firstName,
            lastName: this.lastName
          },
          { new: true }
        );
      }
    } catch (error) {
      console.error('Error syncing names in pre-save:', error);
      // Don't block the save operation
    }
  }
  
  next();
});

// Virtual populate for profile models
userSchema.virtual('talentProfile', {
  ref: 'TalentProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

userSchema.virtual('castingDirectorProfile', {
  ref: 'CastingDirectorProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);