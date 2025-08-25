import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const WriterStartConversationModal = ({ isOpen, onClose, user }) => {
  const { startConversation } = useMessaging();
  const [formData, setFormData] = useState({
    subject: '',
    initialMessage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.initialMessage.trim()) {
      toast.error('لطفاً موضوع و پیام اولیه را وارد کنید');
      return;
    }

    setSubmitting(true);
    
    try {
      await startConversation(
        user._id,
        formData.subject.trim(),
        formData.initialMessage.trim()
      );

      toast.success('مکالمه با موفقیت ایجاد شد!');
      setFormData({ subject: '', initialMessage: '' });
      onClose();
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.response?.data?.error || 'خطا در ایجاد مکالمه. لطفاً دوباره تلاش کنید.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({ subject: '', initialMessage: '' });
      onClose();
    }
  };

  const getRoleText = (role) => {
    const roleConfig = {
      talent: 'استعداد',
      casting_director: 'کارگردان کستینگ',
      journalist: 'نویسنده',
      admin: 'مدیر'
    };
    return roleConfig[role] || role;
  };

  const getProfileImage = () => {
    if (user.talentProfile?.headshot?.url) {
      return user.talentProfile.headshot.url;
    } else if (user.castingDirectorProfile?.profileImage?.url) {
      return user.castingDirectorProfile.profileImage.url;
    } else if (user.writerProfile?.profileImage) {
      return user.writerProfile.profileImage;
    }
    return null;
  };

  const getUserName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">شروع مکالمه جدید</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt={getUserName()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-semibold text-lg">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getUserName()}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {getRoleText(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                موضوع مکالمه *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="موضوع مکالمه را وارد کنید..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={submitting}
              />
            </div>

            {/* Initial Message */}
            <div>
              <label htmlFor="initialMessage" className="block text-sm font-medium text-gray-700 mb-2">
                پیام اولیه *
              </label>
              <textarea
                id="initialMessage"
                value={formData.initialMessage}
                onChange={(e) => setFormData({ ...formData, initialMessage: e.target.value })}
                placeholder="پیام اولیه خود را بنویسید..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  شروع مکالمه
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriterStartConversationModal;
