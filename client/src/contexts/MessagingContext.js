import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const MessagingContext = createContext();

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      console.log('Fetching conversations...');
      const response = await api.get('/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Conversations response:', response.data);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.response?.data);
    }
  }, [user, token]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      const response = await api.get('/messages/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user, token]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId || !token) return;
    
    try {
      setLoading(true);
      console.log('Fetching messages for conversation:', conversationId);
      const response = await api.get(`/messages/conversations/${conversationId}?page=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Messages response:', response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Send a message
  const sendMessage = async (conversationId, content) => {
    if (!conversationId || !content.trim() || !token) return;
    
    try {
      console.log('Sending message to conversation:', conversationId);
      console.log('Message content:', content);
      
      const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        content: content.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Send message response:', response.data);
      
      // Add the new message to the current messages
      setMessages(prev => [...prev, response.data.message]);
      
      // Update the conversation's last message
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, lastMessage: response.data.message.content, lastMessageAt: new Date() }
          : conv
      ));
      
      return response.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  // Start a new conversation (for directors and writers)
  const startConversation = async (recipientId, subject, initialMessage, castingId = null) => {
    if (!recipientId || !subject || !initialMessage || !token) return;
    
    // Only directors and writers can start conversations
    if (user.role !== 'casting_director' && user.role !== 'journalist') {
      throw new Error('فقط کارگردانان کستینگ و نویسندگان می‌توانند مکالمه شروع کنند');
    }
    
    try {
      // Use unified endpoint for both directors and writers
      const response = await api.post('/messages/conversations', {
        recipientId,
        subject,
        initialMessage,
        castingId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add the new conversation to the list
      setConversations(prev => [response.data.conversation, ...prev]);
      
      return response.data.conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId) => {
    if (!conversationId || !token) return;
    
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update conversations to mark as read
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
      // Update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Close a conversation
  const closeConversation = async (conversationId) => {
    if (!conversationId || !token) {
      console.error('Missing conversationId or token:', { conversationId, hasToken: !!token });
      return;
    }
    
    try {
      console.log('Sending close request for conversation:', conversationId);
      const response = await api.patch(`/messages/conversations/${conversationId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Close response:', response.data);
      
      // Remove the conversation from the list (since we only show active conversations)
      setConversations(prev => {
        const filtered = prev.filter(conv => conv._id !== conversationId);
        console.log('Updated conversations list:', filtered.length, 'conversations');
        return filtered;
      });
      
      // If this was the selected conversation, clear the selection
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      
      // Update unread count
      fetchUnreadCount();
      
      return true;
    } catch (error) {
      console.error('Error closing conversation:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  // Delete a conversation (permanently remove from database)
  const deleteConversation = async (conversationId) => {
    if (!conversationId || !token) {
      console.error('Missing conversationId or token:', { conversationId, hasToken: !!token });
      return;
    }
    
    try {
      console.log('Sending delete request for conversation:', conversationId);
      const response = await api.delete(`/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      
      // Remove the conversation from the list
      setConversations(prev => {
        const filtered = prev.filter(conv => conv._id !== conversationId);
        console.log('Updated conversations list:', filtered.length, 'conversations');
        return filtered;
      });
      
      // If this was the selected conversation, clear the selection
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      
      // Update unread count
      fetchUnreadCount();
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  // Select a conversation
  const selectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    } else {
      setMessages([]);
      setTypingUsers(new Map());
    }
  };

  // Send typing indicator (placeholder for future implementation)
  const sendTypingIndicator = (conversationId, isTyping) => {
    // Typing indicators will be implemented with polling or server-sent events in the future
    console.log('Typing indicator:', isTyping ? 'start' : 'stop', 'for conversation:', conversationId);
  };

  // Get selected conversation
  const selectedConversation = conversations.find(conv => conv._id === selectedConversationId);

  // Initial data fetch
  useEffect(() => {
    if (user && token) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [user, token]); // Removed fetchConversations and fetchUnreadCount to prevent infinite loop

  // Cleanup when conversation changes
  useEffect(() => {
    // Cleanup function for conversation changes
    return () => {
      // Any cleanup needed when conversation changes
    };
  }, [selectedConversationId]);

  const value = {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    unreadCount,
    loading,
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    selectConversation,
    markAsRead,
    closeConversation,
    deleteConversation,
    sendTypingIndicator
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
