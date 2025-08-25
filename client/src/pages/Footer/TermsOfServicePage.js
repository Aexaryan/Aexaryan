import React from 'react';
import { DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon, ScaleIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '../../components/Common/Breadcrumb';
import FooterPageNavigation from '../../components/Footer/FooterPageNavigation';
import BackToTop from '../../components/Common/BackToTop';
import FloatingActionMenu from '../../components/Footer/FloatingActionMenu';

const TermsOfServicePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'شرایط استفاده', href: '/terms' }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">شرایط استفاده از خدمات</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          لطفاً این شرایط را با دقت مطالعه کنید
        </p>
        <p className="text-sm text-gray-500 mt-4">آخرین به‌روزرسانی: ۲۲ آگوست ۲۰۲۵</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">قوانین شفاف</h3>
            <p className="text-gray-600 text-sm">
              شرایط استفاده واضح و قابل فهم
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">تضمین کیفیت</h3>
            <p className="text-gray-600 text-sm">
              ارائه خدمات با کیفیت و قابل اعتماد
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">مسئولیت‌پذیری</h3>
            <p className="text-gray-600 text-sm">
              تعریف واضح مسئولیت‌ها و تعهدات
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScaleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">عدالت</h3>
            <p className="text-gray-600 text-sm">
              برابری و عدالت برای تمام کاربران
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۱. پذیرش شرایط</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              با استفاده از خدمات کستینگ پلت، شما موافقت می‌کنید که:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>حداقل ۱۸ سال سن دارید یا با رضایت والدین/سرپرست قانونی از خدمات استفاده می‌کنید</li>
              <li>اطلاعات دقیق و صحیح در پروفایل خود ارائه می‌دهید</li>
              <li>مسئولیت حفظ امنیت حساب کاربری خود را بر عهده می‌گیرید</li>
              <li>از خدمات مطابق با قوانین و مقررات استفاده می‌کنید</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۲. تعریف خدمات</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              کستینگ پلت پلتفرمی است که خدمات زیر را ارائه می‌دهد:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>ایجاد پروفایل برای استعدادها و کارگردانان کستینگ</li>
              <li>انتشار فرصت‌های کستینگ و جستجوی استعدادها</li>
              <li>ارتباط بین استعدادها و کارگردانان</li>
              <li>مدیریت درخواست‌ها و مکالمات</li>
              <li>ارائه ابزارهای تحلیلی و گزارش‌گیری</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۳. مسئولیت‌های کاربران</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">استعدادها</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>ارائه اطلاعات دقیق و به‌روز در پروفایل</li>
                <li>ارسال درخواست‌های مناسب و مرتبط</li>
                <li>رعایت زمان‌بندی و تعهدات کاری</li>
                <li>حفظ حرفه‌ای‌گری در ارتباطات</li>
                <li>رعایت قوانین کپی‌رایت و مالکیت معنوی</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">کارگردانان کستینگ</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>ارائه اطلاعات دقیق درباره پروژه‌ها</li>
                <li>پرداخت منصفانه و به موقع</li>
                <li>رعایت شرایط کاری ایمن و مناسب</li>
                <li>ارتباط محترمانه با استعدادها</li>
                <li>رعایت قوانین کار و استخدام</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۴. محتوای ممنوع</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              کاربران مجاز به انتشار محتوای زیر نیستند:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>محتوای توهین‌آمیز، تهدیدکننده یا آزاردهنده</li>
              <li>اطلاعات نادرست یا گمراه‌کننده</li>
              <li>محتوای غیرقانونی یا نقض‌کننده حقوق دیگران</li>
              <li>اسپم یا محتوای تبلیغاتی غیرمجاز</li>
              <li>محتوای جنسی یا نامناسب</li>
              <li>اطلاعات شخصی دیگران بدون رضایت</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۵. مالکیت معنوی</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              در رابطه با مالکیت معنوی:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>کاربران مالک محتوای ارسالی خود هستند</li>
              <li>کستینگ پلت مجوز استفاده از محتوا برای ارائه خدمات را دارد</li>
              <li>استفاده غیرمجاز از محتوای دیگران ممنوع است</li>
              <li>نقض حقوق مالکیت معنوی منجر به تعلیق حساب می‌شود</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۶. محدودیت مسئولیت</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              کستینگ پلت مسئولیت‌های زیر را ندارد:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>کیفیت کار یا خدمات ارائه شده توسط کاربران</li>
              <li>اختلافات بین استعدادها و کارگردانان</li>
              <li>خسارات ناشی از استفاده نادرست از خدمات</li>
              <li>مشکلات فنی خارج از کنترل ما</li>
              <li>اطلاعات نادرست ارائه شده توسط کاربران</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۷. تعلیق و لغو حساب</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              کستینگ پلت حق تعلیق یا لغو حساب کاربران را در موارد زیر دارد:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>نقض شرایط استفاده</li>
              <li>فعالیت‌های کلاهبرداری یا فریبکارانه</li>
              <li>آزار و اذیت دیگر کاربران</li>
              <li>انتشار محتوای ممنوع</li>
              <li>عدم فعالیت طولانی‌مدت</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۸. تغییرات شرایط</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              کستینگ پلت حق تغییر این شرایط را محفوظ می‌دارد. تغییرات مهم از طریق:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>اعلامیه در وب‌سایت</li>
              <li>ایمیل به کاربران</li>
              <li>اعلان در اپلیکیشن</li>
            </ul>
            <p className="text-gray-700 mt-4">
              ادامه استفاده از خدمات پس از تغییرات، به معنای پذیرش شرایط جدید است.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۹. قانون حاکم</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              این شرایط تابع قوانین جمهوری اسلامی ایران است. هرگونه اختلاف از طریق:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>مذاکره و حل و فصل دوستانه</li>
              <li>داوری در صورت توافق طرفین</li>
              <li>مراجع قضایی صالح</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">۱۰. تماس با ما</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              برای سوالات درباره این شرایط، با ما تماس بگیرید:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>ایمیل:</strong> legal@castingplatform.ir</p>
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

export default TermsOfServicePage;
