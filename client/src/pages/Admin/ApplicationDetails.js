import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/applications/${id}`);
      setApplication(response.data.application);
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('خطا در دریافت اطلاعات درخواست');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/applications/${id}/status`, { status: newStatus });
      setApplication(prev => ({ ...prev, status: newStatus }));
      toast.success(`وضعیت درخواست با موفقیت تغییر یافت`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('خطا در تغییر وضعیت درخواست');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'پذیرفته شده' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'رد شده' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', text: 'لغو شده' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">درخواست یافت نشد</h2>
          <p className="text-gray-600 mb-4">درخواست مورد نظر وجود ندارد یا حذف شده است.</p>
          <button
            onClick={() => navigate('/admin/applications')}
            className="btn-secondary"
          >
            بازگشت به لیست درخواست‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => navigate('/admin/applications')}
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-5 h-5 ml-2" />
                بازگشت
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">جزئیات درخواست</h1>
                <p className="text-gray-600">مشاهده و مدیریت اطلاعات درخواست</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">اطلاعات درخواست</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کستینگ
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {application.casting?.title || 'نامشخص'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      استعداد
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {application.talent?.firstName} {application.talent?.lastName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ درخواست
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(application.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آخرین بروزرسانی
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(application.updatedAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نامه معرفی
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{application.coverLetter}</p>
                    </div>
                  </div>
                )}

                {application.portfolio && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نمونه کارها
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{application.portfolio}</p>
                    </div>
                  </div>
                )}

                {application.experience && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تجربیات
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{application.experience}</p>
                    </div>
                  </div>
                )}

                {application.availability && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      در دسترس بودن
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{application.availability}</p>
                    </div>
                  </div>
                )}

                {application.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      یادداشت‌ها
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{application.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Talent Profile Summary */}
            {application.talent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">اطلاعات استعداد</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام و نام خانوادگی
                      </label>
                      <span className="text-gray-900">
                        {application.talent.firstName} {application.talent.lastName}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل
                      </label>
                      <span className="text-gray-900">{application.talent.email}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تلفن
                      </label>
                      <span className="text-gray-900">{application.talent.phone || 'ثبت نشده'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ عضویت
                      </label>
                      <span className="text-gray-900">
                        {new Date(application.talent.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Casting Summary */}
            {application.casting && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">اطلاعات کستینگ</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان
                      </label>
                      <span className="text-gray-900 font-medium">{application.casting.title}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع
                      </label>
                      <span className="text-gray-900">{application.casting.type}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        کارگردان
                      </label>
                      <span className="text-gray-900">
                        {application.casting.castingDirector?.firstName} {application.casting.castingDirector?.lastName}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ ایجاد
                      </label>
                      <span className="text-gray-900">
                        {new Date(application.casting.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">عملیات</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تغییر وضعیت
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusChange('accepted')}
                        disabled={updating || application.status === 'accepted'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          application.status === 'accepted'
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckIcon className="w-4 h-4 ml-2" />
                        پذیرش
                      </button>
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        disabled={updating || application.status === 'rejected'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          application.status === 'rejected'
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <XMarkIcon className="w-4 h-4 ml-2" />
                        رد کردن
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/users/${application.talent?._id}`)}
                      className="w-full btn-secondary mb-3"
                    >
                      <UserIcon className="w-4 h-4 ml-2" />
                      مشاهده پروفایل استعداد
                    </button>
                    <button
                      onClick={() => navigate(`/admin/castings/${application.casting?._id}`)}
                      className="w-full btn-secondary"
                    >
                      <DocumentTextIcon className="w-4 h-4 ml-2" />
                      مشاهده کستینگ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">آمار</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد درخواست‌های استعداد</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {application.talent?.applicationsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد درخواست‌های کستینگ</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {application.casting?.applicationsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">امتیاز استعداد</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {application.talent?.rating || 0}
                      <StarIcon className="w-4 h-4 inline text-yellow-400 mr-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">تاریخچه</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">درخواست ارسال شد</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  {application.status !== 'pending' && (
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          وضعیت به {application.status === 'accepted' ? 'پذیرفته شده' : 'رد شده'} تغییر یافت
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.updatedAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
