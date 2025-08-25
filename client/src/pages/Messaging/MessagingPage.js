import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationsList from '../../components/Messaging/ConversationsList';
import MessageList from '../../components/Messaging/MessageList';
import MessageInput from '../../components/Messaging/MessageInput';
import { 
  ChatBubbleLeftIcon, 
  UserGroupIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const MessagingPage = () => {
  const { fetchConversations, conversations, unreadCount, selectedConversationId, selectConversation } = useMessaging();
  const { user } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    fetchConversations();
    
    // Check if mobile view
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [fetchConversations]);

  const handleSelectConversation = (conversation) => {
    selectConversation(conversation._id);
    if (isMobileView) {
      // On mobile, hide conversation list when conversation is selected
      document.getElementById('conversations-panel')?.classList.add('hidden');
      document.getElementById('messages-panel')?.classList.remove('hidden');
    }
  };

  const handleBackToConversations = () => {
    if (isMobileView) {
      document.getElementById('conversations-panel')?.classList.remove('hidden');
      document.getElementById('messages-panel')?.classList.add('hidden');
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">پیام‌ها</h1>
              <p className="text-sm text-gray-600">
                {conversations.length} مکالمه {unreadCount > 0 && `• ${unreadCount} پیام خوانده نشده`}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full">
              <BellIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{unreadCount} پیام جدید</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-80px)] flex">
        {/* Conversations Panel */}
        <div 
          id="conversations-panel"
          className={`w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col ${
            isMobileView && selectedConversationId ? 'hidden' : ''
          }`}
        >
          {/* Conversations Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">مکالمات</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">آنلاین</span>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-hidden">
            <ConversationsList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          </div>
        </div>

        {/* Messages Panel */}
        <div 
          id="messages-panel"
          className={`flex-1 flex flex-col bg-white ${
            isMobileView && !selectedConversationId ? 'hidden' : ''
          }`}
        >
          {selectedConversationId ? (
            <>
              {/* Mobile Back Button */}
              {isMobileView && (
                <div className="lg:hidden p-3 border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={handleBackToConversations}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    بازگشت به مکالمات
                  </button>
                </div>
              )}
              
              <MessageList conversationId={selectedConversationId} />
              <MessageInput conversationId={selectedConversationId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChatBubbleLeftIcon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  پیام‌های شما
                </h3>
                <p className="text-gray-600 mb-6">
                  برای شروع مکالمه، یکی از مکالمات موجود را انتخاب کنید یا منتظر پیام جدید باشید.
                </p>
                
                {conversations.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">هنوز مکالمه‌ای ندارید</h4>
                        <p className="text-sm text-blue-700">
                          {user?.role === 'journalist' 
                            ? 'می‌توانید با کاربران دیگر مکالمه شروع کنید' 
                            : isMobileView 
                              ? 'کارگردانان می‌توانند با شما مکالمه شروع کنند' 
                              : 'می‌توانید با استعدادها مکالمه شروع کنید'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
