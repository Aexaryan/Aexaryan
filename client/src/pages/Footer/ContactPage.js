import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Common/Breadcrumb';
import FooterPageNavigation from '../../components/Footer/FooterPageNavigation';
import BackToTop from '../../components/Common/BackToTop';
import FloatingActionMenu from '../../components/Footer/FloatingActionMenu';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('پیام شما با موفقیت ارسال شد. در اسرع وقت با شما تماس خواهیم گرفت.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'تماس با ما', href: '/contact' }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">تماس با ما</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ما آماده پاسخگویی به سوالات و پیشنهادات شما هستیم
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">اطلاعات تماس</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">ایمیل</h3>
                <p className="text-gray-600">info@castingplatform.ir</p>
                <p className="text-gray-600">support@castingplatform.ir</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <PhoneIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">تلفن</h3>
                <p className="text-gray-600">۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p className="text-gray-600">۰۹۱۲-۱۲۳-۴۵۶۷</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">آدرس</h3>
                <p className="text-gray-600">
                  تهران، خیابان ولیعصر، پلاک ۱۲۳<br />
                  ساختمان کستینگ پلت، طبقه ۴
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClockIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">ساعات کاری</h3>
                <p className="text-gray-600">شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر</p>
                <p className="text-gray-600">پنجشنبه: ۹ صبح تا ۱ ظهر</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">شبکه‌های اجتماعی</h3>
            <div className="flex gap-4">
              <a href="https://twitter.com/castingplatform" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
                <span className="text-primary-600 font-bold">ت</span>
              </a>
              <a href="https://instagram.com/castingplatform" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
                <span className="text-primary-600 font-bold">ا</span>
              </a>
              <a href="https://linkedin.com/company/castingplatform" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
                <span className="text-primary-600 font-bold">ل</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">ارسال پیام</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="نام خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ایمیل خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                موضوع *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="موضوع پیام خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                پیام *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="پیام خود را بنویسید..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
            </button>
          </form>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">موقعیت ما</h2>
        <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-600">نقشه موقعیت دفتر مرکزی</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">لینک‌های مفید</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات بیشتر</h3>
            <div className="space-y-2">
              <a href="/about" className="block text-primary-600 hover:text-primary-700 transition-colors">درباره ما</a>
              <a href="/faq" className="block text-primary-600 hover:text-primary-700 transition-colors">سوالات متداول</a>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">قوانین و مقررات</h3>
            <div className="space-y-2">
              <a href="/terms" className="block text-primary-600 hover:text-primary-700 transition-colors">شرایط استفاده</a>
              <a href="/privacy" className="block text-primary-600 hover:text-primary-700 transition-colors">حریم خصوصی</a>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">بازگشت</h3>
            <div className="space-y-2">
              <a href="/" className="block text-primary-600 hover:text-primary-700 transition-colors">صفحه اصلی</a>
            </div>
          </div>
        </div>
      </div>
      
      <FooterPageNavigation />
      <BackToTop />
      <FloatingActionMenu />
    </div>
  );
};

export default ContactPage;
