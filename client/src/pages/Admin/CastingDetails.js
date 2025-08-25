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
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FilmIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const CastingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [casting, setCasting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCastingDetails();
  }, [id]);

  const fetchCastingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/castings/${id}`);
      setCasting(response.data.casting);
    } catch (error) {
      console.error('Error fetching casting details:', error);
      toast.error('خطا در دریافت اطلاعات کستینگ');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/castings/${id}/status`, { status: newStatus });
      setCasting(prev => ({ ...prev, status: newStatus }));
      toast.success(`وضعیت کستینگ با موفقیت تغییر یافت`);
    } catch (error) {
      console.error('Error updating casting status:', error);
      toast.error('خطا در تغییر وضعیت کستینگ');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'فعال' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'پیش‌نویس' },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: 'متوقف' },
      closed: { color: 'bg-red-100 text-red-800', text: 'بسته' },
      filled: { color: 'bg-blue-100 text-blue-800', text: 'تکمیل شده' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      film: { color: 'bg-purple-100 text-purple-800', text: 'فیلم' },
      tv_series: { color: 'bg-blue-100 text-blue-800', text: 'سریال تلویزیونی' },
      commercial: { color: 'bg-orange-100 text-orange-800', text: 'تبلیغات' },
      theater: { color: 'bg-indigo-100 text-indigo-800', text: 'تئاتر' },
      music_video: { color: 'bg-pink-100 text-pink-800', text: 'موزیک ویدیو' },
      documentary: { color: 'bg-green-100 text-green-800', text: 'مستند' },
      web_series: { color: 'bg-cyan-100 text-cyan-800', text: 'سریال اینترنتی' },
      other: { color: 'bg-gray-100 text-gray-800', text: 'سایر' },
    };
    const config = typeConfig[type] || typeConfig.film;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!casting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">کستینگ یافت نشد</h2>
          <p className="text-gray-600 mb-4">کستینگ مورد نظر وجود ندارد یا حذف شده است.</p>
          <button
            onClick={() => navigate('/admin/castings')}
            className="btn-secondary"
          >
            بازگشت به لیست کستینگ‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => navigate('/admin/castings')}
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-5 h-5 ml-2" />
                بازگشت
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{casting.title}</h1>
                <p className="text-gray-600">مشاهده و مدیریت اطلاعات کستینگ</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              {getStatusBadge(casting.status)}
              {getTypeBadge(casting.projectType)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Casting Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">اطلاعات کستینگ</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان
                    </label>
                    <span className="text-gray-900 font-medium">{casting.title}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <FilmIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{casting.projectType}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کارگردان
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {casting.castingDirector?.firstName} {casting.castingDirector?.lastName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ ایجاد
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(casting.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مکان
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {casting.location ? 
                          `${casting.location.city || ''}, ${casting.location.province || ''}`.trim() || 'ثبت نشده' 
                          : 'ثبت نشده'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ شروع
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {casting.shootingSchedule?.startDate ? new Date(casting.shootingSchedule.startDate).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ پایان
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {casting.shootingSchedule?.endDate ? new Date(casting.shootingSchedule.endDate).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مهلت درخواست
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {casting.applicationDeadline ? new Date(casting.applicationDeadline).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">{casting.description}</p>
                </div>

                {casting.requirements && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شرایط و الزامات
                    </label>
                    <div className="text-gray-900">
                      {casting.requirements && typeof casting.requirements === 'object' ? (
                        <div className="space-y-2">
                          {casting.requirements.gender && (
                            <div><span className="font-medium">جنسیت:</span> {casting.requirements.gender}</div>
                          )}
                          {casting.requirements.requiredSkills && casting.requirements.requiredSkills.length > 0 && (
                            <div><span className="font-medium">مهارت‌های مورد نیاز:</span> {casting.requirements.requiredSkills.join(', ')}</div>
                          )}
                          {casting.requirements.languages && casting.requirements.languages.length > 0 && (
                            <div><span className="font-medium">زبان‌ها:</span> {casting.requirements.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')}</div>
                          )}
                          {casting.requirements.physicalRequirements && (
                            <div><span className="font-medium">نیازهای فیزیکی:</span> {casting.requirements.physicalRequirements}</div>
                          )}
                          {casting.requirements.experienceLevel && (
                            <div><span className="font-medium">سطح تجربه:</span> {casting.requirements.experienceLevel}</div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{casting.requirements}</p>
                      )}
                    </div>
                  </div>
                )}

                {casting.compensation && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      دستمزد
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">نوع:</span>
                          <span className="text-gray-900 mr-2">{casting.compensation.type}</span>
                        </div>
                        {casting.compensation.amount && (
                          <div>
                            <span className="text-sm text-gray-600">مبلغ:</span>
                            <span className="text-gray-900 mr-2">
                              {typeof casting.compensation.amount === 'object' ? 
                                `${casting.compensation.amount.min || 0} - ${casting.compensation.amount.max || 0} ${casting.compensation.amount.currency || 'IRR'}` 
                                : casting.compensation.amount
                              }
                            </span>
                          </div>
                        )}
                        {casting.compensation.amount && typeof casting.compensation.amount === 'object' && casting.compensation.amount.currency && (
                          <div>
                            <span className="text-sm text-gray-600">واحد پول:</span>
                            <span className="text-gray-900 mr-2">{casting.compensation.amount.currency}</span>
                          </div>
                        )}
                        {casting.compensation.paymentStructure && (
                          <div>
                            <span className="text-sm text-gray-600">نحوه پرداخت:</span>
                            <span className="text-gray-900 mr-2">{casting.compensation.paymentStructure}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {casting.photos && casting.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">تصاویر</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {casting.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={`تصویر ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
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
                        onClick={() => handleStatusChange('active')}
                        disabled={updating || casting.status === 'active'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          casting.status === 'active'
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckIcon className="w-4 h-4 ml-2" />
                        فعال کردن
                      </button>
                      <button
                        onClick={() => handleStatusChange('paused')}
                        disabled={updating || casting.status === 'paused'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          casting.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        }`}
                      >
                        <XMarkIcon className="w-4 h-4 ml-2" />
                        متوقف کردن
                      </button>
                      <button
                        onClick={() => handleStatusChange('closed')}
                        disabled={updating || casting.status === 'closed'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          casting.status === 'closed'
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <XMarkIcon className="w-4 h-4 ml-2" />
                        بستن
                      </button>
                      <button
                        onClick={() => handleStatusChange('filled')}
                        disabled={updating || casting.status === 'filled'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          casting.status === 'filled'
                            ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <CheckIcon className="w-4 h-4 ml-2" />
                        تکمیل شده
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/castings/${id}/edit`)}
                      className="w-full btn-secondary mb-3"
                    >
                      <PencilIcon className="w-4 h-4 ml-2" />
                      ویرایش کستینگ
                    </button>
                    <button
                      onClick={() => navigate(`/admin/castings/${id}/applications`)}
                      className="w-full btn-primary"
                    >
                      <EyeIcon className="w-4 h-4 ml-2" />
                      مشاهده درخواست‌ها
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">آمار</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد درخواست‌ها</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {casting.totalApplications || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد بازدید</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {casting.views || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد علاقه‌مندی</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {casting.favoritesCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {casting.tags && casting.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">برچسب‌ها</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {casting.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastingDetails;
