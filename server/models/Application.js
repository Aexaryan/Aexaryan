const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  casting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Casting',
    required: true
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Content
  coverMessage: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Additional Materials
  additionalImages: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String
  }],
  
  videoAudition: {
    url: String,
    publicId: String,
    duration: Number // in seconds
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
    default: 'pending'
  },
  
  // Director's Response
  directorNotes: {
    type: String,
    maxlength: 500
  },
  directorResponse: {
    message: String,
    respondedAt: Date
  },
  
  // Callback Information
  callbackDetails: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    time: String,
    location: String,
    instructions: String
  },
  
  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Metadata
  applicationNumber: {
    type: String,
    unique: true
  },
  
  // Talent snapshot at time of application
  talentSnapshot: {
    name: String,
    age: Number,
    height: Number,
    skills: [String],
    headshot: String
  }
});

// Create unique compound index to prevent duplicate applications
applicationSchema.index({ casting: 1, talent: 1 }, { unique: true });

// Indexes for better query performance
applicationSchema.index({ status: 1, submittedAt: -1 });
applicationSchema.index({ casting: 1, status: 1 });
applicationSchema.index({ talent: 1, submittedAt: -1 });

// Generate unique application number before saving
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate application number: CAST-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Application').countDocuments({
      submittedAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    
    this.applicationNumber = `CAST-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Update statusUpdatedAt when status changes
  if (this.isModified('status')) {
    this.statusUpdatedAt = Date.now();
    
    if (this.status === 'reviewed' && !this.reviewedAt) {
      this.reviewedAt = Date.now();
    }
  }
  
  next();
});

// Static method to get applications summary for a casting
applicationSchema.statics.getCastingSummary = function(castingId) {
  return this.aggregate([
    { $match: { casting: mongoose.Types.ObjectId(castingId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Virtual for application age in days
applicationSchema.virtual('daysOld').get(function() {
  const now = new Date();
  const submitted = new Date(this.submittedAt);
  const diffTime = now - submitted;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);