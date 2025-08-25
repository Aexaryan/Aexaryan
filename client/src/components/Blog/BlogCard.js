import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon, 
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const BlogCard = ({ blog, onLike, showAuthor = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(blog._id);
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
      <div className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
        {initials || <UserIcon className="w-5 h-5" />}
      </div>
    );
  };

  return (
    <Link to={`/blogs/${blog.slug}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.featuredImage?.url || '/images/default-blog.jpg'}
            alt={blog.featuredImage?.alt || blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              {getCategoryLabel(blog.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-primary-600 transition-colors duration-200 line-clamp-2">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 ml-1" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 ml-1" />
                <span>{blog.readTime} دقیقه</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 ml-1" />
                <span>{blog.views.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </div>

          {/* Author and Actions */}
          <div className="flex items-center justify-between">
            {showAuthor && blog.author && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden ml-2">
                  {renderAvatar(blog.author)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {blog.author.displayName || `${blog.author.firstName} ${blog.author.lastName}`}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 space-x-reverse text-sm transition-colors duration-200 ${
                  blog.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {blog.isLiked ? (
                  <HeartIconSolid className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                <span>{blog.likes?.length || 0}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {blog.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">
                    +{blog.tags.length - 3} بیشتر
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

export default BlogCard;
