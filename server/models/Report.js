const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Report type and target
  reportType: {
    type: String,
    enum: ['casting', 'user', 'application', 'blog', 'news', 'system', 'other'],
    required: true
  },
  
  // Target of the report (optional for system/other reports)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: function() {
      return this.reportType !== 'system' && this.reportType !== 'other';
    }
  },

  // Original content ID (for casting, blog, news reports)
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      return ['casting', 'blog', 'news'].includes(this.reportType);
    }
  },
  
  // Dynamic reference for target model
  targetModel: {
    type: String,
    validate: {
      validator: function(v) {
        if (this.reportType === 'system' || this.reportType === 'other') {
          return true; // Allow any value or null for system/other reports
        }
        return ['Casting', 'User', 'Application', 'Blog', 'News'].includes(v);
      },
      message: 'targetModel must be one of: Casting, User, Application, Blog, News'
    },
    required: function() {
      return this.reportType !== 'system' && this.reportType !== 'other';
    }
  },
  
  // Report category
  category: {
    type: String,
    enum: [
      'inappropriate_content',
      'spam',
      'fake_information',
      'harassment',
      'copyright_violation',
      'technical_issue',
      'payment_issue',
      'safety_concern',
      'other'
    ],
    required: true
  },
  
  // Report details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Evidence/attachments
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    description: String
  }],
  
  // Report status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Admin notes and actions
  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ['status_change', 'priority_change', 'note_added', 'action_taken']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Report discussion messages
  messages: [{
    sender: {
      type: String,
      enum: ['admin', 'user'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution details
  resolution: {
    action: {
      type: String,
      enum: [
        'warning_sent',
        'content_removed',
        'user_suspended',
        'user_banned',
        'casting_removed',
        'application_rejected',
        'no_action',
        'other'
      ]
    },
    details: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // For tracking report history
  isResolved: {
    type: Boolean,
    default: false
  },
  
  resolvedAt: Date,
  
  // For preventing spam reports
  reportNumber: {
    type: String,
    unique: true
  }
});

// Generate report number before saving
reportSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of reports for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.reportNumber = `REP-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  
  this.updatedAt = new Date();
  next();
});

// Virtual for report age
reportSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is urgent (high priority and older than 24 hours)
reportSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || 
         (this.priority === 'high' && this.ageInDays > 1) ||
         (this.status === 'pending' && this.ageInDays > 3);
});

// Indexes for better query performance
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, targetId: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportNumber: 1 });

module.exports = mongoose.model('Report', reportSchema);
