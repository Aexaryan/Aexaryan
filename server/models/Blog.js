const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان مقاله الزامی است'],
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
    required: [true, 'محتوای مقاله الزامی است'],
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
        'casting_tips',
        'industry_news', 
        'success_stories',
        'interviews',
        'tutorials',
        'career_advice',
        'technology',
        'events',
        'other'
      ],
      message: 'دسته‌بندی نامعتبر است'
    }
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
      default: 'تصویر مقاله'
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
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
    default: 5
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
  
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'عنوان متا نمی‌تواند بیشتر از 60 کاراکتر باشد']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'توضیحات متا نمی‌تواند بیشتر از 160 کاراکتر باشد']
    },
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ author: 1, status: 1 });
BlogSchema.index({ slug: 1 });

// Virtual for like count
BlogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
BlogSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.status === 'approved').length;
});

// Virtual for isLiked (to be used with user context)
BlogSchema.virtual('isLiked').get(function() {
  return false; // Will be set dynamically
});

// Pre-save middleware to generate slug
BlogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  try {
    // Generate slug from title
    let slug = this.title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    

    
    // If slug is empty after processing, use a fallback
    if (!slug || slug.length === 0) {
      slug = 'blog-' + Date.now();
    }
    

    this.slug = slug;
  } catch (error) {
    console.error('Error generating slug:', error);
    // Fallback slug
    this.slug = 'blog-' + Date.now();
  }
  
  next();
});

// Pre-save middleware to calculate read time
BlogSchema.pre('save', function(next) {
  if (!this.isModified('content')) return next();
  
  try {
    // Calculate read time (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  } catch (error) {
    console.error('Error calculating read time:', error);
    this.readTime = 5; // Default fallback
  }
  
  next();
});

// Method to increment views
BlogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
BlogSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Static method to get published blogs
BlogSchema.statics.getPublished = function() {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar');
};

// Static method to get blogs by category
BlogSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'firstName lastName avatar');
};

module.exports = mongoose.model('Blog', BlogSchema);
