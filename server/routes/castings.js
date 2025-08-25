const express = require('express');
const Casting = require('../models/Casting');
const Application = require('../models/Application');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth, optionalAuth, requireCastingDirector, requireTalent } = require('../middleware/auth');

const router = express.Router();

// Profile routes - must come before any dynamic routes
// Update casting director profile
router.put('/profile', auth, requireCastingDirector, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.user;
    delete updates.totalCastings;
    delete updates.activeCastings;
    delete updates.successfulCastings;
    delete updates.createdAt;
    delete updates.updatedAt;

    const profile = await CastingDirectorProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'پروفایل کارگردان یافت نشد' });
    }

    // Sync the updated names with the user model
    if (updates.firstName || updates.lastName) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(
        req.user._id,
        {
          firstName: profile.firstName,
          lastName: profile.lastName
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      profile
    });
  } catch (error) {
    console.error('Update casting director profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در به‌روزرسانی پروفایل' });
  }
});

// Get my casting director profile
router.get('/profile', auth, requireCastingDirector, async (req, res) => {
  try {
    const profile = await CastingDirectorProfile.findOne({ user: req.user._id })
      .populate('user', 'email createdAt lastLogin isVerified');

    if (!profile) {
      return res.status(404).json({ error: 'پروفایل کارگردان یافت نشد' });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get casting director profile error:', error);
    res.status(500).json({ error: 'خطا در دریافت پروفایل' });
  }
});

// Get casting director profile by ID (public)
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CastingDirectorProfile.findOne({ user: id })
      .populate('user', 'firstName lastName email role identificationStatus');

    if (!profile) {
      return res.status(404).json({ error: 'پروفایل کارگردان یافت نشد' });
    }

    // Only return public information
    const publicProfile = {
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName: profile.companyName,
      position: profile.position,
      phoneNumber: profile.phoneNumber,
      website: profile.website,
      city: profile.city,
      province: profile.province,
      biography: profile.biography,
      experience: profile.experience,
      specialties: profile.specialties,
      profileImage: profile.profileImage,
      identificationStatus: profile.user.identificationStatus
    };

    res.json({
      success: true,
      profile: publicProfile
    });
  } catch (error) {
    console.error('Get casting director profile by ID error:', error);
    res.status(500).json({ error: 'خطا در دریافت پروفایل کارگردان' });
  }
});

// Get all active castings (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      projectType,
      roleType,
      city,
      province,
      gender,
      ageMin,
      ageMax,
      isPremium,
      isUrgent,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { 
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    };

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Project type filter
    if (projectType) {
      filter.projectType = projectType;
    }

    // Role type filter
    if (roleType) {
      filter.roleType = roleType;
    }

    // Location filters
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    if (province) {
      filter['location.province'] = { $regex: province, $options: 'i' };
    }

    // Gender requirement
    if (gender && gender !== 'any') {
      filter['requirements.gender'] = { $in: [gender, 'any'] };
    }

    // Age range filter
    if (ageMin || ageMax) {
      if (ageMin) {
        filter.$or = [
          { 'requirements.ageRange.min': { $exists: false } },
          { 'requirements.ageRange.min': { $lte: parseInt(ageMax) || 100 } }
        ];
      }
      if (ageMax) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { 'requirements.ageRange.max': { $exists: false } },
            { 'requirements.ageRange.max': { $gte: parseInt(ageMin) || 0 } }
          ]
        });
      }
    }

    // Premium and urgent filters
    if (isPremium === 'true') {
      filter.isPremium = true;
    }
    if (isUrgent === 'true') {
      filter.isUrgent = true;
    }

    // Build sort object
    const sortObject = {};
    
    // Premium and urgent castings should appear first
    if (sortBy === 'createdAt') {
      sortObject.isPremium = -1;
      sortObject.isUrgent = -1;
    }
    
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const castings = await Casting.find(filter)
      .populate('castingDirector', 'email')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Casting.countDocuments(filter);

    // Increment view count for each casting
    const castingIds = castings.map(c => c._id);
    await Casting.updateMany(
      { _id: { $in: castingIds } },
      { $inc: { views: 1 } }
    );

    res.json({
      success: true,
      castings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get castings error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کستینگ‌ها' });
  }
});

// Get casting by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const casting = await Casting.findById(req.params.id)
      .populate('castingDirector', 'email');

    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Increment view count
    casting.views += 1;
    await casting.save();

    // Check if current user has applied (if authenticated)
    let hasApplied = false;
    if (req.user && req.user.role === 'talent') {
      const application = await Application.findOne({
        casting: casting._id,
        talent: req.user._id
      });
      hasApplied = !!application;
    }

    res.json({
      success: true,
      casting,
      hasApplied
    });
  } catch (error) {
    console.error('Get casting error:', error);
    res.status(500).json({ error: 'خطا در دریافت کستینگ' });
  }
});

// Create new casting (casting directors only)
router.post('/', auth, requireCastingDirector, async (req, res) => {
  try {
    // Check if director is approved
    if (req.user.identificationStatus !== 'approved') {
      return res.status(403).json({ 
        error: 'برای ایجاد کستینگ، ابتدا باید حساب کاربری شما تایید شود. لطفاً عکس شناسایی خود را آپلود کنید.' 
      });
    }

    const castingData = {
      ...req.body,
      castingDirector: req.user._id
    };

    const casting = new Casting(castingData);
    await casting.save();

    // Populate casting director info
    await casting.populate('castingDirector', 'email');

    res.status(201).json({
      success: true,
      message: 'کستینگ با موفقیت ایجاد شد',
      casting
    });
  } catch (error) {
    console.error('Create casting error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در ایجاد کستینگ' });
  }
});

// Update casting (only by creator)
router.put('/:id', auth, requireCastingDirector, async (req, res) => {
  try {
    const casting = await Casting.findById(req.params.id);
    
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Check if user is the creator
    if (casting.castingDirector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به ویرایش این کستینگ نیستید' });
    }

    // Don't allow updates to certain fields
    const updates = { ...req.body };
    delete updates.castingDirector;
    delete updates.views;
    delete updates.totalApplications;
    delete updates.createdAt;

    const updatedCasting = await Casting.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('castingDirector', 'email');

    res.json({
      success: true,
      message: 'کستینگ با موفقیت به‌روزرسانی شد',
      casting: updatedCasting
    });
  } catch (error) {
    console.error('Update casting error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در به‌روزرسانی کستینگ' });
  }
});

// Delete casting (only by creator)
router.delete('/:id', auth, requireCastingDirector, async (req, res) => {
  try {
    const casting = await Casting.findById(req.params.id);
    
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Check if user is the creator
    if (casting.castingDirector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به حذف این کستینگ نیستید' });
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ casting: casting._id });
    if (applicationCount > 0) {
      return res.status(400).json({ 
        error: 'نمی‌توان کستینگ با درخواست موجود را حذف کرد. ابتدا وضعیت را به بسته تغییر دهید.' 
      });
    }

    await Casting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'کستینگ با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete casting error:', error);
    res.status(500).json({ error: 'خطا در حذف کستینگ' });
  }
});

// Get my castings (casting directors only)
router.get('/me/castings', auth, requireCastingDirector, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { castingDirector: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const castings = await Casting.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get application counts for each casting
    for (let casting of castings) {
      const applicationStats = await Application.aggregate([
        { $match: { casting: casting._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      casting.applicationStats = {
        total: applicationStats.reduce((sum, stat) => sum + stat.count, 0),
        pending: applicationStats.find(s => s._id === 'pending')?.count || 0,
        reviewed: applicationStats.find(s => s._id === 'reviewed')?.count || 0,
        shortlisted: applicationStats.find(s => s._id === 'shortlisted')?.count || 0,
        accepted: applicationStats.find(s => s._id === 'accepted')?.count || 0,
        rejected: applicationStats.find(s => s._id === 'rejected')?.count || 0
      };
    }

    const totalCount = await Casting.countDocuments(filter);

    res.json({
      success: true,
      castings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get my castings error:', error);
    res.status(500).json({ error: 'خطا در دریافت کستینگ‌های شما' });
  }
});

// Get casting applications (casting directors only)
router.get('/:id/applications', auth, requireCastingDirector, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const casting = await Casting.findById(req.params.id);
    
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Check if user is the creator
    if (casting.castingDirector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به مشاهده درخواست‌های این کستینگ نیستید' });
    }

    const filter = { casting: req.params.id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate('talent', 'email')
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
    console.error('Get casting applications error:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌های کستینگ' });
  }
});

// Update casting status
router.patch('/:id/status', auth, requireCastingDirector, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['draft', 'active', 'paused', 'closed', 'filled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر' });
    }

    const casting = await Casting.findById(req.params.id);
    
    if (!casting) {
      return res.status(404).json({ error: 'کستینگ یافت نشد' });
    }

    // Check if user is the creator
    if (casting.castingDirector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'شما مجاز به تغییر وضعیت این کستینگ نیستید' });
    }

    casting.status = status;
    await casting.save();

    res.json({
      success: true,
      message: 'وضعیت کستینگ با موفقیت تغییر کرد',
      casting: {
        id: casting._id,
        status: casting.status,
        updatedAt: casting.updatedAt
      }
    });
  } catch (error) {
    console.error('Update casting status error:', error);
    res.status(500).json({ error: 'خطا در تغییر وضعیت کستینگ' });
  }
});

module.exports = router;