import React from 'react';
import { InformationCircleIcon, UsersIcon, GlobeAltIcon, HeartIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '../../components/Common/Breadcrumb';
import FooterPageNavigation from '../../components/Footer/FooterPageNavigation';
import BackToTop from '../../components/Common/BackToTop';
import FloatingActionMenu from '../../components/Footer/FloatingActionMenu';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'درباره ما', href: '/about' }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">درباره کستینگ پلت</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          پلتفرم پیشرفته برای اتصال استعدادها و کارگردانان کستینگ در صنعت سینما و تلویزیون ایران
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ماموریت ما</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            کستینگ پلت با هدف تسهیل فرآیند یافتن استعدادهای مناسب برای پروژه‌های سینمایی و تلویزیونی تأسیس شده است. 
            ما معتقدیم که هر استعداد شایسته‌ای باید فرصت نمایش توانایی‌های خود را داشته باشد.
          </p>
          <p className="text-gray-700 leading-relaxed">
            از سوی دیگر، کارگردانان و تهیه‌کنندگان نیز باید به راحتی بتوانند استعدادهای مناسب را برای پروژه‌های خود پیدا کنند.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">چشم‌انداز ما</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            تبدیل شدن به بزرگترین و معتبرترین پلتفرم کستینگ در ایران و منطقه، 
            با ارائه خدمات با کیفیت و ابزارهای پیشرفته برای تمامی فعالان صنعت سینما و تلویزیون.
          </p>
          <p className="text-gray-700 leading-relaxed">
            ما در تلاش هستیم تا با استفاده از فناوری‌های نوین، تجربه‌ای منحصر به فرد برای کاربران خود فراهم کنیم.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">ارزش‌های ما</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">جامعه‌محور</h3>
            <p className="text-gray-600 text-sm">
              ایجاد جامعه‌ای پویا از استعدادها و کارگردانان
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <InformationCircleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">شفافیت</h3>
            <p className="text-gray-600 text-sm">
              ارائه اطلاعات شفاف و قابل اعتماد
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GlobeAltIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">دسترسی آسان</h3>
            <p className="text-gray-600 text-sm">
              فراهم‌سازی دسترسی آسان برای همه
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">کیفیت</h3>
            <p className="text-gray-600 text-sm">
              ارائه خدمات با بالاترین کیفیت
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">آمار و ارقام</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">۱۰۰۰+</div>
            <div className="text-gray-600">استعداد ثبت‌شده</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">۵۰۰+</div>
            <div className="text-gray-600">کارگردان فعال</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">۲۰۰۰+</div>
            <div className="text-gray-600">کستینگ موفق</div>
          </div>
        </div>
      </div>
      
      <FooterPageNavigation />
      <BackToTop />
      <FloatingActionMenu />
    </div>
  );
};

export default AboutPage;
