import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon, 
  HeartIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const NewsDetailsPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated, isTalent } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/news/${slug}`);
      setNews(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('خطا در دریافت خبر');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleLike = async () => {
    if (!user) {
      toast.error('برای لایک کردن باید وارد حساب کاربری خود شوید');
      return;
    }

    try {
      await api.post(`/news/${news._id}/like`);
      setNews(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked 
          ? prev.likes.filter(like => like.user !== user.id)
          : [...prev.likes, { user: user.id }]
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('برای نظر دادن باید وارد حساب کاربری خود شوید');
      return;
    }

    if (!comment.trim()) {
      toast.error('لطفاً نظر خود را بنویسید');
      return;
    }

    try {
      setSubmittingComment(true);
      await api.post(`/news/${news._id}/comments`, { content: comment });
      setComment('');
      toast.success('نظر شما با موفقیت ارسال شد');
      // Refresh news to get updated comments
      fetchNews();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('خطا در ارسال نظر');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const categories = {
      industry_news: 'اخبار صنعت',
      casting_announcements: 'اعلانات کستینگ',
      platform_updates: 'به‌روزرسانی‌های پلتفرم',
      success_stories: 'داستان‌های موفقیت',
      events: 'رویدادها',
      awards: 'جوایز',
      partnerships: 'مشارکت‌ها',
      technology: 'فناوری',
      breaking_news: 'اخبار فوری',
      other: 'سایر'
    };
    return categories[category] || category;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority] || colors.normal;
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const renderAvatar = (author) => {
    if (!author) return null;

    // Check for profile picture first (from TalentProfile or CastingDirectorProfile)
    const profileImageUrl = author.profileImage?.url;
    const initials = getInitials(author.firstName, author.lastName);
    const bgColor = getAvatarColor(author.firstName || author.lastName || author.email);

    if (profileImageUrl) {
      return (
        <img
          src={profileImageUrl}
          alt={`${author.firstName} ${author.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <div className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-semibold text-lg`}>
        {initials || <UserIcon className="w-6 h-6" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">خبر یافت نشد</h1>
          <p className="text-gray-600 mb-6">خبر مورد نظر شما وجود ندارد یا حذف شده است.</p>
          <Link
            to="/news"
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 ml-2" />
            بازگشت به اخبار
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                to="/news"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">خبر</h1>
            </div>
            
            {isAuthenticated && (
              <Link
                to={user.role === 'casting_director' ? '/director/dashboard' : '/talent/dashboard'}
                className="btn-outline btn-sm inline-flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 ml-2" />
                بازگشت به داشبورد
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
              {getCategoryLabel(news.category)}
            </span>
            {news.isBreaking && (
              <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 ml-1" />
                اخبار فوری
              </span>
            )}
            <span className={`text-sm px-3 py-1 rounded-full ${getPriorityColor(news.priority)}`}>
              {news.priority === 'urgent' ? 'فوری' : 
               news.priority === 'high' ? 'مهم' : 
               news.priority === 'normal' ? 'عادی' : 'کم'}
            </span>
            {news.tags && news.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 ml-1" />
                <span>{formatDate(news.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 ml-1" />
                <span>{news.readTime} دقیقه مطالعه</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 ml-1" />
                <span>{news.views.toLocaleString('fa-IR')} بازدید</span>
              </div>
            </div>
          </div>

          {/* Author Info */}
          {news.author && (
            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                {renderAvatar(news.author)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {news.author.firstName} {news.author.lastName}
                </p>
                {news.author.writerProfile?.specialization && (
                  <p className="text-sm text-gray-600">
                    {news.author.writerProfile.specialization}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {news.featuredImage && (
            <div className="mb-8">
              <img
                src={news.featuredImage.url}
                alt={news.featuredImage.alt || news.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* News Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: news.content }} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors duration-200 ${
                  news.isLiked 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {news.isLiked ? (
                  <HeartIconSolid className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{news.likes?.length || 0} لایک</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChatBubbleLeftIcon className="w-5 h-5 ml-2" />
              نظرات ({news.comments?.length || 0})
            </h3>

            {/* Comment Form */}
            {isAuthenticated && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="نظر خود را بنویسید..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="mt-2 btn-primary btn-sm"
                >
                  {submittingComment ? 'در حال ارسال...' : 'ارسال نظر'}
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {news.comments && news.comments.length > 0 ? (
                news.comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {renderAvatar(comment.user)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <p className="font-medium text-gray-900">
                            {comment.user.displayName || `${comment.user.firstName} ${comment.user.lastName}`}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">هنوز نظری ثبت نشده است.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
