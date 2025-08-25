import React from 'react';
import { ExclamationTriangleIcon, ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const CastingWarningModal = ({
  isOpen,
  onClose,
  onConfirm,
  castingTitle = "این پروژه",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900">
                  هشدار مهم - ایمنی جامعه
                </h3>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">بستن</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Main Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-right">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      درخواست برای {castingTitle}
                    </h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      شما در حال ارسال درخواست برای شرکت در این پروژه هستید. لطفاً موارد زیر را با دقت مطالعه کنید.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-right">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        تعهد ما به ایمنی جامعه
                      </h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        ما تمام تلاش خود را می‌کنیم تا جامعه‌ای امن و قابل اعتماد ایجاد کنیم و همیشه مالکان پروژه‌ها را تأیید می‌کنیم.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-right">
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ نکته مهم
                    </h4>
                    <p className="text-red-700 text-sm leading-relaxed mb-3">
                      <strong>از آنجایی که پروژه‌های نمایش داده شده در سایت خارج از پلتفرم ما و خارج از قوانین ما انجام می‌شوند،</strong> ما به شدت توصیه می‌کنیم که هنرمندان قبل از شرکت در هر پروژه‌ای، تحقیقات لازم را انجام دهند.
                    </p>
                    <p className="text-red-700 text-sm leading-relaxed">
                      همیشه از گزارش‌دهی رفتارهای مشکوک استقبال می‌کنیم و از شما می‌خواهیم در صورت مشاهده هرگونه رفتار غیرعادی، آن را به ما اطلاع دهید.
                    </p>
                  </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-right">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🔒 مسئولیت‌پذیری
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      با ارسال این درخواست، شما تأیید می‌کنید که متوجه هستید ما مسئولیتی در قبال پروژه‌هایی که خارج از کنترل و نظارت ما انجام می‌شوند، نداریم.
                    </p>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-right">
                    <h4 className="font-semibold text-green-800 mb-2">
                      💡 نکات ایمنی
                    </h4>
                    <ul className="text-green-700 text-sm leading-relaxed space-y-1">
                      <li>• همیشه در مکان‌های عمومی و امن ملاقات کنید</li>
                      <li>• اطلاعات شخصی خود را با احتیاط به اشتراک بگذارید</li>
                      <li>• در صورت احساس ناامنی، فوراً محل را ترک کنید</li>
                      <li>• هرگونه رفتار مشکوک را به ما گزارش دهید</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ارسال...
                </>
              ) : (
                'تأیید و ارسال درخواست'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastingWarningModal;
