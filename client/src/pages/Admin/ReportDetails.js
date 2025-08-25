import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ArrowLeftIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resolutionAction, setResolutionAction] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const response = await api.get(`/admin/reports/${id}`);
      setReport(response.data.report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('خطا در بارگذاری جزئیات گزارش');
      navigate('/admin/reports');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/reports/${id}/status`, { status: newStatus });
      toast.success('وضعیت گزارش با موفقیت به‌روزرسانی شد');
      fetchReportDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('خطا در به‌روزرسانی وضعیت');
    } finally {
      setUpdating(false);
    }
  };

  const updatePriority = async (newPriority) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/reports/${id}/priority`, { priority: newPriority });
      toast.success('اولویت گزارش با موفقیت به‌روزرسانی شد');
      fetchReportDetails();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('خطا در به‌روزرسانی اولویت');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      toast.error('لطفاً یادداشت را وارد کنید');
      return;
    }

    try {
      setUpdating(true);
      await api.post(`/admin/reports/${id}/notes`, { note: newNote });
      toast.success('یادداشت با موفقیت اضافه شد');
      setNewNote('');
      fetchReportDetails();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('خطا در اضافه کردن یادداشت');
    } finally {
      setUpdating(false);
    }
  };

  const resolveReport = async () => {
    if (!resolutionAction || !resolutionDetails.trim()) {
      toast.error('لطفاً اقدام و جزئیات حل مشکل را وارد کنید');
      return;
    }

    try {
      setUpdating(true);
      await api.post(`/admin/reports/${id}/resolve`, {
        action: resolutionAction,
        details: resolutionDetails
      });
      toast.success('گزارش با موفقیت حل شد');
      fetchReportDetails();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('خطا در حل گزارش');
    } finally {
      setUpdating(false);
    }
  };

  const navigateToTarget = (targetModel, targetId) => {
    switch (targetModel) {
      case 'Casting':
        navigate(`/admin/castings/${targetId}`);
        break;
      case 'User':
        navigate(`/admin/users/${targetId}`);
        break;
      case 'Application':
        navigate(`/admin/applications/${targetId}`);
        break;
      default:
        toast.error('نوع هدف پشتیبانی نمی‌شود');
    }
  };

  const navigateToContent = (contentType, contentId) => {
    switch (contentType) {
      case 'casting':
        navigate(`/admin/castings/${contentId}`);
        break;
      case 'blog':
        navigate(`/blogs/${contentId}`);
        break;
      case 'news':
        navigate(`/news/${contentId}`);
        break;
      default:
        toast.error('نوع محتوا پشتیبانی نمی‌شود');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('لطفاً پیام را وارد کنید');
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/admin/reports/${id}/message`, {
        message: newMessage,
        targetUserId: report.targetId._id
      });
      toast.success('پیام با موفقیت ارسال شد');
      setNewMessage('');
      fetchReportDetails();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: EyeIcon },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      dismissed: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
      escalated: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {getStatusLabel(status)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800' },
      medium: { color: 'bg-yellow-100 text-yellow-800' },
      high: { color: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority] || priorityConfig.low;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getPriorityLabel(priority)}
      </span>
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'در انتظار',
      under_review: 'در حال بررسی',
      resolved: 'حل شده',
      dismissed: 'رد شده',
      escalated: 'ارجاع شده'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'کم',
      medium: 'متوسط',
      high: 'زیاد',
      urgent: 'فوری'
    };
    return labels[priority] || priority;
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      casting: 'کستینگ',
      user: 'کاربر',
      application: 'درخواست',
      blog: 'مقاله',
      news: 'خبر',
      system: 'سیستم',
      other: 'سایر'
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category) => {
    const labels = {
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
    return labels[category] || category;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری جزئیات گزارش..." />;
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">گزارش یافت نشد</h3>
          <p className="mt-1 text-sm text-gray-500">گزارش مورد نظر وجود ندارد یا حذف شده است.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/reports')}
              className="btn-secondary"
            >
              بازگشت به لیست گزارشات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/admin/reports')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 ml-1" />
            بازگشت
          </button>
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FlagIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">گزارش #{report.reportNumber}</h1>
            <p className="text-gray-600">جزئیات کامل گزارش</p>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-4">
          {getStatusBadge(report.status)}
          {getPriorityBadge(report.priority)}
          <span className="text-sm text-gray-500">
            {new Date(report.createdAt).toLocaleDateString('fa-IR')} - {new Date(report.createdAt).toLocaleTimeString('fa-IR')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Status Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">وضعیت گزارش</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت فعلی</label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <span className="text-sm text-gray-600">
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اولویت</label>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(report.priority)}
                    <span className="text-sm text-gray-600">
                      {getPriorityLabel(report.priority)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ارسال</label>
                  <p className="text-gray-900">
                    {new Date(report.createdAt).toLocaleDateString('fa-IR')} - {new Date(report.createdAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>

                {report.updatedAt && report.updatedAt !== report.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">آخرین به‌روزرسانی</label>
                    <p className="text-gray-900">
                      {new Date(report.updatedAt).toLocaleDateString('fa-IR')} - {new Date(report.updatedAt).toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره گزارش</label>
                  <p className="text-gray-900 font-mono text-lg">{report.reportNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع گزارش</label>
                  <p className="text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                  <p className="text-gray-900">{getCategoryLabel(report.category)}</p>
                </div>

                {report.resolution && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ حل</label>
                    <p className="text-gray-900">
                      {new Date(report.resolution.resolvedAt).toLocaleDateString('fa-IR')} - {new Date(report.resolution.resolvedAt).toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">تاریخچه وضعیت</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">گزارش ارسال شد</span>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('fa-IR')} - {new Date(report.createdAt).toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">گزارش توسط {report.reporter?.firstName} {report.reporter?.lastName} ارسال شد</p>
                </div>
              </div>

              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">آخرین به‌روزرسانی</span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.updatedAt).toLocaleDateString('fa-IR')} - {new Date(report.updatedAt).toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">وضعیت یا جزئیات گزارش به‌روزرسانی شد</p>
                  </div>
                </div>
              )}

              {report.resolution && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">گزارش حل شد</span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.resolution.resolvedAt).toLocaleDateString('fa-IR')} - {new Date(report.resolution.resolvedAt).toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">اقدام: {report.resolution.action}</p>
                  </div>
                </div>
              )}

              {report.adminNotes && report.adminNotes.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">یادداشت‌های ادمین</span>
                      <span className="text-xs text-gray-500">{report.adminNotes.length} یادداشت</span>
                    </div>
                    <p className="text-sm text-gray-600">یادداشت‌های ادمین اضافه شده است</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">جزئیات گزارش</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                <p className="text-gray-900">{report.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <p className="text-gray-900 whitespace-pre-wrap">{report.description}</p>
              </div>

              {report.targetId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">هدف گزارش</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">
                      {report.targetModel}: {report.targetId.title || report.targetId.firstName || report.targetId._id}
                    </p>
                    <button
                      onClick={() => navigateToTarget(report.targetModel, report.targetId._id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      مشاهده جزئیات
                    </button>
                  </div>
                  {report.targetId.email && (
                    <p className="text-sm text-gray-600 mt-1">ایمیل: {report.targetId.email}</p>
                  )}
                </div>
              )}

              {/* Content Information for content-based reports */}
              {report.contentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">محتوای گزارش شده</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">
                      {report.reportType === 'casting' && report.contentId.title && (
                        <>کستینگ: {report.contentId.title}</>
                      )}
                      {report.reportType === 'blog' && report.contentId.title && (
                        <>مقاله: {report.contentId.title}</>
                      )}
                      {report.reportType === 'news' && report.contentId.title && (
                        <>خبر: {report.contentId.title}</>
                      )}
                    </p>
                    <button
                      onClick={() => navigateToContent(report.reportType, report.contentId._id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      مشاهده محتوا
                    </button>
                  </div>
                  {report.contentId.excerpt && (
                    <p className="text-sm text-gray-600 mt-1">{report.contentId.excerpt}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reporter Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات گزارش‌دهنده</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                <p className="text-gray-900">
                  {report.reporter?.firstName} {report.reporter?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                <p className="text-gray-900">{report.reporter?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع کاربر</label>
                <p className="text-gray-900">
                  {report.reporter?.role === 'talent' ? 'استعداد' : 
                   report.reporter?.role === 'casting_director' ? 'کارگردان کستینگ' : 
                   report.reporter?.role === 'admin' ? 'ادمین' : report.reporter?.role}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ارسال</label>
                <p className="text-gray-900">
                  {new Date(report.createdAt).toLocaleDateString('fa-IR')} - {new Date(report.createdAt).toLocaleTimeString('fa-IR')}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence */}
          {report.evidence && report.evidence.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">مدارک و شواهد</h2>
              
              <div className="space-y-3">
                {report.evidence.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.type === 'file' || item.type === 'image' || item.type === 'document' ? (
                      <PaperClipIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    ) : (
                      <LinkIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.filename || 'لینک خارجی'}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 mt-1 inline-block"
                      >
                        مشاهده {item.type === 'file' || item.type === 'image' || item.type === 'document' ? 'فایل' : 'لینک'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Details */}
          {report.resolution && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">جزئیات حل مشکل</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اقدام انجام شده</label>
                  <p className="text-gray-900">{report.resolution.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ حل</label>
                  <p className="text-gray-900">
                    {new Date(report.resolution.resolvedAt).toLocaleDateString('fa-IR')} - {new Date(report.resolution.resolvedAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
                {report.resolution.resolvedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حل شده توسط</label>
                    <p className="text-gray-900">
                      {report.resolution.resolvedBy.firstName} {report.resolution.resolvedBy.lastName}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">جزئیات</label>
                <p className="text-gray-900 whitespace-pre-wrap">{report.resolution.details}</p>
              </div>
            </div>
          )}

          {/* Report Discussion - Only visible when there's a target user */}
          {report.targetId && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">گفتگو درباره گزارش</h2>
              
              {/* Messages List */}
              {report.messages && report.messages.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {report.messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 p-4 rounded-lg ${
                      message.sender === 'admin' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {message.sender === 'admin' ? 'A' : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender === 'admin' ? 'ادمین' : 'کاربر'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString('fa-IR')} - {new Date(message.createdAt).toLocaleTimeString('fa-IR')}
                          </span>
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mb-6">
                  <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>هنوز پیامی در این گزارش ارسال نشده است</p>
                </div>
              )}

              {/* Send Message */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">ارسال پیام به کاربر</h3>
                <div className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پیام خود را اینجا بنویسید..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="btn-primary btn-sm"
                    >
                      {sendingMessage ? 'در حال ارسال...' : 'ارسال پیام'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">خلاصه وضعیت</h2>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-sm font-medium text-gray-900">{getStatusLabel(report.status)}</p>
                <p className="text-xs text-gray-500 mt-1">وضعیت فعلی</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  {getPriorityBadge(report.priority)}
                </div>
                <p className="text-sm font-medium text-gray-900">{getPriorityLabel(report.priority)}</p>
                <p className="text-xs text-gray-500 mt-1">اولویت</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{report.reportNumber}</p>
                <p className="text-xs text-gray-500 mt-1">شماره گزارش</p>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات گزارش</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره گزارش</label>
                <p className="text-gray-900 font-mono">{report.reportNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع گزارش</label>
                <p className="text-gray-900">{getReportTypeLabel(report.reportType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                <p className="text-gray-900">{getCategoryLabel(report.category)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ارسال</label>
                <p className="text-gray-900">
                  {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آخرین به‌روزرسانی</label>
                  <p className="text-gray-900">
                    {new Date(report.updatedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات گزارش‌دهنده</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                <p className="text-gray-900">
                  {report.reporter?.firstName} {report.reporter?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                <p className="text-gray-900">{report.reporter?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع کاربر</label>
                <p className="text-gray-900">
                  {report.reporter?.role === 'talent' ? 'استعداد' : 
                   report.reporter?.role === 'casting_director' ? 'کارگردان کستینگ' : 
                   report.reporter?.role === 'admin' ? 'ادمین' : report.reporter?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اقدامات سریع</h2>
            
            <div className="space-y-3">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تغییر وضعیت</label>
                <select
                  value={report.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="input-field-select"
                >
                  <option value="pending">در انتظار</option>
                  <option value="under_review">در حال بررسی</option>
                  <option value="resolved">حل شده</option>
                  <option value="dismissed">رد شده</option>
                  <option value="escalated">ارجاع شده</option>
                </select>
              </div>

              {/* Priority Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تغییر اولویت</label>
                <select
                  value={report.priority}
                  onChange={(e) => updatePriority(e.target.value)}
                  disabled={updating}
                  className="input-field-select"
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">افزودن یادداشت</h2>
            
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="یادداشت خود را اینجا بنویسید..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={addNote}
                disabled={updating || !newNote.trim()}
                className="w-full btn-primary btn-sm"
              >
                افزودن یادداشت
              </button>
            </div>
          </div>

          {/* Resolve Report */}
          {report.status !== 'resolved' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">حل گزارش</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اقدام انجام شده</label>
                  <select
                    value={resolutionAction}
                    onChange={(e) => setResolutionAction(e.target.value)}
                    className="input-field-select"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="warning_sent">هشدار به کاربر</option>
                    <option value="user_suspended">تعلیق موقت</option>
                    <option value="user_banned">مسدودسازی</option>
                    <option value="content_removed">حذف محتوا</option>
                    <option value="casting_removed">حذف کستینگ</option>
                    <option value="application_rejected">رد درخواست</option>
                    <option value="no_action">بدون اقدام</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">جزئیات</label>
                  <textarea
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                    placeholder="جزئیات اقدام انجام شده..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={resolveReport}
                  disabled={updating || !resolutionAction || !resolutionDetails.trim()}
                  className="w-full btn-success btn-sm"
                >
                  حل گزارش
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      {report.adminNotes && report.adminNotes.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">یادداشت‌های ادمین</h2>
          
          <div className="space-y-4">
            {report.adminNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {note.admin?.firstName} {note.admin?.lastName}
                    </span>
                    {note.action && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {note.action === 'status_change' ? 'تغییر وضعیت' :
                         note.action === 'priority_change' ? 'تغییر اولویت' :
                         note.action === 'action_taken' ? 'اقدام انجام شده' : note.action}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900">{note.note}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(note.createdAt).toLocaleDateString('fa-IR')} - {new Date(note.createdAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetails;
