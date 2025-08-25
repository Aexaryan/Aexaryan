import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  UserIcon,
  FilmIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  KeyIcon,
  DatabaseIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('خطا در بارگذاری تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { settings });
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
      try {
        setSaving(true);
        const response = await api.post('/admin/settings/reset');
        setSettings(response.data.settings);
        toast.success(response.data.message);
      } catch (error) {
        console.error('Error resetting settings:', error);
        toast.error('خطا در بازگردانی تنظیمات');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری تنظیمات..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات سیستم</h1>
            <p className="text-gray-600">تنظیمات پلتفرم</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="btn-outline"
            >
              بازگردانی پیش‌فرض
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <CogIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات عمومی</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام پلتفرم
              </label>
              <input
                type="text"
                value={settings.platformName || 'کستینگ پلت'}
                onChange={(e) => handleSettingChange('platformName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل پشتیبانی
              </label>
              <input
                type="email"
                value={settings.supportEmail || 'support@castingplatform.com'}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر اندازه فایل (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize || 10}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                منطقه زمانی
              </label>
              <select
                value={settings.timezone || 'Asia/Tehran'}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="input-field-select"
              >
                <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/London">London (UTC+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات امنیتی</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداقل طول رمز عبور
              </label>
              <input
                type="number"
                value={settings.minPasswordLength || 8}
                onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدت اعتبار توکن (ساعت)
              </label>
              <input
                type="number"
                value={settings.tokenExpiryHours || 24}
                onChange={(e) => handleSettingChange('tokenExpiryHours', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.requireEmailVerification || false}
                onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="requireEmailVerification" className="mr-2 text-sm text-gray-700">
                نیاز به تایید ایمیل
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableTwoFactor"
                checked={settings.enableTwoFactor || false}
                onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="enableTwoFactor" className="mr-2 text-sm text-gray-700">
                فعال‌سازی احراز هویت دو مرحله‌ای
              </label>
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات مدیریت کاربران</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر تعداد درخواست‌ها در روز
              </label>
              <input
                type="number"
                value={settings.maxApplicationsPerDay || 10}
                onChange={(e) => handleSettingChange('maxApplicationsPerDay', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر تعداد کستینگ‌های فعال
              </label>
              <input
                type="number"
                value={settings.maxActiveCastings || 5}
                onChange={(e) => handleSettingChange('maxActiveCastings', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveUsers"
                checked={settings.autoApproveUsers || false}
                onChange={(e) => handleSettingChange('autoApproveUsers', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="autoApproveUsers" className="mr-2 text-sm text-gray-700">
                تایید خودکار کاربران جدید
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveCastings"
                checked={settings.autoApproveCastings || false}
                onChange={(e) => handleSettingChange('autoApproveCastings', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="autoApproveCastings" className="mr-2 text-sm text-gray-700">
                تایید خودکار کستینگ‌ها
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <BellIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات اعلان‌ها</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications || true}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="emailNotifications" className="mr-2 text-sm text-gray-700">
                اعلان‌های ایمیل
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={settings.pushNotifications || true}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="pushNotifications" className="mr-2 text-sm text-gray-700">
                اعلان‌های push
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminNotifications"
                checked={settings.adminNotifications || true}
                onChange={(e) => handleSettingChange('adminNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="adminNotifications" className="mr-2 text-sm text-gray-700">
                اعلان‌های ادمین
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="weeklyReports"
                checked={settings.weeklyReports || false}
                onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="weeklyReports" className="mr-2 text-sm text-gray-700">
                گزارش‌های هفتگی
              </label>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <ServerIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">اطلاعات سیستم</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نسخه سیستم
              </label>
              <input
                type="text"
                value="1.0.0"
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                آخرین بروزرسانی
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString('fa-IR')}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت پایگاه داده
              </label>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">متصل</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت سرور
              </label>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">فعال</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
