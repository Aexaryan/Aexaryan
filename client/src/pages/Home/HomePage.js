import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import ApprovalBadge from '../../components/Common/ApprovalBadge';
import BlogCard from '../../components/Blog/BlogCard';
import NewsCard from '../../components/News/NewsCard';
import { 
  UserGroupIcon, 
  FilmIcon, 
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  PlayIcon,
  CheckCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  HeartIcon,
  NewspaperIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalTalents: 0,
    totalCastings: 0,
    successfulProjects: 0
  });
  const [recentCastings, setRecentCastings] = useState([]);
  const [featuredTalents, setFeaturedTalents] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState({
    castings: true,
    talents: true,
    blogs: true,
    breakingNews: true,
    recentNews: true
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Make all API calls in parallel for faster loading
      const [
        castingsResponse,
        talentsResponse,
        blogsResponse,
        breakingNewsResponse,
        recentNewsResponse
      ] = await Promise.all([
        api.get(`/castings?limit=6`),
        api.get(`/talents/featured?limit=8`),
        api.get(`/blogs/featured`),
        api.get(`/news/breaking`),
        api.get(`/news?limit=6`)
      ]);

      // Set all data at once
      setRecentCastings(castingsResponse.data.castings || []);
      setFeaturedTalents(talentsResponse.data.talents || []);
      setFeaturedBlogs(blogsResponse.data.blogs || []);
      setBreakingNews(breakingNewsResponse.data.news || []);
      setRecentNews(recentNewsResponse.data.news || []);
      
      // Update all section loading states
      setSectionLoading({
        castings: false,
        talents: false,
        blogs: false,
        breakingNews: false,
        recentNews: false
      });
      
      // Mock stats for now - in real app, you'd have an endpoint for this
      setStats({
        totalTalents: 1250,
        totalCastings: 340,
        successfulProjects: 890
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
      // Set loading to false even on error
      setSectionLoading({
        castings: false,
        talents: false,
        blogs: false,
        breakingNews: false,
        recentNews: false
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'جستجوی پیشرفته',
      description: 'با فیلترهای دقیق، استعداد مورد نظر خود را پیدا کنید',
      icon: '🔍'
    },
    {
      title: 'پروفایل جامع',
      description: 'پروفایل کاملی از مهارت‌ها، تجربیات و نمونه کارها',
      icon: '👤'
    },
    {
      title: 'مدیریت آسان',
      description: 'مدیریت کستینگ‌ها و درخواست‌ها در یک مکان',
      icon: '📋'
    },
    {
      title: 'ارتباط مستقیم',
      description: 'ارتباط مستقیم بین استعدادها و کارگردانان',
      icon: '💬'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'ثبت نام کنید',
      description: 'به عنوان استعداد یا کارگردان کستینگ ثبت نام کنید'
    },
    {
      step: '2',
      title: 'پروفایل بسازید',
      description: 'پروفایل جامع خود را با عکس‌ها و مهارت‌ها تکمیل کنید'
    },
    {
      step: '3',
      title: 'جستجو کنید',
      description: 'فرصت‌های شغلی یا استعدادهای مناسب را پیدا کنید'
    },
    {
      step: '4',
      title: 'شروع همکاری',
      description: 'درخواست ارسال کنید و همکاری خود را آغاز کنید'
    }
  ];

  const getExperienceLevelText = (level) => {
    const levels = {
      beginner: 'مبتدی',
      intermediate: 'متوسط',
      experienced: 'با تجربه',
      professional: 'حرفه‌ای'
    };
    return levels[level] || level;
  };

  if (user) {
    // Redirect authenticated users to their dashboard
    let dashboardPath;
    let welcomeMessage;
    
    switch (user.role) {
      case 'talent':
        dashboardPath = '/talent/dashboard';
        welcomeMessage = 'استعداد عزیز';
        break;
      case 'casting_director':
        dashboardPath = '/director/dashboard';
        welcomeMessage = 'کارگردان محترم';
        break;
      case 'journalist':
        dashboardPath = '/writer/dashboard';
        welcomeMessage = 'نویسنده محترم';
        break;
      case 'admin':
        dashboardPath = '/admin/dashboard';
        welcomeMessage = 'مدیر سیستم';
        break;
      default:
        dashboardPath = '/';
        welcomeMessage = 'کاربر عزیز';
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            خوش آمدید، {welcomeMessage}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            آماده شروع کار هستید؟
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={dashboardPath}
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              ورود به داشبورد
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
            </Link>
            <button
              onClick={logout}
              className="btn-secondary text-lg px-8 py-3 inline-flex items-center"
            >
              خروج و ورود مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow border-b-2 border-accent-600">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-accent-600 rounded flex items-center justify-center">
              <span className="text-black font-bold text-xl">ک</span>
            </div>
            <span className="mr-3 text-2xl font-bold text-accent-600">کستینگ پلت</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-black hover:text-white hover:bg-secondary-200 px-2 py-1 rounded transition-colors font-medium"
            >
              درباره ما
            </Link>
            <Link
              to="/blogs"
              className="text-black hover:text-white hover:bg-secondary-200 px-2 py-1 rounded transition-colors font-medium"
            >
              مقالات
            </Link>
            <Link
              to="/login"
              className="text-black hover:text-white hover:bg-secondary-200 px-2 py-1 rounded transition-colors font-medium"
            >
              ورود
            </Link>
            <Link
              to="/register"
              className="bg-accent-600 hover:bg-accent-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              ثبت نام رایگان
            </Link>
          </div>
        </div>
      </header>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">در حال بارگذاری...</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-white py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-black">
              <span className="block">نقش بعدی شما</span>
              <span className="block text-accent-600">اینجا شروع می‌شود</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-black mb-8 max-w-3xl mx-auto leading-relaxed">
              پلتفرم پیشرو که کارگردانان کستینگ استعدادهای برتر را پیدا می‌کنند و بازیگران نقش‌های رویایی خود را پیدا می‌کنند.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register?role=talent"
                className="bg-accent-600 hover:bg-accent-700 text-white font-bold text-lg px-8 py-4 rounded transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
              >
                <UserGroupIcon className="w-6 h-6 ml-2" />
                فرصت‌های بازیگری را پیدا کنید
              </Link>
              <Link
                to="/register?role=casting_director"
                className="bg-secondary-200 hover:bg-secondary-300 text-white font-bold text-lg px-8 py-4 rounded transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-lg border-2 border-accent-600"
              >
                <FilmIcon className="w-6 h-6 ml-2" />
                پروژه خود را منتشر کنید
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-black mb-8">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-accent-600 ml-2" />
                <span>تضمین کیفیت</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-accent-600 ml-2" />
                <span>پشتیبانی 24/7</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-accent-600 ml-2" />
                <span>امنیت کامل</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">
                  {stats.totalTalents.toLocaleString()}+
                </div>
                <div className="text-black">استعداد فعال</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">
                  {stats.totalCastings.toLocaleString()}+
                </div>
                <div className="text-black">کستینگ منتشر شده</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">
                  {stats.successfulProjects.toLocaleString()}+
                </div>
                <div className="text-black">پروژه موفق</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talents Section */}
      {sectionLoading.talents ? (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-accent-600 mb-4">
                اخیراً انتخاب شده‌اند
              </h2>
              <p className="text-black max-w-2xl mx-auto">
                داستان‌های موفقیت و پروژه‌های اخیر
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          </div>
        </section>
      ) : featuredTalents.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-accent-600 mb-4">
                اخیراً انتخاب شده‌اند
              </h2>
              <p className="text-black max-w-2xl mx-auto">
                داستان‌های موفقیت و پروژه‌های اخیر
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredTalents.map((talent) => {
                return (
                <div key={talent._id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Talent Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {talent.headshot?.url ? (
                      <img
                        src={talent.headshot.url}
                        alt={talent.artisticName || `${talent.firstName} ${talent.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <UserGroupIcon className="w-16 h-16 text-primary-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <StarIcon className="w-3 h-3 ml-1" />
                      ویژه
                    </div>
                  </div>

                  {/* Talent Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {talent.artisticName || `${talent.firstName} ${talent.lastName}`}
                      </h3>
                      {talent.identificationStatus === 'approved' && (
                        <ApprovalBadge size="sm" showText={false} />
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPinIcon className="w-4 h-4 ml-1" />
                      {talent.city}, {talent.province}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">سطح تجربه:</span> {getExperienceLevelText(talent.experienceLevel)}
                    </div>
                    
                    {/* Skills */}
                    {talent.skills && talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {talent.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {talent.skills.length > 3 && (
                          <span className="text-gray-500 text-xs">+{talent.skills.length - 3} بیشتر</span>
                        )}
                      </div>
                    )}
                    
                    {/* Bio Preview */}
                    {talent.biography && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {talent.biography}
                      </p>
                    )}
                    
                    {/* Action Button */}
                    <Link
                      to="/register"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium inline-flex items-center justify-center"
                    >
                      <HeartIcon className="w-4 h-4 ml-1" />
                      مشاهده پروفایل
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="btn-outline inline-flex items-center"
              >
                مشاهده همه استعدادها
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              کاربران ما چه می‌گویند؟
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              نظرات واقعی از کارگردانان و استعدادهای موفق
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial 1 - Casting Director */}
            <div className="bg-white rounded shadow border border-accent-600 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">ک</span>
                </div>
                <div className="mr-4">
                  <h4 className="font-bold text-black">احمد محمدی</h4>
                  <p className="text-black text-sm">کارگردان کستینگ، شبکه یک</p>
                </div>
              </div>
              <p className="text-black italic">
                "کستینگ پلت فرآیند انتخاب بازیگر را برای ما بسیار ساده کرده است. کیفیت استعدادها و سرعت در پیدا کردن افراد مناسب واقعاً قابل توجه است."
              </p>
            </div>

            {/* Testimonial 2 - Talent */}
            <div className="bg-white rounded shadow border border-accent-600 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">س</span>
                </div>
                <div className="mr-4">
                  <h4 className="font-bold text-black">سارا احمدی</h4>
                  <p className="text-black text-sm">بازیگر</p>
                </div>
              </div>
              <p className="text-black italic">
                "از طریق کستینگ پلت توانستم نقش رویایی خود را در یک فیلم سینمایی پیدا کنم. پلتفرم بسیار کاربردی و حرفه‌ای است."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-accent-600 mb-4">
              چگونه کار می‌کند؟
            </h2>
            <p className="text-black max-w-2xl mx-auto">
              فرآیند ساده ما برای هر دو طرف
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Talent */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-accent-600 mb-8">برای استعدادها</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">پروفایل خود را بسازید</h4>
                    <p className="text-black">پروفایل جامعی با عکس‌ها، مهارت‌ها و تجربیات خود ایجاد کنید</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">جستجو و درخواست</h4>
                    <p className="text-black">فرصت‌های مناسب را پیدا کنید و درخواست خود را ارسال کنید</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    3
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">نقش خود را بگیرید</h4>
                    <p className="text-black">با کارگردانان ارتباط برقرار کنید و نقش رویایی خود را بدست آورید</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Casting Directors */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-accent-600 mb-8">برای کارگردانان کستینگ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">پروژه خود را منتشر کنید</h4>
                    <p className="text-black">جزئیات پروژه و نیازمندی‌های نقش را مشخص کنید</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">درخواست‌ها را دریافت کنید</h4>
                    <p className="text-black">از استعدادهای واجد شرایط درخواست دریافت کنید</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    3
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-black mb-2">نقش خود را انتخاب کنید</h4>
                    <p className="text-black">بهترین استعداد را انتخاب کنید و پروژه خود را شروع کنید</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Castings */}
      {sectionLoading.castings ? (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                آخرین فرصت‌های شغلی
              </h2>
              <p className="text-gray-600">
                جدیدترین کستینگ‌های منتشر شده را مشاهده کنید
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </section>
      ) : recentCastings.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                آخرین فرصت‌های شغلی
              </h2>
              <p className="text-gray-600">
                جدیدترین کستینگ‌های منتشر شده را مشاهده کنید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recentCastings.slice(0, 6).map((casting) => (
                <div key={casting._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {casting.title}
                    </h3>
                    <span className="status-active">
                      فعال
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {casting.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{casting.projectType}</span>
                    <span>{casting.location?.city}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        مهلت: {new Date(casting.applicationDeadline).toLocaleDateString('fa-IR')}
                      </span>
                      <Link
                        to="/register"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="btn-primary inline-flex items-center"
              >
                مشاهده همه فرصت‌ها
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Breaking News Section */}
      {sectionLoading.breakingNews ? (
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                اخبار فوری
              </h2>
              <p className="text-gray-600 text-lg">
                آخرین اخبار و اعلانات مهم صنعت کستینگ
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </section>
      ) : breakingNews.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                اخبار فوری
              </h2>
              <p className="text-gray-600 text-lg">
                آخرین اخبار و اعلانات مهم صنعت کستینگ
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {breakingNews.map((news) => (
                <NewsCard
                  key={news._id}
                  news={news}
                  variant="breaking"
                  showAuthor={false}
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                to="/news"
                className="btn-primary inline-flex items-center"
              >
                مشاهده همه اخبار
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Blogs Section */}
      {sectionLoading.blogs ? (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <DocumentTextIcon className="w-8 h-8 text-primary-600 ml-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  مقالات ویژه
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                بهترین مقالات و راهنماهای صنعت کستینگ
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </section>
      ) : featuredBlogs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <DocumentTextIcon className="w-8 h-8 text-primary-600 ml-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  مقالات ویژه
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                بهترین مقالات و راهنماهای صنعت کستینگ
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  showAuthor={true}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/blogs"
                className="btn-primary inline-flex items-center"
              >
                مشاهده همه مقالات
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent News Section */}
      {sectionLoading.recentNews ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <NewspaperIcon className="w-8 h-8 text-primary-600 ml-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  آخرین اخبار
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                جدیدترین اخبار و رویدادهای صنعت کستینگ
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </section>
      ) : recentNews.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <NewspaperIcon className="w-8 h-8 text-primary-600 ml-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  آخرین اخبار
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                جدیدترین اخبار و رویدادهای صنعت کستینگ
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {recentNews.map((news) => (
                <NewsCard
                  key={news._id}
                  news={news}
                  showAuthor={true}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/news"
                className="btn-primary inline-flex items-center"
              >
                مشاهده همه اخبار
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-accent-600 mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-black text-xl mb-8">
            به هزاران متخصص خلاق بپیوندید و سفر خود را امروز شروع کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=talent"
              className="bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-8 rounded transition-colors duration-200 inline-flex items-center"
            >
              به عنوان استعداد بپیوندید
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
            </Link>
            <Link
              to="/register?role=casting_director"
              className="bg-secondary-200 hover:bg-secondary-300 text-white font-bold py-3 px-8 rounded transition-colors duration-200 inline-flex items-center border-2 border-accent-600"
            >
              به عنوان کارگردان کستینگ بپیوندید
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-accent-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold">ک</span>
                </div>
                <span className="mr-2 text-xl font-bold text-accent-600">کستینگ پلت</span>
              </div>
              <p className="text-white">
                پلتفرم جامع ارتباط استعدادها و کارگردانان کستینگ
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-accent-600">لینک‌های مفید</h3>
              <ul className="space-y-2 text-white">
                <li><Link to="/about" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">درباره ما</Link></li>
                <li><Link to="/contact" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">تماس با ما</Link></li>
                <li><Link to="/help" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">راهنما</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-accent-600">خدمات</h3>
              <ul className="space-y-2 text-white">
                <li><Link to="/talent-search" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">جستجوی استعداد</Link></li>
                <li><Link to="/casting-management" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">مدیریت کستینگ</Link></li>
                <li><Link to="/portfolio" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">نمونه کار</Link></li>
                <li><Link to="/blogs" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">مقالات</Link></li>
                <li><Link to="/news" className="hover:text-accent-600 hover:bg-white px-2 py-1 rounded transition-colors">اخبار</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-accent-600">تماس</h3>
              <div className="text-white space-y-2">
                <p>alexander.aryanfar@gmail.com</p>
                <p>تهران، ایران</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-accent-600 mt-8 pt-8 text-center text-white">
            <p>&copy; 2024 کستینگ پلت. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;