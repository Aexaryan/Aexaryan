import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  NewspaperIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MyNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/writer/news');
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('خطا در دریافت اخبار');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این خبر را حذف کنید؟')) {
      return;
    }

    try {
      await api.delete(`/writer/news/${newsId}`);
      toast.success('خبر با موفقیت حذف شد');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('خطا در حذف خبر');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'منتشر شده' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'در انتظار بررسی' },
      draft: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'پیش‌نویس' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'رد شده' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'فوری' },
      normal: { color: 'bg-blue-100 text-blue-800', icon: ExclamationTriangleIcon, text: 'عادی' },
      low: { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon, text: 'کم اهمیت' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const filteredNews = news
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری اخبار..." />;
  }

  return (
    <WriterLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">اخبار من</h1>
                <p className="text-gray-600">مدیریت و ویرایش اخبار خود</p>
              </div>
              <Link
                to="/writer/news/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                نوشتن خبر جدید
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در اخبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="published">منتشر شده</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="draft">پیش‌نویس</option>
                <option value="rejected">رد شده</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">همه اولویت‌ها</option>
                <option value="high">فوری</option>
                <option value="normal">عادی</option>
                <option value="low">کم اهمیت</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="title">بر اساس عنوان</option>
                <option value="views">بیشترین بازدید</option>
                <option value="priority">بر اساس اولویت</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {filteredNews.length} خبر
                </span>
              </div>
            </div>
          </div>

          {/* News List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredNews.length === 0 ? (
              <div className="p-12 text-center">
                <NewspaperIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خبری یافت نشد</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'هیچ خبری با فیلترهای انتخاب شده مطابقت ندارد'
                    : 'هنوز خبری ننوشته‌اید'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                  <Link
                    to="/writer/news/create"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    نوشتن اولین خبر
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNews.map((newsItem) => (
                  <div key={newsItem._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {newsItem.title}
                          </h3>
                          {getStatusBadge(newsItem.status)}
                          {getPriorityBadge(newsItem.priority)}
                          {newsItem.isBreaking && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              فوری
                            </span>
                          )}
                        </div>
                        
                        {newsItem.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {newsItem.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(newsItem.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {newsItem.views || 0} بازدید
                          </div>
                          <div className="flex items-center gap-1">
                            <ChartBarIcon className="w-4 h-4" />
                            {newsItem.likes || 0} پسند
                          </div>
                          {newsItem.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {newsItem.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/writer/news/${newsItem._id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/news/${newsItem.slug}`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="مشاهده"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteNews(newsItem._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </WriterLayout>
      );
    };

export default MyNews;
