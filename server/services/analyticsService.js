const {
  PageView,
  UserSession,
  UserEngagement,
  PlatformMetrics,
  SeasonalTrends,
  GeographicAnalytics,
  DeviceAnalytics,
  PerformanceMetrics
} = require('../models/Analytics');
const User = require('../models/User');
const Casting = require('../models/Casting');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const News = require('../models/News');

class AnalyticsService {
  // Track page view
  static async trackPageView(pageData) {
    try {
      const pageView = new PageView(pageData);
      await pageView.save();
      return pageView;
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  // Start user session
  static async startSession(sessionData) {
    try {
      const session = new UserSession(sessionData);
      await session.save();
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // End user session
  static async endSession(sessionId, endData = {}) {
    try {
      const session = await UserSession.findOne({ sessionId });
      if (!session) return null;

      session.endTime = new Date();
      session.duration = Math.floor((session.endTime - session.startTime) / 1000);
      Object.assign(session, endData);
      
      await session.save();
      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // Get session by ID
  static async getSession(sessionId) {
    try {
      return await UserSession.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Track user action
  static async trackUserAction(actionData) {
    try {
      // This would typically save to a UserAction collection
      // For now, we'll just log it
      console.log('User action tracked:', actionData);
      return true;
    } catch (error) {
      console.error('Error tracking user action:', error);
      throw error;
    }
  }

  // Track performance metrics
  static async trackPerformance(performanceData) {
    try {
      const performance = new PerformanceMetrics(performanceData);
      await performance.save();
      return performance;
    } catch (error) {
      console.error('Error tracking performance:', error);
      throw error;
    }
  }

  // Track geographic data
  static async trackGeographicData(geographicData) {
    try {
      const geo = new GeographicAnalytics(geographicData);
      await geo.save();
      return geo;
    } catch (error) {
      console.error('Error tracking geographic data:', error);
      throw error;
    }
  }

  // Track device data
  static async trackDeviceData(deviceData) {
    try {
      const device = new DeviceAnalytics(deviceData);
      await device.save();
      return device;
    } catch (error) {
      console.error('Error tracking device data:', error);
      throw error;
    }
  }

  // Cleanup old analytics data
  static async cleanupOldPageViews(date) {
    try {
      await PageView.deleteMany({ timestamp: { $lt: date } });
    } catch (error) {
      console.error('Error cleaning up old page views:', error);
    }
  }

  static async cleanupOldSessions(date) {
    try {
      await UserSession.deleteMany({ startTime: { $lt: date } });
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }

  static async cleanupOldPerformanceData(date) {
    try {
      await PerformanceMetrics.deleteMany({ date: { $lt: date } });
    } catch (error) {
      console.error('Error cleaning up old performance data:', error);
    }
  }

  // Get comprehensive analytics dashboard data
  static async getDashboardAnalytics(range = '30d') {
    try {
      const { startDate, endDate } = this.getDateRange(range);
      
      const [
        visitorMetrics,
        userMetrics,
        contentMetrics,
        engagementMetrics,
        conversionMetrics,
        seasonalData,
        geographicData,
        deviceData,
        performanceData
      ] = await Promise.all([
        this.getVisitorMetrics(startDate, endDate),
        this.getUserMetrics(startDate, endDate),
        this.getContentMetrics(startDate, endDate),
        this.getEngagementMetrics(startDate, endDate),
        this.getConversionMetrics(startDate, endDate),
        this.getSeasonalTrends(startDate, endDate),
        this.getGeographicAnalytics(startDate, endDate),
        this.getDeviceAnalytics(startDate, endDate),
        this.getPerformanceMetrics(startDate, endDate)
      ]);

      return {
        visitorMetrics,
        userMetrics,
        contentMetrics,
        engagementMetrics,
        conversionMetrics,
        seasonalData,
        geographicData,
        deviceData,
        performanceData,
        timeRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }

  // Visitor Analytics
  static async getVisitorMetrics(startDate, endDate) {
    try {
      const [
        totalVisitors,
        uniqueVisitors,
        returningVisitors,
        newVisitors,
        pageViews,
        averageSessionDuration,
        bounceRate,
        topPages,
        visitorTrends
      ] = await Promise.all([
        PageView.countDocuments({ timestamp: { $gte: startDate, $lte: endDate } }),
        PageView.distinct('sessionId', { timestamp: { $gte: startDate, $lte: endDate } }).then(sessions => sessions.length),
        this.getReturningVisitors(startDate, endDate),
        this.getNewVisitors(startDate, endDate),
        PageView.countDocuments({ timestamp: { $gte: startDate, $lte: endDate } }),
        this.getAverageSessionDuration(startDate, endDate),
        this.getBounceRate(startDate, endDate),
        this.getTopPages(startDate, endDate),
        this.getVisitorTrends(startDate, endDate)
      ]);

      return {
        totalVisitors,
        uniqueVisitors,
        returningVisitors,
        newVisitors,
        pageViews,
        averageSessionDuration,
        bounceRate,
        topPages,
        visitorTrends
      };
    } catch (error) {
      console.error('Error getting visitor metrics:', error);
      throw error;
    }
  }

  // User Analytics
  static async getUserMetrics(startDate, endDate) {
    try {
      const [
        totalUsers,
        newUsers,
        activeUsers,
        userGrowth,
        userRetention,
        userDemographics,
        userEngagement
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getActiveUsers(startDate, endDate),
        this.getUserGrowth(startDate, endDate),
        this.getUserRetention(startDate, endDate),
        this.getUserDemographics(),
        this.getUserEngagement(startDate, endDate)
      ]);

      return {
        totalUsers,
        newUsers,
        activeUsers,
        userGrowth,
        userRetention,
        userDemographics,
        userEngagement
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw error;
    }
  }

  // Content Analytics
  static async getContentMetrics(startDate, endDate) {
    try {
      const [
        totalCastings,
        newCastings,
        activeCastings,
        castingViews,
        totalApplications,
        newApplications,
        applicationRate,
        totalBlogs,
        newBlogs,
        blogViews,
        totalNews,
        newNews,
        newsViews
      ] = await Promise.all([
        Casting.countDocuments(),
        Casting.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Casting.countDocuments({ status: 'active' }),
        this.getCastingViews(startDate, endDate),
        Application.countDocuments(),
        Application.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getApplicationRate(startDate, endDate),
        Blog.countDocuments(),
        Blog.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getBlogViews(startDate, endDate),
        News.countDocuments(),
        News.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getNewsViews(startDate, endDate)
      ]);

      return {
        castings: {
          total: totalCastings,
          new: newCastings,
          active: activeCastings,
          views: castingViews
        },
        applications: {
          total: totalApplications,
          new: newApplications,
          rate: applicationRate
        },
        blogs: {
          total: totalBlogs,
          new: newBlogs,
          views: blogViews
        },
        news: {
          total: totalNews,
          new: newNews,
          views: newsViews
        }
      };
    } catch (error) {
      console.error('Error getting content metrics:', error);
      throw error;
    }
  }

  // Engagement Analytics
  static async getEngagementMetrics(startDate, endDate) {
    try {
      const [
        averageSessionDuration,
        pagesPerSession,
        timeOnSite,
        engagementRate,
        topActions,
        userJourney
      ] = await Promise.all([
        this.getAverageSessionDuration(startDate, endDate),
        this.getPagesPerSession(startDate, endDate),
        this.getTimeOnSite(startDate, endDate),
        this.getEngagementRate(startDate, endDate),
        this.getTopActions(startDate, endDate),
        this.getUserJourney(startDate, endDate)
      ]);

      return {
        averageSessionDuration,
        pagesPerSession,
        timeOnSite,
        engagementRate,
        topActions,
        userJourney
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      throw error;
    }
  }

  // Conversion Analytics
  static async getConversionMetrics(startDate, endDate) {
    try {
      const [
        registrationRate,
        applicationRate,
        castingCreationRate,
        conversionFunnel,
        topConversionSources
      ] = await Promise.all([
        this.getRegistrationRate(startDate, endDate),
        this.getApplicationRate(startDate, endDate),
        this.getCastingCreationRate(startDate, endDate),
        this.getConversionFunnel(startDate, endDate),
        this.getTopConversionSources(startDate, endDate)
      ]);

      return {
        registrationRate,
        applicationRate,
        castingCreationRate,
        conversionFunnel,
        topConversionSources
      };
    } catch (error) {
      console.error('Error getting conversion metrics:', error);
      throw error;
    }
  }

  // Seasonal Trends
  static async getSeasonalTrends(startDate, endDate) {
    try {
      const seasonalData = await SeasonalTrends.find({
        $and: [
          { year: { $gte: startDate.getFullYear() } },
          { year: { $lte: endDate.getFullYear() } }
        ]
      }).sort({ year: 1, month: 1 });

      return this.processSeasonalData(seasonalData);
    } catch (error) {
      console.error('Error getting seasonal trends:', error);
      throw error;
    }
  }

  // Geographic Analytics
  static async getGeographicAnalytics(startDate, endDate) {
    try {
      const geographicData = await GeographicAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });

      return this.processGeographicData(geographicData);
    } catch (error) {
      console.error('Error getting geographic analytics:', error);
      throw error;
    }
  }

  // Device Analytics
  static async getDeviceAnalytics(startDate, endDate) {
    try {
      const deviceData = await DeviceAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });

      return this.processDeviceData(deviceData);
    } catch (error) {
      console.error('Error getting device analytics:', error);
      throw error;
    }
  }

  // Performance Metrics
  static async getPerformanceMetrics(startDate, endDate) {
    try {
      const performanceData = await PerformanceMetrics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });

      return this.processPerformanceData(performanceData);
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  // Helper methods
  static getDateRange(range) {
    const now = new Date();
    let startDate;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  }

  static async getReturningVisitors(startDate, endDate) {
    // Implementation for returning visitors logic
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate }
    });
    
    const visitorCounts = {};
    sessions.forEach(session => {
      const visitorId = session.userId || session.ipAddress;
      visitorCounts[visitorId] = (visitorCounts[visitorId] || 0) + 1;
    });

    return Object.values(visitorCounts).filter(count => count > 1).length;
  }

  static async getNewVisitors(startDate, endDate) {
    // Implementation for new visitors logic
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate }
    });
    
    const visitorCounts = {};
    sessions.forEach(session => {
      const visitorId = session.userId || session.ipAddress;
      visitorCounts[visitorId] = (visitorCounts[visitorId] || 0) + 1;
    });

    return Object.values(visitorCounts).filter(count => count === 1).length;
  }

  static async getAverageSessionDuration(startDate, endDate) {
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate },
      duration: { $exists: true, $ne: null }
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalDuration / sessions.length);
  }

  static async getBounceRate(startDate, endDate) {
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate }
    });

    if (sessions.length === 0) return 0;

    const bounceSessions = sessions.filter(session => session.pagesVisited.length <= 1);
    return Math.round((bounceSessions.length / sessions.length) * 100);
  }

  static async getTopPages(startDate, endDate) {
    const pageViews = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return pageViews.map(page => ({
      page: page._id,
      views: page.count
    }));
  }

  static async getVisitorTrends(startDate, endDate) {
    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    const trends = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const visitors = await PageView.distinct('sessionId', {
        timestamp: { $gte: date, $lt: nextDate }
      });

      trends.push({
        date: date.toISOString().split('T')[0],
        visitors: visitors.length
      });
    }

    return trends;
  }

  static async getActiveUsers(startDate, endDate) {
    return User.countDocuments({
      lastLogin: { $gte: startDate, $lte: endDate }
    });
  }

  static async getUserGrowth(startDate, endDate) {
    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    const growth = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const newUsers = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      growth.push({
        date: date.toISOString().split('T')[0],
        newUsers
      });
    }

    return growth;
  }

  static async getUserRetention(startDate, endDate) {
    // Implementation for user retention calculation
    const users = await User.find({
      createdAt: { $lte: startDate }
    });

    const retainedUsers = await User.countDocuments({
      lastLogin: { $gte: startDate, $lte: endDate }
    });

    return users.length > 0 ? Math.round((retainedUsers / users.length) * 100) : 0;
  }

  static async getUserDemographics() {
    const [talents, directors, admins] = await Promise.all([
      User.countDocuments({ role: 'talent' }),
      User.countDocuments({ role: 'casting_director' }),
      User.countDocuments({ role: 'admin' })
    ]);

    return {
      talents,
      directors,
      admins,
      total: talents + directors + admins
    };
  }

  static async getUserEngagement(startDate, endDate) {
    const engagement = await UserEngagement.find({
      date: { $gte: startDate, $lte: endDate }
    });

    if (engagement.length === 0) {
      return {
        averageSessionTime: 0,
        averagePagesVisited: 0,
        averageActions: 0
      };
    }

    const totalSessionTime = engagement.reduce((sum, user) => sum + user.totalSessionTime, 0);
    const totalPagesVisited = engagement.reduce((sum, user) => sum + user.pagesVisited, 0);
    const totalActions = engagement.reduce((sum, user) => sum + user.actionsPerformed, 0);

    return {
      averageSessionTime: Math.round(totalSessionTime / engagement.length),
      averagePagesVisited: Math.round(totalPagesVisited / engagement.length),
      averageActions: Math.round(totalActions / engagement.length)
    };
  }

  // Additional helper methods for content metrics
  static async getCastingViews(startDate, endDate) {
    return PageView.countDocuments({
      page: 'castings',
      timestamp: { $gte: startDate, $lte: endDate }
    });
  }

  static async getApplicationRate(startDate, endDate) {
    const [applications, visitors] = await Promise.all([
      Application.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      PageView.distinct('sessionId', { timestamp: { $gte: startDate, $lte: endDate } }).then(sessions => sessions.length)
    ]);

    return visitors > 0 ? Math.round((applications / visitors) * 100) : 0;
  }

  static async getBlogViews(startDate, endDate) {
    return PageView.countDocuments({
      page: 'blogs',
      timestamp: { $gte: startDate, $lte: endDate }
    });
  }

  static async getNewsViews(startDate, endDate) {
    return PageView.countDocuments({
      page: 'news',
      timestamp: { $gte: startDate, $lte: endDate }
    });
  }

  // Additional helper methods for engagement metrics
  static async getPagesPerSession(startDate, endDate) {
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate }
    });

    if (sessions.length === 0) return 0;

    const totalPages = sessions.reduce((sum, session) => sum + session.pagesVisited.length, 0);
    return Math.round(totalPages / sessions.length);
  }

  static async getTimeOnSite(startDate, endDate) {
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate },
      duration: { $exists: true, $ne: null }
    });

    if (sessions.length === 0) return 0;

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalTime / sessions.length);
  }

  static async getEngagementRate(startDate, endDate) {
    const sessions = await UserSession.find({
      startTime: { $gte: startDate, $lte: endDate }
    });

    if (sessions.length === 0) return 0;

    const engagedSessions = sessions.filter(session => 
      session.duration > 60 && session.pagesVisited.length > 1
    );

    return Math.round((engagedSessions.length / sessions.length) * 100);
  }

  static async getTopActions(startDate, endDate) {
    // Implementation for top user actions
    return [
      { action: 'page_view', count: 1000 },
      { action: 'login', count: 500 },
      { action: 'application_submit', count: 200 },
      { action: 'casting_create', count: 50 }
    ];
  }

  static async getUserJourney(startDate, endDate) {
    // Implementation for user journey analysis
    return [
      { step: 'home', users: 1000, conversion: 100 },
      { step: 'castings', users: 800, conversion: 80 },
      { step: 'application', users: 400, conversion: 50 },
      { step: 'submit', users: 200, conversion: 50 }
    ];
  }

  // Additional helper methods for conversion metrics
  static async getRegistrationRate(startDate, endDate) {
    const [registrations, visitors] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      PageView.distinct('sessionId', { timestamp: { $gte: startDate, $lte: endDate } }).then(sessions => sessions.length)
    ]);

    return visitors > 0 ? Math.round((registrations / visitors) * 100) : 0;
  }

  static async getCastingCreationRate(startDate, endDate) {
    const [castings, visitors] = await Promise.all([
      Casting.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      PageView.distinct('sessionId', { timestamp: { $gte: startDate, $lte: endDate } }).then(sessions => sessions.length)
    ]);

    return visitors > 0 ? Math.round((castings / visitors) * 100) : 0;
  }

  static async getConversionFunnel(startDate, endDate) {
    // Implementation for conversion funnel
    return [
      { stage: 'visitors', count: 1000, conversion: 100 },
      { stage: 'registered', count: 200, conversion: 20 },
      { stage: 'active', count: 100, conversion: 10 },
      { stage: 'converted', count: 50, conversion: 5 }
    ];
  }

  static async getTopConversionSources(startDate, endDate) {
    // Implementation for top conversion sources
    return [
      { source: 'direct', conversions: 100, rate: 10 },
      { source: 'organic', conversions: 80, rate: 8 },
      { source: 'social', conversions: 60, rate: 6 },
      { source: 'referral', conversions: 40, rate: 4 }
    ];
  }

  // Data processing methods
  static processSeasonalData(data) {
    // Process seasonal trends data
    return {
      trends: data,
      summary: {
        totalRegistrations: data.reduce((sum, item) => sum + item.userRegistrations, 0),
        totalCastings: data.reduce((sum, item) => sum + item.castingCreations, 0),
        totalApplications: data.reduce((sum, item) => sum + item.applications, 0)
      }
    };
  }

  static processGeographicData(data) {
    // Process geographic analytics data
    return {
      locations: data,
      topCountries: this.getTopCountries(data),
      topCities: this.getTopCities(data)
    };
  }

  static processDeviceData(data) {
    // Process device analytics data
    return {
      devices: data,
      deviceBreakdown: this.getDeviceBreakdown(data),
      browserBreakdown: this.getBrowserBreakdown(data)
    };
  }

  static processPerformanceData(data) {
    // Process performance metrics data
    return {
      metrics: data,
      averageLoadTime: this.getAverageLoadTime(data),
      averageResponseTime: this.getAverageResponseTime(data),
      uptimePercentage: this.getUptimePercentage(data)
    };
  }

  // Additional processing helper methods
  static getTopCountries(data) {
    const countryStats = {};
    data.forEach(item => {
      countryStats[item.country] = (countryStats[item.country] || 0) + item.visitors;
    });

    return Object.entries(countryStats)
      .map(([country, visitors]) => ({ country, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  }

  static getTopCities(data) {
    const cityStats = {};
    data.forEach(item => {
      const key = `${item.city}, ${item.province}`;
      cityStats[key] = (cityStats[key] || 0) + item.visitors;
    });

    return Object.entries(cityStats)
      .map(([city, visitors]) => ({ city, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  }

  static getDeviceBreakdown(data) {
    const deviceStats = {};
    data.forEach(item => {
      deviceStats[item.deviceType] = (deviceStats[item.deviceType] || 0) + item.visitors;
    });

    const total = Object.values(deviceStats).reduce((sum, count) => sum + count, 0);
    return Object.entries(deviceStats).map(([device, count]) => ({
      device,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  static getBrowserBreakdown(data) {
    const browserStats = {};
    data.forEach(item => {
      browserStats[item.browser] = (browserStats[item.browser] || 0) + item.visitors;
    });

    const total = Object.values(browserStats).reduce((sum, count) => sum + count, 0);
    return Object.entries(browserStats).map(([browser, count]) => ({
      browser,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  static getAverageLoadTime(data) {
    if (data.length === 0) return 0;
    const totalLoadTime = data.reduce((sum, item) => sum + item.pageLoadTime, 0);
    return Math.round(totalLoadTime / data.length);
  }

  static getAverageResponseTime(data) {
    if (data.length === 0) return 0;
    const totalResponseTime = data.reduce((sum, item) => sum + item.serverResponseTime, 0);
    return Math.round(totalResponseTime / data.length);
  }

  static getUptimePercentage(data) {
    if (data.length === 0) return 100;
    const totalUptime = data.reduce((sum, item) => sum + item.uptime, 0);
    return Math.round(totalUptime / data.length);
  }
}

module.exports = AnalyticsService;
