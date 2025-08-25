import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const MyBlogs = () => {
  // const { user: currentUser } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [canCreate, setCanCreate] = useState(false);
  const [canCreateLoading, setCanCreateLoading] = useState(true);

  useEffect(() => {
    fetchMyBlogs();
    checkCanCreate();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs/my-blogs');
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreate = async () => {
    try {
      setCanCreateLoading(true);
      const response = await api.get('/blogs/can-create');
      setCanCreate(response.data.canCreate);
    } catch (error) {
      console.error('Error checking blog creation permission:', error);
      setCanCreate(false);
    } finally {
      setCanCreateLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این مقاله را حذف کنید؟')) {
      return;
    }

    try {
      setDeletingId(blogId);
      await api.delete(`/blogs/${blogId}`);
      toast.success('مقاله با موفقیت حذف شد');
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('خطا در حذف مقاله');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 ml-1" />
            منتشر شده
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 ml-1" />
            در انتظار بررسی
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 ml-1" />
            رد شده
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      casting_tips: 'نکات کستینگ',
      industry_news: 'اخبار صنعت',
      success_stories: 'داستان‌های موفقیت',
      interviews: 'مصاحبه‌ها',
      tutorials: 'آموزش‌ها',
      career_advice: 'مشاوره شغلی',
      technology: 'فناوری',
      events: 'رویدادها',
      other: 'سایر'
    };
    return categories[category] || category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری مقالات..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-primary-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">مقالات من</h1>
              </div>
              {canCreate && (
                <Link
                  to="/director/blogs/create"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 ml-2" />
                  ایجاد مقاله جدید
                </Link>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              مدیریت مقالات خود و مشاهده وضعیت انتشار آنها
            </p>
            {!canCreate && !canCreateLoading && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  برای ایجاد مقاله، ابتدا باید هویت شما توسط ادمین تایید شود.
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">کل مقالات</p>
                  <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">منتشر شده</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {blogs.filter(blog => blog.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {blogs.filter(blog => blog.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">رد شده</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {blogs.filter(blog => blog.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blogs List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">لیست مقالات</h2>
            </div>
            
            {blogs.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز مقاله‌ای ایجاد نکرده‌اید</h3>
                <p className="text-gray-600 mb-6">شروع کنید و اولین مقاله خود را ایجاد کنید</p>
                {canCreate ? (
                  <Link
                    to="/director/blogs/create"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 ml-2" />
                    ایجاد مقاله جدید
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4 ml-2" />
                    ایجاد مقاله جدید
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مقاله
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        دسته‌بندی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ ایجاد
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
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {blog.featuredImage?.url && (
                              <img
                                className="w-12 h-12 rounded-lg object-cover ml-3"
                                src={blog.featuredImage.url}
                                alt={blog.featuredImage.alt || blog.title}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {blog.title}
                              </div>
                              {blog.excerpt && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {blog.excerpt}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {getCategoryLabel(blog.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(blog.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(blog.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {blog.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {blog.status === 'published' && (
                              <Link
                                to={`/blogs/${blog.slug}`}
                                className="text-primary-600 hover:text-primary-900"
                                title="مشاهده"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Link>
                            )}
                            <Link
                              to={`/director/blogs/${blog._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="ویرایش"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              disabled={deletingId === blog._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="حذف"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBlogs;
