const express = require('express');
const Application = require('../models/Application');
const Casting = require('../models/Casting');
const TalentProfile = require('../models/TalentProfile');
const { auth, requireTalent, requireCastingDirector } = require('../middleware/auth');

const router = express.Router();

// Submit application (talents only)
router.post('/', auth, requireTalent, async (req, res) => {
  try {
    const { castingId, coverMessage, additionalImages, videoAudition } = req.body;

    if (!castingId || !coverMessage) {
      return res.status(400).json({ error: 'شناسه کستینگ و پیام پوششی ضروری است' });
    }

    // Check if casting exists and is active
    const casting = await Casting.findById(castingId);
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    if (casting.status !== 'active') {
      return res.status(400).json({ error: 'این کستینگ فعال نیست' });
    }

    // Check if application deadline has passed
    if (casting.applicationDeadline < new Date()) {
      return res.status(400).json({ error: 'مهلت ارسال درخواست به پایان رسیده است' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      casting: castingId,
      talent: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'شما قبلاً برای این کستینگ درخواست ارسال کرده‌اید' });
    }

    // Get talent profile for snapshot
    const talentProfile = await TalentProfile.findOne({ user: req.user._id });
    if (!talentProfile) {
      return res.status(400).json({ error: 'لطفاً ابتدا پروفایل خود را تکمیل کنید' });
    }

    // Create application
    const application = new Application({
      casting: castingId,
      talent: req.user._id,
      coverMessage,
      additionalImages: additionalImages || [],
      videoAudition,
      talentSnapshot: {
        name: talentProfile.artisticName,
        age: talentProfile.age,
        height: talentProfile.height,
        skills: talentProfile.skills,
        headshot: talentProfile.headshot?.url
      }
    });

    await application.save();

    // Update casting application count
    casting.totalApplications += 1;
    await casting.save();

    // Update talent application count
    talentProfile.totalApplications += 1;
    await talentProfile.save();

    // Populate the application for response
    await application.populate('casting', 'title projectType roleType applicationDeadline');

    res.status(201).json({
      success: true,
      message: 'درخواست شما با موفقیت ارسال شد',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'شما قبلاً برای این کستینگ درخواست ارسال کرده‌اید' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در ارسال درخواست' });
  }
});

// Get my applications (talents only)
router.get('/me', auth, requireTalent, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { talent: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate('casting', 'title projectType roleType status applicationDeadline castingDirector')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌های شما' });
  }
});

// Get application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('casting', 'title description projectType roleType requirements applicationDeadline castingDirector')
      .populate('talent', 'email');

    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check permissions
    const isTalent = req.user.role === 'talent' && application.talent._id.toString() === req.user._id.toString();
    const isCastingDirector = req.user.role === 'casting_director' && 
      application.casting.castingDirector._id.toString() === req.user._id.toString();

    if (!isTalent && !isCastingDirector) {
      return res.status(403).json({ error: 'شما مجاز به مشاهده این درخواست نیستید' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست' });
  }
});

// Update application status (casting directors only)
router.patch('/:id/status', auth, requireCastingDirector, async (req, res) => {
  try {
    const { status, directorNotes, directorResponse, callbackDetails } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر' });
    }

    const application = await Application.findById(req.params.id)
      .populate('casting', 'castingDirector');

    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the casting director
    if (application.casting.castingDirector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به تغییر وضعیت این درخواست نیستید' });
    }

    // Update application
    const updates = { status };
    
    if (directorNotes) {
      updates.directorNotes = directorNotes;
    }
    
    if (directorResponse) {
      updates.directorResponse = {
        message: directorResponse,
        respondedAt: new Date()
      };
    }
    
    if (callbackDetails) {
      updates.callbackDetails = callbackDetails;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('talent', 'email');

    // Update casting statistics
    if (status === 'shortlisted') {
      await Casting.findByIdAndUpdate(
        application.casting._id,
        { $inc: { shortlistedApplications: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'وضعیت درخواست با موفقیت تغییر کرد',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در تغییر وضعیت درخواست' });
  }
});

// Withdraw application (talents only)
router.patch('/:id/withdraw', auth, requireTalent, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the applicant
    if (application.talent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به انصراف از این درخواست نیستید' });
    }

    // Check if application can be withdrawn
    if (['accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({ error: 'نمی‌توان از درخواست پذیرفته شده یا رد شده انصراف داد' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'درخواست شما با موفقیت لغو شد',
      application: {
        id: application._id,
        status: application.status,
        statusUpdatedAt: application.statusUpdatedAt
      }
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'خطا در لغو درخواست' });
  }
});

// Get application statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'talent') {
      // Talent statistics
      const applications = await Application.find({ talent: req.user._id });
      
      stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        withdrawn: applications.filter(app => app.status === 'withdrawn').length,
        successRate: applications.length > 0 ? 
          Math.round((applications.filter(app => app.status === 'accepted').length / applications.length) * 100) : 0
      };
    } else if (req.user.role === 'casting_director') {
      // Casting director statistics
      const castings = await Casting.find({ castingDirector: req.user._id });
      const castingIds = castings.map(c => c._id);
      const applications = await Application.find({ casting: { $in: castingIds } });
      
      stats = {
        totalCastings: castings.length,
        activeCastings: castings.filter(c => c.status === 'active').length,
        totalApplications: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// Bulk update application status (casting directors only)
router.patch('/bulk/status', auth, requireCastingDirector, async (req, res) => {
  try {
    const { applicationIds, status, directorNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'لیست شناسه درخواست‌ها ضروری است' });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر' });
    }

    // Get applications and verify ownership
    const applications = await Application.find({
      _id: { $in: applicationIds }
    }).populate('casting', 'castingDirector');

    // Check if all applications belong to this casting director
    const unauthorizedApps = applications.filter(
      app => app.casting.castingDirector.toString() !== req.user._id.toString()
    );

    if (unauthorizedApps.length > 0) {
      return res.status(403).json({ error: 'شما مجاز به تغییر وضعیت برخی از این درخواست‌ها نیستید' });
    }

    // Update applications
    const updates = { status };
    if (directorNotes) {
      updates.directorNotes = directorNotes;
    }

    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      updates
    );

    res.json({
      success: true,
      message: `وضعیت ${result.modifiedCount} درخواست با موفقیت تغییر کرد`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update application status error:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت درخواست‌ها' });
  }
});

module.exports = router;