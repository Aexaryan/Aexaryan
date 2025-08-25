const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const News = require('./models/News');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for sample content creation'))
  .catch(err => console.error('MongoDB connection error:', err));

const createSampleContent = async () => {
  try {
    // Find an admin user to be the author
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    console.log('Creating sample blog posts...');

    // Sample Blog Posts
    const sampleBlogs = [
      {
        title: 'راهنمای کامل برای موفقیت در کستینگ‌های سینمایی',
        slug: 'complete-guide-cinema-casting-success',
        content: `
          <h2>مقدمه</h2>
          <p>موفقیت در کستینگ‌های سینمایی نیاز به آمادگی کامل و درک عمیق از صنعت فیلم دارد. در این مقاله، ما مراحل کلیدی برای موفقیت در کستینگ‌ها را بررسی می‌کنیم.</p>
          
          <h2>آمادگی قبل از کستینگ</h2>
          <p>قبل از حضور در کستینگ، موارد زیر را حتماً آماده کنید:</p>
          <ul>
            <li>پورتفولیو حرفه‌ای با عکس‌های با کیفیت</li>
            <li>رزومه به‌روز و کامل</li>
            <li>آمادگی برای اجرای صحنه‌های مختلف</li>
            <li>مطالعه کامل فیلمنامه</li>
          </ul>
          
          <h2>نکات مهم در روز کستینگ</h2>
          <p>در روز کستینگ، این نکات را رعایت کنید:</p>
          <ul>
            <li>زودتر از موعد مقرر حاضر شوید</li>
            <li>لباس مناسب و حرفه‌ای بپوشید</li>
            <li>اعتماد به نفس داشته باشید</li>
            <li>با کارگردان و تیم کستینگ ارتباط خوبی برقرار کنید</li>
          </ul>
          
          <h2>نتیجه‌گیری</h2>
          <p>موفقیت در کستینگ نیاز به تلاش، آمادگی و تجربه دارد. با رعایت این نکات، شانس موفقیت شما افزایش خواهد یافت.</p>
        `,
        excerpt: 'راهنمای جامع برای موفقیت در کستینگ‌های سینمایی شامل نکات آمادگی، روز کستینگ و تکنیک‌های موفقیت',
        author: adminUser._id,
        category: 'casting_tips',
        tags: ['کستینگ', 'سینما', 'موفقیت', 'آمادگی'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
          alt: 'کستینگ سینمایی'
        },
        status: 'published',
        publishedAt: new Date(),
        readTime: 8,
        views: 1250,
        likes: [],
        comments: [],
        seo: {
          metaTitle: 'راهنمای کامل کستینگ سینمایی - نکات موفقیت',
          metaDescription: 'راهنمای جامع برای موفقیت در کستینگ‌های سینمایی با نکات کاربردی و تجربیات حرفه‌ای',
          keywords: ['کستینگ', 'سینما', 'موفقیت', 'آمادگی', 'فیلم']
        }
      },
      {
        title: 'تکنیک‌های جدید بازیگری در عصر دیجیتال',
        slug: 'new-acting-techniques-digital-age',
        content: `
          <h2>تغییرات صنعت بازیگری</h2>
          <p>صنعت بازیگری در عصر دیجیتال تغییرات اساسی کرده است. تکنولوژی‌های جدید روش‌های بازیگری را متحول کرده‌اند.</p>
          
          <h2>بازیگری در مقابل دوربین سبک</h2>
          <p>با گسترش محتوای دیجیتال، بازیگران باید مهارت‌های جدیدی کسب کنند:</p>
          <ul>
            <li>بازیگری برای محتوای کوتاه</li>
            <li>تکنیک‌های مخصوص شبکه‌های اجتماعی</li>
            <li>بازیگری در استودیوهای خانگی</li>
            <li>تعامل با هوش مصنوعی</li>
          </ul>
          
          <h2>آینده بازیگری</h2>
          <p>بازیگران آینده باید مهارت‌های دیجیتال را در کنار مهارت‌های سنتی توسعه دهند.</p>
        `,
        excerpt: 'بررسی تکنیک‌های جدید بازیگری در عصر دیجیتال و تغییرات صنعت سرگرمی',
        author: adminUser._id,
        category: 'tutorials',
        tags: ['بازیگری', 'دیجیتال', 'تکنولوژی', 'آینده'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
          alt: 'تکنولوژی دیجیتال'
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        readTime: 6,
        views: 890,
        likes: [],
        comments: [],
        seo: {
          metaTitle: 'تکنیک‌های جدید بازیگری در عصر دیجیتال',
          metaDescription: 'بررسی تکنیک‌های جدید بازیگری و تغییرات صنعت در عصر دیجیتال',
          keywords: ['بازیگری', 'دیجیتال', 'تکنولوژی', 'آینده']
        }
      },
      {
        title: 'داستان موفقیت: از کستینگ تا ستاره سینما',
        slug: 'success-story-casting-to-stardom',
        content: `
          <h2>شروع داستان</h2>
          <p>در این مقاله، داستان موفقیت یکی از بازیگران معروف را بررسی می‌کنیم که از یک کستینگ ساده شروع کرد و به ستاره سینما تبدیل شد.</p>
          
          <h2>مراحل پیشرفت</h2>
          <p>این بازیگر مراحل زیر را طی کرد:</p>
          <ol>
            <li>شروع با نقش‌های کوچک در تئاتر</li>
            <li>شرکت در کستینگ‌های مختلف</li>
            <li>ایفای نقش در فیلم‌های کوتاه</li>
            <li>نقش‌آفرینی در فیلم‌های سینمایی</li>
            <li>تبدیل شدن به ستاره</li>
          </ol>
          
          <h2>درس‌های آموخته</h2>
          <p>از این داستان می‌توان درس‌های ارزشمندی آموخت که برای همه بازیگران مفید است.</p>
        `,
        excerpt: 'داستان الهام‌بخش موفقیت یک بازیگر از کستینگ ساده تا تبدیل شدن به ستاره سینما',
        author: adminUser._id,
        category: 'success_stories',
        tags: ['موفقیت', 'داستان', 'ستاره', 'کستینگ'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
          alt: 'موفقیت در سینما'
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        readTime: 7,
        views: 2100,
        likes: [],
        comments: [],
        seo: {
          metaTitle: 'داستان موفقیت: از کستینگ تا ستاره سینما',
          metaDescription: 'داستان الهام‌بخش موفقیت یک بازیگر و درس‌های آموخته از مسیر موفقیت',
          keywords: ['موفقیت', 'داستان', 'ستاره', 'کستینگ', 'الهام']
        }
      }
    ];

    // Create blog posts
    for (const blogData of sampleBlogs) {
      const existingBlog = await Blog.findOne({ slug: blogData.slug });
      if (!existingBlog) {
        const blog = new Blog(blogData);
        await blog.save();
        console.log(`✅ Blog created: ${blog.title}`);
      } else {
        console.log(`⏭️ Blog already exists: ${blogData.title}`);
      }
    }

    console.log('\nCreating sample news articles...');

    // Sample News Articles
    const sampleNews = [
      {
        title: 'افتتاح بزرگترین استودیو فیلم‌سازی در تهران',
        slug: 'largest-film-studio-tehran-opening',
        content: `
          <h2>افتتاح رسمی</h2>
          <p>بزرگترین استودیو فیلم‌سازی ایران با حضور مسئولان فرهنگی و هنرمندان برجسته در تهران افتتاح شد.</p>
          
          <h2>ویژگی‌های استودیو</h2>
          <p>این استودیو با مساحت 50,000 متر مربع شامل:</p>
          <ul>
            <li>10 سالن فیلمبرداری مجهز</li>
            <li>استودیوهای صداگذاری پیشرفته</li>
            <li>اتاق‌های تدوین دیجیتال</li>
            <li>فضاهای سبک‌پردازی مدرن</li>
          </ul>
          
          <h2>تأثیر بر صنعت سینما</h2>
          <p>این پروژه می‌تواند تحول بزرگی در صنعت سینمای ایران ایجاد کند و فرصت‌های شغلی جدیدی برای هنرمندان فراهم آورد.</p>
        `,
        summary: 'بزرگترین استودیو فیلم‌سازی ایران با امکانات پیشرفته در تهران افتتاح شد',
        author: adminUser._id,
        category: 'industry_news',
        priority: 'high',
        tags: ['استودیو', 'تهران', 'فیلم‌سازی', 'افتتاح'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=400&fit=crop',
          alt: 'استودیو فیلم‌سازی'
        },
        status: 'published',
        publishedAt: new Date(),
        readTime: 4,
        views: 3200,
        likes: [],
        comments: [],
        isBreaking: true,
        isFeatured: true,
        seo: {
          metaTitle: 'افتتاح بزرگترین استودیو فیلم‌سازی تهران',
          metaDescription: 'افتتاح رسمی بزرگترین استودیو فیلم‌سازی ایران با امکانات پیشرفته',
          keywords: ['استودیو', 'تهران', 'فیلم‌سازی', 'افتتاح', 'سینما']
        }
      },
      {
        title: 'اعلام برگزیدگان جشنواره فیلم فجر 1403',
        slug: 'fajr-film-festival-2024-winners',
        content: `
          <h2>مراسم اختتامیه</h2>
          <p>مراسم اختتامیه چهل و دومین جشنواره فیلم فجر با اعلام برگزیدگان به پایان رسید.</p>
          
          <h2>برگزیدگان اصلی</h2>
          <ul>
            <li><strong>بهترین فیلم:</strong> "عنوان فیلم" - کارگردان: نام کارگردان</li>
            <li><strong>بهترین کارگردان:</strong> نام کارگردان - فیلم "عنوان"</li>
            <li><strong>بهترین بازیگر مرد:</strong> نام بازیگر - فیلم "عنوان"</li>
            <li><strong>بهترین بازیگر زن:</strong> نام بازیگر - فیلم "عنوان"</li>
          </ul>
          
          <h2>آمار جشنواره</h2>
          <p>در این دوره از جشنواره، بیش از 200 فیلم از سراسر کشور شرکت داشتند.</p>
        `,
        summary: 'برگزیدگان چهل و دومین جشنواره فیلم فجر در مراسم اختتامیه اعلام شدند',
        author: adminUser._id,
        category: 'awards',
        priority: 'normal',
        tags: ['جشنواره فجر', 'برگزیدگان', 'سینما', 'جایزه'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
          alt: 'جشنواره فیلم'
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        readTime: 5,
        views: 1800,
        likes: [],
        comments: [],
        isBreaking: false,
        isFeatured: true,
        seo: {
          metaTitle: 'برگزیدگان جشنواره فیلم فجر 1403',
          metaDescription: 'اعلام رسمی برگزیدگان چهل و دومین جشنواره فیلم فجر',
          keywords: ['جشنواره فجر', 'برگزیدگان', 'سینما', 'جایزه', '2024']
        }
      },
      {
        title: 'به‌روزرسانی جدید پلتفرم کستینگ: ویژگی‌های جدید اضافه شد',
        slug: 'casting-platform-update-new-features',
        content: `
          <h2>ویژگی‌های جدید</h2>
          <p>پلتفرم کستینگ ما با ویژگی‌های جدید و بهبود یافته به‌روزرسانی شده است:</p>
          
          <h3>بهبودهای اصلی</h3>
          <ul>
            <li>سیستم جستجوی پیشرفته</li>
            <li>پروفایل‌های بهبود یافته</li>
            <li>سیستم پیام‌رسانی بهتر</li>
            <li>گزارش‌های تحلیلی دقیق‌تر</li>
          </ul>
          
          <h3>ویژگی‌های جدید</h3>
          <ul>
            <li>سیستم ویدیو کستینگ</li>
            <li>تقویم هوشمند</li>
            <li>سیستم امتیازدهی</li>
            <li>گزارش‌های پیشرفته</li>
          </ul>
          
          <h2>نحوه استفاده</h2>
          <p>کاربران می‌توانند از این ویژگی‌های جدید برای بهبود تجربه کستینگ خود استفاده کنند.</p>
        `,
        summary: 'پلتفرم کستینگ با ویژگی‌های جدید و بهبود یافته به‌روزرسانی شد',
        author: adminUser._id,
        category: 'platform_updates',
        priority: 'normal',
        tags: ['پلتفرم', 'به‌روزرسانی', 'ویژگی‌های جدید', 'کستینگ'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
          alt: 'پلتفرم دیجیتال'
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readTime: 6,
        views: 950,
        likes: [],
        comments: [],
        isBreaking: false,
        isFeatured: false,
        seo: {
          metaTitle: 'به‌روزرسانی پلتفرم کستینگ - ویژگی‌های جدید',
          metaDescription: 'معرفی ویژگی‌های جدید و بهبود یافته پلتفرم کستینگ',
          keywords: ['پلتفرم', 'به‌روزرسانی', 'ویژگی‌های جدید', 'کستینگ', 'دیجیتال']
        }
      },
      {
        title: 'همکاری جدید با شبکه‌های بین‌المللی برای تولید محتوا',
        slug: 'international-networks-collaboration-content-production',
        content: `
          <h2>توافقنامه همکاری</h2>
          <p>پلتفرم کستینگ ما با چندین شبکه بین‌المللی برای تولید محتوای مشترک به توافق رسیده است.</p>
          
          <h2>شرکای جدید</h2>
          <ul>
            <li>شبکه A - تولید فیلم‌های مستند</li>
            <li>شبکه B - تولید سریال‌های تلویزیونی</li>
            <li>شبکه C - تولید محتوای دیجیتال</li>
          </ul>
          
          <h2>فرصت‌های جدید</h2>
          <p>این همکاری فرصت‌های جدیدی برای بازیگران و کارگردانان ایرانی فراهم می‌آورد تا در پروژه‌های بین‌المللی شرکت کنند.</p>
          
          <h2>برنامه آینده</h2>
          <p>در ماه‌های آینده، پروژه‌های مشترک متعددی آغاز خواهد شد.</p>
        `,
        summary: 'توافق همکاری با شبکه‌های بین‌المللی برای تولید محتوای مشترک و فرصت‌های جدید',
        author: adminUser._id,
        category: 'partnerships',
        priority: 'high',
        tags: ['همکاری', 'بین‌المللی', 'شبکه', 'تولید محتوا'],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
          alt: 'همکاری بین‌المللی'
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        readTime: 5,
        views: 1400,
        likes: [],
        comments: [],
        isBreaking: false,
        isFeatured: true,
        seo: {
          metaTitle: 'همکاری با شبکه‌های بین‌المللی - فرصت‌های جدید',
          metaDescription: 'توافق همکاری با شبکه‌های بین‌المللی برای تولید محتوای مشترک',
          keywords: ['همکاری', 'بین‌المللی', 'شبکه', 'تولید محتوا', 'فرصت']
        }
      }
    ];

    // Create news articles
    for (const newsData of sampleNews) {
      const existingNews = await News.findOne({ slug: newsData.slug });
      if (!existingNews) {
        const news = new News(newsData);
        await news.save();
        console.log(`✅ News created: ${news.title}`);
      } else {
        console.log(`⏭️ News already exists: ${newsData.title}`);
      }
    }

    console.log('\n🎉 Sample content creation completed successfully!');
    console.log(`📊 Created ${sampleBlogs.length} blog posts and ${sampleNews.length} news articles`);

  } catch (error) {
    console.error('Error creating sample content:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createSampleContent();
