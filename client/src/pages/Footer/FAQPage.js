import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '../../components/Common/Breadcrumb';
import FooterPageNavigation from '../../components/Footer/FooterPageNavigation';
import BackToTop from '../../components/Common/BackToTop';
import FloatingActionMenu from '../../components/Footer/FloatingActionMenu';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      category: "حساب کاربری",
      items: [
        {
          question: "چگونه می‌توانم حساب کاربری ایجاد کنم؟",
          answer: "برای ایجاد حساب کاربری، روی دکمه 'ثبت نام' کلیک کنید و فرم مربوطه را پر کنید. شما باید اطلاعات شخصی، ایمیل و رمز عبور را وارد کنید."
        },
        {
          question: "آیا می‌توانم نوع حساب کاربری خود را تغییر دهم؟",
          answer: "خیر، پس از ثبت نام نمی‌توانید نوع حساب کاربری (استعداد یا کارگردان کستینگ) را تغییر دهید. برای تغییر نوع حساب، باید حساب جدیدی ایجاد کنید."
        },
        {
          question: "چگونه می‌توانم رمز عبور خود را تغییر دهم؟",
          answer: "در بخش پروفایل، گزینه 'تغییر رمز عبور' را انتخاب کنید. رمز عبور فعلی و رمز عبور جدید را وارد کنید."
        },
        {
          question: "آیا می‌توانم حساب کاربری خود را حذف کنم؟",
          answer: "بله، می‌توانید حساب کاربری خود را در بخش تنظیمات حذف کنید. توجه داشته باشید که این عمل غیرقابل بازگشت است."
        }
      ]
    },
    {
      category: "پروفایل و اطلاعات",
      items: [
        {
          question: "چه اطلاعاتی باید در پروفایل خود قرار دهم؟",
          answer: "اطلاعات کامل شامل نام، عکس، بیوگرافی، مهارت‌ها، تجربیات و نمونه کارها. هرچه اطلاعات کامل‌تر باشد، شانس موفقیت شما بیشتر است."
        },
        {
          question: "آیا می‌توانم عکس‌های متعدد در پروفایل خود قرار دهم؟",
          answer: "بله، می‌توانید عکس‌های متعدد در بخش پورتفولیو قرار دهید. این عکس‌ها به کارگردانان کمک می‌کند تا بهتر شما را ارزیابی کنند."
        },
        {
          question: "چگونه می‌توانم مهارت‌های خود را اضافه کنم؟",
          answer: "در بخش ویرایش پروفایل، قسمت مهارت‌ها را پیدا کنید و مهارت‌های خود را اضافه کنید. می‌توانید سطح تخصص هر مهارت را نیز مشخص کنید."
        }
      ]
    },
    {
      category: "کستینگ و درخواست‌ها",
      items: [
        {
          question: "چگونه می‌توانم برای یک کستینگ درخواست ارسال کنم؟",
          answer: "در صفحه جزئیات کستینگ، روی دکمه 'ارسال درخواست' کلیک کنید و فرم مربوطه را پر کنید. حتماً رزومه و نمونه کارهای خود را ضمیمه کنید."
        },
        {
          question: "آیا می‌توانم برای چندین کستینگ همزمان درخواست ارسال کنم؟",
          answer: "بله، می‌توانید برای چندین کستینگ همزمان درخواست ارسال کنید. اما توجه داشته باشید که کیفیت درخواست‌ها مهم‌تر از تعداد آنهاست."
        },
        {
          question: "چگونه می‌توانم وضعیت درخواست‌های خود را پیگیری کنم؟",
          answer: "در بخش 'درخواست‌های من' می‌توانید وضعیت تمام درخواست‌های خود را مشاهده کنید. کارگردانان از طریق پیام‌ها با شما در ارتباط خواهند بود."
        },
        {
          question: "آیا می‌توانم درخواست خود را پس بگیرم؟",
          answer: "بله، تا زمانی که کارگردان درخواست شما را بررسی نکرده باشد، می‌توانید آن را پس بگیرید."
        }
      ]
    },
    {
      category: "کارگردانان کستینگ",
      items: [
        {
          question: "چگونه می‌توانم کستینگ جدید ایجاد کنم؟",
          answer: "در داشبورد کارگردان، روی 'ایجاد کستینگ' کلیک کنید و تمام اطلاعات مورد نیاز را وارد کنید. کستینگ شما پس از تأیید منتشر خواهد شد."
        },
        {
          question: "چه اطلاعاتی باید در کستینگ قرار دهم؟",
          answer: "اطلاعات کامل پروژه، نقش مورد نیاز، شرایط کاری، مکان و زمان فیلمبرداری، حقوق و مزایا، و مهلت ارسال درخواست."
        },
        {
          question: "چگونه می‌توانم استعدادهای مناسب را پیدا کنم؟",
          answer: "از بخش 'جستجوی استعداد' استفاده کنید. می‌توانید بر اساس مهارت‌ها، سن، جنسیت و سایر معیارها جستجو کنید."
        },
        {
          question: "آیا می‌توانم کستینگ خود را ویرایش کنم؟",
          answer: "بله، تا زمانی که درخواستی برای کستینگ ارسال نشده باشد، می‌توانید آن را ویرایش کنید."
        }
      ]
    },
    {
      category: "پیام‌ها و ارتباطات",
      items: [
        {
          question: "چگونه می‌توانم با کارگردان/استعداد ارتباط برقرار کنم؟",
          answer: "کارگردانان می‌توانند از طریق پروفایل استعدادها یا لیست درخواست‌ها، پیام ارسال کنند. استعدادها نیز می‌توانند به پیام‌های دریافتی پاسخ دهند."
        },
        {
          question: "آیا پیام‌های من خصوصی هستند؟",
          answer: "بله، تمام پیام‌ها خصوصی هستند و فقط بین فرستنده و گیرنده قابل مشاهده هستند."
        },
        {
          question: "چگونه می‌توانم پیام‌های قدیمی را پیدا کنم؟",
          answer: "در بخش پیام‌ها، تمام مکالمات شما ذخیره می‌شوند و می‌توانید به آنها دسترسی داشته باشید."
        }
      ]
    },
    {
      category: "پرداخت و مالی",
      items: [
        {
          question: "آیا استفاده از پلتفرم رایگان است؟",
          answer: "استفاده پایه از پلتفرم رایگان است. برخی ویژگی‌های پیشرفته ممکن است نیاز به اشتراک داشته باشند."
        },
        {
          question: "چگونه پرداخت‌ها انجام می‌شود؟",
          answer: "پرداخت‌ها بین استعداد و کارگردان به صورت مستقیم انجام می‌شود. کستینگ پلت در این فرآیند دخالتی ندارد."
        },
        {
          question: "آیا کستینگ پلت از پرداخت‌ها کمیسیون می‌گیرد؟",
          answer: "در حال حاضر، کستینگ پلت از پرداخت‌ها کمیسیون نمی‌گیرد. تمام مبالغ مستقیماً بین طرفین رد و بدل می‌شود."
        }
      ]
    },
    {
      category: "امنیت و حریم خصوصی",
      items: [
        {
          question: "اطلاعات من چقدر امن هستند؟",
          answer: "ما از بالاترین استانداردهای امنیتی برای محافظت از اطلاعات شما استفاده می‌کنیم. تمام داده‌ها رمزگذاری شده و محفوظ هستند."
        },
        {
          question: "آیا اطلاعات من با اشخاص ثالث به اشتراک گذاشته می‌شود؟",
          answer: "خیر، ما اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر با رضایت صریح شما یا در صورت الزام قانونی."
        },
        {
          question: "چگونه می‌توانم حساب کاربری خود را امن نگه دارم؟",
          answer: "رمز عبور قوی انتخاب کنید، آن را با کسی به اشتراک نگذارید، و در صورت مشکوک شدن به نفوذ، فوراً رمز عبور خود را تغییر دهید."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'سوالات متداول', href: '/faq' }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">سوالات متداول</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          پاسخ سوالات رایج شما درباره کستینگ پلت
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">فهرست مطالب</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faqData.map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{category.category}</h3>
              <p className="text-sm text-gray-600">{category.items.length} سوال</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <QuestionMarkCircleIcon className="w-6 h-6 text-primary-600 ml-2" />
                {category.category}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {category.items.map((item, itemIndex) => {
                const globalIndex = categoryIndex * 100 + itemIndex;
                const isOpen = openItems.has(globalIndex);
                
                return (
                  <div key={itemIndex} className="px-6 py-4">
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full flex items-center justify-between text-right hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                      <span className="text-lg font-medium text-gray-900">{item.question}</span>
                      {isOpen ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="mt-4 pr-4 border-r-2 border-primary-200">
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-primary-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">هنوز سوالی دارید؟</h2>
        <p className="text-gray-600 mb-6">
          اگر پاسخ سوال خود را پیدا نکردید، با تیم پشتیبانی ما تماس بگیرید
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            تماس با ما
          </a>
          <a
            href="mailto:support@castingplatform.ir"
            className="bg-white text-primary-600 border border-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            ارسال ایمیل
          </a>
        </div>
      </div>
      
      <FooterPageNavigation />
      <BackToTop />
      <FloatingActionMenu />
    </div>
  );
};

export default FAQPage;
