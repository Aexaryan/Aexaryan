import React, { useState, useEffect } from 'react';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  NewspaperIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const WriterAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalArticles: 0,
    totalNews: 0,
    publishedArticles: 0,
    publishedNews: 0,
    pendingArticles: 0,
    pendingNews: 0,
    rejectedArticles: 0,
    rejectedNews: 0,
    monthlyStats: [],
    topArticles: [],
    topNews: [],
    categoryStats: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/writer/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('خطا در دریافت آمار و تحلیل');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change = null }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% از ماه گذشته
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color = 'blue' }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value} از {max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری آمار و تحلیل..." />;
  }

  return (
    <WriterLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">آمار و تحلیل</h1>
            </div>
            <p className="text-gray-600">بررسی عملکرد محتوای خود</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="کل بازدیدها"
              value={analytics.totalViews}
              icon={EyeIcon}
              color="blue"
              change={12}
            />
            <StatCard
              title="کل پسندها"
              value={analytics.totalLikes}
              icon={HeartIcon}
              color="red"
              change={8}
            />
            <StatCard
              title="کل نظرات"
              value={analytics.totalComments}
              icon={ChatBubbleLeftIcon}
              color="green"
              change={15}
            />
            <StatCard
              title="کل محتوا"
              value={analytics.totalArticles + analytics.totalNews}
              icon={DocumentTextIcon}
              color="purple"
              change={5}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">وضعیت محتوا</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    مقالات
                  </h3>
                  <ProgressBar 
                    label="منتشر شده" 
                    value={analytics.publishedArticles} 
                    max={analytics.totalArticles} 
                    color="green" 
                  />
                  <ProgressBar 
                    label="در انتظار بررسی" 
                    value={analytics.pendingArticles} 
                    max={analytics.totalArticles} 
                    color="yellow" 
                  />
                  <ProgressBar 
                    label="رد شده" 
                    value={analytics.rejectedArticles} 
                    max={analytics.totalArticles} 
                    color="red" 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <NewspaperIcon className="w-5 h-5" />
                    اخبار
                  </h3>
                  <ProgressBar 
                    label="منتشر شده" 
                    value={analytics.publishedNews} 
                    max={analytics.totalNews} 
                    color="green" 
                  />
                  <ProgressBar 
                    label="در انتظار بررسی" 
                    value={analytics.pendingNews} 
                    max={analytics.totalNews} 
                    color="yellow" 
                  />
                  <ProgressBar 
                    label="رد شده" 
                    value={analytics.rejectedNews} 
                    max={analytics.totalNews} 
                    color="red" 
                  />
                </div>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">بهترین محتوا</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    مقالات پربازدید
                  </h3>
                  <div className="space-y-3">
                    {analytics.topArticles.slice(0, 5).map((article, index) => (
                      <div key={article._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                            <p className="text-sm text-gray-500">{article.views} بازدید</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    اخبار پربازدید
                  </h3>
                  <div className="space-y-3">
                    {analytics.topNews.slice(0, 5).map((news, index) => (
                      <div key={news._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{news.title}</p>
                            <p className="text-sm text-gray-500">{news.views} بازدید</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">عملکرد دسته‌بندی‌ها</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.categoryStats.map((category) => (
                <div key={category.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">{category.count} محتوا</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">بازدید:</span>
                      <span className="font-medium">{category.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">پسند:</span>
                      <span className="font-medium">{category.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">نظر:</span>
                      <span className="font-medium">{category.comments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">روند ماهانه</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.monthlyStats.slice(-3).map((month) => (
                <div key={month.month} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">{month.month}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">بازدید:</span>
                      <span className="font-medium">{month.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">محتوای جدید:</span>
                      <span className="font-medium">{month.newContent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">نرخ تعامل:</span>
                      <span className="font-medium">{month.engagementRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WriterLayout>
      );
    };

export default WriterAnalytics;
