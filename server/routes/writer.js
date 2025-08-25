const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Blog = require('../models/Blog');
const News = require('../models/News');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { auth, requireJournalist } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Get writer stats
router.get('/stats', auth, requireJournalist, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('writerProfile');
    
    // Get articles count
    const articlesCount = await Blog.countDocuments({ author: req.user._id });
    
    // Get news count
    const newsCount = await News.countDocuments({ author: req.user._id });
    
    // Get total views, likes, comments from articles and news
    const articles = await Blog.find({ author: req.user._id });
    const news = await News.find({ author: req.user._id });
    
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.views || 0), 0);
    
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.likes || 0), 0);
    
    const totalComments = articles.reduce((sum, article) => sum + (article.comments || 0), 0) +
                         news.reduce((sum, newsItem) => sum + (newsItem.comments || 0), 0);
    
    // Get status counts
    const pendingArticles = await Blog.countDocuments({ 
      author: req.user._id, 
      status: 'pending' 
    });
    
    const approvedArticles = await Blog.countDocuments({ 
      author: req.user._id, 
      status: 'published' 
    });
    
    const rejectedArticles = await Blog.countDocuments({ 
      author: req.user._id, 
      status: 'rejected' 
    });

    res.json({
      totalArticles: articlesCount,
      totalViews,
      totalLikes,
      totalComments,
      pendingArticles,
      approvedArticles,
      rejectedArticles
    });
  } catch (error) {
    console.error('Error fetching writer stats:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// Get all articles for writer
router.get('/articles', auth, requireJournalist, async (req, res) => {
  try {
    const articles = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .select('title status views likes comments createdAt excerpt category slug publishedAt');

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات' });
  }
});

// Get single article for editing
router.get('/articles/:id', auth, requireJournalist, async (req, res) => {
  try {
    const article = await Blog.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!article) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    res.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'خطا در دریافت مقاله' });
  }
});

// Get recent articles
router.get('/recent-articles', auth, requireJournalist, async (req, res) => {
  try {
    const articles = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status views likes comments createdAt');

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات اخیر' });
  }
});

// Get all news for writer
router.get('/news', auth, requireJournalist, async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .select('title status views likes comments createdAt excerpt category slug priority isBreaking publishedAt');

    res.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'خطا در دریافت اخبار' });
  }
});

// GET /writer/users/explore - Explore users (talents and directors)
router.get('/users/explore', auth, requireJournalist, async (req, res) => {
  try {
    const { page = 1, limit = 12, role = '', status = '', location = '', experience = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    } else {
      // Only show talents and casting directors
      query.role = { $in: ['talent', 'casting_director'] };
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Location filter (for talents)
    if (location) {
      query['talentProfile.location'] = { $regex: location, $options: 'i' };
    }
    
    // Experience filter (for talents)
    if (experience && experience !== 'all') {
      query['talentProfile.experience'] = experience;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName email role status createdAt')
        .populate({
          path: 'talentProfile',
          select: 'artisticName biography city province headshot skills experience'
        })
        .populate({
          path: 'castingDirectorProfile', 
          select: 'companyName biography city province profileImage experience specialties website phoneNumber'
        })
        .populate({
          path: 'writerProfile',
          select: 'bio specialization location profileImage experience education website phone'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users for exploration:', error);
    res.status(500).json({ error: 'خطا در دریافت کاربران' });
  }
});

// Get recent news
router.get('/recent-news', auth, requireJournalist, async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status views likes comments createdAt publishedAt');

    res.json({ news });
  } catch (error) {
    console.error('Error fetching recent news:', error);
    res.status(500).json({ error: 'خطا در دریافت اخبار اخیر' });
  }
});

// Get single news for editing
router.get('/news/:id', auth, requireJournalist, async (req, res) => {
  try {
    const news = await News.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }

    res.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'خطا در دریافت خبر' });
  }
});

// Get writer profile
router.get('/profile', auth, requireJournalist, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('writerProfile');
    
    // Get stats
    const articles = await Blog.find({ author: req.user._id });
    const news = await News.find({ author: req.user._id });
    
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.views || 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.likes || 0), 0);
    
    res.json({
      bio: user.writerProfile?.bio || '',
      specialization: user.writerProfile?.specialization || '',
      experience: user.writerProfile?.experience || '',
      skills: user.writerProfile?.skills || [],
      phone: user.writerProfile?.phone || '',
      website: user.writerProfile?.website || '',
      location: user.writerProfile?.location || '',
      education: user.writerProfile?.education || '',
      awards: user.writerProfile?.awards || '',
      profileImage: user.writerProfile?.profileImage || '',
      isApprovedWriter: user.writerProfile?.isApprovedWriter || false,
      totalArticles,
      totalViews,
      totalLikes,
      joinDate: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching writer profile:', error);
    res.status(500).json({ error: 'خطا در دریافت پروفایل' });
  }
});

// Update writer profile
router.put('/profile', auth, requireJournalist, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Updating writer profile...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Handle both JSON and multipart/form-data
    let bio, specialization, experience, skills, phone, website, location, education, awards;
    
    if (req.body.bio !== undefined) {
      // Handle multipart/form-data
      bio = req.body.bio;
      specialization = req.body.specialization;
      experience = req.body.experience;
      phone = req.body.phone;
      website = req.body.website;
      location = req.body.location;
      education = req.body.education;
      awards = req.body.awards;
      
      // Parse skills if it's a JSON string
      if (req.body.skills && typeof req.body.skills === 'string') {
        try {
          skills = JSON.parse(req.body.skills);
        } catch (e) {
          skills = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        }
      }
    } else {
      // Handle JSON
      ({ bio, specialization, experience, skills, phone, website, location, education, awards } = req.body);
    }

    const user = await User.findById(req.user._id);
    
    if (!user.writerProfile) {
      user.writerProfile = {};
    }

    // Handle profile image upload
    if (req.file) {
      try {
        console.log('Uploading profile image to Cloudinary...');
        
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'writer-profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        user.writerProfile.profileImage = result.secure_url;
        console.log('Profile image uploaded successfully:', result.secure_url);
      } catch (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر پروفایل' });
      }
    }

    // Update profile fields
    user.writerProfile.bio = bio || user.writerProfile.bio;
    user.writerProfile.specialization = specialization || user.writerProfile.specialization;
    user.writerProfile.experience = experience || user.writerProfile.experience;
    user.writerProfile.skills = Array.isArray(skills) ? skills : (user.writerProfile.skills || []);
    user.writerProfile.phone = phone || user.writerProfile.phone;
    user.writerProfile.website = website || user.writerProfile.website;
    user.writerProfile.location = location || user.writerProfile.location;
    user.writerProfile.education = education || user.writerProfile.education;
    user.writerProfile.awards = awards || user.writerProfile.awards;

    await user.save();

    res.json({
      success: true,
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      profile: user.writerProfile
    });
  } catch (error) {
    console.error('Error updating writer profile:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی پروفایل' });
  }
});

// Create article (writer endpoint)
router.post('/articles', auth, requireJournalist, upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('Received article creation request');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Handle both JSON and multipart/form-data
    let title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured, seo, imageAlt;
    
    if (req.body.title) {
      // Handle multipart/form-data
      title = req.body.title;
      content = req.body.content;
      excerpt = req.body.excerpt;
      category = req.body.category;
      tags = req.body.tags;
      isPublished = req.body.isPublished === 'true';
      isBreaking = req.body.isBreaking === 'true';
      isFeatured = req.body.isFeatured === 'true';
      imageAlt = req.body.imageAlt;
      
      // Parse tags if it's a JSON string
      if (tags && typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
      
      // Parse SEO if it's a JSON string
      if (req.body.seo && typeof req.body.seo === 'string') {
        try {
          seo = JSON.parse(req.body.seo);
        } catch (e) {
          seo = {};
        }
      }
    } else {
      // Handle JSON
      ({ title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured, seo, imageAlt } = req.body);
    }
    
    console.log('Parsed data:', { title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured });
    
    if (!title || !content) {
      console.log('Missing required fields:', { title: !!title, content: !!content });
      return res.status(400).json({ error: 'عنوان و محتوا ضروری است' });
    }

    // Check if user is approved writer
    const user = await User.findById(req.user._id);
    if (!user.writerProfile?.isApprovedWriter) {
      return res.status(403).json({ error: 'شما مجوز نوشتن مقاله ندارید' });
    }

    // Handle featured image upload
    let featuredImageUrl = null;
    if (req.file) {
      try {
        console.log('Uploading featured image to Cloudinary...');
        
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'articles',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageUrl = {
          url: result.secure_url,
          alt: imageAlt || 'تصویر مقاله'
        };
        console.log('Image uploaded successfully:', featuredImageUrl.url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }

    // Generate a proper slug from the title
    const generateSlug = async (title) => {
      // Convert Persian numbers to English
      const persianToEnglish = {
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
        '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
      };
      
      let slug = title;
      
      // Replace Persian numbers with English
      Object.keys(persianToEnglish).forEach(persian => {
        slug = slug.replace(new RegExp(persian, 'g'), persianToEnglish[persian]);
      });
      
      // Convert to lowercase and replace spaces/special chars with hyphens
      slug = slug.toLowerCase()
        .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '') // Remove Persian/Arabic characters
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      // If slug is empty, use timestamp
      if (!slug) {
        slug = `article-${Date.now()}`;
      }
      
      // Check for uniqueness and add suffix if needed
      let uniqueSlug = slug;
      let counter = 1;
      
      while (true) {
        const existingArticle = await Blog.findOne({ slug: uniqueSlug });
        if (!existingArticle) {
          break;
        }
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      return uniqueSlug;
    };

    const articleData = {
      title,
      content,
      excerpt,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      author: req.user._id,
      status: isPublished ? 'published' : 'draft',
      publishedAt: isPublished ? new Date() : null,
      isBreaking: isBreaking || false,
      isFeatured: isFeatured || false,
      slug: await generateSlug(title),
      seo: seo || {},
      imageAlt: imageAlt || '',
      featuredImage: featuredImageUrl
    };

    console.log('Creating article with data:', {
      title: articleData.title,
      status: articleData.status,
      publishedAt: articleData.publishedAt,
      isPublished: isPublished
    });

    const article = new Blog(articleData);

    await article.save();
    console.log('Article saved with publishedAt:', article.publishedAt);

    // Update user's article count
    if (user.writerProfile) {
      user.writerProfile.totalArticles += 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'مقاله با موفقیت ایجاد شد',
      article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'مقاله‌ای با این عنوان قبلاً وجود دارد. لطفاً عنوان را تغییر دهید.' });
    }
    
    res.status(500).json({ error: 'خطا در ایجاد مقاله' });
  }
});

// Create news (writer endpoint)
router.post('/news', auth, requireJournalist, upload.single('featuredImage'), async (req, res) => {
  try {
    let { title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured, priority, seo, imageAlt } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'عنوان و محتوا ضروری است' });
    }

    if (content.trim().length < 50) {
      return res.status(400).json({ error: 'محتوا باید حداقل 50 کاراکتر باشد' });
    }

    // Check if user is approved writer
    const user = await User.findById(req.user._id);
    if (!user.writerProfile?.isApprovedWriter) {
      return res.status(403).json({ error: 'شما مجوز نوشتن خبر ندارید' });
    }

    // Parse JSON fields if they come as strings
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      }
    }
    
    if (typeof seo === 'string') {
      try {
        seo = JSON.parse(seo);
      } catch (e) {
        seo = {};
      }
    }

    // Handle featured image upload
    let featuredImageUrl = null;
    if (req.file) {
      try {
        console.log('Uploading featured image to Cloudinary...');
        
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'news',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageUrl = {
          url: result.secure_url,
          alt: imageAlt || 'تصویر خبر'
        };
        console.log('Image uploaded successfully:', featuredImageUrl.url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }

    // Generate unique slug
    const generateSlug = async (title) => {
      const persianToEnglish = {
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
        '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
      };
      
      let slug = title;
      
      Object.keys(persianToEnglish).forEach(persian => {
        slug = slug.replace(new RegExp(persian, 'g'), persianToEnglish[persian]);
      });
      
      slug = slug.toLowerCase()
        .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (!slug) {
        slug = `news-${Date.now()}`;
      }
      
      // Check for uniqueness and add suffix if needed
      let uniqueSlug = slug;
      let counter = 1;
      
      while (true) {
        const existingNews = await News.findOne({ slug: uniqueSlug });
        if (!existingNews) {
          break;
        }
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      return uniqueSlug;
    };

    const newsData = {
      title,
      content,
      excerpt,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      author: req.user._id,
      status: isPublished ? 'published' : 'draft',
      publishedAt: isPublished ? new Date() : null,
      isBreaking: isBreaking || false,
      isFeatured: isFeatured || false,
      priority: priority || 'normal',
      slug: await generateSlug(title),
      seo: seo || {},
      imageAlt: imageAlt || '',
      featuredImage: featuredImageUrl
    };

    console.log('Creating news with data:', {
      title: newsData.title,
      status: newsData.status,
      publishedAt: newsData.publishedAt,
      isPublished: isPublished
    });

    const news = new News(newsData);
    await news.save();
    console.log('News saved with publishedAt:', news.publishedAt);

    // Update user's news count
    if (user.writerProfile) {
      user.writerProfile.newsCount = (user.writerProfile.newsCount || 0) + 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'خبر با موفقیت ایجاد شد',
      news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'خبری با این عنوان قبلاً وجود دارد. لطفاً عنوان را تغییر دهید.' });
    }
    
    res.status(500).json({ error: 'خطا در ایجاد خبر' });
  }
});

// Delete article
router.delete('/articles/:id', auth, requireJournalist, async (req, res) => {
  try {
    const article = await Blog.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!article) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'مقاله با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'خطا در حذف مقاله' });
  }
});

// Delete news
router.delete('/news/:id', auth, requireJournalist, async (req, res) => {
  try {
    const news = await News.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'خبر با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'خطا در حذف خبر' });
  }
});

// Update article
router.put('/articles/:id', auth, requireJournalist, upload.single('featuredImage'), async (req, res) => {
  try {
    let { title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured, seo, imageAlt } = req.body;
    
    // Parse JSON fields if they come as strings
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      }
    }
    
    if (typeof seo === 'string') {
      try {
        seo = JSON.parse(seo);
      } catch (e) {
        seo = {};
      }
    }
    
    const article = await Blog.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!article) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    // Handle featured image upload
    let featuredImageData = article.featuredImage; // Keep existing image by default
    if (req.file) {
      try {
        console.log('Uploading new featured image to Cloudinary...');
        
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'articles',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageData = {
          url: result.secure_url,
          alt: req.body.imageAlt || article.featuredImage?.alt || 'تصویر مقاله'
        };
        console.log('New image uploaded successfully:', featuredImageData.url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }

    // Generate unique slug if title changed
    let newSlug = article.slug;
    if (title && title !== article.title) {
      const generateSlug = async (title) => {
        const persianToEnglish = {
          '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
          '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };
        
        let slug = title;
        
        Object.keys(persianToEnglish).forEach(persian => {
          slug = slug.replace(new RegExp(persian, 'g'), persianToEnglish[persian]);
        });
        
        slug = slug.toLowerCase()
          .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (!slug) {
          slug = `article-${Date.now()}`;
        }
        
        // Check for uniqueness and add suffix if needed
        let uniqueSlug = slug;
        let counter = 1;
        
        while (true) {
          const existingArticle = await Blog.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } });
          if (!existingArticle) {
            break;
          }
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        
        return uniqueSlug;
      };
      
      newSlug = await generateSlug(title);
    }

    // Update article fields
    article.title = title || article.title;
    article.content = content || article.content;
    article.excerpt = excerpt || article.excerpt;
    article.category = category || article.category;
    article.tags = Array.isArray(tags) ? tags : article.tags;
    article.status = isPublished === 'true' || isPublished === true ? 'published' : 'draft';
    article.publishedAt = (isPublished === 'true' || isPublished === true) ? new Date() : article.publishedAt;
    article.isBreaking = isBreaking === 'true' || isBreaking === true || false;
    article.isFeatured = isFeatured === 'true' || isFeatured === true || false;
    article.slug = newSlug;
    article.seo = seo || article.seo;
    article.imageAlt = imageAlt || article.imageAlt;
    article.featuredImage = featuredImageData;

    await article.save();

    res.json({
      success: true,
      message: 'مقاله با موفقیت به‌روزرسانی شد',
      article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'مقاله‌ای با این عنوان قبلاً وجود دارد. لطفاً عنوان را تغییر دهید.' });
    }
    
    res.status(500).json({ error: 'خطا در به‌روزرسانی مقاله' });
  }
});

// Update news
router.put('/news/:id', auth, requireJournalist, upload.single('featuredImage'), async (req, res) => {
  try {
    let { title, content, excerpt, category, tags, isPublished, isBreaking, isFeatured, priority, seo, imageAlt } = req.body;
    
    // Parse JSON fields if they come as strings
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      }
    }
    
    if (typeof seo === 'string') {
      try {
        seo = JSON.parse(seo);
      } catch (e) {
        seo = {};
      }
    }
    
    const news = await News.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!news) {
      return res.status(404).json({ error: 'خبر یافت نشد' });
    }

    // Handle featured image upload
    let featuredImageData = news.featuredImage; // Keep existing image by default
    if (req.file) {
      try {
        console.log('Uploading new featured image to Cloudinary...');
        
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'news',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageData = {
          url: result.secure_url,
          alt: imageAlt || news.featuredImage?.alt || 'تصویر خبر'
        };
        console.log('New image uploaded successfully:', featuredImageData.url);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'خطا در آپلود تصویر' });
      }
    }

    // Generate unique slug if title changed
    let newSlug = news.slug;
    if (title && title !== news.title) {
      const generateSlug = async (title) => {
        const persianToEnglish = {
          '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
          '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };
        
        let slug = title;
        
        Object.keys(persianToEnglish).forEach(persian => {
          slug = slug.replace(new RegExp(persian, 'g'), persianToEnglish[persian]);
        });
        
        slug = slug.toLowerCase()
          .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (!slug) {
          slug = `news-${Date.now()}`;
        }
        
        // Check for uniqueness and add suffix if needed
        let uniqueSlug = slug;
        let counter = 1;
        
        while (true) {
          const existingNews = await News.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } });
          if (!existingNews) {
            break;
          }
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        
        return uniqueSlug;
      };
      
      newSlug = await generateSlug(title);
    }

    // Update news fields
    news.title = title || news.title;
    news.content = content || news.content;
    news.excerpt = excerpt || news.excerpt;
    news.category = category || news.category;
    news.tags = Array.isArray(tags) ? tags : news.tags;
    news.status = isPublished === 'true' || isPublished === true ? 'published' : 'draft';
    news.publishedAt = (isPublished === 'true' || isPublished === true) ? new Date() : news.publishedAt;
    news.isBreaking = isBreaking === 'true' || isBreaking === true || false;
    news.isFeatured = isFeatured === 'true' || isFeatured === true || false;
    news.priority = priority || news.priority;
    news.slug = newSlug;
    news.seo = seo || news.seo;
    news.imageAlt = imageAlt || news.imageAlt;
    news.featuredImage = featuredImageData;

    await news.save();

    res.json({
      success: true,
      message: 'خبر با موفقیت به‌روزرسانی شد',
      news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'خبری با این عنوان قبلاً وجود دارد. لطفاً عنوان را تغییر دهید.' });
    }
    
    res.status(500).json({ error: 'خطا در به‌روزرسانی خبر' });
  }
});

// Check if writer can create articles
router.get('/can-create-article', auth, requireJournalist, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    
    // For now, allow all journalists to create articles
    // You can add more complex logic here (e.g., check profile completion, verification status, etc.)
    const canCreate = user && user.role === 'journalist';
    
    res.json({ canCreate });
  } catch (error) {
    console.error('Error checking article creation permission:', error);
    res.status(500).json({ error: 'خطا در بررسی مجوز' });
  }
});

// Get writer analytics
router.get('/analytics', auth, requireJournalist, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic stats
    const articles = await Blog.find({ author: userId });
    const news = await News.find({ author: userId });
    
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.views || 0), 0);
    
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0) +
                      news.reduce((sum, newsItem) => sum + (newsItem.likes || 0), 0);
    
    const totalComments = articles.reduce((sum, article) => sum + (article.comments || 0), 0) +
                         news.reduce((sum, newsItem) => sum + (newsItem.comments || 0), 0);

    // Get status counts
    const publishedArticles = articles.filter(article => article.status === 'published').length;
    const pendingArticles = articles.filter(article => article.status === 'pending').length;
    const rejectedArticles = articles.filter(article => article.status === 'rejected').length;
    
    const publishedNews = news.filter(newsItem => newsItem.status === 'published').length;
    const pendingNews = news.filter(newsItem => newsItem.status === 'pending').length;
    const rejectedNews = news.filter(newsItem => newsItem.status === 'rejected').length;

    // Get top performing content
    const topArticles = articles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(article => ({
        _id: article._id,
        title: article.title,
        views: article.views || 0
      }));

    const topNews = news
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(newsItem => ({
        _id: newsItem._id,
        title: newsItem.title,
        views: newsItem.views || 0
      }));

    // Get category stats
    const categoryStats = [];
    const allContent = [...articles, ...news];
    const categories = [...new Set(allContent.map(item => item.category).filter(Boolean))];
    
    categories.forEach(category => {
      const categoryContent = allContent.filter(item => item.category === category);
      const views = categoryContent.reduce((sum, item) => sum + (item.views || 0), 0);
      const likes = categoryContent.reduce((sum, item) => sum + (item.likes || 0), 0);
      const comments = categoryContent.reduce((sum, item) => sum + (item.comments || 0), 0);
      
      categoryStats.push({
        name: category,
        count: categoryContent.length,
        views,
        likes,
        comments
      });
    });

    // Mock monthly stats (in real app, you'd calculate this from actual data)
    const monthlyStats = [
      {
        month: 'فروردین',
        views: 1250,
        newContent: 8,
        engagementRate: 12.5
      },
      {
        month: 'اردیبهشت',
        views: 1580,
        newContent: 12,
        engagementRate: 15.2
      },
      {
        month: 'خرداد',
        views: 1420,
        newContent: 10,
        engagementRate: 13.8
      }
    ];

    res.json({
      totalViews,
      totalLikes,
      totalComments,
      totalArticles: articles.length,
      totalNews: news.length,
      publishedArticles,
      publishedNews,
      pendingArticles,
      pendingNews,
      rejectedArticles,
      rejectedNews,
      topArticles,
      topNews,
      categoryStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار و تحلیل' });
  }
});

// Note: Conversation creation is now handled by the unified /messages/conversations endpoint
// This endpoint has been removed to use the same structure as directors

module.exports = router;
