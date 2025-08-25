const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان خبر الزامی است'],
    trim: true,
    maxlength: [200, 'عنوان نمی‌تواند بیشتر از 200 کاراکتر باشد']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  content: {
    type: String,
    required: [true, 'محتوای خبر الزامی است'],
    minlength: [100, 'محتوا باید حداقل 100 کاراکتر باشد']
  },
  
  excerpt: {
    type: String,
    maxlength: [300, 'خلاصه نمی‌تواند بیشتر از 300 کاراکتر باشد']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'نویسنده الزامی است']
  },
  
  category: {
    type: String,
    required: [true, 'دسته‌بندی الزامی است'],
    enum: {
      values: [
        'industry_news',
        'casting_announcements',
        'platform_updates',
        'success_stories',
        'events',
        'awards',
        'partnerships',
        'technology',
        'breaking_news',
        'other'
      ],
      message: 'دسته‌بندی نامعتبر است'
    }
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'برچسب نمی‌تواند بیشتر از 50 کاراکتر باشد']
  }],
  
  featuredImage: {
    url: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: 'تصویر خبر'
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
    default: 'draft'
  },
  
  publishedAt: {
    type: Date,
    default: null
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    maxlength: [500, 'دلیل رد نمی‌تواند بیشتر از 500 کاراکتر باشد']
  },
  
  readTime: {
    type: Number,
    min: [1, 'زمان خواندن باید حداقل 1 دقیقه باشد'],
    default: 3
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'نظر نمی‌تواند بیشتر از 1000 کاراکتر باشد']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date
    }
  }],
  
  isBreaking: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  relatedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  
  seo: {
    title: {
      type: String,
      maxlength: [60, 'عنوان متا نمی‌تواند بیشتر از 60 کاراکتر باشد']
    },
    description: {
      type: String,
      maxlength: [160, 'توضیحات متا نمی‌تواند بیشتر از 160 کاراکتر باشد']
    },
    keywords: [String]
  },
  
  imageAlt: {
    type: String,
    default: 'تصویر خبر'
  }
}, {
  timestamps: true
});

// Indexes for better performance
NewsSchema.index({ status: 1, publishedAt: -1 });
NewsSchema.index({ category: 1, status: 1 });
NewsSchema.index({ author: 1, status: 1 });
NewsSchema.index({ slug: 1 });
NewsSchema.index({ priority: 1, publishedAt: -1 });
NewsSchema.index({ isBreaking: 1, publishedAt: -1 });
NewsSchema.index({ isFeatured: 1, publishedAt: -1 });

// Virtual for like count
NewsSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
NewsSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.status === 'approved').length;
});

// Virtual for isLiked (to be used with user context)
NewsSchema.virtual('isLiked').get(function() {
  return false; // Will be set dynamically
});

// Pre-save middleware to generate slug
NewsSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Generate slug from title
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  next();
});

// Pre-save middleware to calculate read time
NewsSchema.pre('save', function(next) {
  if (!this.isModified('content')) return next();
  
  // Calculate read time (average 200 words per minute)
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / 200);
  
  next();
});

// Method to increment views
NewsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
NewsSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Static method to get published news
NewsSchema.statics.getPublished = function() {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar');
};

// Static method to get breaking news
NewsSchema.statics.getBreakingNews = function() {
  return this.find({ 
    isBreaking: true,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar')
  .sort({ publishedAt: -1 })
  .limit(5);
};

// Static method to get featured news
NewsSchema.statics.getFeaturedNews = function() {
  return this.find({ 
    isFeatured: true,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar')
  .sort({ publishedAt: -1 })
  .limit(10);
};

// Static method to get news by category
NewsSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar');
};

module.exports = mongoose.model('News', NewsSchema);
