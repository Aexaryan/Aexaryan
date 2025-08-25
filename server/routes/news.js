const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// Helper function to populate author with profile pictures and consistent names
const populateAuthorWithProfile = async (newsItems) => {
  for (let news of newsItems) {
    if (news.author) {
      // Get display name and profile pictures based on user role
      if (news.author.role === 'talent') {
        const talentProfile = await TalentProfile.findOne({ user: news.author._id }).select('artisticName firstName lastName headshot');
        if (talentProfile) {
          // Use artistic name if available, otherwise use profile names
          news.author.displayName = talentProfile.artisticName || `${talentProfile.firstName} ${talentProfile.lastName}`.trim();
          if (talentProfile.headshot?.url) {
            news.author.profileImage = { url: talentProfile.headshot.url };
          }
        }
      } else if (news.author.role === 'casting_director') {
        const directorProfile = await CastingDirectorProfile.findOne({ user: news.author._id }).select('firstName lastName companyName profileImage');
        if (directorProfile) {
          // Use profile names for directors
          const profileName = `${directorProfile.firstName} ${directorProfile.lastName}`.trim();
          news.author.displayName = profileName;
          if (directorProfile.profileImage?.url) {
            news.author.profileImage = { url: directorProfile.profileImage.url };
          }
        }
      }
      
      // Fallback to user names if no profile found
      if (!news.author.displayName) {
        news.author.displayName = `${news.author.firstName} ${news.author.lastName}`.trim();
      }
    }
  }
  return newsItems;
};

// GET /news - Get all published news with pagination and filters
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
        { summary: { $regex: search, $options: 'i' } },
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
    } else if (sort === 'priority') {
      sortOption = { priority: -1, publishedAt: -1 };
    }
    
    const [news, total] = await Promise.all([
      News.find(query)
        .populate('author', 'firstName lastName role')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      News.countDocuments(query)
    ]);

    // Populate profile pictures
    await populateAuthorWithProfile(news);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      news,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'خطا در دریافت اخبار' });
  }
});

// GET /news/breaking - Get breaking news
router.get('/breaking', async (req, res) => {
  try {
    const news = await News.getBreakingNews();
    res.json({ news });
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({ error: 'خطا در دریافت اخبار فوری' });
  }
});

// GET /news/featured - Get featured news
router.get('/featured', async (req, res) => {
  try {
    const news = await News.getFeaturedNews();
    res.json({ news });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({ error: 'خطا در دریافت اخبار ویژه' });
  }
});

// GET /news/stats - Get news statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, published, pending, draft] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ status: 'pending' }),
      News.countDocuments({ status: 'draft' })
    ]);

    res.json({
      total,
      published,
      pending,
      draft
    });
  } catch (error) {
    console.error('Error fetching news stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار اخبار' });
  }
});

// GET /news/categories - Get news categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'industry_news', label: 'اخبار صنعت' },
      { value: 'casting_announcements', label: 'اعلانات کستینگ' },
      { value: 'platform_updates', label: 'به‌روزرسانی‌های پلتفرم' },
      { value: 'success_stories', label: 'داستان‌های موفقیت' },
      { value: 'events', label: 'رویدادها' },
      { value: 'awards', label: 'جوایز' },
      { value: 'partnerships', label: 'مشارکت‌ها' },
      { value: 'technology', label: 'فناوری' },
      { value: 'breaking_news', label: 'اخبار فوری' },
      { value: 'other', label: 'سایر' }
    ];
    
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'خطا در دریافت دسته‌بندی‌ها' });
  }
});

// GET /news/:slug - Get single news by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const news = await News.findOne({ 
      slug,
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
    .populate('author', 'firstName lastName avatar writerProfile')
    .populate('comments.user', 'firstName lastName avatar')
    .lean();
    
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }
    
    // Increment views
    await News.findByIdAndUpdate(news._id, { $inc: { views: 1 } });
    
    // Check if user liked the news
    if (req.user) {
      news.isLiked = news.likes.some(like => like.user.toString() === req.user.id);
    }
    
    // Filter approved comments
    news.comments = news.comments.filter(comment => comment.status === 'approved');
    
    res.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'خطا در دریافت خبر' });
  }
});

// POST /news - Create new news (requires auth and writer permissions)
router.post('/', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user can write content (admin, approved director, or approved journalist)
    const canWrite = (user.role === 'journalist' && user.writerProfile?.isApprovedWriter) ||
                     (user.role === 'casting_director' && user.identificationStatus === 'approved') ||
                     user.role === 'admin';
    
    if (!canWrite) {
      return res.status(403).json({ error: 'شما مجوز نوشتن خبر ندارید' });
    }
    
    const {
      title,
      content,
      summary,
      category,
      priority,
      tags,
      isBreaking,
      isFeatured,
      seo
    } = req.body;
    
    // Handle featured image upload
    let featuredImage = {};
    if (req.file) {
      featuredImage = {
        url: req.file.path,
        alt: req.body.imageAlt || title
      };
    }
    
    // Determine initial status based on user's auto-approval status
    let initialStatus = 'pending';
    if (user.role === 'admin') {
      initialStatus = 'published';
    } else if (user.writerProfile?.autoApproval) {
      initialStatus = 'published';
    }

    const news = new News({
      title,
      content,
      summary,
      category,
      priority: priority || 'normal',
      tags: tags ? JSON.parse(tags) : [],
      featuredImage,
      author: user.id,
      isBreaking: isBreaking === 'true',
      isFeatured: isFeatured === 'true',
      seo: seo ? JSON.parse(seo) : {},
      status: initialStatus
    });
    
    if (initialStatus === 'published') {
      news.publishedAt = new Date();
      news.approvedBy = user.id;
      news.approvedAt = new Date();
    }
    
    await news.save();
    
    res.status(201).json({ 
      news,
      message: initialStatus === 'published' ? 'خبر با موفقیت منتشر شد' : 'خبر برای بررسی ارسال شد'
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'خطا در ایجاد خبر' });
  }
});

// PUT /news/:id - Update news
router.put('/:id', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }
    
    // Check permissions
    if (news.author.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز ویرایش این خبر را ندارید' });
    }
    
    const {
      title,
      content,
      summary,
      category,
      priority,
      tags,
      isBreaking,
      isFeatured,
      seo
    } = req.body;
    
    // Handle featured image upload
    if (req.file) {
      news.featuredImage = {
        url: req.file.path,
        alt: req.body.imageAlt || title
      };
    }
    
    // Update fields
    news.title = title;
    news.content = content;
    news.summary = summary;
    news.category = category;
    news.priority = priority || 'normal';
    news.tags = tags ? JSON.parse(tags) : [];
    news.isBreaking = isBreaking === 'true';
    news.isFeatured = isFeatured === 'true';
    news.seo = seo ? JSON.parse(seo) : {};
    
    // Reset approval if content changed
    if (news.status === 'published' && user.role !== 'admin') {
      news.status = 'pending';
      news.publishedAt = null;
      news.approvedBy = null;
      news.approvedAt = null;
    }
    
    await news.save();
    
    res.json({ 
      news,
      message: 'خبر با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی خبر' });
  }
});

// PATCH /news/:id/status - Update news status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Only admin can update status
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز تغییر وضعیت خبر را ندارید' });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }

    news.status = status;
    
    if (status === 'published') {
      news.publishedAt = new Date();
      news.approvedBy = user.id;
      news.approvedAt = new Date();
    } else if (status === 'rejected') {
      news.publishedAt = null;
      news.approvedBy = null;
      news.approvedAt = null;
    }

    await news.save();

    res.json({ 
      news,
      message: 'وضعیت خبر با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating news status:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی وضعیت خبر' });
  }
});

// DELETE /news/:id - Delete news
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }
    
    // Check permissions
    if (news.author.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'شما مجوز حذف این خبر را ندارید' });
    }
    
    await News.findByIdAndDelete(id);
    
    res.json({ message: 'خبر با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'خطا در حذف خبر' });
  }
});

// POST /news/:id/like - Toggle like on news
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }
    
    await news.toggleLike(user.id);
    
    res.json({ 
      message: 'عملیات با موفقیت انجام شد',
      likeCount: news.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'خطا در انجام عملیات' });
  }
});

// POST /news/:id/comments - Add comment to news
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }
    
    const comment = {
      user: user.id,
      content,
      status: 'approved' // Auto-approve all authenticated user comments
    };
    
    comment.approvedAt = new Date();
    
    news.comments.push(comment);
    await news.save();
    
    res.status(201).json({ 
      message: 'نظر با موفقیت اضافه شد'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'خطا در افزودن نظر' });
  }
});

module.exports = router;
