import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '../../components/Common/Breadcrumb';
import FooterPageNavigation from '../../components/Footer/FooterPageNavigation';
import BackToTop from '../../components/Common/BackToTop';
import FloatingActionMenu from '../../components/Footer/FloatingActionMenu';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'حریم خصوصی', href: '/privacy' }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">حریم خصوصی</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ما متعهد به حفظ حریم خصوصی و امنیت اطلاعات شما هستیم
        </p>
        <p className="text-sm text-gray-500 mt-4">آخرین به‌روزرسانی: ۲۲ آگوست ۲۰۲۵</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">امنیت بالا</h3>
            <p className="text-gray-600 text-sm">
              محافظت از اطلاعات با بالاترین استانداردهای امنیتی
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">شفافیت کامل</h3>
            <p className="text-gray-600 text-sm">
              اطلاع‌رسانی شفاف درباره نحوه استفاده از اطلاعات
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">دسترسی محدود</h3>
            <p className="text-gray-600 text-sm">
              دسترسی محدود و کنترل شده به اطلاعات شخصی
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">مطابقت قانونی</h3>
            <p className="text-gray-600 text-sm">
              رعایت کامل قوانین و مقررات حفاظت از داده‌ها
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">اطلاعاتی که جمع‌آوری می‌کنیم</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات شخصی</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>نام و نام خانوادگی</li>
                <li>آدرس ایمیل</li>
                <li>شماره تلفن</li>
                <li>تاریخ تولد</li>
                <li>اطلاعات پروفایل (عکس، بیوگرافی، مهارت‌ها)</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات حرفه‌ای</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>سوابق کاری و تجربیات</li>
                <li>نمونه کارها و پورتفولیو</li>
                <li>مهارت‌ها و تخصص‌ها</li>
                <li>اطلاعات شرکت و سازمان (برای کارگردانان)</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات فنی</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>آدرس IP و اطلاعات دستگاه</li>
                <li>کوکی‌ها و فایل‌های موقت</li>
                <li>لاگ‌های سیستم و فعالیت‌های کاربر</li>
                <li>اطلاعات مرورگر و سیستم عامل</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">نحوه استفاده از اطلاعات</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اهداف اصلی</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>ارائه خدمات کستینگ و اتصال استعدادها به کارگردانان</li>
                <li>بهبود تجربه کاربری و شخصی‌سازی خدمات</li>
                <li>ارتباط با کاربران و ارسال اطلاعیه‌های مهم</li>
                <li>تحلیل و بهبود عملکرد پلتفرم</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اشتراک‌گذاری اطلاعات</h3>
              <p className="text-gray-700 mb-3">
                ما اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر در موارد زیر:
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>با رضایت صریح شما</li>
                <li>برای ارائه خدمات مورد نیاز (مثل پردازش پرداخت)</li>
                <li>در صورت الزام قانونی</li>
                <li>برای محافظت از حقوق و امنیت خود و دیگران</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">امنیت اطلاعات</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              ما از روش‌های امنیتی پیشرفته برای محافظت از اطلاعات شما استفاده می‌کنیم:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>رمزگذاری SSL/TLS برای انتقال امن داده‌ها</li>
              <li>رمزگذاری داده‌ها در سرور</li>
              <li>کنترل دسترسی سختگیرانه</li>
              <li>نظارت مداوم بر سیستم‌های امنیتی</li>
              <li>به‌روزرسانی منظم نرم‌افزارها و سیستم‌ها</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">حقوق شما</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              شما دارای حقوق زیر در رابطه با اطلاعات شخصی خود هستید:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>دسترسی به اطلاعات شخصی خود</li>
              <li>تصحیح اطلاعات نادرست یا ناقص</li>
              <li>حذف اطلاعات شخصی (حق فراموشی)</li>
              <li>محدود کردن پردازش اطلاعات</li>
              <li>انتقال اطلاعات به سرویس‌های دیگر</li>
              <li>اعتراض به پردازش اطلاعات</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">کوکی‌ها و فناوری‌های مشابه</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              ما از کوکی‌ها و فناوری‌های مشابه برای بهبود تجربه کاربری استفاده می‌کنیم:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>کوکی‌های ضروری برای عملکرد سایت</li>
              <li>کوکی‌های عملکردی برای بهبود سرعت</li>
              <li>کوکی‌های تحلیلی برای درک رفتار کاربران</li>
              <li>کوکی‌های تبلیغاتی (فقط با رضایت شما)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              شما می‌توانید تنظیمات کوکی‌ها را در مرورگر خود تغییر دهید.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">تماس با ما</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              اگر سوالی درباره این سیاست حریم خصوصی دارید، با ما تماس بگیرید:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>ایمیل:</strong> privacy@castingplatform.ir</p>
              <p><strong>تلفن:</strong> ۰۲۱-۱۲۳۴۵۶۷۸</p>
              <p><strong>آدرس:</strong> تهران، خیابان ولیعصر، پلاک ۱۲۳</p>
            </div>
          </div>
        </section>
      </div>
      
      <FooterPageNavigation />
      <BackToTop />
      <FloatingActionMenu />
    </div>
  );
};

export default PrivacyPolicyPage;
