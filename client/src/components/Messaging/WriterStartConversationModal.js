import React, { useState } from 'react';
import { useMessaging } from '../../contexts/MessagingContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WriterStartConversationModal = ({ isOpen, onClose, user }) => {
  const { startConversation } = useMessaging();
  const [formData, setFormData] = useState({
    subject: '',
    initialMessage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.initialMessage.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      console.log('User data structure:', user);
      console.log('Starting conversation with:', {
        userId: user._id,
        subject: formData.subject,
        initialMessage: formData.initialMessage
      });
      
      const conversation = await startConversation(
        user._id,
        formData.subject,
        formData.initialMessage
      );
      
      console.log('Conversation created:', conversation);
      
      if (conversation) {
        setFormData({ subject: '', initialMessage: '' });
        toast.success('مکالمه با موفقیت ایجاد شد!');
        onClose();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      console.error('Error details:', error.response?.data);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.error || 'خطا در ایجاد مکالمه. لطفاً دوباره تلاش کنید.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">شروع گفتگو جدید</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">کاربر:</h3>
            <p className="text-gray-600">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.displayName || user.fullName || user.email || 'نام نامشخص'
              }
            </p>
            <p className="text-sm text-gray-500">
              {user.email || 'ایمیل نامشخص'}
            </p>
            {user.role && (
              <p className="text-sm text-gray-500">
                نقش: {user.role === 'casting_director' ? 'کارگردان کستینگ' : 
                       user.role === 'talent' ? 'استعداد' : 
                       user.role === 'journalist' ? 'نویسنده' : user.role}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موضوع *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="موضوع گفتگو..."
              required
            />
          </div>

          {/* Initial Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              پیام اولیه *
            </label>
            <textarea
              name="initialMessage"
              value={formData.initialMessage}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="پیام اولیه خود را بنویسید..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.subject.trim() || !formData.initialMessage.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'در حال ارسال...' : 'شروع گفتگو'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriterStartConversationModal;
