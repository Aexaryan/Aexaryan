const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth, requireTalent, requireCastingDirector } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'casting-platform',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// Upload headshot for talent
router.post('/headshot', auth, requireTalent, upload.single('headshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل تصویری انتخاب نشده است' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Delete old headshot from Cloudinary if exists
    if (talent.headshot?.publicId) {
      try {
        await cloudinary.uploader.destroy(talent.headshot.publicId);
      } catch (error) {
        console.error('Error deleting old headshot:', error);
      }
    }

    // Upload new headshot
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'casting-platform/headshots',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update talent profile
    talent.headshot = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await talent.save();

    res.json({
      success: true,
      message: 'عکس پرتره با موفقیت آپلود شد',
      headshot: talent.headshot
    });
  } catch (error) {
    console.error('Upload headshot error:', error);
    
    if (error.message.includes('فقط فایل‌های تصویری')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'خطا در آپلود عکس پرتره' });
  }
});

// Upload portfolio images for talent
router.post('/portfolio', auth, requireTalent, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'هیچ فایل تصویری انتخاب نشده است' });
    }

    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    // Check portfolio limit
    const currentCount = talent.portfolio.length;
    const newCount = req.files.length;
    const maxImages = parseInt(process.env.MAX_IMAGES_PER_PROFILE) || 10;

    if (currentCount + newCount > maxImages) {
      return res.status(400).json({ 
        error: `حداکثر ${maxImages} عکس در گالری مجاز است. شما در حال حاضر ${currentCount} عکس دارید.` 
      });
    }

    const uploadPromises = req.files.map((file, index) => 
      uploadToCloudinary(file.buffer, {
        folder: 'casting-platform/portfolio',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);

    // Add new images to portfolio
    const newImages = results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      caption: req.body.captions ? req.body.captions[index] : ''
    }));

    talent.portfolio.push(...newImages);
    await talent.save();

    res.json({
      success: true,
      message: `${results.length} عکس با موفقیت به گالری اضافه شد`,
      newImages,
      totalImages: talent.portfolio.length
    });
  } catch (error) {
    console.error('Upload portfolio error:', error);
    res.status(500).json({ error: 'خطا در آپلود عکس‌های گالری' });
  }
});

// Delete portfolio image
router.delete('/portfolio/:imageId', auth, requireTalent, async (req, res) => {
  try {
    const talent = await TalentProfile.findOne({ user: req.user._id });
    if (!talent) {
      return res.status(404).json({ error: 'پروفایل استعداد یافت نشد' });
    }

    const imageIndex = talent.portfolio.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ error: 'عکس مورد نظر یافت نشد' });
    }

    const image = talent.portfolio[imageIndex];

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }

    // Remove from portfolio
    talent.portfolio.splice(imageIndex, 1);
    await talent.save();

    res.json({
      success: true,
      message: 'عکس با موفقیت حذف شد',
      remainingImages: talent.portfolio.length
    });
  } catch (error) {
    console.error('Delete portfolio image error:', error);
    res.status(500).json({ error: 'خطا در حذف عکس' });
  }
});

// Upload profile image for casting director
router.post('/profile-image', auth, requireCastingDirector, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل تصویری انتخاب نشده است' });
    }

    const director = await CastingDirectorProfile.findOne({ user: req.user._id });
    if (!director) {
      return res.status(404).json({ error: 'پروفایل کارگردان یافت نشد' });
    }

    // Delete old profile image if exists
    if (director.profileImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(director.profileImage.publicId);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
      }
    }

    // Upload new profile image
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'casting-platform/directors',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update director profile
    director.profileImage = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await director.save();

    res.json({
      success: true,
      message: 'تصویر پروفایل با موفقیت آپلود شد',
      profileImage: director.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'خطا در آپلود تصویر پروفایل' });
  }
});

// Upload video audition
router.post('/video-audition', auth, requireTalent, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل ویدیویی انتخاب نشده است' });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'فقط فایل‌های ویدیویی مجاز هستند' });
    }

    // Upload video to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'casting-platform/auditions',
          transformation: [
            { width: 720, height: 720, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      message: 'ویدیو تست بازیگری با موفقیت آپلود شد',
      video: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration
      }
    });
  } catch (error) {
    console.error('Upload video audition error:', error);
    res.status(500).json({ error: 'خطا در آپلود ویدیو تست بازیگری' });
  }
});

// Get upload statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'talent') {
      const talent = await TalentProfile.findOne({ user: req.user._id });
      if (talent) {
        stats = {
          hasHeadshot: !!talent.headshot?.url,
          portfolioCount: talent.portfolio.length,
          maxPortfolioImages: parseInt(process.env.MAX_IMAGES_PER_PROFILE) || 10,
          remainingSlots: (parseInt(process.env.MAX_IMAGES_PER_PROFILE) || 10) - talent.portfolio.length
        };
      }
    } else if (req.user.role === 'casting_director') {
      const director = await CastingDirectorProfile.findOne({ user: req.user._id });
      if (director) {
        stats = {
          hasProfileImage: !!director.profileImage?.url
        };
      }
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار آپلود' });
  }
});

module.exports = router;