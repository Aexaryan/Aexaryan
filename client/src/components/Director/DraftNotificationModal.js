import React from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const DraftNotificationModal = ({ isOpen, onClose, castingId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">کستینگ ذخیره شد!</h3>
              <p className="text-blue-100 text-sm">کستینگ شما به عنوان پیش‌نویس ذخیره شد</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">کستینگ با موفقیت ذخیره شد</h4>
            <p className="text-gray-600">
              کستینگ شما به عنوان پیش‌نویس ذخیره شده و در حال حاضر فقط برای شما قابل مشاهده است.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 mb-3">مراحل بعدی:</h5>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>بازبینی کستینگ:</strong> کستینگ خود را بررسی کنید و در صورت نیاز تغییرات اعمال کنید
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>انتشار کستینگ:</strong> وقتی آماده شدید، کستینگ را منتشر کنید تا استعدادها بتوانند درخواست دهند
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <EyeIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">توجه مهم:</p>
                <p>کستینگ‌های پیش‌نویس برای استعدادها قابل مشاهده نیستند. برای دریافت درخواست، حتماً کستینگ را منتشر کنید.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            بستن
          </button>
          <div className="flex gap-3">
            <Link
              to="/director/my-castings"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              مشاهده کستینگ‌ها
            </Link>
            {castingId && (
              <Link
                to={`/director/edit-casting/${castingId}`}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <ArrowRightIcon className="w-4 h-4" />
                ویرایش کستینگ
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftNotificationModal;
