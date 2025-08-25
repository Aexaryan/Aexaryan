const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Casting = require('../models/Casting');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const News = require('../models/News');
const User = require('../models/User');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply auth middleware to all routes
router.use(auth);

// GET /reports - Get user's own reports
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { reporter: req.user._id };
    if (status) {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('targetId', 'title firstName lastName email')
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
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'خطا در دریافت گزارشات' });
  }
});

// POST /reports - Create a new report
router.post('/', upload.array('evidence', 5), async (req, res) => {
  try {
    const {
      reportType,
      targetId,
      category,
      title,
      description,
      evidenceLinks
    } = req.body;

    // Validation
    if (!reportType || !category || !title || !description) {
      return res.status(400).json({ error: 'تمام فیلدهای ضروری را پر کنید' });
    }

    // Validate report type and target
    if (reportType !== 'system' && reportType !== 'other' && !targetId) {
      return res.status(400).json({ error: 'شناسه هدف برای این نوع گزارش ضروری است' });
    }

    // Check if user has already reported this target recently (prevent spam)
    if (targetId) {
      const recentReport = await Report.findOne({
        reporter: req.user._id,
        targetId,
        reportType,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (recentReport) {
        return res.status(400).json({ 
          error: 'شما قبلاً این مورد را گزارش کرده‌اید. لطفاً 24 ساعت صبر کنید.' 
        });
      }
    }

    // Validate that the target content exists and get its owner
    let contentOwner = null;
    if (reportType === 'casting') {
      const casting = await Casting.findById(targetId).populate('castingDirector', '_id firstName lastName');
      if (!casting) {
        return res.status(400).json({ error: 'کستینگ یافت نشد' });
      }
      if (!casting.castingDirector) {
        return res.status(400).json({ error: 'کستینگ فاقد مدیر است' });
      }
      contentOwner = casting.castingDirector;
      
      // Prevent users from reporting their own castings
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید کستینگ خود را گزارش کنید' });
      }
    } else if (reportType === 'blog') {
      const blog = await Blog.findById(targetId).populate('author', '_id firstName lastName');
      if (!blog) {
        return res.status(400).json({ error: 'مقاله یافت نشد' });
      }
      if (!blog.author) {
        return res.status(400).json({ error: 'مقاله فاقد نویسنده است' });
      }
      contentOwner = blog.author;
      
      // Prevent users from reporting their own blogs
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید مقاله خود را گزارش کنید' });
      }
    } else if (reportType === 'news') {
      const news = await News.findById(targetId).populate('author', '_id firstName lastName');
      if (!news) {
        return res.status(400).json({ error: 'خبر یافت نشد' });
      }
      if (!news.author) {
        return res.status(400).json({ error: 'خبر فاقد نویسنده است' });
      }
      contentOwner = news.author;
      
      // Prevent users from reporting their own news
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید خبر خود را گزارش کنید' });
      }
    } else if (reportType === 'application') {
      const application = await Application.findById(targetId).populate('talent', '_id firstName lastName');
      if (!application) {
        return res.status(400).json({ error: 'درخواست یافت نشد' });
      }
      if (!application.talent) {
        return res.status(400).json({ error: 'درخواست فاقد استعداد است' });
      }
      contentOwner = application.talent;
      
      // Prevent users from reporting their own applications
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید درخواست خود را گزارش کنید' });
      }
    } else if (reportType === 'user') {
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(400).json({ error: 'کاربر یافت نشد' });
      }
      contentOwner = targetUser;
      
      // Prevent users from reporting themselves
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید خود را گزارش کنید' });
      }
    } else if (reportType === 'message') {
      const message = await Message.findById(targetId).populate('sender', '_id firstName lastName');
      if (!message) {
        return res.status(400).json({ error: 'پیام یافت نشد' });
      }
      if (!message.sender) {
        return res.status(400).json({ error: 'پیام فاقد فرستنده است' });
      }
      contentOwner = message.sender;
      
      // Prevent users from reporting their own messages
      if (contentOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'شما نمی‌توانید پیام خود را گزارش کنید' });
      }
    }

    // Process uploaded files
    const evidence = [];
    
    // Add uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        evidence.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'document',
          url: file.path,
          filename: file.originalname,
          description: 'فایل آپلود شده'
        });
      });
    }

    // Add evidence links
    if (evidenceLinks) {
      try {
        const links = JSON.parse(evidenceLinks);
        links.forEach(link => {
          evidence.push({
            type: 'link',
            url: link.url,
            description: link.description || 'لینک ارائه شده'
          });
        });
      } catch (e) {
        console.error('Error parsing evidence links:', e);
      }
    }

    // Create report with proper targeting logic
    const reportData = {
      reporter: req.user._id,        // Creator ID (who created the report)
      reportType,
      category,
      title,
      description,
      evidence
    };

    // Store content ID for content-based reports (the actual content being reported)
    if (['casting', 'blog', 'news'].includes(reportType)) {
      reportData.contentId = targetId;
      console.log(`Content ID stored: ${targetId} for ${reportType}`);
    }

    // Set target fields for content-based reports (the owner of the content/account)
    if (reportType !== 'system' && reportType !== 'other' && contentOwner) {
      reportData.targetId = contentOwner._id;  // Target ID (owner of content/account)
      reportData.targetModel = 'User';
      
      console.log(`=== REPORT CREATION LOG ===`);
      console.log(`Reporter (Creator): ${req.user.firstName} ${req.user.lastName} (${req.user._id})`);
      console.log(`Report Type: ${reportType}`);
      console.log(`Content ID: ${targetId}`);
      console.log(`Target (Owner): ${contentOwner.firstName} ${contentOwner.lastName} (${contentOwner._id})`);
      console.log(`Category: ${category}`);
      console.log(`Title: ${title}`);
      console.log(`========================`);
    }

    // Validate report data structure before saving
    if (reportType !== 'system' && reportType !== 'other') {
      if (!reportData.targetId) {
        console.error('ERROR: targetId is missing for report type:', reportType);
        return res.status(500).json({ error: 'خطا در تعیین هدف گزارش' });
      }
      if (!reportData.targetModel) {
        console.error('ERROR: targetModel is missing for report type:', reportType);
        return res.status(500).json({ error: 'خطا در تعیین نوع هدف گزارش' });
      }
    }

    console.log('Final report data:', JSON.stringify(reportData, null, 2));

    const report = new Report(reportData);

    await report.save();

    res.status(201).json({
      success: true,
      message: 'گزارش با موفقیت ارسال شد',
      report: {
        id: report._id,
        reportNumber: report.reportNumber,
        status: report.status
      }
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'خطا در ارسال گزارش' });
  }
});

// GET /reports/against-me - Get reports where user is the target
router.get('/against-me', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { targetId: req.user._id };
    if (status) {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter', 'firstName lastName email')
        .populate('contentId', 'title slug excerpt')
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
    console.error('Error fetching reports against user:', error);
    res.status(500).json({ error: 'خطا در دریافت گزارشات' });
  }
});



// GET /reports/:id - Get specific report details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      _id: id,
      reporter: req.user._id
    }).populate('targetId', 'title firstName lastName email')
      .populate('reporter', 'firstName lastName email')
      .populate('adminNotes.admin', 'firstName lastName')
      .populate('messages.adminId', 'firstName lastName')
      .populate('contentId', 'title slug excerpt')
      .lean();

    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات گزارش' });
  }
});

// PUT /reports/:id - Update user's own report (only if pending)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, evidenceLinks } = req.body;

    const report = await Report.findOne({
      _id: id,
      reporter: req.user._id,
      status: 'pending'
    });

    if (!report) {
      return res.status(404).json({ error: 'گزارش قابل ویرایش یافت نشد' });
    }

    // Update fields
    if (title) report.title = title;
    if (description) report.description = description;

    // Update evidence links
    if (evidenceLinks) {
      try {
        const links = JSON.parse(evidenceLinks);
        const linkEvidence = links.map(link => ({
          type: 'link',
          url: link.url,
          description: link.description || 'لینک ارائه شده'
        }));
        
        // Replace existing link evidence
        report.evidence = report.evidence.filter(e => e.type !== 'link').concat(linkEvidence);
      } catch (e) {
        console.error('Error parsing evidence links:', e);
      }
    }

    await report.save();

    res.json({
      success: true,
      message: 'گزارش با موفقیت به‌روزرسانی شد',
      report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی گزارش' });
  }
});

// DELETE /reports/:id - Cancel user's own report (only if pending)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOneAndDelete({
      _id: id,
      reporter: req.user._id,
      status: 'pending'
    });

    if (!report) {
      return res.status(404).json({ error: 'گزارش قابل حذف یافت نشد' });
    }

    res.json({
      success: true,
      message: 'گزارش با موفقیت لغو شد'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'خطا در حذف گزارش' });
  }
});

// GET /reports/stats - Get user's report statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalReports, pendingReports, resolvedReports, recentReports, reportsAgainstMe, pendingReportsAgainstMe] = await Promise.all([
      Report.countDocuments({ reporter: req.user._id }),
      Report.countDocuments({ reporter: req.user._id, status: 'pending' }),
      Report.countDocuments({ reporter: req.user._id, status: 'resolved' }),
      Report.countDocuments({
        reporter: req.user._id,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Report.countDocuments({ targetId: req.user._id }),
      Report.countDocuments({ targetId: req.user._id, status: 'pending' })
    ]);

    res.json({
      totalReports,
      pendingReports,
      resolvedReports,
      recentReports,
      reportsAgainstMe,
      pendingReportsAgainstMe
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار گزارشات' });
  }
});

// POST /reports/:id/message - User reply to admin message (only if user is the target)
router.post('/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'پیام نمی‌تواند خالی باشد' });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    // Check if user is the target of this report
    if (!report.targetId || report.targetId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به ارسال پیام در این گزارش نیستید' });
    }

    // Add message to report
    if (!report.messages) {
      report.messages = [];
    }

    report.messages.push({
      sender: 'user',
      content: message.trim(),
      createdAt: new Date()
    });

    await report.save();

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

// GET /reports/target/:id - Get report details for target user
router.get('/target/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('targetId', 'title firstName lastName email')
      .populate('reporter', 'firstName lastName email')
      .populate('adminNotes.admin', 'firstName lastName')
      .populate('messages.adminId', 'firstName lastName')
      .populate('contentId', 'title slug excerpt')
      .lean();

    if (!report) {
      return res.status(404).json({ error: 'گزارش یافت نشد' });
    }

    // Check if user is the target of this report
    if (!report.targetId || report.targetId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به مشاهده این گزارش نیستید' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error fetching report details for target:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات گزارش' });
  }
});





module.exports = router;
