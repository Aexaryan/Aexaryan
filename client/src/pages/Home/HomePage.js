import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  PlayIcon, 
  UserGroupIcon, 
  FilmIcon, 
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTalents: 0,
    totalCastings: 0,
    successfulProjects: 0
  });
  const [recentCastings, setRecentCastings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch recent castings
      const castingsResponse = await axios.get('/castings?limit=6');
      setRecentCastings(castingsResponse.data.castings || []);
      
      // Mock stats for now - in real app, you'd have an endpoint for this
      setStats({
        totalTalents: 1250,
        totalCastings: 340,
        successfulProjects: 890
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
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

  if (user) {
    // Redirect authenticated users to their dashboard
    const dashboardPath = user.role === 'talent' ? '/talent/dashboard' : '/director/dashboard';
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            خوش آمدید، {user.role === 'talent' ? 'استعداد عزیز' : 'کارگردان محترم'}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            آماده شروع کار هستید؟
          </p>
          <Link
            to={dashboardPath}
            className="btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            ورود به داشبورد
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ک</span>
            </div>
            <span className="mr-3 text-2xl font-bold text-gray-900">کستینگ پلت</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              ورود
            </Link>
            <Link
              to="/register"
              className="btn-primary"
            >
              ثبت نام
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-orange-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            پلتفرم جامع کستینگ
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            محلی برای ارتباط استعدادها و کارگردانان کستینگ. 
            بهترین فرصت‌ها را پیدا کنید یا استعداد مورد نظرتان را کشف کنید.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register?role=talent"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              <UserGroupIcon className="w-6 h-6 ml-2" />
              ثبت نام به عنوان استعداد
            </Link>
            <Link
              to="/register?role=casting_director"
              className="btn-outline text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              <FilmIcon className="w-6 h-6 ml-2" />
              ثبت نام به عنوان کارگردان
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalTalents.toLocaleString()}+
              </div>
              <div className="text-gray-600">استعداد فعال</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalCastings.toLocaleString()}+
              </div>
              <div className="text-gray-600">کستینگ منتشر شده</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.successfulProjects.toLocaleString()}+
              </div>
              <div className="text-gray-600">پروژه موفق</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              چرا کستینگ پلت؟
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ما ابزارهای پیشرفته‌ای را ارائه می‌دهیم تا فرآیند کستینگ را ساده و موثر کنیم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              چگونه کار می‌کند؟
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              در چهار مرحله ساده، به شبکه بزرگ صنعت سرگرمی بپیوندید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Castings */}
      {recentCastings.length > 0 && (
        <section className="py-20 bg-white">
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

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-primary-100 text-xl mb-8">
            همین امروز به جمع هزاران استعداد و کارگردان بپیوندید
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            شروع کنید
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">ک</span>
                </div>
                <span className="mr-2 text-xl font-bold">کستینگ پلت</span>
              </div>
              <p className="text-gray-400">
                پلتفرم جامع ارتباط استعدادها و کارگردانان کستینگ
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">لینک‌های مفید</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">درباره ما</Link></li>
                <li><Link to="/contact" className="hover:text-white">تماس با ما</Link></li>
                <li><Link to="/help" className="hover:text-white">راهنما</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">خدمات</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/talent-search" className="hover:text-white">جستجوی استعداد</Link></li>
                <li><Link to="/casting-management" className="hover:text-white">مدیریت کستینگ</Link></li>
                <li><Link to="/portfolio" className="hover:text-white">نمونه کار</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">تماس</h3>
              <div className="text-gray-400 space-y-2">
                <p>alexander.aryanfar@gmail.com</p>
                <p>تهران، ایران</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 کستینگ پلت. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;