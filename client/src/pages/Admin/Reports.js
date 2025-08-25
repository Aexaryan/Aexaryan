import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  FilmIcon,
  DocumentTextIcon,
  FlagIcon,
  TrashIcon,
  BanIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReports, setSelectedReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : '',
        type: typeFilter !== 'all' ? typeFilter : ''
      });

      const response = await api.get(`/admin/reports?${params}`);
      setReports(response.data.reports || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('خطا در بارگذاری گزارشات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/admin/reports/${reportId}/status`, { status: newStatus });
      toast.success('وضعیت گزارش با موفقیت تغییر یافت');
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('خطا در تغییر وضعیت گزارش');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) {
      toast.error('لطفاً گزارشات را انتخاب کنید');
      return;
    }

    try {
      await api.post('/admin/reports/bulk-action', {
        reportIds: selectedReports,
        action: action
      });
      toast.success('عملیات با موفقیت انجام شد');
      setSelectedReports([]);
      fetchReports();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'در انتظار بررسی', class: 'bg-yellow-100 text-yellow-800' },
      reviewed: { text: 'بررسی شده', class: 'bg-blue-100 text-blue-800' },
      resolved: { text: 'حل شده', class: 'bg-green-100 text-green-800' },
      dismissed: { text: 'رد شده', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'user':
        return <UserIcon className="w-5 h-5 text-red-600" />;
      case 'casting':
        return <FilmIcon className="w-5 h-5 text-orange-600" />;
      case 'application':
        return <DocumentTextIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <FlagIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeText = (type) => {
    const typeMap = {
      user: 'کاربر',
      casting: 'کستینگ',
      application: 'درخواست',
      content: 'محتوا'
    };
    return typeMap[type] || type;
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { text: 'کم', class: 'bg-green-100 text-green-800' },
      medium: { text: 'متوسط', class: 'bg-yellow-100 text-yellow-800' },
      high: { text: 'زیاد', class: 'bg-red-100 text-red-800' },
      critical: { text: 'بحرانی', class: 'bg-red-200 text-red-900' }
    };

    const config = severityConfig[severity] || severityConfig.medium;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری گزارشات..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">گزارشات و نظارت</h1>
            <p className="text-gray-600">گزارشات تخلف و محتوای نامناسب</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('review')}
              disabled={selectedReports.length === 0}
              className="btn-outline disabled:opacity-50"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              بررسی انتخاب شده
            </button>
            <button
              onClick={() => handleBulkAction('dismiss')}
              disabled={selectedReports.length === 0}
              className="btn-outline text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              رد انتخاب شده
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="reviewed">بررسی شده</option>
            <option value="resolved">حل شده</option>
            <option value="dismissed">رد شده</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه انواع</option>
            <option value="user">کاربر</option>
            <option value="casting">کستینگ</option>
            <option value="application">درخواست</option>
            <option value="content">محتوا</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchReports}
            className="btn-primary"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReports(reports.map(report => report._id));
                      } else {
                        setSelectedReports([]);
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  گزارش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شدت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  گزارش‌دهنده
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اقدامات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReports([...selectedReports, report._id]);
                        } else {
                          setSelectedReports(selectedReports.filter(id => id !== report._id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <FlagIcon className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {report.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(report.type)}
                      <span className="mr-2 text-sm text-gray-900">
                        {getTypeText(report.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(report.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {report.reporter?.firstName} {report.reporter?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/reports/${report._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(report._id, 'reviewed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(report._id, 'resolved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(report._id, 'dismissed')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  قبلی
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    نمایش <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> تا{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, reports.length)}</span> از{' '}
                    <span className="font-medium">{reports.length}</span> نتیجه
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">در انتظار بررسی</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.severity === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">گزارشات بحرانی</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600">حل شده</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {reports.length}
              </div>
              <div className="text-sm text-gray-600">کل گزارشات</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
