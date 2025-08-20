# پلتفرم کستینگ پلت (Casting Platform)

یک پلتفرم جامع برای ارتباط بین استعدادها (بازیگران، مدل‌ها و غیره) و کارگردانان کستینگ که فرآیند پیدا کردن و انتخاب افراد مناسب برای پروژه‌های مختلف هنری را تسهیل می‌کند.

## ویژگی‌های کلیدی

### برای استعدادها 👩‍🎤
- **پروفایل جامع**: ایجاد پروفایل کامل با عکس‌های پرتره و گالری
- **جستجوی فرصت‌ها**: مشاهده و فیلتر کردن کستینگ‌های فعال
- **مدیریت درخواست‌ها**: ارسال درخواست و پیگیری وضعیت آن‌ها
- **آمار عملکرد**: مشاهده آمار بازدید پروفایل و نرخ موفقیت

### برای کارگردانان کستینگ 🎬
- **جستجوی پیشرفته**: یافتن استعدادهای مناسب با فیلترهای دقیق
- **مدیریت کستینگ**: ایجاد، ویرایش و مدیریت کستینگ‌ها
- **بررسی درخواست‌ها**: مشاهده و تغییر وضعیت درخواست‌های دریافتی
- **گزارش‌گیری**: دسترسی به آمار و گزارش‌های مفصل

## تکنولوژی‌های استفاده شده

### Backend
- **Node.js** + **Express.js**: سرور و API
- **MongoDB** + **Mongoose**: پایگاه داده
- **JWT**: احراز هویت
- **Cloudinary**: ذخیره‌سازی تصاویر
- **Multer**: آپلود فایل‌ها
- **Bcrypt**: رمزگذاری پسوردها

### Frontend
- **React.js**: رابط کاربری
- **Tailwind CSS**: طراحی و استایل
- **React Router**: مسیریابی
- **Axios**: ارتباط با API
- **React Hot Toast**: نمایش پیام‌ها
- **Heroicons**: آیکون‌ها

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (v16 یا بالاتر)
- MongoDB
- حساب Cloudinary (برای آپلود تصاویر)

### مراحل نصب

1. **کلون کردن پروژه**
```bash
git clone https://github.com/yourusername/casting-platform.git
cd casting-platform
```

2. **نصب وابستگی‌ها**
```bash
# نصب وابستگی‌های اصلی
npm install

# نصب وابستگی‌های سرور
cd server && npm install

# نصب وابستگی‌های کلاینت
cd ../client && npm install
```

3. **تنظیم متغیرهای محیطی**
```bash
# در پوشه server
cp .env.example .env
```

فایل `.env` را با اطلاعات خود تکمیل کنید:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/casting-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (اختیاری)
EMAIL_FROM=noreply@castingplatform.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

4. **راه‌اندازی پایگاه داده**
```bash
# MongoDB را راه‌اندازی کنید
mongod
```

5. **اجرای پروژه**
```bash
# از پوشه اصلی
npm run dev
```

این دستور هم سرور (پورت 5000) و هم کلاینت (پورت 3000) را به صورت همزمان اجرا می‌کند.

## ساختار پروژه

```
casting-platform/
├── server/                 # Backend (Node.js/Express)
│   ├── models/            # مدل‌های MongoDB
│   ├── routes/            # مسیرهای API
│   ├── middleware/        # میدلورهای Express
│   └── index.js          # فایل اصلی سرور
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # کامپوننت‌های React
│   │   ├── pages/         # صفحات اپلیکیشن
│   │   ├── contexts/      # Context API
│   │   └── App.js        # کامپوننت اصلی
│   └── public/           # فایل‌های استاتیک
└── README.md
```

## API Endpoints

### احراز هویت
- `POST /api/auth/register` - ثبت نام
- `POST /api/auth/login` - ورود
- `GET /api/auth/me` - اطلاعات کاربر
- `POST /api/auth/logout` - خروج

### استعدادها
- `GET /api/talents` - لیست استعدادها (برای کارگردانان)
- `GET /api/talents/:id` - جزئیات استعداد
- `PUT /api/talents/profile` - به‌روزرسانی پروفایل
- `GET /api/talents/me/stats` - آمار استعداد

### کستینگ‌ها
- `GET /api/castings` - لیست کستینگ‌های فعال
- `POST /api/castings` - ایجاد کستینگ جدید
- `GET /api/castings/:id` - جزئیات کستینگ
- `PUT /api/castings/:id` - ویرایش کستینگ

### درخواست‌ها
- `POST /api/applications` - ارسال درخواست
- `GET /api/applications/me` - درخواست‌های من
- `PATCH /api/applications/:id/status` - تغییر وضعیت درخواست

### آپلود فایل
- `POST /api/upload/headshot` - آپلود عکس پرتره
- `POST /api/upload/portfolio` - آپلود عکس‌های گالری
- `DELETE /api/upload/portfolio/:id` - حذف عکس از گالری

## ویژگی‌های طراحی

### پشتیبانی از RTL
اپلیکیشن به طور کامل از زبان فارسی و راست‌چین پشتیبانی می‌کند.

### طراحی واکنش‌گرا
رابط کاربری در تمام اندازه‌های صفحه (موبایل، تبلت، دسکتاپ) به خوبی کار می‌کند.

### تم رنگی
- **اصلی**: طلایی (#f59e0b)
- **ثانویه**: خاکستری تیره
- **پس‌زمینه**: سفید و خاکستری روشن

## مشارکت در پروژه

1. پروژه را Fork کنید
2. برنچ جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را Commit کنید (`git commit -m 'Add some amazing feature'`)
4. به برنچ Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request بسازید

## مجوز

این پروژه تحت مجوز MIT منتشر شده است. فایل [LICENSE](LICENSE) را برای جزئیات بیشتر مطالعه کنید.

## تماس

Alexander Aryanfar - alexander.aryanfar@gmail.com

لینک پروژه: [https://github.com/Alexaryan/casting-platform](https://github.com/Alexaryan/casting-platform)

---

## نکات مهم برای توسعه

### امنیت
- همه پسوردها با bcrypt رمزگذاری می‌شوند
- JWT برای احراز هویت استفاده می‌شود
- Rate limiting برای جلوگیری از حملات DDoS
- اعتبارسنجی داده‌ها در سمت سرور

### عملکرد
- تصاویر از Cloudinary بهینه‌سازی می‌شوند
- Lazy loading برای تصاویر
- Pagination برای لیست‌های بزرگ
- Index‌های MongoDB برای جستجوی سریع

### قابلیت توسعه
- معماری modular
- جداسازی concerns
- استفاده از Context API برای state management
- کامپوننت‌های قابل استفاده مجدد

### تست
```bash
# تست‌های backend
cd server && npm test

# تست‌های frontend
cd client && npm test
```

### دیپلوی
برای دیپلوی روی سرویس‌های cloud مثل Heroku یا Vercel، متغیرهای محیطی را تنظیم کنید و دستورات build را اجرا کنید:

```bash
# Build کردن frontend
cd client && npm run build

# اجرای production server
cd server && npm start
```