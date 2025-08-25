const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Casting = require('../models/Casting');
const Application = require('../models/Application');
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const Report = require('../models/Report');
const Settings = require('../models/Settings');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'دسترسی محدود - فقط ادمین' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'خطا در احراز هویت ادمین' });
  }
};

// Apply auth middleware first, then admin auth to all routes
router.use(auth);
router.use(adminAuth);

// GET /admin/stats - Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      talentsCount,
      directorsCount,
      totalCastings,
      activeCastings,
      draftCastings,
      suspendedCastings,
      totalApplications,
      pendingUsersCount,
      pendingCastingsCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'talent' }),
      User.countDocuments({ role: 'casting_director' }),
      Casting.countDocuments(),
      Casting.countDocuments({ status: 'active' }),
      Casting.countDocuments({ status: 'draft' }),
      Casting.countDocuments({ status: 'suspended' }),
      Application.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      Casting.countDocuments({ status: 'draft' })
    ]);

    const pendingActions = pendingUsersCount + pendingCastingsCount;

    res.json({
      totalUsers,
      talentsCount,
      directorsCount,
      totalCastings,
      activeCastings,
      draftCastings,
      suspendedCastings,
      totalApplications,
      pendingActions
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// GET /admin/activities - Get recent activities
router.get('/activities', async (req, res) => {
  try {
    // Get recent activities from different collections
    const [recentUsers, recentCastings, recentApplications] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(20).select('firstName lastName email role status createdAt'),
      Casting.find().sort({ createdAt: -1 }).limit(20).select('title status director createdAt'),
      Application.find().sort({ createdAt: -1 }).limit(20).select('status talent casting createdAt')
    ]);

    const activities = [];

    // Add user registration activities
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        description: `کاربر جدید ${user.firstName} ${user.lastName} (${user.email}) ثبت نام کرد`,
        createdAt: user.createdAt,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    });

    // Add casting creation activities
    recentCastings.forEach(casting => {
      activities.push({
        type: 'casting_created',
        description: `کستینگ جدید "${casting.title}" ایجاد شد`,
        createdAt: casting.createdAt,
        casting: {
          title: casting.title,
          status: casting.status
        }
      });
    });

    // Add application submission activities
    recentApplications.forEach(application => {
      activities.push({
        type: 'application_submitted',
        description: `درخواست جدید برای کستینگ ارسال شد`,
        createdAt: application.createdAt,
        application: {
          status: application.status
        }
      });
    });

    // Sort all activities by date (newest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit to 50 most recent activities
    const limitedActivities = activities.slice(0, 50);

    res.json({
      activities: limitedActivities,
      total: limitedActivities.length
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'خطا در دریافت فعالیت‌ها' });
  }
});

// GET /admin/pending-actions - Get pending actions
router.get('/pending-actions', async (req, res) => {
  try {
    const actions = [];

    // Pending user approvals
    const pendingUsers = await User.find({ status: 'pending' })
      .limit(5);

    pendingUsers.forEach(user => {
      actions.push({
        type: 'user_approval',
        description: `تایید کاربر: ${user.firstName || user.email}`,
        link: `/admin/users/${user._id}`,
        createdAt: user.createdAt
      });
    });

    // Draft castings
    const draftCastings = await Casting.find({ status: 'draft' })
      .populate('castingDirector')
      .limit(5);

    draftCastings.forEach(casting => {
      actions.push({
        type: 'casting_review',
        description: `بررسی کستینگ: ${casting.title}`,
        link: `/admin/castings/${casting._id}`,
        createdAt: casting.createdAt
      });
    });

    res.json({
      actions: actions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Error fetching pending actions:', error);
    res.status(500).json({ error: 'خطا در دریافت اقدامات در انتظار' });
  }
});

// GET /admin/users - Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', role = '', hasAutoApproval } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    // Apply auto-approval filter
    if (hasAutoApproval !== undefined) {
      if (hasAutoApproval === 'true') {
        query['writerProfile.autoApproval'] = true;
      } else {
        query.$or = [
          { 'writerProfile.autoApproval': { $ne: true } },
          { writerProfile: { $exists: false } }
        ];
      }
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'خطا در دریافت کاربران' });
  }
});

// PATCH /admin/users/:id/status - Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت کاربر' });
  }
});

// POST /admin/users/bulk-action - Bulk user actions
router.post('/users/bulk-action', async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'لیست کاربران نامعتبر است' });
    }

    let updateData = {};
    
    switch (action) {
      case 'activate':
        updateData = { status: 'active' };
        break;
      case 'suspend':
        updateData = { status: 'suspended' };
        break;
      default:
        return res.status(400).json({ error: 'عملیات نامعتبر است' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({ 
      message: 'عملیات با موفقیت انجام شد',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error performing bulk user action:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

// GET /admin/castings - Get all castings with filters
router.get('/castings', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', type = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.projectType = type;
    }

    const skip = (page - 1) * limit;
    
    const [castings, total] = await Promise.all([
      Casting.find(query)
        .populate('castingDirector')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Casting.countDocuments(query)
    ]);

    res.json({
      castings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching castings:', error);
    res.status(500).json({ error: 'خطا در دریافت کستینگ‌ها' });
  }
});

// PATCH /admin/castings/:id/status - Update casting status
router.patch('/castings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const casting = await Casting.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('castingDirector');

    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    res.json({ casting });
  } catch (error) {
    console.error('Error updating casting status:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت کستینگ' });
  }
});

// POST /admin/castings/bulk-action - Bulk casting actions
router.post('/castings/bulk-action', async (req, res) => {
  try {
    const { castingIds, action } = req.body;

    if (!castingIds || !Array.isArray(castingIds) || castingIds.length === 0) {
      return res.status(400).json({ error: 'لیست کستینگ‌ها نامعتبر است' });
    }

    let updateData = {};
    
    switch (action) {
      case 'approve':
        updateData = { status: 'active' };
        break;
      case 'reject':
        updateData = { status: 'suspended' };
        break;
      default:
        return res.status(400).json({ error: 'عملیات نامعتبر است' });
    }

    const result = await Casting.updateMany(
      { _id: { $in: castingIds } },
      updateData
    );

    res.json({ 
      message: 'عملیات با موفقیت انجام شد',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error performing bulk casting action:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

// GET /admin/users/:id - Get specific user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    // Get profile data based on user role
    let profileData = {};
    
    if (user.role === 'talent') {
      const talentProfile = await TalentProfile.findOne({ user: user._id });
      if (talentProfile) {
        profileData.talentProfile = talentProfile;
      }
    } else if (user.role === 'casting_director') {
      const directorProfile = await CastingDirectorProfile.findOne({ user: user._id });
      if (directorProfile) {
        profileData.castingDirectorProfile = directorProfile;
      }
    }

    // Get statistics
    const [castingsCount, applicationsCount, messagesCount] = await Promise.all([
      user.role === 'casting_director' ? Casting.countDocuments({ castingDirector: user._id }) : 0,
      user.role === 'talent' ? Application.countDocuments({ talent: user._id }) : 0,
      0 // Messages count - implement when messaging is added
    ]);

    const userWithProfile = {
      ...user.toObject(),
      ...profileData,
      castingsCount,
      applicationsCount,
      messagesCount
    };

    res.json({ user: userWithProfile });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات کاربر' });
  }
});

// GET /admin/castings/:id - Get specific casting details
router.get('/castings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const casting = await Casting.findById(id)
      .populate('castingDirector');

    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    res.json({ casting });
  } catch (error) {
    console.error('Error fetching casting details:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات کستینگ' });
  }
});

// PUT /admin/castings/:id - Update casting details
router.put('/castings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the casting
    const casting = await Casting.findById(id);
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Update the casting
    const updatedCasting = await Casting.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('castingDirector');

    res.json({ 
      casting: updatedCasting,
      message: 'کستینگ با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating casting:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی کستینگ' });
  }
});

// GET /admin/castings/:id/applications - Get applications for a specific casting
router.get('/castings/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    const { status = '' } = req.query;

    // Check if casting exists
    const casting = await Casting.findById(id);
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    let query = { casting: id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('talent', 'firstName lastName email')
      .populate({
        path: 'casting',
        select: 'title projectType roleType'
      })
      .sort({ submittedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching casting applications:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌های کستینگ' });
  }
});

// PATCH /admin/applications/:id/status - Update application status (admin version)
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { 
        status,
        adminNotes,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('talent', 'firstName lastName email')
     .populate('casting', 'title');

    res.json({ 
      application: updatedApplication,
      message: 'وضعیت درخواست تغییر کرد'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت درخواست' });
  }
});

// POST /admin/applications/bulk/status - Bulk update application status (admin version)
router.post('/applications/bulk/status', async (req, res) => {
  try {
    const { applicationIds, status, adminNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'لیست درخواست‌ها نمی‌تواند خالی باشد' });
    }

    const updateData = { 
      status,
      updatedAt: new Date()
    };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      updateData
    );

    res.json({ 
      message: `وضعیت ${result.modifiedCount} درخواست تغییر کرد`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت درخواست‌ها' });
  }
});

// GET /admin/applications - Get all applications with filters and pagination
router.get('/applications', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query.$or = [
        { 'talent.firstName': { $regex: search, $options: 'i' } },
        { 'talent.lastName': { $regex: search, $options: 'i' } },
        { 'casting.title': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('talent', 'firstName lastName email')
        .populate('casting', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      applications,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌ها' });
  }
});

// GET /admin/applications/:id - Get specific application details
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('talent', 'firstName lastName email phone createdAt')
      .populate('casting', 'title type createdAt')
      .populate('casting.castingDirector', 'firstName lastName');

    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات درخواست' });
  }
});

// PATCH /admin/applications/:id/status - Update application status
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت درخواست' });
  }
});

// POST /admin/applications/bulk-action - Bulk actions on applications
router.post('/applications/bulk-action', async (req, res) => {
  try {
    const { applicationIds, action } = req.body;

    let updateData = {};
    switch (action) {
      case 'accept':
        updateData = { status: 'accepted' };
        break;
      case 'reject':
        updateData = { status: 'rejected' };
        break;
      default:
        return res.status(400).json({ error: 'عملیات نامعتبر' });
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      updateData
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

const AnalyticsService = require('../services/analyticsService');

// GET /admin/analytics - Get comprehensive platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    // Get comprehensive analytics data
    const analyticsData = await AnalyticsService.getDashboardAnalytics(range);
    
    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// GET /admin/analytics/visitors - Get visitor analytics
router.get('/analytics/visitors', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const visitorMetrics = await AnalyticsService.getVisitorMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: visitorMetrics
    });
  } catch (error) {
    console.error('Error fetching visitor analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار بازدیدکنندگان' });
  }
});

// GET /admin/analytics/users - Get user analytics
router.get('/analytics/users', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const userMetrics = await AnalyticsService.getUserMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: userMetrics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار کاربران' });
  }
});

// GET /admin/analytics/content - Get content analytics
router.get('/analytics/content', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const contentMetrics = await AnalyticsService.getContentMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: contentMetrics
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار محتوا' });
  }
});

// GET /admin/analytics/engagement - Get engagement analytics
router.get('/analytics/engagement', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const engagementMetrics = await AnalyticsService.getEngagementMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: engagementMetrics
    });
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار تعامل' });
  }
});

// GET /admin/analytics/conversion - Get conversion analytics
router.get('/analytics/conversion', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const conversionMetrics = await AnalyticsService.getConversionMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: conversionMetrics
    });
  } catch (error) {
    console.error('Error fetching conversion analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار تبدیل' });
  }
});

// GET /admin/analytics/seasonal - Get seasonal trends
router.get('/analytics/seasonal', async (req, res) => {
  try {
    const { range = '1y' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const seasonalData = await AnalyticsService.getSeasonalTrends(startDate, endDate);
    
    res.json({
      success: true,
      data: seasonalData
    });
  } catch (error) {
    console.error('Error fetching seasonal analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت روندهای فصلی' });
  }
});

// GET /admin/analytics/geographic - Get geographic analytics
router.get('/analytics/geographic', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const geographicData = await AnalyticsService.getGeographicAnalytics(startDate, endDate);
    
    res.json({
      success: true,
      data: geographicData
    });
  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار جغرافیایی' });
  }
});

// GET /admin/analytics/devices - Get device analytics
router.get('/analytics/devices', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const deviceData = await AnalyticsService.getDeviceAnalytics(startDate, endDate);
    
    res.json({
      success: true,
      data: deviceData
    });
  } catch (error) {
    console.error('Error fetching device analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار دستگاه‌ها' });
  }
});

// GET /admin/analytics/performance - Get performance metrics
router.get('/analytics/performance', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = AnalyticsService.getDateRange(range);
    
    const performanceData = await AnalyticsService.getPerformanceMetrics(startDate, endDate);
    
    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت معیارهای عملکرد' });
  }
});

// GET /admin/analytics/realtime - Get real-time analytics
router.get('/analytics/realtime', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const realtimeData = await Promise.all([
      AnalyticsService.getActiveUsers(oneHourAgo, now),
      AnalyticsService.getVisitorTrends(oneHourAgo, now),
      AnalyticsService.getTopPages(oneHourAgo, now)
    ]);
    
    res.json({
      success: true,
      data: {
        activeUsers: realtimeData[0],
        visitorTrends: realtimeData[1],
        topPages: realtimeData[2],
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار لحظه‌ای' });
  }
});



// GET /admin/pending-actions - Get pending actions
router.get('/pending-actions', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    // Mock pending actions data
    const mockPendingActions = [
      {
        _id: '1',
        title: 'تایید کاربر جدید',
        description: 'کاربر جدید نیاز به تایید دارد',
        type: 'user_approval',
        priority: 'medium',
        createdAt: new Date()
      },
      {
        _id: '2',
        title: 'بررسی کستینگ',
        description: 'کستینگ جدید نیاز به بررسی دارد',
        type: 'casting_approval',
        priority: 'high',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    res.json({
      pendingActions: mockPendingActions
    });
  } catch (error) {
    console.error('Error fetching pending actions:', error);
    res.status(500).json({ error: 'خطا در دریافت اقدامات در انتظار' });
  }
});

// POST /admin/pending-actions/:id - Handle pending action
router.post('/pending-actions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, type } = req.body;

    // Mock action handling
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling pending action:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

// GET /admin/settings - Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'خطا در دریافت تنظیمات' });
  }
});

// PUT /admin/settings - Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { settings: newSettings } = req.body;
    
    if (!newSettings) {
      return res.status(400).json({ error: 'تنظیمات مورد نیاز است' });
    }

    let settings = await Settings.getSettings();
    
    // Validate and update settings
    const validationErrors = [];
    Object.keys(newSettings).forEach(key => {
      if (settings.schema.paths[key]) {
        const value = newSettings[key];
        
        // Validate specific fields
        if (key === 'maxFileSize' && (value < 1 || value > 100)) {
          validationErrors.push('حداکثر اندازه فایل باید بین 1 تا 100 مگابایت باشد');
        } else if (key === 'minPasswordLength' && (value < 6 || value > 20)) {
          validationErrors.push('حداقل طول رمز عبور باید بین 6 تا 20 کاراکتر باشد');
        } else if (key === 'tokenExpiryHours' && (value < 1 || value > 168)) {
          validationErrors.push('مدت اعتبار توکن باید بین 1 تا 168 ساعت باشد');
        } else if (key === 'maxApplicationsPerDay' && (value < 1 || value > 100)) {
          validationErrors.push('حداکثر تعداد درخواست‌ها باید بین 1 تا 100 باشد');
        } else if (key === 'maxActiveCastings' && (value < 1 || value > 50)) {
          validationErrors.push('حداکثر تعداد کستینگ‌های فعال باید بین 1 تا 50 باشد');
        } else {
          settings[key] = value;
        }
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'خطا در اعتبارسنجی تنظیمات',
        details: validationErrors 
      });
    }
    
    settings.lastUpdate = new Date();
    await settings.save();

    res.json({ 
      success: true, 
      message: 'تنظیمات با موفقیت به‌روزرسانی شد',
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'خطا در ذخیره تنظیمات' });
  }
});

// POST /admin/settings/reset - Reset settings to defaults
router.post('/settings/reset', async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    // Reset to default values
    settings.platformName = 'کستینگ پلت';
    settings.supportEmail = 'support@castingplatform.com';
    settings.maxFileSize = 10;
    settings.timezone = 'Asia/Tehran';
    settings.minPasswordLength = 8;
    settings.tokenExpiryHours = 24;
    settings.requireEmailVerification = false;
    settings.enableTwoFactor = false;
    settings.maxApplicationsPerDay = 10;
    settings.maxActiveCastings = 5;
    settings.autoApproveUsers = false;
    settings.autoApproveCastings = false;
    settings.emailNotifications = true;
    settings.pushNotifications = true;
    settings.adminNotifications = true;
    settings.weeklyReports = false;
    
    settings.lastUpdate = new Date();
    await settings.save();

    res.json({ 
      success: true, 
      message: 'تنظیمات با موفقیت به حالت پیش‌فرض بازگردانده شد',
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'خطا در بازگردانی تنظیمات' });
  }
});

// ===== REPORTS MANAGEMENT =====

// GET /admin/reports - Get all reports with filters and pagination
router.get('/reports', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      priority = '', 
      reportType = '', 
      category = '',
      search = ''
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (reportType) query.reportType = reportType;
    if (category) query.category = category;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reportNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'firstName lastName email')
        .populate('targetId', 'title firstName lastName email')
        .populate('adminNotes.admin', 'firstName lastName')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      reports,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'خطا در دریافت گزارشات' });
  }
});

// GET /admin/reports/:id - Get specific report details
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reporter', 'firstName lastName email role')
      .populate('targetId', 'title firstName lastName email')
      .populate('adminNotes.admin', 'firstName lastName')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .populate('messages.adminId', 'firstName lastName');

    // Populate content information for content-based reports
    if (report.contentId) {
      if (report.reportType === 'casting') {
        await report.populate('contentId', 'title projectType roleType');
      } else if (report.reportType === 'blog') {
        await report.populate('contentId', 'title slug excerpt');
      } else if (report.reportType === 'news') {
        await report.populate('contentId', 'title slug excerpt');
      }
    }

    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات گزارش' });
  }
});

// PATCH /admin/reports/:id/status - Update report status
router.patch('/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    const oldStatus = report.status;
    report.status = status;

    // Add admin note
    if (note) {
      report.adminNotes.push({
        admin: req.user._id,
        note,
        action: 'status_change'
      });
    }

    // Update resolution if status is resolved
    if (status === 'resolved' && !report.resolution.resolvedAt) {
      report.resolution.resolvedAt = new Date();
      report.resolution.resolvedBy = req.user._id;
      report.isResolved = true;
    }

    await report.save();

    res.json({
      success: true,
      message: 'وضعیت گزارش تغییر کرد',
      report
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت گزارش' });
  }
});

// PATCH /admin/reports/:id/priority - Update report priority
router.patch('/reports/:id/priority', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, note } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    report.priority = priority;

    // Add admin note
    if (note) {
      report.adminNotes.push({
        admin: req.user._id,
        note,
        action: 'priority_change'
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'اولویت گزارش تغییر کرد',
      report
    });
  } catch (error) {
    console.error('Error updating report priority:', error);
    res.status(500).json({ error: 'خطا در تغییر اولویت گزارش' });
  }
});

// POST /admin/reports/:id/notes - Add admin note
router.post('/reports/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'متن یادداشت ضروری است' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    report.adminNotes.push({
      admin: req.user._id,
      note,
      action: 'note_added'
    });

    await report.save();

    res.json({
      success: true,
      message: 'یادداشت اضافه شد',
      report
    });
  } catch (error) {
    console.error('Error adding admin note:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن یادداشت' });
  }
});

// POST /admin/reports/:id/resolve - Resolve report with action
router.post('/reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, details, note } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    // Update resolution
    report.resolution = {
      action,
      details,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };

    report.status = 'resolved';
    report.isResolved = true;

    // Add admin note
    if (note) {
      report.adminNotes.push({
        admin: req.user._id,
        note,
        action: 'action_taken'
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'گزارش حل شد',
      report
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ error: 'خطا در حل گزارش' });
  }
});

// GET /admin/reports/stats/overview - Get reports statistics
router.get('/reports/stats/overview', async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      underReviewReports,
      resolvedReports,
      urgentReports,
      todayReports,
      weeklyReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'under_review' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ priority: 'urgent' }),
      Report.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Report.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get reports by category
    const categoryStats = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get reports by type
    const typeStats = await Report.aggregate([
      { $group: { _id: '$reportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalReports,
      pendingReports,
      underReviewReports,
      resolvedReports,
      urgentReports,
      todayReports,
      weeklyReports,
      categoryStats,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار گزارشات' });
  }
});

// PATCH /admin/users/:id/auto-approval - Grant/revoke auto-approval for content
router.patch('/users/:id/auto-approval', async (req, res) => {
  try {
    const { id } = req.params;
    const { autoApproval } = req.body;
    const admin = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    // Check if user is a writer or director
    if (user.role !== 'journalist' && user.role !== 'casting_director') {
      return res.status(400).json({ error: 'فقط نویسندگان و کارگردانان می‌توانند مجوز تایید خودکار داشته باشند' });
    }

    // Update auto-approval status
    if (!user.writerProfile) {
      user.writerProfile = {};
    }

    user.writerProfile.autoApproval = autoApproval;
    
    if (autoApproval) {
      user.writerProfile.autoApprovalGrantedAt = new Date();
      user.writerProfile.autoApprovalGrantedBy = admin.id;
    } else {
      user.writerProfile.autoApprovalGrantedAt = null;
      user.writerProfile.autoApprovalGrantedBy = null;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        writerProfile: user.writerProfile
      },
      message: autoApproval ? 'مجوز تایید خودکار اعطا شد' : 'مجوز تایید خودکار لغو شد'
    });
  } catch (error) {
    console.error('Error updating auto-approval:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی مجوز تایید خودکار' });
  }
});

// POST /admin/reports/:id/message - Send message to user about report
router.post('/reports/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, targetUserId } = req.body;
    const admin = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'پیام نمی‌تواند خالی باشد' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    // Add message to report
    if (!report.messages) {
      report.messages = [];
    }

    report.messages.push({
      sender: 'admin',
      content: message.trim(),
      createdAt: new Date(),
      adminId: admin._id
    });

    await report.save();

    // Send notification to target user (you can implement this later)
    // For now, we'll just save the message in the report

    res.json({
      success: true,
      message: 'پیام با موفقیت ارسال شد',
      report: {
        id: report._id,
        messages: report.messages
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'خطا در ارسال پیام' });
  }
});

module.exports = router;
