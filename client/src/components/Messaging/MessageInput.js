import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../../contexts/MessagingContext';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const MessageInput = ({ conversationId }) => {
  const { sendMessage, sendTypingIndicator } = useMessaging();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    } else if (message.trim() && isTyping) {
      // Reset typing timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }, 2000); // Stop typing indicator after 2 seconds of no input
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, conversationId, sendTypingIndicator]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (isTyping) {
        sendTypingIndicator(conversationId, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, conversationId, sendTypingIndicator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, message);
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement file upload functionality
      console.log('File selected:', file);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* File Upload Button */}
        <div className="flex-shrink-0">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <PaperClipIcon className="w-5 h-5 text-gray-600" />
            </div>
          </label>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پیام خود را بنویسید..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-gray-50 focus:bg-white transition-colors"
            rows={1}
            disabled={sending}
            maxLength={1000}
          />
          
          {/* Character Count */}
          {message.length > 0 && (
            <div className="absolute bottom-2 left-3 text-xs text-gray-400">
              {message.length}/1000
            </div>
          )}
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaceSmileIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <div className="flex-shrink-0">
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="w-12 h-12 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5 transform rotate-90" />
            )}
          </button>
        </div>
      </form>

      {/* Typing Indicator */}
      {sending && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          در حال ارسال پیام...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
