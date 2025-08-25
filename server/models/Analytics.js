const mongoose = require('mongoose');

// Page View Schema
const pageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    enum: ['home', 'blogs', 'news', 'castings', 'talents', 'login', 'register', 'dashboard', 'profile', 'admin']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0 // Time spent on page in seconds
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  userRole: {
    type: String,
    enum: ['guest', 'talent', 'casting_director', 'admin'],
    default: 'guest'
  }
});

// User Session Schema
const userSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userAgent: String,
  ipAddress: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // Total session duration in seconds
  pagesVisited: [{
    page: String,
    timestamp: Date,
    duration: Number
  }],
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  userRole: {
    type: String,
    enum: ['guest', 'talent', 'casting_director', 'admin'],
    default: 'guest'
  }
});

// User Engagement Schema
const userEngagementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  loginCount: {
    type: Number,
    default: 0
  },
  totalSessionTime: {
    type: Number,
    default: 0 // Total time spent in seconds
  },
  pagesVisited: {
    type: Number,
    default: 0
  },
  actionsPerformed: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Platform Metrics Schema
const platformMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  // User metrics
  newUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  returningUsers: {
    type: Number,
    default: 0
  },
  // Content metrics
  newCastings: {
    type: Number,
    default: 0
  },
  newApplications: {
    type: Number,
    default: 0
  },
  newBlogs: {
    type: Number,
    default: 0
  },
  newNews: {
    type: Number,
    default: 0
  },
  // Engagement metrics
  totalPageViews: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Number,
    default: 0
  },
  // Conversion metrics
  registrationRate: {
    type: Number,
    default: 0
  },
  applicationRate: {
    type: Number,
    default: 0
  },
  castingCreationRate: {
    type: Number,
    default: 0
  }
});

// Seasonal Trends Schema
const seasonalTrendsSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter'],
    required: true
  },
  // Seasonal metrics
  userRegistrations: {
    type: Number,
    default: 0
  },
  castingCreations: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  // Industry-specific trends
  popularProjectTypes: [{
    type: String,
    count: Number
  }],
  popularLocations: [{
    location: String,
    count: Number
  }],
  popularRoles: [{
    role: String,
    count: Number
  }]
});

// Geographic Analytics Schema
const geographicAnalyticsSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  visitors: {
    type: Number,
    default: 0
  },
  users: {
    type: Number,
    default: 0
  },
  castings: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  }
});

// Device Analytics Schema
const deviceAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  operatingSystem: {
    type: String,
    required: true
  },
  visitors: {
    type: Number,
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Number,
    default: 0
  }
});

// Performance Metrics Schema
const performanceMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  pageLoadTime: {
    type: Number,
    default: 0
  },
  serverResponseTime: {
    type: Number,
    default: 0
  },
  errorRate: {
    type: Number,
    default: 0
  },
  uptime: {
    type: Number,
    default: 100
  },
  activeConnections: {
    type: Number,
    default: 0
  }
});

// Create indexes for better performance
pageViewSchema.index({ timestamp: -1 });
pageViewSchema.index({ page: 1, timestamp: -1 });
pageViewSchema.index({ userId: 1, timestamp: -1 });
pageViewSchema.index({ sessionId: 1 });

userSessionSchema.index({ startTime: -1 });
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ sessionId: 1 });

userEngagementSchema.index({ userId: 1, date: -1 });
userEngagementSchema.index({ date: -1 });

platformMetricsSchema.index({ date: -1 });

seasonalTrendsSchema.index({ year: 1, month: 1 });
seasonalTrendsSchema.index({ season: 1, year: 1 });

geographicAnalyticsSchema.index({ date: -1 });
geographicAnalyticsSchema.index({ country: 1, province: 1, city: 1 });

deviceAnalyticsSchema.index({ date: -1 });
deviceAnalyticsSchema.index({ deviceType: 1, date: -1 });

performanceMetricsSchema.index({ date: -1 });

// Create models
const PageView = mongoose.model('PageView', pageViewSchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);
const UserEngagement = mongoose.model('UserEngagement', userEngagementSchema);
const PlatformMetrics = mongoose.model('PlatformMetrics', platformMetricsSchema);
const SeasonalTrends = mongoose.model('SeasonalTrends', seasonalTrendsSchema);
const GeographicAnalytics = mongoose.model('GeographicAnalytics', geographicAnalyticsSchema);
const DeviceAnalytics = mongoose.model('DeviceAnalytics', deviceAnalyticsSchema);
const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);

module.exports = {
  PageView,
  UserSession,
  UserEngagement,
  PlatformMetrics,
  SeasonalTrends,
  GeographicAnalytics,
  DeviceAnalytics,
  PerformanceMetrics
};
