import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const WriterReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });

      const response = await api.get(`/reports?${params}`);
      setReports(response.data.reports || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalReports(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('خطا در دریافت گزارشات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'در انتظار بررسی' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: EyeIcon, text: 'در حال بررسی' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'حل شده' },
      dismissed: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, text: 'رد شده' },
      escalated: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'ارجاع شده' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      inappropriate_content: { color: 'bg-red-100 text-red-800', text: 'محتوای نامناسب' },
      spam: { color: 'bg-orange-100 text-orange-800', text: 'اسپم' },
      fake_information: { color: 'bg-yellow-100 text-yellow-800', text: 'اطلاعات جعلی' },
      harassment: { color: 'bg-red-100 text-red-800', text: 'آزار و اذیت' },
      copyright_violation: { color: 'bg-purple-100 text-purple-800', text: 'نقض حق نشر' },
      technical_issue: { color: 'bg-blue-100 text-blue-800', text: 'مشکل فنی' },
      payment_issue: { color: 'bg-green-100 text-green-800', text: 'مشکل پرداخت' },
      safety_concern: { color: 'bg-red-100 text-red-800', text: 'نگرانی امنیتی' },
      other: { color: 'bg-gray-100 text-gray-800', text: 'سایر' }
    };

    const config = categoryConfig[category] || categoryConfig.other;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getReportTypeIcon = (reportType) => {
    const iconConfig = {
      casting: DocumentTextIcon,
      user: UserIcon,
      application: DocumentTextIcon,
      blog: DocumentTextIcon,
      news: DocumentTextIcon,
      system: CogIcon,
      other: ExclamationTriangleIcon
    };

    return iconConfig[reportType] || ExclamationTriangleIcon;
  };

  const getReportTypeText = (reportType) => {
    const typeConfig = {
      casting: 'کستینگ',
      user: 'کاربر',
      application: 'درخواست',
      blog: 'مقاله',
      news: 'خبر',
      system: 'سیستم',
      other: 'سایر'
    };

    return typeConfig[reportType] || 'سایر';
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری گزارشات..." />;
  }

  return (
    <WriterLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">گزارش‌های من</h1>
            <p className="text-gray-600">مدیریت و پیگیری گزارشات ارسالی</p>
          </div>
          <Link
            to="/reports/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            ارسال گزارش جدید
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">کل گزارشات</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">در انتظار بررسی</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">حل شده</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">در حال بررسی</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در گزارشات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="under_review">در حال بررسی</option>
            <option value="resolved">حل شده</option>
            <option value="dismissed">رد شده</option>
            <option value="escalated">ارجاع شده</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            <option value="inappropriate_content">محتوای نامناسب</option>
            <option value="spam">اسپم</option>
            <option value="fake_information">اطلاعات جعلی</option>
            <option value="harassment">آزار و اذیت</option>
            <option value="copyright_violation">نقض حق نشر</option>
            <option value="technical_issue">مشکل فنی</option>
            <option value="payment_issue">مشکل پرداخت</option>
            <option value="safety_concern">نگرانی امنیتی</option>
            <option value="other">سایر</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {filteredReports.length} گزارش
            </span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ گزارشی یافت نشد</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'هیچ گزارشی با فیلترهای انتخاب شده مطابقت ندارد'
                : 'هنوز گزارشی ارسال نکرده‌اید'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Link
                to="/reports/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                ارسال اولین گزارش
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const ReportTypeIcon = getReportTypeIcon(report.reportType);
              return (
                <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ReportTypeIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        {getStatusBadge(report.status)}
                        {getCategoryBadge(report.category)}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>نوع: {getReportTypeText(report.reportType)}</span>
                        </div>
                        {report.reportNumber && (
                          <div className="flex items-center gap-1">
                            <span>شماره: {report.reportNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/reports/${report._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </nav>
        </div>
      )}
    </WriterLayout>
  );
};

export default WriterReports;
