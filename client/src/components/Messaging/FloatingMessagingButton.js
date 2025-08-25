import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const FloatingMessagingButton = () => {
  const { user } = useAuth();
  const { unreadCount } = useMessaging();

  if (!user) return null;

  const getMessagesLink = () => {
    if (user.role === 'talent') {
      return '/talent/messages';
    } else if (user.role === 'casting_director') {
      return '/director/messages';
    } else if (user.role === 'journalist') {
      return '/writer/messages';
    }
    return '/messages';
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link
        to={getMessagesLink()}
        className="relative group flex items-center justify-center w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        title="پیام‌ها"
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          پیام‌ها
          {unreadCount > 0 && (
            <span className="mr-1 text-red-300">({unreadCount} جدید)</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default FloatingMessagingButton;
