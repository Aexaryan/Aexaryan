import React, { useState } from 'react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ApprovalBadge from '../Common/ApprovalBadge';
import ConfirmationModal from '../Common/ConfirmationModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ConversationsList = ({ onSelectConversation, selectedConversationId }) => {
  const { conversations, loading, closeConversation, deleteConversation } = useMessaging();
  const { user } = useAuth();
  const [closingConversationId, setClosingConversationId] = useState(null);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToClose, setConversationToClose] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  const handleCloseConversation = (e, conversationId) => {
    e.stopPropagation(); // Prevent selecting the conversation
    setConversationToClose(conversationId);
    setShowCloseModal(true);
  };

  const confirmCloseConversation = async () => {
    if (!conversationToClose) return;

    try {
      setClosingConversationId(conversationToClose);
      await closeConversation(conversationToClose);
      toast.success('مکالمه با موفقیت بسته و حذف شد');
    } catch (error) {
      console.error('Error closing conversation:', error);
      toast.error('خطا در بستن و حذف مکالمه');
    } finally {
      setClosingConversationId(null);
      setShowCloseModal(false);
      setConversationToClose(null);
    }
  };

  const cancelCloseConversation = () => {
    setShowCloseModal(false);
    setConversationToClose(null);
  };

  const handleDeleteConversation = (e, conversationId) => {
    e.stopPropagation(); // Prevent selecting the conversation
    setConversationToDelete(conversationId);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      setDeletingConversationId(conversationToDelete);
      await deleteConversation(conversationToDelete);
      toast.success('مکالمه با موفقیت حذف شد');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('خطا در حذف مکالمه');
    } finally {
      setDeletingConversationId(null);
      setShowDeleteModal(false);
      setConversationToDelete(null);
    }
  };

  const cancelDeleteConversation = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };



  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getOtherUser = (conversation) => {
    if (conversation.conversationType === 'director_talent') {
      if (user.role === 'casting_director') {
        return conversation.talent;
      } else {
        return conversation.director;
      }
    } else if (conversation.conversationType === 'writer_user') {
      // For writer conversations, determine if current user is initiator or recipient
      // Handle both _id and id cases for user object
      const currentUserId = user._id || user.id;
      const initiatorId = conversation.initiator._id || conversation.initiator.id;
      const recipientId = conversation.recipient._id || conversation.recipient.id;
      
      const isInitiator = initiatorId === currentUserId;
      return isInitiator ? conversation.recipient : conversation.initiator;
    }
    return null;
  };

  const getUnreadCount = (conversation) => {
    if (conversation.conversationType === 'director_talent') {
      if (user.role === 'casting_director') {
        return conversation.unreadCount?.director || 0;
      } else {
        return conversation.unreadCount?.talent || 0;
      }
    } else if (conversation.conversationType === 'writer_user') {
      // Handle both _id and id cases for user object
      const currentUserId = user._id || user.id;
      const initiatorId = conversation.initiator._id || conversation.initiator.id;
      
      const isInitiator = initiatorId === currentUserId;
      return isInitiator ? conversation.unreadCount?.initiator || 0 : conversation.unreadCount?.recipient || 0;
    }
    return 0;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'مکالمه جدید';
    
    // Handle both string and object formats for lastMessage
    if (typeof conversation.lastMessage === 'string') {
      return conversation.lastMessage.substring(0, 30) + (conversation.lastMessage.length > 30 ? '...' : '');
    }
    
    const message = conversation.lastMessage;
    // Handle both _id and id cases for user object
    const currentUserId = user._id || user.id;
    const senderId = message.sender?._id || message.sender?.id || message.sender;
    const isOwnMessage = senderId === currentUserId;
    const prefix = isOwnMessage ? 'شما: ' : '';
    
    return prefix + (message.content?.substring(0, 30) || 'پیام جدید') + (message.content?.length > 30 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="در حال بارگذاری مکالمات..." />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {user.role === 'casting_director' 
            ? 'هنوز مکالمه‌ای شروع نکرده‌اید' 
            : user.role === 'journalist'
            ? 'هنوز مکالمه‌ای شروع نکرده‌اید'
            : 'هنوز پیامی دریافت نکرده‌اید'
          }
        </h3>
        <p className="text-gray-500 text-center text-sm">
          {user.role === 'casting_director' 
            ? 'برای شروع مکالمه با استعدادها، از پروفایل آن‌ها استفاده کنید'
            : user.role === 'journalist'
            ? 'برای شروع مکالمه با کاربران، از بخش کاوش کاربران استفاده کنید'
            : 'کارگردانان می‌توانند با شما مکالمه شروع کنند'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full bg-gradient-to-b from-white to-gray-50">
      <div className="space-y-2 p-3">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const unreadCount = getUnreadCount(conversation);
          const isSelected = selectedConversationId === conversation._id;
          const hasUnread = unreadCount > 0;
          
          // Skip rendering if otherUser is not available
          if (!otherUser) {
            console.warn('No otherUser found for conversation:', conversation._id);
            return null;
          }

          return (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 shadow-lg transform scale-[1.02]' 
                  : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:transform hover:scale-[1.01]'
              }`}
            >
              {/* Unread Indicator */}
              {hasUnread && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
              )}

              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <Link 
                  to={user.role === 'journalist' ? '#' : user.role === 'casting_director' 
                    ? otherUser.talentProfileId 
                      ? `/director/talents/${otherUser.talentProfileId}` 
                      : `/director/talents?search=${encodeURIComponent(`${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email)}`
                    : `/${otherUser.role === 'casting_director' ? 'director' : 'talent'}/${otherUser._id}`
                  }
                  className="block flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-3 border-white shadow-lg">
                      {(() => {
                        // Handle different profile image structures based on user role
                        let imageUrl = null;
                        if (otherUser.role === 'casting_director') {
                          imageUrl = otherUser.profileImage?.url || otherUser.profileImage;
                        } else if (otherUser.role === 'talent') {
                          imageUrl = otherUser.headshot?.url || otherUser.headshot;
                        } else {
                          // For other roles, try different possible image fields
                          imageUrl = otherUser.profileImage?.url || otherUser.headshot?.url || otherUser.profileImage || otherUser.headshot;
                        }
                        
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={`${otherUser.firstName || ''} ${otherUser.lastName || ''}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null;
                      })()}
                      <div className={`w-full h-full flex items-center justify-center ${(() => {
                        let imageUrl = null;
                        if (otherUser.role === 'casting_director') {
                          imageUrl = otherUser.profileImage?.url || otherUser.profileImage;
                        } else if (otherUser.role === 'talent') {
                          imageUrl = otherUser.headshot?.url || otherUser.headshot;
                        } else {
                          imageUrl = otherUser.profileImage?.url || otherUser.headshot?.url || otherUser.profileImage || otherUser.headshot;
                        }
                        return imageUrl ? 'hidden' : '';
                      })()}`}>
                        <UserIcon className="w-7 h-7 text-primary-600" />
                      </div>
                    </div>
                    
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-sm animate-pulse"></div>
                  </div>
                </Link>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <Link 
                      to={user.role === 'journalist' ? '#' : user.role === 'casting_director' 
                        ? otherUser.talentProfileId 
                          ? `/director/talents/${otherUser.talentProfileId}` 
                          : `/director/talents?search=${encodeURIComponent(`${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email)}`
                        : `/${otherUser.role === 'casting_director' ? 'director' : 'talent'}/${otherUser._id}`
                      }
                      className="block hover:text-primary-600 transition-colors group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-primary-700 transition-colors">
                          {(() => {
                            // Handle different name structures based on user role
                            if (otherUser.role === 'casting_director') {
                              return otherUser.firstName && otherUser.lastName 
                                ? `${otherUser.firstName} ${otherUser.lastName}`
                                : otherUser.email;
                            } else if (otherUser.role === 'talent') {
                              return otherUser.firstName && otherUser.lastName 
                                ? `${otherUser.firstName} ${otherUser.lastName}`
                                : otherUser.email;
                            } else {
                              // For other roles (like journalists), use displayName or fallback
                              return otherUser.displayName || otherUser.fullName || 
                                (otherUser.firstName && otherUser.lastName 
                                  ? `${otherUser.firstName} ${otherUser.lastName}`
                                  : otherUser.email);
                            }
                          })()}
                        </h4>
                        {otherUser.identificationStatus === 'approved' && (
                          <ApprovalBadge size="xs" showText={false} />
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {conversation.lastMessageAt ? (
                          <>
                            <CalendarDaysIcon className="w-3 h-3" />
                            <span className="font-medium">{formatTime(conversation.lastMessageAt)}</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-3 h-3" />
                            <span className="font-medium">جدید</span>
                          </>
                        )}
                      </div>
                      
                      {/* Action Buttons - Top Right */}
                      <div className="flex items-center gap-1">
                        {/* Close Button */}
                        <button
                          onClick={(e) => handleCloseConversation(e, conversation._id)}
                          disabled={closingConversationId === conversation._id}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            closingConversationId === conversation._id
                              ? 'text-red-600 bg-red-100'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="بستن مکالمه"
                        >
                          {closingConversationId === conversation._id ? (
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <XMarkIcon className="w-3 h-3" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteConversation(e, conversation._id)}
                          disabled={deletingConversationId === conversation._id}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            deletingConversationId === conversation._id
                              ? 'text-red-600 bg-red-100'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="حذف مکالمه"
                        >
                          {deletingConversationId === conversation._id ? (
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <p className="text-sm font-bold text-primary-700 mb-2 truncate bg-primary-50 px-2 py-1 rounded-lg">
                    {conversation.subject || 'مکالمه جدید'}
                  </p>

                  {/* Last Message */}
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate flex-1 ${
                      hasUnread ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'
                    }`}>
                      {getLastMessagePreview(conversation)}
                    </p>
                    
                    {hasUnread && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[24px] text-center shadow-md">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button - Bottom Right */}
              <button
                onClick={(e) => handleCloseConversation(e, conversation._id)}
                disabled={closingConversationId === conversation._id}
                className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 shadow-sm z-10 ${
                  closingConversationId === conversation._id
                    ? 'text-red-600 bg-red-100 opacity-100'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-100'
                }`}
                title="بستن مکالمه"
              >
                {closingConversationId === conversation._id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XMarkIcon className="w-4 h-4" />
                )}
              </button>

              {/* Hover Effects */}
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Closing Conversation */}
      <ConfirmationModal
        isOpen={showCloseModal}
        onClose={cancelCloseConversation}
        onConfirm={confirmCloseConversation}
        title="بستن مکالمه"
        message={`🗑️ هشدار: بستن و حذف مکالمه

این کار باعث می‌شود که:
• مکالمه به طور کامل از پایگاه داده حذف شود
• تمام پیام‌های موجود در این مکالمه پاک شوند
• این کار غیرقابل بازگشت است
• هیچ کس دیگر نمی‌تواند این مکالمه را ببیند

آیا مطمئن هستید که می‌خواهید این مکالمه را ببندید و حذف کنید؟`}
        confirmText="بله، ببند و حذف کن"
        cancelText="لغو"
        type="danger"
        isLoading={closingConversationId !== null}
      />

      {/* Confirmation Modal for Deleting Conversation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteConversation}
        onConfirm={confirmDeleteConversation}
        title="حذف مکالمه"
        message={`🗑️ هشدار: حذف دائمی مکالمه

این کار باعث می‌شود که:
• مکالمه به طور کامل از پایگاه داده حذف شود
• تمام پیام‌های موجود در این مکالمه پاک شوند
• این کار غیرقابل بازگشت است
• هیچ کس دیگر نمی‌تواند این مکالمه را ببیند

آیا مطمئن هستید که می‌خواهید این مکالمه را برای همیشه حذف کنید؟`}
        confirmText="بله، حذف کن"
        cancelText="لغو"
        type="danger"
        isLoading={deletingConversationId !== null}
      />
    </div>
  );
};

export default ConversationsList;
