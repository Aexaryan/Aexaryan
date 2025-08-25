const AnalyticsService = require('../services/analyticsService');
const { v4: uuidv4 } = require('uuid');

// Analytics tracking middleware
const trackAnalytics = async (req, res, next) => {
  try {
    // Generate session ID if not exists
    if (!req.session.analyticsSessionId) {
      req.session.analyticsSessionId = uuidv4();
    }

    // Get user information
    const userId = req.user?._id || null;
    const userRole = req.user?.role || 'guest';
    const isAuthenticated = !!req.user;

    // Get request information
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrer = req.get('Referrer') || 'direct';
    const page = getPageFromPath(req.path);

    // Track page view
    const pageViewData = {
      page,
      userId,
      sessionId: req.session.analyticsSessionId,
      userAgent,
      ipAddress,
      referrer,
      isAuthenticated,
      userRole,
      timestamp: new Date()
    };

    // Track page view asynchronously (don't block the request)
    AnalyticsService.trackPageView(pageViewData).catch(error => {
      console.error('Error tracking page view:', error);
    });

    // Start session if not already started
    if (!req.session.analyticsSessionStarted) {
      const sessionData = {
        sessionId: req.session.analyticsSessionId,
        userId,
        userAgent,
        ipAddress,
        isAuthenticated,
        userRole,
        pagesVisited: [{
          page,
          timestamp: new Date()
        }]
      };

      AnalyticsService.startSession(sessionData).catch(error => {
        console.error('Error starting session:', error);
      });

      req.session.analyticsSessionStarted = true;
    } else {
      // Update existing session with new page visit
      const session = await AnalyticsService.getSession(req.session.analyticsSessionId);
      if (session) {
        session.pagesVisited.push({
          page,
          timestamp: new Date()
        });
        await session.save();
      }
    }

    // Track session end when user leaves (using beforeunload event)
    res.locals.analyticsSessionId = req.session.analyticsSessionId;

    next();
  } catch (error) {
    console.error('Analytics tracking error:', error);
    next(); // Continue even if analytics fails
  }
};

// Track user actions
const trackUserAction = (action, additionalData = {}) => {
  return async (req, res, next) => {
    try {
      if (req.session.analyticsSessionId) {
        const actionData = {
          sessionId: req.session.analyticsSessionId,
          userId: req.user?._id || null,
          action,
          timestamp: new Date(),
          ...additionalData
        };

        // Track user action asynchronously
        AnalyticsService.trackUserAction(actionData).catch(error => {
          console.error('Error tracking user action:', error);
        });
      }
      next();
    } catch (error) {
      console.error('User action tracking error:', error);
      next();
    }
  };
};

// Track performance metrics
const trackPerformance = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to track response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    const performanceData = {
      date: new Date(),
      path: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date()
    };

    // Track performance asynchronously
    AnalyticsService.trackPerformance(performanceData).catch(error => {
      console.error('Error tracking performance:', error);
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Track geographic data
const trackGeographicData = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get geographic data from IP (you can use a service like ipapi.co or similar)
    const geoData = await getGeographicData(ipAddress);
    
    if (geoData) {
          const geographicData = {
      country: geoData.country || 'Unknown',
      province: geoData.region || 'Unknown',
      city: geoData.city || 'Unknown',
      date: new Date(),
      visitors: 1,
      users: 0,
      castings: 0,
      applications: 0
    };

      // Track geographic data asynchronously
      AnalyticsService.trackGeographicData(geographicData).catch(error => {
        console.error('Error tracking geographic data:', error);
      });
    }

    next();
  } catch (error) {
    console.error('Geographic tracking error:', error);
    next();
  }
};

// Track device information
const trackDeviceInfo = (req, res, next) => {
  try {
    const userAgent = req.get('User-Agent');
    const deviceInfo = parseUserAgent(userAgent);
    
    const deviceData = {
      date: new Date(),
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operatingSystem: deviceInfo.os,
      visitors: 1,
      pageViews: 1,
      averageSessionDuration: 0,
      bounceRate: 0
    };

    // Track device data asynchronously
    AnalyticsService.trackDeviceData(deviceData).catch(error => {
      console.error('Error tracking device data:', error);
    });

    next();
  } catch (error) {
    console.error('Device tracking error:', error);
    next();
  }
};

// Helper function to get page name from path
const getPageFromPath = (path) => {
  const pathMap = {
    '/': 'home',
    '/blogs': 'blogs',
    '/news': 'news',
    '/castings': 'castings',
    '/talents': 'talents',
    '/login': 'login',
    '/register': 'register',
    '/dashboard': 'dashboard',
    '/profile': 'profile',
    '/admin': 'admin'
  };

  // Check exact matches first
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Check for partial matches
  for (const [route, page] of Object.entries(pathMap)) {
    if (path.startsWith(route)) {
      return page;
    }
  }

  return 'other';
};

// Helper function to get geographic data from IP
const getGeographicData = async (ipAddress) => {
  try {
    // For development, return mock data
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      return {
        country: 'Iran',
        region: 'Tehran',
        city: 'Tehran'
      };
    }

    // In production, you would use a real IP geolocation service
    // Example with ipapi.co (free tier available)
    // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    // const data = await response.json();
    // return {
    //   country: data.country_name,
    //   region: data.region,
    //   city: data.city
    // };

    return null;
  } catch (error) {
    console.error('Error getting geographic data:', error);
    return null;
  }
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }

  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // Operating system detection
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return {
    deviceType,
    browser,
    os
  };
};

// Analytics data collection middleware
const collectAnalyticsData = async (req, res, next) => {
  try {
    // Collect real-time analytics data
    const analyticsData = {
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userId: req.user?._id || null,
      userRole: req.user?.role || 'guest',
      isAuthenticated: !!req.user,
      sessionId: req.session.analyticsSessionId,
      referrer: req.get('Referrer'),
      responseTime: 0,
      statusCode: 0
    };

    // Store analytics data for processing
    req.analyticsData = analyticsData;

    next();
  } catch (error) {
    console.error('Analytics data collection error:', error);
    next();
  }
};

// Analytics cleanup middleware (run periodically)
const cleanupAnalyticsData = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Clean up old analytics data
    await Promise.all([
      AnalyticsService.cleanupOldPageViews(thirtyDaysAgo),
      AnalyticsService.cleanupOldSessions(thirtyDaysAgo),
      AnalyticsService.cleanupOldPerformanceData(thirtyDaysAgo)
    ]);

    console.log('Analytics data cleanup completed');
  } catch (error) {
    console.error('Analytics cleanup error:', error);
  }
};

// Export middleware functions
module.exports = {
  trackAnalytics,
  trackUserAction,
  trackPerformance,
  trackGeographicData,
  trackDeviceInfo,
  collectAnalyticsData,
  cleanupAnalyticsData
};
