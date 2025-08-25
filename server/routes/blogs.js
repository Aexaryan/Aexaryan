const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage (for Cloudinary)
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
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'casting-platform/blogs',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Helper function to populate author with profile pictures and consistent names
const populateAuthorWithProfile = async (blogs) => {
  for (let blog of blogs) {
    if (blog.author) {
      // Get display name and profile pictures based on user role
      if (blog.author.role === 'talent') {
        const talentProfile = await TalentProfile.findOne({ user: blog.author._id }).select('artisticName firstName lastName headshot');
        if (talentProfile) {
          // Use artistic name if available, otherwise use profile names
          blog.author.displayName = talentProfile.artisticName || `${talentProfile.firstName} ${talentProfile.lastName}`.trim();
          if (talentProfile.headshot?.url) {
            blog.author.profileImage = { url: talentProfile.headshot.url };
          }
        }
      } else if (blog.author.role === 'casting_director') {
        const directorProfile = await CastingDirectorProfile.findOne({ user: blog.author._id }).select('firstName lastName companyName profileImage');
        if (directorProfile) {
          // Use profile names for directors
          const profileName = `${directorProfile.firstName} ${directorProfile.lastName}`.trim();
          blog.author.displayName = profileName;
          if (directorProfile.profileImage?.url) {
            blog.author.profileImage = { url: directorProfile.profileImage.url };
          }
        }
      }
      
      // Fallback to user names if no profile found
      if (!blog.author.displayName) {
        blog.author.displayName = `${blog.author.firstName} ${blog.author.lastName}`.trim();
      }
    }
  }
  return blogs;
};

// GET /blogs - Get all published blogs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category = '', 
      search = '',
      sort = 'newest'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {
      status: 'published',
      publishedAt: { $lte: new Date() }
    };
    
    // Apply category filter
    if (category) {
      query.category = category;
    }
    
    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Apply sorting
    let sortOption = { publishedAt: -1 };
    if (sort === 'oldest') {
      sortOption = { publishedAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'most_liked') {
      sortOption = { 'likes.length': -1 };
    }
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'firstName lastName role')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);

    // Populate profile pictures
    await populateAuthorWithProfile(blogs);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      blogs,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات' });
  }
});

// GET /blogs/featured - Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
    .populate('author', 'firstName lastName role')
    .sort({ views: -1, publishedAt: -1 })
    .limit(6)
    .lean();

    // Populate profile pictures
    await populateAuthorWithProfile(blogs);
    
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات ویژه' });
  }
});

// GET /blogs/categories - Get blog categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'casting_tips', label: 'نکات کستینگ' },
      { value: 'industry_news', label: 'اخبار صنعت' },
      { value: 'success_stories', label: 'داستان‌های موفقیت' },
      { value: 'interviews', label: 'مصاحبه‌ها' },
      { value: 'tutorials', label: 'آموزش‌ها' },
      { value: 'career_advice', label: 'مشاوره شغلی' },
      { value: 'technology', label: 'فناوری' },
      { value: 'events', label: 'رویدادها' },
      { value: 'other', label: 'سایر' }
    ];
    
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'خطا در دریافت دسته‌بندی‌ها' });
  }
});

// GET /blogs/my-blogs - Get user's own blogs
router.get('/my-blogs', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate('author', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .lean();

    // Populate profile pictures
    await populateAuthorWithProfile(blogs);
    
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات' });
  }
});

// GET /blogs/stats - Get blog statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, published, pending, draft] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'pending' }),
      Blog.countDocuments({ status: 'draft' })
    ]);

    res.json({
      total,
      published,
      pending,
      draft
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار مقالات' });
  }
});

// GET /blogs/can-create - Check if user can create blogs
router.get('/can-create', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log('User checking blog creation permission:', {
      id: user._id,
      role: user.role,
      identificationStatus: user.identificationStatus,
      writerProfile: user.writerProfile
    });
    
    // Check if user can write content (admin, approved director, or approved journalist)
    const canWrite = (user.role === 'journalist' && user.writerProfile?.isApprovedWriter) ||
                     (user.role === 'casting_director' && user.identificationStatus === 'approved') ||
                     user.role === 'admin';
    
    console.log('Can write result:', canWrite);
    
    res.json({ 
      canCreate: canWrite,
      reason: canWrite ? null : 'شما مجوز نوشتن مقاله ندارید. برای کارگردانان، تایید هویت الزامی است.'
    });
  } catch (error) {
    console.error('Error checking blog creation permission:', error);
    res.status(500).json({ error: 'خطا در بررسی مجوز' });
  }
});

// GET /blogs/:id/edit - Get blog by ID for editing
router.get('/:id/edit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const blog = await Blog.findById(id)
      .populate('author', 'firstName lastName role');
    
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    // Check permissions
    if (blog.author._id.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز ویرایش این مقاله را ندارید' });
    }
    
    res.json({ 
      blog,
      currentUser: { id: user.id, role: user.role }
    });
  } catch (error) {
    console.error('Error fetching blog for edit:', error);
    res.status(500).json({ error: 'خطا در دریافت مقاله' });
  }
});

// GET /blogs/:slug - Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ 
      slug,
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
    .populate('author', 'firstName lastName role writerProfile')
    .populate('comments.user', 'firstName lastName role')
    .lean();
    
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    
    // Check if user liked the blog
    if (req.user) {
      blog.isLiked = blog.likes.some(like => like.user.toString() === req.user.id);
    }
    
    // Filter approved comments
    blog.comments = blog.comments.filter(comment => comment.status === 'approved');
    
    // Populate profile pictures and display names for author and comment authors
    if (blog.author) {
      if (blog.author.role === 'talent') {
        const talentProfile = await TalentProfile.findOne({ user: blog.author._id }).select('artisticName firstName lastName headshot');
        if (talentProfile) {
          // Use artistic name if available, otherwise use profile names
          blog.author.displayName = talentProfile.artisticName || `${talentProfile.firstName} ${talentProfile.lastName}`.trim();
          if (talentProfile.headshot?.url) {
            blog.author.profileImage = { url: talentProfile.headshot.url };
          }
        }
      } else if (blog.author.role === 'casting_director') {
        const directorProfile = await CastingDirectorProfile.findOne({ user: blog.author._id }).select('firstName lastName companyName profileImage');
        if (directorProfile) {
          // Use profile names for directors
          const profileName = `${directorProfile.firstName} ${directorProfile.lastName}`.trim();
          blog.author.displayName = profileName;
          if (directorProfile.profileImage?.url) {
            blog.author.profileImage = { url: directorProfile.profileImage.url };
          }
        }
      }
      
      // Fallback to user names if no profile found
      if (!blog.author.displayName) {
        blog.author.displayName = `${blog.author.firstName} ${blog.author.lastName}`.trim();
      }
    }
    
    // Populate profile pictures and display names for comment authors
    for (let comment of blog.comments) {
      if (comment.user) {
        if (comment.user.role === 'talent') {
          const talentProfile = await TalentProfile.findOne({ user: comment.user._id }).select('artisticName firstName lastName headshot');
          if (talentProfile) {
            // Use artistic name if available, otherwise use profile names
            comment.user.displayName = talentProfile.artisticName || `${talentProfile.firstName} ${talentProfile.lastName}`.trim();
            if (talentProfile.headshot?.url) {
              comment.user.profileImage = { url: talentProfile.headshot.url };
            }
          }
        } else if (comment.user.role === 'casting_director') {
          const directorProfile = await CastingDirectorProfile.findOne({ user: comment.user._id }).select('firstName lastName companyName profileImage');
          if (directorProfile) {
            // Use profile names for directors
            const profileName = `${directorProfile.firstName} ${directorProfile.lastName}`.trim();
            comment.user.displayName = profileName;
            if (directorProfile.profileImage?.url) {
              comment.user.profileImage = { url: directorProfile.profileImage.url };
            }
          }
        }
        
        // Fallback to user names if no profile found
        if (!comment.user.displayName) {
          comment.user.displayName = `${comment.user.firstName} ${comment.user.lastName}`.trim();
        }
      }
    }
    
    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'خطا در دریافت مقاله' });
  }
});

// POST /blogs - Create new blog (requires auth and writer permissions)
router.post('/', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const user = req.user;

    
    // Check if user can write content (admin, approved director, or approved journalist)
    const canWrite = (user.role === 'journalist' && user.writerProfile?.isApprovedWriter) ||
                     (user.role === 'casting_director' && user.identificationStatus === 'approved') ||
                     user.role === 'admin';
    

    
    if (!canWrite) {
      return res.status(403).json({ error: 'شما مجوز نوشتن مقاله ندارید. برای کارگردانان، تایید هویت الزامی است.' });
    }
    
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      seo
    } = req.body;
    
    // Handle featured image upload
    let featuredImage = {};
    if (req.file) {

      
      try {
        // Upload to Cloudinary

        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'casting-platform/blogs',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        

        
        featuredImage = {
          url: result.secure_url,
          alt: req.body.imageAlt || title
        };
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }
    

    
    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // If slug is empty after processing, use a fallback
    if (!slug || slug.length === 0) {
      slug = 'blog-' + Date.now();
    }
    

    
    // Determine initial status based on user's auto-approval status
    let initialStatus = 'pending';
    if (user.role === 'admin') {
      initialStatus = 'published';
    } else if (user.writerProfile?.autoApproval) {
      initialStatus = 'published';
    }

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || '',
      category,
      tags: tags ? JSON.parse(tags) : [],
      featuredImage,
      author: user.id,
      seo: seo ? JSON.parse(seo) : {},
      status: initialStatus
    });
    
    if (initialStatus === 'published') {
      blog.publishedAt = new Date();
      blog.approvedBy = user.id;
      blog.approvedAt = new Date();
    }
    
    await blog.save();
    
    res.status(201).json({ 
      blog,
      message: initialStatus === 'published' ? 'مقاله با موفقیت منتشر شد' : 'مقاله برای بررسی ارسال شد'
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    res.status(500).json({ error: 'خطا در ایجاد مقاله' });
  }
});

// PUT /blogs/:id - Update blog
router.put('/:id', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    // Check permissions
    if (blog.author.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز ویرایش این مقاله را ندارید' });
    }
    
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      seo
    } = req.body;
    
    // Handle featured image upload
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'casting-platform/blogs',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        
        blog.featuredImage = {
          url: result.secure_url,
          alt: req.body.imageAlt || title
        };
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }
    
    // Update fields
    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt;
    blog.category = category;
    blog.tags = tags ? JSON.parse(tags) : [];
    blog.seo = seo ? JSON.parse(seo) : {};
    
    // Reset approval if content changed
    if (blog.status === 'published' && user.role !== 'admin') {
      blog.status = 'pending';
      blog.publishedAt = null;
      blog.approvedBy = null;
      blog.approvedAt = null;
    }
    
    await blog.save();
    
    res.json({ 
      blog,
      message: 'مقاله با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی مقاله' });
  }
});

// PATCH /blogs/:id/status - Update blog status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Only admin can update status
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز تغییر وضعیت مقاله را ندارید' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    blog.status = status;
    
    if (status === 'published') {
      blog.publishedAt = new Date();
      blog.approvedBy = user.id;
      blog.approvedAt = new Date();
    } else if (status === 'rejected') {
      blog.publishedAt = null;
      blog.approvedBy = null;
      blog.approvedAt = null;
    }

    await blog.save();

    res.json({ 
      blog,
      message: 'وضعیت مقاله با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی وضعیت مقاله' });
  }
});

// DELETE /blogs/:id - Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    // Check permissions
    if (blog.author.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز حذف این مقاله را ندارید' });
    }
    
    await Blog.findByIdAndDelete(id);
    
    res.json({ message: 'مقاله با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'خطا در حذف مقاله' });
  }
});

// POST /blogs/:id/like - Toggle like on blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    await blog.toggleLike(user.id);
    
    res.json({ 
      message: 'عملیات با موفقیت انجام شد',
      likeCount: blog.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

// POST /blogs/:id/comments - Add comment to blog
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }
    
    const comment = {
      user: user.id,
      content,
      status: 'approved' // Auto-approve all authenticated user comments
    };
    
    comment.approvedAt = new Date();
    
    blog.comments.push(comment);
    await blog.save();
    
    res.status(201).json({ 
      message: 'نظر با موفقیت اضافه شد'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'خطا در افزودن نظر' });
  }
});

module.exports = router;
