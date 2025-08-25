import React, { useRef, useEffect, useState } from 'react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ApprovalBadge from '../Common/ApprovalBadge';
import DirectorInfoPopup from './DirectorInfoPopup';
import TalentInfoPopup from './TalentInfoPopup';

import {
  UserIcon,
  CheckIcon,
  PaperAirplaneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MessageList = ({ conversationId }) => {
  const { messages, loading, selectedConversation, fetchMessages, typingUsers } = useMessaging();
  const { user, profile } = useAuth();
  const messagesEndRef = useRef(null);
  const [showDirectorPopup, setShowDirectorPopup] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [showTalentPopup, setShowTalentPopup] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'دیروز';
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`;
    } else {
      return date.toLocaleDateString('fa-IR');
    }
  };

  const isOwnMessage = (message) => {
    // Handle both _id and id cases for user object
    const userId = user?._id || user?.id;
    const senderId = message.sender?._id || message.sender?.id;
    
    // Standard logic: if it's our message, return true (right side)
    return senderId === userId;
  };

  const shouldShowDate = (message, index) => {
    if (index === 0) return true;
    
    const currentDate = new Date(message.createdAt).toDateString();
    const previousDate = new Date(messages[index - 1].createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner text="در حال بارگذاری پیام‌ها..." />
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">مکالمه‌ای انتخاب نشده است</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Conversation Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-sm relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(() => {
              let otherUser;
              if (selectedConversation.conversationType === 'director_talent') {
                otherUser = user.role === 'casting_director' ? selectedConversation.talent : selectedConversation.director;
              } else if (selectedConversation.conversationType === 'writer_user') {
                otherUser = (selectedConversation.initiator._id === user._id || selectedConversation.initiator.id === user._id) ? selectedConversation.recipient : selectedConversation.initiator;
              } else {
                otherUser = null;
              }
              
              if (!otherUser) {
                return (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <UserIcon className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">کاربر</h3>
                      <p className="text-sm text-gray-600">اطلاعات کاربر در دسترس نیست</p>
                    </div>
                  </div>
                );
              }
              
              // Handle different profile image structures based on user role
              let profileImage = null;
              if (otherUser.role === 'casting_director') {
                profileImage = otherUser.profileImage?.url || otherUser.profileImage;
              } else if (otherUser.role === 'talent') {
                profileImage = otherUser.headshot?.url || otherUser.headshot;
              } else {
                // For other roles, try different possible image fields
                profileImage = otherUser.profileImage?.url || otherUser.headshot?.url || otherUser.profileImage || otherUser.headshot;
              }
              
              // Handle different name structures based on user role
              let fullName = '';
              if (otherUser.role === 'casting_director') {
                fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email;
              } else if (otherUser.role === 'talent') {
                fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email;
              } else {
                // For other roles (like journalists), use displayName or fallback
                fullName = otherUser.displayName || otherUser.fullName || 
                  `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email;
              }
              
              return (
                <>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-3 border-white shadow-lg">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt={fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <UserIcon className="w-7 h-7 text-primary-600" />
                      )}
                    </div>
                    
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-sm"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-xl">
                        {fullName}
                      </h3>
                      {otherUser.identificationStatus === 'approved' && (
                        <ApprovalBadge size="sm" showText={false} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">آنلاین</span>
                      <span>•</span>
                      <span className="truncate max-w-xs">{selectedConversation.subject}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Current User Profile */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">شما:</span>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-white shadow-md">
              {(() => {
                let currentUserProfile = null;
                if (user.role === 'casting_director') {
                  currentUserProfile = profile?.profileImage?.url || profile?.profileImage;
                } else if (user.role === 'talent') {
                  currentUserProfile = profile?.headshot?.url || profile?.headshot;
                } else if (user.role === 'journalist') {
                  currentUserProfile = profile?.profileImage?.url || profile?.profileImage;
                }
                
                if (currentUserProfile) {
                  return (
                    <img 
                      src={currentUserProfile} 
                      alt="Your Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '';
                        e.target.style.display = 'none';
                      }}
                    />
                  );
                }
                
                // Fallback icon - only show if no image
                return <UserIcon className="w-5 h-5 text-primary-600" />;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                مکالمه جدید
              </h3>
              <p className="text-gray-600">
                اولین پیام خود را ارسال کنید تا مکالمه شروع شود
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const ownMessage = isOwnMessage(message);
              const showDate = shouldShowDate(message, index);
              
              return (
                <div key={message._id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={`flex ${ownMessage ? 'justify-start' : 'justify-end'} mb-4`}>
                    <div className={`flex items-end gap-3 max-w-sm lg:max-w-lg ${ownMessage ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar - always show the sender's avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                        {(() => {
                          if (ownMessage) {
                            // For own messages, show current user's profile
                            let currentUserProfile = null;
                            if (user.role === 'casting_director') {
                              currentUserProfile = profile?.profileImage?.url || profile?.profileImage;
                            } else if (user.role === 'talent') {
                              currentUserProfile = profile?.headshot?.url || profile?.headshot;
                            } else if (user.role === 'journalist') {
                              currentUserProfile = profile?.profileImage?.url || profile?.profileImage;
                            }
                            
                            if (currentUserProfile) {
                              return (
                                <img 
                                  src={currentUserProfile} 
                                  alt="Your Profile"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '';
                                    e.target.style.display = 'none';
                                  }}
                                />
                              );
                            }
                          } else {
                            // For received messages, show other user's profile
                            let otherUser;
                            if (selectedConversation.conversationType === 'director_talent') {
                              otherUser = user.role === 'casting_director' ? selectedConversation.talent : selectedConversation.director;
                            } else if (selectedConversation.conversationType === 'writer_user') {
                              otherUser = (selectedConversation.initiator._id === user._id || selectedConversation.initiator.id === user._id) ? selectedConversation.recipient : selectedConversation.initiator;
                            } else {
                              otherUser = null;
                            }
                            
                            if (otherUser) {
                              // Handle different profile image structures based on user role
                              let profileImage = null;
                              if (otherUser.role === 'casting_director') {
                                profileImage = otherUser.profileImage?.url || otherUser.profileImage;
                              } else if (otherUser.role === 'talent') {
                                profileImage = otherUser.headshot?.url || otherUser.headshot;
                              } else {
                                // For other roles, try different possible image fields
                                profileImage = otherUser.profileImage?.url || otherUser.headshot?.url || otherUser.profileImage || otherUser.headshot;
                              }
                              
                              if (profileImage) {
                                return (
                                  <img 
                                    src={profileImage} 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = '';
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                );
                              }
                            }
                          }
                          
                          // Fallback icon - only show if no image
                          return <UserIcon className="w-5 h-5 text-primary-600" />;
                        })()}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`relative group ${ownMessage ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-md transition-all duration-200 ${
                          ownMessage 
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-bl-md hover:shadow-lg' 
                            : 'bg-white text-gray-800 rounded-br-md border border-gray-200/50 hover:shadow-lg hover:border-gray-300/50'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Message Time and Status */}
                        <div className={`flex items-center gap-2 mt-2 text-xs ${
                          ownMessage ? 'justify-start text-gray-500' : 'justify-end text-gray-400'
                        }`}>
                          <span className="font-medium">{formatTime(message.createdAt)}</span>
                          {ownMessage && (
                            <div className="flex items-center gap-1 group/status relative">
                              {message.isRead ? (
                                <div className="flex items-center gap-1 cursor-help">
                                  <CheckIcon className="w-3 h-3 text-blue-500" />
                                  <CheckIcon className="w-3 h-3 text-blue-500 -mr-1" />
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {message.readAt ? `خوانده شده در ${formatTime(message.readAt)}` : 'خوانده شده'}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              ) : message.isDelivered ? (
                                <div className="flex items-center gap-1 cursor-help">
                                  <CheckIcon className="w-3 h-3 text-gray-400" />
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    تحویل داده شده
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 cursor-help">
                                  <ClockIcon className="w-3 h-3 text-gray-400 animate-pulse" />
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    در حال ارسال
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicators */}
          {typingUsers.size > 0 && (
            <div className="flex justify-end mb-4">
              <div className="flex items-end gap-3 max-w-sm lg:max-w-lg flex-row-reverse">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="order-1">
                  <div className="bg-white text-gray-800 rounded-br-md border border-gray-200/50 px-4 py-3 shadow-md">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 mr-2">
                        {Array.from(typingUsers.values()).join('، ')} در حال نوشتن...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll to bottom anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Director Info Popup */}
      <DirectorInfoPopup
        isOpen={showDirectorPopup}
        onClose={() => setShowDirectorPopup(false)}
        directorId={selectedDirector?._id}
        directorName={selectedDirector ? `${selectedDirector.firstName} ${selectedDirector.lastName}` : ''}
      />

      {/* Talent Info Popup */}
      <TalentInfoPopup
        isOpen={showTalentPopup}
        onClose={() => setShowTalentPopup(false)}
        talentId={selectedTalent?.talentProfileId || selectedTalent?._id}
        talentName={selectedTalent ? `${selectedTalent.firstName} ${selectedTalent.lastName}` : ''}
      />
    </div>
  );
};

export default MessageList;
