import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyReports = () => {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'against'

  // Determine the base route based on current location
  const isDirector = location.pathname.includes('/director');
  const baseRoute = isDirector ? '/director' : '/talent';

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [currentPage, statusFilter, activeTab]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });

      let endpoint = '/reports';
      if (activeTab === 'against') {
        endpoint = '/reports/against-me';
      }

      const response = await api.get(`${endpoint}?${params}`);
      setReports(response.data.reports || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`خطا در دریافت گزارشات: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if there's an error
      setStats({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        recentReports: 0,
        reportsAgainstMe: 0,
        pendingReportsAgainstMe: 0
      });
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این گزارش را حذف کنید؟')) {
      return;
    }

    try {
      await api.delete(`/reports/${reportId}`);
      toast.success('گزارش با موفقیت حذف شد');
      fetchReports();
      fetchStats();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('خطا در حذف گزارش');
    }
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

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری گزارشات..." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FlagIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">گزارشات من</h1>
            <p className="text-gray-600">مدیریت و پیگیری گزارشات ارسالی</p>
          </div>
        </div>

        {/* Stats */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">گزارشات ارسالی</p>
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
                  <p className="text-sm font-medium text-gray-600">حل شده</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">هفته گذشته</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.recentReports}</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">گزارشات علیه من</p>
                  <p className="text-2xl font-bold text-red-600">{stats.reportsAgainstMe}</p>
                </div>
                <FlagIcon className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReportsAgainstMe}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">گزارشات ارسالی</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <FlagIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">در انتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حل شده</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">هفته گذشته</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">گزارشات علیه من</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <FlagIcon className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'created'
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            گزارشات ارسالی من
          </button>
          <button
            onClick={() => setActiveTab('against')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'against'
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            گزارشات علیه من
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">فیلتر وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">همه</option>
              <option value="pending">در انتظار</option>
              <option value="under_review">در حال بررسی</option>
              <option value="resolved">حل شده</option>
              <option value="dismissed">رد شده</option>
              <option value="escalated">ارجاع شده</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">گزارشی یافت نشد</h3>
            <p className="text-gray-600">
              {activeTab === 'created' 
                ? 'هنوز هیچ گزارشی ارسال نکرده‌اید.' 
                : 'هیچ گزارشی علیه شما ارسال نشده است. این بدان معنی است که هیچ کس شما، محتوای شما، یا فعالیت‌های شما را گزارش نکرده است.'}
            </p>
            {activeTab === 'against' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ این یک نشانه خوب است! هیچ گزارشی علیه شما وجود ندارد.
                </p>
              </div>
            )}
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
                    عنوان
                  </th>
                  {activeTab === 'against' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      گزارش‌دهنده
                    </th>
                  )}
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
                      <div className="max-w-xs truncate" title={report.title}>
                        {report.title}
                      </div>
                    </td>
                    {activeTab === 'against' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reporter?.firstName} {report.reporter?.lastName}
                      </td>
                    )}
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
                      <div className="flex items-center gap-2">
                        <Link
                          to={`${baseRoute}/reports/${report._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

export default MyReports;
