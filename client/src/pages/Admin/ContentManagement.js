import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon,
  NewspaperIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ContentManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    blogs: { total: 0, published: 0, pending: 0, draft: 0 },
    news: { total: 0, published: 0, pending: 0, draft: 0 }
  });

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const type = activeTab === 'blogs' ? 'blogs' : 'news';
      const response = await api.get(`/${type}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined
        }
      });

      if (activeTab === 'blogs') {
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages);
      } else {
        setNews(response.data.news);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      toast.error(`خطا در دریافت ${activeTab === 'blogs' ? 'مقالات' : 'اخبار'}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTerm, statusFilter, categoryFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const [blogsResponse, newsResponse] = await Promise.all([
        api.get('/blogs/stats'),
        api.get('/news/stats')
      ]);

      setStats({
        blogs: blogsResponse.data,
        news: newsResponse.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    fetchStats();
  }, [fetchContent, fetchStats]);

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      await api.patch(`/${type}/${id}/status`, { status: newStatus });
      toast.success(`وضعیت ${type === 'blogs' ? 'مقاله' : 'خبر'} با موفقیت تغییر کرد`);
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`آیا مطمئن هستید که می‌خواهید این ${type === 'blogs' ? 'مقاله' : 'خبر'} را حذف کنید؟`)) {
      return;
    }

    try {
      await api.delete(`/${type}/${id}`);
      toast.success(`${type === 'blogs' ? 'مقاله' : 'خبر'} با موفقیت حذف شد`);
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('خطا در حذف');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'منتشر شده' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'در انتظار' },
      draft: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon, text: 'پیش‌نویس' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'رد شده' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categories = {
      casting_tips: 'نکات کستینگ',
      industry_news: 'اخبار صنعت',
      success_stories: 'داستان‌های موفقیت',
      interviews: 'مصاحبه‌ها',
      tutorials: 'آموزش‌ها',
      career_advice: 'مشاوره شغلی',
      technology: 'تکنولوژی',
      events: 'رویدادها',
      other: 'سایر'
    };

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {categories[category] || category}
      </span>
    );
  };

  const renderContentTable = (content, type) => {
    if (loading) {
      return <LoadingSpinner text="در حال بارگذاری..." />;
    }

    if (content.length === 0) {
      return (
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {type === 'blogs' ? 'هیچ مقاله‌ای یافت نشد' : 'هیچ خبری یافت نشد'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'فیلترهای خود را تغییر دهید'
              : `هنوز ${type === 'blogs' ? 'مقاله' : 'خبر'}‌ای ایجاد نشده است`}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نویسنده
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                دسته‌بندی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                بازدید
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {content.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {item.featuredImage?.url ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={item.featuredImage.url}
                          alt={item.title}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.excerpt}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.author?.firstName} {item.author?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(item.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.views || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => navigate(`/${type}/${item.slug}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="مشاهده"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/${type}/${item._id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="ویرایش"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'published', type)}
                        className="text-green-600 hover:text-green-900"
                        title="تایید"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id, type)}
                      className="text-red-600 hover:text-red-900"
                      title="حذف"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            قبلی
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              صفحه <span className="font-medium">{currentPage}</span> از{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px space-x-reverse">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مدیریت محتوا</h1>
              <p className="mt-1 text-sm text-gray-500">
                مدیریت مقالات و اخبار پلتفرم
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => navigate('/admin/blogs/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 ml-2" />
                ایجاد مقاله
              </button>
              <button
                onClick={() => navigate('/admin/news/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 ml-2" />
                ایجاد خبر
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">مقالات</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.blogs.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">منتشر شده: {stats.blogs.published}</span>
                  <span className="text-yellow-600">در انتظار: {stats.blogs.pending}</span>
                  <span className="text-gray-600">پیش‌نویس: {stats.blogs.draft}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <NewspaperIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">اخبار</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.news.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">منتشر شده: {stats.news.published}</span>
                  <span className="text-yellow-600">در انتظار: {stats.news.pending}</span>
                  <span className="text-gray-600">پیش‌نویس: {stats.news.draft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('blogs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blogs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline ml-2" />
                مقالات
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'news'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <NewspaperIcon className="h-5 w-5 inline ml-2" />
                اخبار
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`جستجو در ${activeTab === 'blogs' ? 'مقالات' : 'اخبار'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pr-10 pl-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="published">منتشر شده</option>
                    <option value="pending">در انتظار</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="rejected">رد شده</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">همه دسته‌بندی‌ها</option>
                    <option value="casting_tips">نکات کستینگ</option>
                    <option value="industry_news">اخبار صنعت</option>
                    <option value="success_stories">داستان‌های موفقیت</option>
                    <option value="interviews">مصاحبه‌ها</option>
                    <option value="tutorials">آموزش‌ها</option>
                    <option value="career_advice">مشاوره شغلی</option>
                    <option value="technology">تکنولوژی</option>
                    <option value="events">رویدادها</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Table */}
            {renderContentTable(activeTab === 'blogs' ? blogs : news, activeTab)}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
