import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  NewspaperIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const WriterRecentActivity = ({ items, type, emptyMessage }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'منتشر شده';
      case 'pending':
        return 'در انتظار تایید';
      case 'rejected':
        return 'رد شده';
      case 'draft':
        return 'پیش‌نویس';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">
          {type === 'articles' ? '📝' : '📰'}
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
        <Link
          to={type === 'articles' ? '/writer/articles/create' : '/writer/news/create'}
          className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {type === 'articles' ? 'نوشتن مقاله جدید' : 'نوشتن خبر جدید'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.slice(0, 5).map((item, index) => (
        <React.Fragment key={item._id}>
          <div
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {type === 'articles' ? (
                <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              ) : (
                <NewspaperIcon className="w-8 h-8 text-green-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  {item.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  {item.likes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  {item.comments || 0}
                </span>
                <span className="text-xs">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <Link
                to={`/writer/${type === 'articles' ? 'articles' : 'news'}/${item._id}/edit`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ویرایش
              </Link>
            </div>
          </div>
          {index < Math.min(items.length, 5) - 1 && (
            <div className="h-px bg-gray-200 mx-4"></div>
          )}
        </React.Fragment>
      ))}

      {/* View All Link */}
      {items.length > 5 && (
        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            to={`/writer/${type === 'articles' ? 'articles' : 'news'}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده همه {type === 'articles' ? 'مقالات' : 'اخبار'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default WriterRecentActivity;
