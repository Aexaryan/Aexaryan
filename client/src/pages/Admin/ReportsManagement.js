import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reportType: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [currentPage, filters]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await api.get(`/admin/reports?${params}`);
      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('خطا در دریافت گزارشات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reports/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'در انتظار',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon
      },
      under_review: {
        label: 'در حال بررسی',
        color: 'bg-blue-100 text-blue-800',
        icon: EyeIcon
      },
      resolved: {
        label: 'حل شده',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
      },
      dismissed: {
        label: 'رد شده',
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon
      },
      escalated: {
        label: 'ارجاع شده',
        color: 'bg-purple-100 text-purple-800',
        icon: ExclamationTriangleIcon
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'کم', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'متوسط', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'زیاد', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'فوری', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categories = {
      inappropriate_content: 'محتوای نامناسب',
      spam: 'اسپم',
      fake_information: 'اطلاعات جعلی',
      harassment: 'آزار و اذیت',
      copyright_violation: 'نقض حق کپی‌رایت',
      technical_issue: 'مشکل فنی',
      payment_issue: 'مشکل پرداخت',
      safety_concern: 'نگرانی امنیتی',
      other: 'سایر'
    };
    return categories[category] || category;
  };

  const getReportTypeLabel = (type) => {
    const types = {
      casting: 'کستینگ',
      user: 'کاربر',
      application: 'درخواست',
      system: 'سیستم',
      other: 'سایر'
    };
    return types[type] || type;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری گزارشات..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FlagIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت گزارشات</h1>
            <p className="text-gray-600">بررسی و مدیریت گزارشات کاربران</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کل گزارشات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <FlagIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">در انتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">فوری</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgentReports}</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">امروز</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayReports}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">جستجو</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="جستجو در عنوان، توضیحات یا شماره گزارش"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field-select"
            >
              <option value="">همه</option>
              <option value="pending">در انتظار</option>
              <option value="under_review">در حال بررسی</option>
              <option value="resolved">حل شده</option>
              <option value="dismissed">رد شده</option>
              <option value="escalated">ارجاع شده</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input-field-select"
            >
              <option value="">همه</option>
              <option value="low">کم</option>
              <option value="medium">متوسط</option>
              <option value="high">زیاد</option>
              <option value="urgent">فوری</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع</label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="input-field-select"
            >
              <option value="">همه</option>
              <option value="casting">کستینگ</option>
              <option value="user">کاربر</option>
              <option value="application">درخواست</option>
              <option value="system">سیستم</option>
              <option value="other">سایر</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field-select"
          >
            <option value="">همه</option>
            <option value="inappropriate_content">محتوای نامناسب</option>
            <option value="spam">اسپم</option>
            <option value="fake_information">اطلاعات جعلی</option>
            <option value="harassment">آزار و اذیت</option>
            <option value="copyright_violation">نقض حق کپی‌رایت</option>
            <option value="technical_issue">مشکل فنی</option>
            <option value="payment_issue">مشکل پرداخت</option>
            <option value="safety_concern">نگرانی امنیتی</option>
            <option value="other">سایر</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">گزارشی یافت نشد</h3>
            <p className="text-gray-600">هیچ گزارشی با فیلترهای انتخاب شده یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره گزارش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    گزارش‌دهنده
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دسته‌بندی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اولویت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.reportNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {report.reporter?.firstName} {report.reporter?.lastName}
                        </div>
                        <div className="text-gray-500">{report.reporter?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={report.title}>
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getReportTypeLabel(report.reportType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryLabel(report.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/reports/${report._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
