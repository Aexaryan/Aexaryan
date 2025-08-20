const mongoose = require('mongoose');

const castingSchema = new mongoose.Schema({
  castingDirector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Project Details
  projectType: {
    type: String,
    enum: ['film', 'tv_series', 'commercial', 'theater', 'music_video', 'documentary', 'web_series', 'other'],
    required: true
  },
  roleType: {
    type: String,
    enum: ['lead', 'supporting', 'background', 'extra', 'voice_over', 'other'],
    required: true
  },
  
  // Location and Schedule
  location: {
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    specificLocation: String
  },
  shootingSchedule: {
    startDate: Date,
    endDate: Date,
    duration: String, // e.g., "2 weeks", "3 months"
    timeCommitment: String // e.g., "Full-time", "Part-time", "Weekends only"
  },
  
  // Requirements
  requirements: {
    ageRange: {
      min: {
        type: Number,
        min: 0,
        max: 100
      },
      max: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'any', 'non_binary'],
      default: 'any'
    },
    heightRange: {
      min: Number, // in cm
      max: Number  // in cm
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    physicalRequirements: String, // e.g., "Athletic build", "Specific look"
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'experienced', 'professional', 'any'],
      default: 'any'
    }
  },
  
  // Compensation
  compensation: {
    type: {
      type: String,
      enum: ['paid', 'unpaid', 'deferred', 'copy_credit_meals'],
      default: 'paid'
    },
    amount: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'IRR'
      }
    },
    paymentStructure: {
      type: String,
      enum: ['per_day', 'per_hour', 'flat_rate', 'percentage', 'other']
    },
    additionalBenefits: String
  },
  
  // Application Details
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicationInstructions: {
    type: String,
    maxlength: 1000
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'filled'],
    default: 'draft'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Stats
  views: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  shortlistedApplications: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  }
});

// Indexes for better query performance
castingSchema.index({ status: 1, createdAt: -1 });
castingSchema.index({ projectType: 1 });
castingSchema.index({ 'location.city': 1, 'location.province': 1 });
castingSchema.index({ applicationDeadline: 1 });
castingSchema.index({ castingDirector: 1 });

// Update the updatedAt field before saving
castingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Virtual for checking if casting is expired
castingSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline < new Date();
});

// Virtual for days remaining
castingSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Ensure virtual fields are serialized
castingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Casting', castingSchema);