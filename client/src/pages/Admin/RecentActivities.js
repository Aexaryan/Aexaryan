import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  CalendarIcon, UsersIcon, BriefcaseIcon, DocumentTextIcon,
  ExclamationTriangleIcon, ChartBarIcon, FunnelIcon, PrinterIcon,
  ArrowDownTrayIcon, EyeIcon, ClockIcon, UserIcon
} from '@heroicons/react/24/outline';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    user: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/activities');
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (filters.startDate) {
      filtered = filtered.filter(activity => 
        new Date(activity.createdAt) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(activity => 
        new Date(activity.createdAt) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    if (filters.user) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', type: '', user: '' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return <UsersIcon className="w-5 h-5 text-blue-600" />;
      case 'casting_created': return <BriefcaseIcon className="w-5 h-5 text-green-600" />;
      case 'application_submitted': return <DocumentTextIcon className="w-5 h-5 text-purple-600" />;
      case 'user_suspended': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default: return <ChartBarIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityTypeText = (type) => {
    switch (type) {
      case 'user_registration': return 'ثبت نام کاربر';
      case 'casting_created': return 'ایجاد کستینگ';
      case 'application_submitted': return 'ارسال درخواست';
      case 'user_suspended': return 'تعلیق کاربر';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'همین الان';
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} روز پیش`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} هفته پیش`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ماه پیش`;
  };

  const exportToCSV = () => {
    const headers = ['نوع فعالیت', 'توضیحات', 'تاریخ', 'زمان'];
    const csvContent = [
      headers.join(','),
      ...filteredActivities.map(activity => [
        getActivityTypeText(activity.type),
        activity.description,
        formatDate(activity.createdAt),
        getTimeAgo(activity.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `فعالیت‌های_اخیر_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const printActivities = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>گزارش فعالیت‌های اخیر</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .activity-item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .activity-type { font-weight: bold; color: #333; }
          .activity-description { margin: 5px 0; }
          .activity-date { color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>گزارش فعالیت‌های اخیر</h1>
          <p>تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}</p>
          <p>تعداد فعالیت‌ها: ${filteredActivities.length}</p>
        </div>
        
        <h2>فیلترهای اعمال شده:</h2>
        <p>از تاریخ: ${filters.startDate || 'همه'}</p>
        <p>تا تاریخ: ${filters.endDate || 'همه'}</p>
        <p>نوع فعالیت: ${filters.type ? getActivityTypeText(filters.type) : 'همه'}</p>
        <p>جستجو: ${filters.user || 'همه'}</p>
        
        <h2>فعالیت‌ها:</h2>
        ${filteredActivities.map(activity => `
          <div class="activity-item">
            <div class="activity-type">${getActivityTypeText(activity.type)}</div>
            <div class="activity-description">${activity.description}</div>
            <div class="activity-date">${formatDate(activity.createdAt)}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری فعالیت‌ها..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">فعالیت‌های اخیر</h1>
        <p className="text-gray-600">مشاهده و مدیریت فعالیت‌های پلتفرم</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600 ml-2" />
          <h2 className="text-lg font-semibold text-gray-900">فیلترها</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">از تاریخ</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع فعالیت</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="">همه</option>
              <option value="user_registration">ثبت نام کاربر</option>
              <option value="casting_created">ایجاد کستینگ</option>
              <option value="application_submitted">ارسال درخواست</option>
              <option value="user_suspended">تعلیق کاربر</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder="جستجو در توضیحات..."
              className="input-field"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <button onClick={clearFilters} className="btn-secondary">
            پاک کردن فیلترها
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="btn-outline flex items-center">
              <ArrowDownTrayIcon className="w-4 h-4 ml-2" />
              دانلود CSV
            </button>
            <button onClick={printActivities} className="btn-outline flex items-center">
              <PrinterIcon className="w-4 h-4 ml-2" />
              چاپ گزارش
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              فعالیت‌ها ({filteredActivities.length} مورد)
            </h2>
            <div className="text-sm text-gray-500">
              آخرین به‌روزرسانی: {new Date().toLocaleTimeString('fa-IR')}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {getActivityTypeText(activity.type)}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="w-4 h-4 ml-1" />
                          {getTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-2">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                هیچ فعالیتی یافت نشد
              </h3>
              <p className="text-gray-500">
                {Object.values(filters).some(v => v) 
                  ? 'فیلترهای خود را تغییر دهید'
                  : 'هنوز فعالیتی در سیستم ثبت نشده است'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
