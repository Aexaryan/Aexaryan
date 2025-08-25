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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/writer/articles');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این مقاله را حذف کنید؟')) {
      return;
    }

    try {
      await api.delete(`/writer/articles/${articleId}`);
      toast.success('مقاله با موفقیت حذف شد');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('خطا در حذف مقاله');
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

  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      return matchesSearch && matchesStatus;
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
        default:
          return 0;
      }
    });

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری مقالات..." />;
  }

  return (
    <WriterLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">مقالات من</h1>
                <p className="text-gray-600">مدیریت و ویرایش مقالات خود</p>
              </div>
              <Link
                to="/writer/articles/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                نوشتن مقاله جدید
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در مقالات..."
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
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {filteredArticles.length} مقاله
                </span>
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ مقاله‌ای یافت نشد</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'هیچ مقاله‌ای با فیلترهای انتخاب شده مطابقت ندارد'
                    : 'هنوز مقاله‌ای ننوشته‌اید'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link
                    to="/writer/articles/create"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    نوشتن اولین مقاله
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <div key={article._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {article.title}
                          </h3>
                          {getStatusBadge(article.status)}
                        </div>
                        
                        {article.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {article.views || 0} بازدید
                          </div>
                          <div className="flex items-center gap-1">
                            <ChartBarIcon className="w-4 h-4" />
                            {article.likes || 0} پسند
                          </div>
                          {article.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {article.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/writer/articles/${article._id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/blogs/${article.slug}`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="مشاهده"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteArticle(article._id)}
                          className="p-2 bg-secondary-200 hover:bg-secondary-300 text-white rounded-lg transition-colors"
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

export default MyArticles;
