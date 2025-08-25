import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import NewsCard from '../../components/News/NewsCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  NewspaperIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const NewsPage = () => {
  const { isAuthenticated, isTalent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/news?${params}`);
      
      setNews(response.data.news);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);

      // Update URL params
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (category) newParams.set('category', category);
      if (sort !== 'newest') newParams.set('sort', sort);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('خطا در دریافت اخبار');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, category, sort, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

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

  const handleLike = async (newsId) => {
    try {
      await api.post(`/news/${newsId}/like`);
      // Update the news in the list
      setNews(prevNews => 
        prevNews.map(item => {
          if (item._id === newsId) {
            const isLiked = !item.isLiked;
            const likes = isLiked ? [...(item.likes || []), { user: 'current-user' }] : (item.likes || []).filter(like => like.user !== 'current-user');
            return { ...item, isLiked, likes };
          }
          return item;
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

  if (loading && news.length === 0) {
    return <LoadingSpinner text="در حال بارگذاری اخبار..." />;
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
              to="/blogs"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              مقالات
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
              <NewspaperIcon className="w-12 h-12 text-primary-600 ml-3" />
              <h1 className="text-4xl font-bold text-gray-900">اخبار</h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              آخرین اخبار و رویدادهای صنعت کستینگ را در اینجا دنبال کنید
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
                placeholder="جستجو در اخبار..."
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
                  <option value="priority">بر اساس اولویت</option>
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
              {total} خبر یافت شد
            </span>
          </div>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-12">
            <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">خبری یافت نشد</h3>
            <p className="text-gray-600">هیچ خبری با فیلترهای انتخاب شده یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {news.map((item) => (
              <NewsCard
                key={item._id}
                news={item}
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

export default NewsPage;
