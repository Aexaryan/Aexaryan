import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const WriterSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Profile Settings
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    
    // Notification Settings
    emailNotifications: {
      newComments: true,
      articleApprovals: true,
      newsApprovals: true,
      systemUpdates: true,
      weeklyDigest: false
    },
    
    // Security Settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    
    // Writing Preferences
    defaultCategory: 'general',
    autoSave: true,
    autoSaveInterval: 5,
    spellCheck: true,
    wordCount: true,
    readingTime: true
  });

  useEffect(() => {
    fetchWriterSettings();
  }, []);

  const fetchWriterSettings = async () => {
    try {
      const response = await api.get('/api/writer/settings');
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching writer settings:', error);
      // Set default values from user data
      setFormData(prev => ({
        ...prev,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      let dataToSend = {};
      
      switch (section) {
        case 'profile':
          dataToSend = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            bio: formData.bio,
            website: formData.website,
            socialMedia: formData.socialMedia
          };
          break;
        case 'notifications':
          dataToSend = { emailNotifications: formData.emailNotifications };
          break;
        case 'security':
          if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
            setSaving(false);
            return;
          }
          dataToSend = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            twoFactorAuth: formData.twoFactorAuth
          };
          break;
        case 'privacy':
          dataToSend = {
            profileVisibility: formData.profileVisibility,
            showEmail: formData.showEmail,
            showPhone: formData.showPhone,
            allowMessages: formData.allowMessages
          };
          break;
        case 'preferences':
          dataToSend = {
            defaultCategory: formData.defaultCategory,
            autoSave: formData.autoSave,
            autoSaveInterval: formData.autoSaveInterval,
            spellCheck: formData.spellCheck,
            wordCount: formData.wordCount,
            readingTime: formData.readingTime
          };
          break;
        default:
          dataToSend = formData;
      }

      const response = await api.put(`/api/writer/settings/${section}`, dataToSend);
      
      if (response.data.success) {
        toast.success('تنظیمات با موفقیت ذخیره شد');
        
        // Update user context if profile was updated
        if (section === 'profile' && response.data.user) {
          updateUser(response.data.user);
        }
        
        // Clear password fields after successful save
        if (section === 'security') {
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'پروفایل', icon: UserIcon },
    { id: 'notifications', name: 'اعلان‌ها', icon: BellIcon },
    { id: 'security', name: 'امنیت', icon: ShieldCheckIcon },
    { id: 'privacy', name: 'حریم خصوصی', icon: EyeIcon },
    { id: 'preferences', name: 'تنظیمات نوشتن', icon: DocumentTextIcon }
  ];

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری تنظیمات..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات نویسنده</h1>
        <p className="text-gray-600">مدیریت تنظیمات حساب کاربری و ترجیحات</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-accent-600 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">اطلاعات شخصی</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="input-field"
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="input-field"
                      placeholder="نام خانوادگی خود را وارد کنید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field bg-gray-50"
                      placeholder="ایمیل"
                    />
                    <p className="text-xs text-gray-500 mt-1">ایمیل قابل تغییر نیست</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تلفن
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input-field"
                      placeholder="شماره تلفن"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بیوگرافی
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="درباره خودتان بنویسید..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وب‌سایت
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">شبکه‌های اجتماعی</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توییتر
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                      className="input-field"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لینکدین
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                      className="input-field"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اینستاگرام
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                      className="input-field"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('profile')}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات اعلان‌ها</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">نظرات جدید</h4>
                    <p className="text-sm text-gray-600">اعلان برای نظرات جدید روی مقالات شما</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.newComments}
                      onChange={(e) => handleInputChange('emailNotifications.newComments', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">تایید مقالات</h4>
                    <p className="text-sm text-gray-600">اعلان برای تایید یا رد مقالات</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.articleApprovals}
                      onChange={(e) => handleInputChange('emailNotifications.articleApprovals', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">تایید اخبار</h4>
                    <p className="text-sm text-gray-600">اعلان برای تایید یا رد اخبار</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.newsApprovals}
                      onChange={(e) => handleInputChange('emailNotifications.newsApprovals', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">به‌روزرسانی‌های سیستم</h4>
                    <p className="text-sm text-gray-600">اعلان برای تغییرات مهم پلتفرم</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.systemUpdates}
                      onChange={(e) => handleInputChange('emailNotifications.systemUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">خلاصه هفتگی</h4>
                    <p className="text-sm text-gray-600">ارسال خلاصه فعالیت‌های هفتگی</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.weeklyDigest}
                      onChange={(e) => handleInputChange('emailNotifications.weeklyDigest', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('notifications')}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات امنیت</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور فعلی
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="input-field pr-10"
                      placeholder="رمز عبور فعلی"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور جدید
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="input-field pr-10"
                      placeholder="رمز عبور جدید"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="input-field"
                    placeholder="تکرار رمز عبور جدید"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">احراز هویت دو مرحله‌ای</h4>
                    <p className="text-sm text-gray-600">افزایش امنیت حساب کاربری</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات حریم خصوصی</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نمایش پروفایل
                  </label>
                  <select
                    value={formData.profileVisibility}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="input-field-select"
                  >
                    <option value="public">عمومی</option>
                    <option value="private">خصوصی</option>
                    <option value="friends">فقط دوستان</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">نمایش ایمیل</h4>
                    <p className="text-sm text-gray-600">نمایش ایمیل در پروفایل عمومی</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showEmail}
                      onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">نمایش شماره تلفن</h4>
                    <p className="text-sm text-gray-600">نمایش شماره تلفن در پروفایل عمومی</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">دریافت پیام</h4>
                    <p className="text-sm text-gray-600">اجازه ارسال پیام از کاربران دیگر</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowMessages}
                      onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('privacy')}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </div>
          )}

          {/* Writing Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات نوشتن</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دسته‌بندی پیش‌فرض
                  </label>
                  <select
                    value={formData.defaultCategory}
                    onChange={(e) => handleInputChange('defaultCategory', e.target.value)}
                    className="input-field-select"
                  >
                    <option value="general">عمومی</option>
                    <option value="technology">تکنولوژی</option>
                    <option value="culture">فرهنگ و هنر</option>
                    <option value="sports">ورزش</option>
                    <option value="politics">سیاست</option>
                    <option value="economy">اقتصاد</option>
                    <option value="health">سلامت</option>
                    <option value="education">آموزش</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">ذخیره خودکار</h4>
                    <p className="text-sm text-gray-600">ذخیره خودکار محتوا در حین نوشتن</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoSave}
                      onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                {formData.autoSave && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فاصله ذخیره خودکار (ثانیه)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.autoSaveInterval}
                      onChange={(e) => handleInputChange('autoSaveInterval', parseInt(e.target.value))}
                      className="input-field w-32"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">بررسی املایی</h4>
                    <p className="text-sm text-gray-600">نمایش خطاهای املایی در حین نوشتن</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.spellCheck}
                      onChange={(e) => handleInputChange('spellCheck', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">شمارش کلمات</h4>
                    <p className="text-sm text-gray-600">نمایش تعداد کلمات در حین نوشتن</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wordCount}
                      onChange={(e) => handleInputChange('wordCount', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">زمان مطالعه</h4>
                    <p className="text-sm text-gray-600">نمایش زمان تخمینی مطالعه</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.readingTime}
                      onChange={(e) => handleInputChange('readingTime', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('preferences')}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriterSettings;
