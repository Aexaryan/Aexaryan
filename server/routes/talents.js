const express = require('express');
const TalentProfile = require('../models/TalentProfile');
const User = require('../models/User');
const { auth, requireTalent, requireCastingDirector } = require('../middleware/auth');

const router = express.Router();



// Get featured talents (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    // Use aggregation to properly include user data
    const pipeline = [
      {
        $match: {
          isActive: true,
          isFeatured: true
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] }
              }
            }
          ],
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $addFields: {
          identificationStatus: { $ifNull: ['$user.identificationStatus', 'not_submitted'] }
        }
      },
      {
        $sort: { featuredAt: -1, createdAt: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ];

    let featuredTalents = await TalentProfile.aggregate(pipeline);

    // If no featured talents, get some active talents
    if (featuredTalents.length === 0) {
      const fallbackPipeline = [
        {
          $match: {
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] }
                }
              }
            ],
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $addFields: {
            identificationStatus: { $ifNull: ['$user.identificationStatus', 'not_submitted'] }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: parseInt(limit)
        }
      ];

      featuredTalents = await TalentProfile.aggregate(fallbackPipeline);
    }

    res.json({
      success: true,
      talents: featuredTalents
    });
  } catch (error) {
    console.error('Get featured talents error:', error);
    res.status(500).json({ error: 'خطا در دریافت استعدادهای ویژه' });
  }
});

// Get all talents (for casting directors)
router.get('/', auth, requireCastingDirector, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      gender,
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      city,
      province,
      skills,
      languages,
      availabilityStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Search in name and biography
    if (search) {
      filter.$or = [
        { artisticName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { biography: { $regex: search, $options: 'i' } }
      ];
    }

    // Gender filter
    if (gender && gender !== 'any') {
      filter.gender = gender;
    }

    // Location filters
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (province) {
      filter.province = { $regex: province, $options: 'i' };
    }

    // Physical characteristics
    if (heightMin || heightMax) {
      filter.height = {};
      if (heightMin) filter.height.$gte = parseInt(heightMin);
      if (heightMax) filter.height.$lte = parseInt(heightMax);
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArray };
    }

    // Languages filter
    if (languages) {
      const languagesArray = languages.split(',').map(l => l.trim());
      filter['languages.language'] = { $in: languagesArray };
    }

    // Availability status
    if (availabilityStatus) {
      filter.availabilityStatus = availabilityStatus;
    }

    // Age filter (requires aggregation)
    const pipeline = [
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      { $match: filter }
    ];

    // Add age range filter if specified
    if (ageMin || ageMax) {
      const ageFilter = {};
      if (ageMin) ageFilter.$gte = parseInt(ageMin);
      if (ageMax) ageFilter.$lte = parseInt(ageMax);
      pipeline.push({ $match: { age: ageFilter } });
    }

    // Add sorting
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortObject });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Populate user data
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    });
    pipeline.push({ $unwind: '$user' });
    pipeline.push({
      $addFields: {
        identificationStatus: { $ifNull: ['$user.identificationStatus', 'not_submitted'] }
      }
    });

    // Execute aggregation
    const talents = await TalentProfile.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, and lookup
    const totalCountResult = await TalentProfile.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);
    const totalCount = totalCountResult[0]?.total || 0;

    res.json({
      success: true,
      talents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get talents error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست استعدادها' });
  }
});

// Get talent profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const talent = await TalentProfile.findById(req.params.id)
      .populate('user', 'email createdAt lastLogin identificationStatus firstName lastName');

    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Increment profile views (only for casting directors)
    if (req.user.role === 'casting_director') {
      talent.profileViews += 1;
      await talent.save();
    }

    res.json({
      success: true,
      talent
    });
  } catch (error) {
    console.error('Get talent error:', error);
    res.status(500).json({ error: 'خطا در دریافت پروفایل استعداد' });
  }
});

// Update talent profile (only for talent themselves)
router.put('/profile', auth, requireTalent, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.user;
    delete updates.profileViews;
    delete updates.totalApplications;
    delete updates.successfulCastings;
    delete updates.createdAt;

    const talent = await TalentProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Sync the updated names with the user model
    if (updates.firstName || updates.lastName) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(
        req.user._id,
        {
          firstName: talent.firstName,
          lastName: talent.lastName
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      talent
    });
  } catch (error) {
    console.error('Update talent error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'خطا در اعتبارسنجی: ' + errors.join(', ') });
    }
    
    res.status(500).json({ error: 'خطا در به‌روزرسانی پروفایل' });
  }
});

// Get my talent profile
router.get('/me/profile', auth, requireTalent, async (req, res) => {
  try {
    const talent = await TalentProfile.findOne({ user: req.user._id })
      .populate('user', 'email createdAt lastLogin isVerified');

    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    res.json({
      success: true,
      talent
    });
  } catch (error) {
    console.error('Get my talent profile error:', error);
    res.status(500).json({ error: 'خطا در دریافت پروفایل' });
  }
});

// Add skill to talent profile
router.post('/profile/skills', auth, requireTalent, async (req, res) => {
  try {
    const { skill } = req.body;
    
    if (!skill || skill.trim().length === 0) {
      return res.status(400).json({ error: 'مهارت نمی‌تواند خالی باشد' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Check if skill already exists
    if (talent.skills.includes(skill.trim())) {
      return res.status(400).json({ error: 'این مهارت قبلاً اضافه شده است' });
    }

    talent.skills.push(skill.trim());
    await talent.save();

    res.json({
      success: true,
      message: 'مهارت با موفقیت اضافه شد',
      skills: talent.skills
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن مهارت' });
  }
});

// Remove skill from talent profile
router.delete('/profile/skills/:skill', auth, requireTalent, async (req, res) => {
  try {
    const skillToRemove = decodeURIComponent(req.params.skill);

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    talent.skills = talent.skills.filter(skill => skill !== skillToRemove);
    await talent.save();

    res.json({
      success: true,
      message: 'مهارت با موفقیت حذف شد',
      skills: talent.skills
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'خطا در حذف مهارت' });
  }
});

// Add showreel video to talent profile
router.post('/profile/showreel', auth, requireTalent, async (req, res) => {
  try {
    const { title, url, platform, description, duration } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: 'عنوان و لینک ویدیو ضروری است' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    talent.showreel.push({
      title: title.trim(),
      url: url.trim(),
      platform: platform || 'youtube',
      description: description?.trim(),
      duration: duration
    });
    await talent.save();

    res.json({
      success: true,
      message: 'ویدیو شوریل با موفقیت اضافه شد',
      showreel: talent.showreel
    });
  } catch (error) {
    console.error('Add showreel error:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن ویدیو شوریل' });
  }
});

// Remove showreel video from talent profile
router.delete('/profile/showreel/:index', auth, requireTalent, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    if (index < 0 || index >= talent.showreel.length) {
      return res.status(400).json({ error: 'شاخص ویدیو نامعتبر است' });
    }

    talent.showreel.splice(index, 1);
    await talent.save();

    res.json({
      success: true,
      message: 'ویدیو شوریل با موفقیت حذف شد',
      showreel: talent.showreel
    });
  } catch (error) {
    console.error('Remove showreel error:', error);
    res.status(500).json({ error: 'خطا در حذف ویدیو شوریل' });
  }
});

// Add experience to talent profile
router.post('/profile/experience', auth, requireTalent, async (req, res) => {
  try {
    const { title, company, projectType, role, startDate, endDate, description, director, productionCompany, isCurrent } = req.body;
    
    if (!title || !company || !projectType || !role || !startDate) {
      return res.status(400).json({ error: 'تمام فیلدهای ضروری را پر کنید' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    talent.experience.push({
      title: title.trim(),
      company: company.trim(),
      projectType,
      role: role.trim(),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description: description?.trim(),
      director: director?.trim(),
      productionCompany: productionCompany?.trim(),
      isCurrent: isCurrent || false
    });
    await talent.save();

    res.json({
      success: true,
      message: 'تجربه با موفقیت اضافه شد',
      experience: talent.experience
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن تجربه' });
  }
});

// Remove experience from talent profile
router.delete('/profile/experience/:index', auth, requireTalent, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    if (index < 0 || index >= talent.experience.length) {
      return res.status(400).json({ error: 'شاخص تجربه نامعتبر است' });
    }

    talent.experience.splice(index, 1);
    await talent.save();

    res.json({
      success: true,
      message: 'تجربه با موفقیت حذف شد',
      experience: talent.experience
    });
  } catch (error) {
    console.error('Remove experience error:', error);
    res.status(500).json({ error: 'خطا در حذف تجربه' });
  }
});

// Add education to talent profile
router.post('/profile/education', auth, requireTalent, async (req, res) => {
  try {
    const { degree, institution, field, startDate, endDate, grade, description, isCurrent } = req.body;
    
    if (!degree || !institution || !field || !startDate) {
      return res.status(400).json({ error: 'تمام فیلدهای ضروری را پر کنید' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    talent.education.push({
      degree: degree.trim(),
      institution: institution.trim(),
      field: field.trim(),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      grade: grade?.trim(),
      description: description?.trim(),
      isCurrent: isCurrent || false
    });
    await talent.save();

    res.json({
      success: true,
      message: 'تحصیلات با موفقیت اضافه شد',
      education: talent.education
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن تحصیلات' });
  }
});

// Remove education from talent profile
router.delete('/profile/education/:index', auth, requireTalent, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    if (index < 0 || index >= talent.education.length) {
      return res.status(400).json({ error: 'شاخص تحصیلات نامعتبر است' });
    }

    talent.education.splice(index, 1);
    await talent.save();

    res.json({
      success: true,
      message: 'تحصیلات با موفقیت حذف شد',
      education: talent.education
    });
  } catch (error) {
    console.error('Remove education error:', error);
    res.status(500).json({ error: 'خطا در حذف تحصیلات' });
  }
});

// Add language to talent profile
router.post('/profile/languages', auth, requireTalent, async (req, res) => {
  try {
    const { language, proficiency } = req.body;
    
    if (!language || !proficiency) {
      return res.status(400).json({ error: 'زبان و سطح مهارت را وارد کنید' });
    }

    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'native'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({ error: 'سطح مهارت نامعتبر' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Check if language already exists
    const existingLanguage = talent.languages.find(lang => lang.language === language);
    if (existingLanguage) {
      return res.status(400).json({ error: 'این زبان قبلاً اضافه شده است' });
    }

    talent.languages.push({ language, proficiency });
    await talent.save();

    res.json({
      success: true,
      message: 'زبان با موفقیت اضافه شد',
      languages: talent.languages
    });
  } catch (error) {
    console.error('Add language error:', error);
    res.status(500).json({ error: 'خطا در اضافه کردن زبان' });
  }
});

// Get talent statistics
router.get('/me/stats', auth, requireTalent, async (req, res) => {
  try {
    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Get application statistics
    const Application = require('../models/Application');
    const applications = await Application.find({ talent: req.user._id });
    
    const stats = {
      profileViews: talent.profileViews,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      reviewedApplications: applications.filter(app => app.status === 'reviewed').length,
      shortlistedApplications: applications.filter(app => app.status === 'shortlisted').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      successRate: applications.length > 0 ? 
        Math.round((applications.filter(app => app.status === 'accepted').length / applications.length) * 100) : 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get talent stats error:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

module.exports = router;