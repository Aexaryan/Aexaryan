import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon, 
  HeartIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const NewsCard = ({ news, onLike, showAuthor = true, variant = 'default' }) => {
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

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(news._id);
    }
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

  if (variant === 'breaking') {
    return (
      <Link to={`/news/${news.slug}`} className="block">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  اخبار فوری
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(news.publishedAt)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors duration-200">
                {news.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {news.summary}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/news/${news.slug}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={news.featuredImage?.url || '/images/default-news.jpg'}
            alt={news.featuredImage?.alt || news.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex flex-col space-y-2 space-y-reverse">
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              {getCategoryLabel(news.category)}
            </span>
            {news.isBreaking && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                اخبار فوری
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(news.priority)}`}>
              {news.priority === 'urgent' ? 'فوری' : 
               news.priority === 'high' ? 'مهم' : 
               news.priority === 'normal' ? 'عادی' : 'کم'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-primary-600 transition-colors duration-200 line-clamp-2">
            {news.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {news.summary}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 ml-1" />
                <span>{formatDate(news.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 ml-1" />
                <span>{news.readTime} دقیقه</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 ml-1" />
                <span>{news.views.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </div>

          {/* Author and Actions */}
          <div className="flex items-center justify-between">
            {showAuthor && news.author && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden ml-2">
                  {renderAvatar(news.author)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {news.author.displayName || `${news.author.firstName} ${news.author.lastName}`}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 space-x-reverse text-sm transition-colors duration-200 ${
                  news.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {news.isLiked ? (
                  <HeartIconSolid className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                <span>{news.likes?.length || 0}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {news.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {news.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">
                    +{news.tags.length - 3} بیشتر
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
