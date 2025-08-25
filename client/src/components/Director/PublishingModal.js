import React from 'react';
import { 
  EyeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const PublishingModal = ({ isOpen, onClose, onPublish, onSaveDraft, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">انتشار کستینگ</h3>
              <p className="text-primary-100 text-sm">انتخاب کنید که چگونه کستینگ خود را ذخیره کنید</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Publish Option */}
          <div className="border-2 border-primary-200 rounded-xl p-4 hover:border-primary-300 transition-colors cursor-pointer bg-primary-50/30"
               onClick={() => onPublish()}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <EyeIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">انتشار فوری</h4>
                <p className="text-sm text-gray-600 mb-2">
                  کستینگ شما بلافاصله برای استعدادها قابل مشاهده خواهد بود
                </p>
                <div className="flex items-center gap-2 text-xs text-primary-600">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>توصیه شده برای کستینگ‌های آماده</span>
                </div>
              </div>
            </div>
          </div>

          {/* Draft Option */}
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors cursor-pointer"
               onClick={() => onSaveDraft()}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">ذخیره به عنوان پیش‌نویس</h4>
                <p className="text-sm text-gray-600 mb-2">
                  کستینگ شما ذخیره می‌شود اما برای استعدادها قابل مشاهده نخواهد بود
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>می‌توانید بعداً آن را منتشر کنید</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">نکته مهم:</p>
                <p>کستینگ‌های پیش‌نویس فقط برای شما قابل مشاهده هستند. برای اینکه استعدادها بتوانند درخواست دهند، باید کستینگ را منتشر کنید.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <div className="text-xs text-gray-500">
            {loading ? 'در حال پردازش...' : 'انتخاب کنید'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishingModal;
