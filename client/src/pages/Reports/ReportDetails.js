import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ArrowLeftIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  LinkIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Determine the base route based on current location
  const isDirector = location.pathname.includes('/director');
  const baseRoute = isDirector ? '/director' : '/talent';

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      // First try to get the report as the reporter
      let response;
      try {
        response = await api.get(`/reports/${id}`);
        setReport(response.data.report);
      } catch (reporterError) {
        // If not found as reporter, try as target
        if (reporterError.response?.status === 404) {
          response = await api.get(`/reports/target/${id}`);
          setReport(response.data.report);
        } else {
          throw reporterError;
        }
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('خطا در بارگذاری جزئیات گزارش');
      navigate(`${baseRoute}/reports`);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('لطفاً پیام را وارد کنید');
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/reports/${id}/message`, {
        message: newMessage
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

  // Check if current user is the target of this report
  const isCurrentUserTarget = () => {
    if (!report || !user) return false;
    return report.targetId && report.targetId._id === user._id;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: ExclamationTriangleIcon },
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

    const config = priorityConfig[priority] || priorityConfig.medium;

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
              onClick={() => navigate(`${baseRoute}/reports`)}
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
            onClick={() => navigate(`${baseRoute}/reports`)}
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
            <p className="text-gray-600">جزئیات گزارش شما</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع گزارش</label>
                  <p className="text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                  <p className="text-gray-900">{getCategoryLabel(report.category)}</p>
                </div>
              </div>

              {report.targetId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">هدف گزارش</label>
                  <p className="text-gray-900">
                    {report.targetModel}: {report.targetId.title || report.targetId.firstName || report.targetId._id}
                  </p>
                </div>
              )}
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اقدام انجام شده</label>
                  <p className="text-gray-900">{report.resolution.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">جزئیات</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{report.resolution.details}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ حل</label>
                  <p className="text-gray-900">
                    {new Date(report.resolution.resolvedAt).toLocaleDateString('fa-IR')} - {new Date(report.resolution.resolvedAt).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Discussion - Only visible to target user */}
          {isCurrentUserTarget() && (
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
                            {message.sender === 'admin' ? 'ادمین' : 'شما'}
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
                <h3 className="text-md font-medium text-gray-900 mb-3">ارسال پیام به ادمین</h3>
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
          {/* Report Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات گزارش</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره گزارش</label>
                <p className="text-gray-900 font-mono">{report.reportNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                <div className="mt-1">{getStatusBadge(report.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
                <div className="mt-1">{getPriorityBadge(report.priority)}</div>
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
