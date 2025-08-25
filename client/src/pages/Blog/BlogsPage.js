import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import BlogCard from '../../components/Blog/BlogCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const BlogsPage = () => {
  const { isAuthenticated, isTalent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/blogs?${params}`);
      
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);

      // Update URL params
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (category) newParams.set('category', category);
      if (sort !== 'newest') newParams.set('sort', sort);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, category, sort, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blogs/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'search') setSearch(value);
    if (filterType === 'category') setCategory(value);
    if (filterType === 'sort') setSort(value);
  };

  const handleLike = async (blogId) => {
    try {
      await api.post(`/blogs/${blogId}/like`);
      // Update the blog in the list
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => {
          if (blog._id === blogId) {
            const isLiked = !blog.isLiked;
            const likes = isLiked ? [...(blog.likes || []), { user: 'current-user' }] : (blog.likes || []).filter(like => like.user !== 'current-user');
            return { ...blog, isLiked, likes };
          }
          return blog;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && blogs.length === 0) {
    return <LoadingSpinner text="در حال بارگذاری مقالات..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ک</span>
            </div>
            <span className="mr-3 text-2xl font-bold text-gray-900">کستینگ پلت</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              صفحه اصلی
            </Link>
            <Link
              to="/news"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              اخبار
            </Link>
            {!isAuthenticated && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center relative">
            {/* Return to Dashboard Button for Authenticated Users */}
            {isAuthenticated && (
              <div className="absolute top-0 right-0">
                <Link
                  to={isTalent ? '/talent/dashboard' : '/director/dashboard'}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 ml-2" />
                  بازگشت به داشبورد
                </Link>
              </div>
            )}
            
            <div className="flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-12 h-12 text-primary-600 ml-3" />
              <h1 className="text-4xl font-bold text-gray-900">مقالات</h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              بهترین مقالات و راهنماهای صنعت کستینگ را در اینجا بخوانید
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در مقالات..."
                value={search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <select
                  value={category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field-select w-full"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="sm:w-48">
                <select
                  value={sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field-select w-full"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                  <option value="most_liked">بیشترین لایک</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 text-gray-500 ml-2" />
            <span className="text-gray-600">
              {total} مقاله یافت شد
            </span>
          </div>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-gray-600">هیچ مقاله‌ای با فیلترهای انتخاب شده یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onLike={handleLike}
                showAuthor={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2 space-x-reverse">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
