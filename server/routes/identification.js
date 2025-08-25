const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
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
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// POST /api/identification/upload - Upload identification photo
router.post('/upload', auth, upload.single('identificationPhoto'), async (req, res) => {
  // Handle multer errors
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'لطفاً عکس شناسایی را انتخاب کنید' });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'فایل باید تصویر باشد' });
    }

    // Check file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      if (!req.file.buffer) {
        reject(new Error('فایل خالی است'));
        return;
      }
      
      cloudinary.uploader.upload_stream(
        {
          folder: 'identification_photos',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user identification status
    user.identificationStatus = 'pending';
    user.identificationPhoto = {
      url: result.secure_url,
      uploadedAt: new Date(),
      publicId: result.public_id
    };

    await user.save();

    res.json({
      message: 'عکس شناسایی با موفقیت آپلود شد و در انتظار بررسی است',
      identificationStatus: user.identificationStatus
    });

  } catch (error) {
    console.error('Error uploading identification photo:', error);
    
    // Provide more specific error messages
    if (error.message === 'فایل خالی است') {
      res.status(400).json({ error: 'فایل انتخاب شده خالی است' });
    } else if (error.http_code === 400) {
      res.status(400).json({ error: 'خطا در آپلود فایل به Cloudinary' });
    } else {
      res.status(500).json({ error: 'خطا در آپلود عکس شناسایی' });
    }
  }
});

// GET /api/identification/status - Get user's identification status
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('identificationStatus identificationPhoto');

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.json({
      identificationStatus: user.identificationStatus,
      hasPhoto: !!user.identificationPhoto?.url,
      uploadedAt: user.identificationPhoto?.uploadedAt,
      rejectionReason: user.identificationPhoto?.rejectionReason
    });

  } catch (error) {
    console.error('Error getting identification status:', error);
    res.status(500).json({ error: 'خطا در دریافت وضعیت شناسایی' });
  }
});

// GET /api/identification/pending - Get pending identification requests (Admin only)
router.get('/pending', auth, adminAuth, async (req, res) => {
  try {
    const pendingUsers = await User.find({
      identificationStatus: 'pending'
    }).select('firstName lastName email role identificationPhoto createdAt');

    res.json({
      pendingUsers: pendingUsers.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        photoUrl: user.identificationPhoto?.url,
        uploadedAt: user.identificationPhoto?.uploadedAt,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Error getting pending identifications:', error);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌های در انتظار' });
  }
});

// POST /api/identification/review - Review identification request (Admin only)
router.post('/review/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'عملیات نامعتبر' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    if (user.identificationStatus !== 'pending') {
      return res.status(400).json({ error: 'این درخواست قبلاً بررسی شده است' });
    }

    const adminUser = req.user;

    if (action === 'approve') {
      // Approve the user
      user.identificationStatus = 'approved';
      user.identificationApprovedAt = new Date();
      user.identificationApprovedBy = adminUser._id;

      // Delete the photo from Cloudinary
      if (user.identificationPhoto?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.identificationPhoto.publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting photo from Cloudinary:', cloudinaryError);
        }
      }

      // Clear photo data
      user.identificationPhoto = {
        reviewedAt: new Date(),
        reviewedBy: adminUser._id
      };

    } else if (action === 'reject') {
      // Reject the user
      user.identificationStatus = 'rejected';
      user.identificationPhoto = {
        ...user.identificationPhoto,
        reviewedAt: new Date(),
        reviewedBy: adminUser._id,
        rejectionReason: rejectionReason || 'عکس شناسایی نامعتبر است'
      };
    }

    await user.save();

    res.json({
      message: action === 'approve' ? 'کاربر با موفقیت تایید شد' : 'درخواست رد شد',
      identificationStatus: user.identificationStatus
    });

  } catch (error) {
    console.error('Error reviewing identification:', error);
    res.status(500).json({ error: 'خطا در بررسی درخواست شناسایی' });
  }
});

// DELETE /api/identification/photo - Delete identification photo (Admin only)
router.delete('/photo/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    // Delete from Cloudinary
    if (user.identificationPhoto?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.identificationPhoto.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting photo from Cloudinary:', cloudinaryError);
      }
    }

    // Clear photo data
    user.identificationPhoto = {};
    await user.save();

    res.json({ message: 'عکس شناسایی با موفقیت حذف شد' });

  } catch (error) {
    console.error('Error deleting identification photo:', error);
    res.status(500).json({ error: 'خطا در حذف عکس شناسایی' });
  }
});

// GET /api/identification/stats - Get identification statistics (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$identificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      pending: 0,
      approved: 0,
      rejected: 0,
      not_submitted: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    res.json(statsObject);

  } catch (error) {
    console.error('Error getting identification stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار شناسایی' });
  }
});

module.exports = router;
