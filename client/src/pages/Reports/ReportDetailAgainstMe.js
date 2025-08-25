import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  FlagIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  UserIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const ReportDetailAgainstMe = () => {
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
      setLoading(true);
      const response = await api.get(`/reports/target/${id}`);
      setReport(response.data.report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('خطا در دریافت جزئیات گزارش');
      navigate(`${baseRoute}/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await api.post(`/reports/${id}/message`, {
        message: newMessage
      });
      
      setNewMessage('');
      await fetchReportDetails(); // Refresh to get new message
      toast.success('پیام با موفقیت ارسال شد');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام');
    } finally {
      setSendingMessage(false);
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
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
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

  const getReportTypeIcon = (reportType) => {
    switch (reportType) {
      case 'casting':
        return <BriefcaseIcon className="w-5 h-5" />;
      case 'blog':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'news':
        return <NewspaperIcon className="w-5 h-5" />;
      case 'user':
        return <UserIcon className="w-5 h-5" />;
      default:
        return <FlagIcon className="w-5 h-5" />;
    }
  };

  const getReportTypeLabel = (reportType) => {
    const types = {
      casting: 'کستینگ',
      blog: 'مقاله',
      news: 'خبر',
      user: 'کاربر',
      application: 'درخواست'
    };
    return types[reportType] || reportType;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری جزئیات گزارش..." />;
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">گزارش یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`${baseRoute}/dashboard`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 ml-2" />
          بازگشت به داشبورد
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            جزئیات گزارش
          </h1>
          {getStatusBadge(report.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              اطلاعات گزارش
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان گزارش
                </label>
                <p className="text-gray-900">{report.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{report.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع گزارش
                  </label>
                  <div className="flex items-center gap-2">
                    {getReportTypeIcon(report.reportType)}
                    <span className="text-gray-900">{getReportTypeLabel(report.reportType)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    دسته‌بندی
                  </label>
                  <p className="text-gray-900">{getCategoryLabel(report.category)}</p>
                </div>
              </div>

              {report.contentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    محتوای گزارش شده
                  </label>
                  <p className="text-gray-900">{report.contentId.title || report.contentId.slug || 'محتوای حذف شده'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          {report.evidence && report.evidence.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                مدارک ارائه شده
              </h2>
              
              <div className="space-y-3">
                {report.evidence.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.type === 'image' && (
                      <img 
                        src={item.url} 
                        alt={item.description || 'مدرک'} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.description || 'مدرک ارائه شده'}
                      </p>
                      {item.filename && (
                        <p className="text-xs text-gray-500">{item.filename}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              گفتگو با ادمین
            </h2>
            
            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {report.messages && report.messages.length > 0 ? (
                report.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-primary-100 text-primary-900'
                      }`}
                    >
                      <div className="text-xs mb-1">
                        {message.sender === 'admin' ? 'ادمین' : 'شما'}
                        {message.adminId && (
                          <span className="text-gray-600">
                            {' '}
                            ({message.adminId.firstName} {message.adminId.lastName})
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleString('fa-IR')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  هنوز پیامی در این گفتگو وجود ندارد
                </div>
              )}
            </div>

            {/* Send Message */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              وضعیت گزارش
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  شماره گزارش
                </label>
                <p className="text-gray-900 font-mono">{report.reportNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاریخ گزارش
                </label>
                <p className="text-gray-900">
                  {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اولویت
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  report.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {report.priority === 'urgent' ? 'فوری' :
                   report.priority === 'high' ? 'بالا' :
                   report.priority === 'medium' ? 'متوسط' : 'پایین'}
                </span>
              </div>

              {report.resolution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اقدام انجام شده
                  </label>
                  <p className="text-gray-900">{report.resolution.details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailAgainstMe;
