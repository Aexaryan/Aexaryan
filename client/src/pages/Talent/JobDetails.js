import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import CastingWarningModal from '../../components/Common/CastingWarningModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [casting, setCasting] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverMessage: ''
  });

  useEffect(() => {
    fetchCastingDetails();
  }, [id]);

  const fetchCastingDetails = async () => {
    try {
      const response = await api.get(`/castings/${id}`);
      setCasting(response.data.casting);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      console.error('Error fetching casting details:', error);
      if (error.response?.status === 404) {
        navigate('/talent/jobs');
        toast.error('کستینگ مورد نظر یافت نشد');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applicationData.coverMessage.trim()) {
      toast.error('لطفاً پیام پوششی خود را بنویسید');
      return;
    }

    setApplying(true);
    try {
      await api.post('/applications', {
        castingId: casting._id,
        coverMessage: applicationData.coverMessage
      });
      
      // Refresh casting details to get updated hasApplied status
      await fetchCastingDetails();
      setShowApplicationForm(false);
      toast.success('درخواست شما با موفقیت ارسال شد');
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.error || 'خطا در ارسال درخواست');
    } finally {
      setApplying(false);
    }
  };

  const handleStartApplication = () => {
    setShowWarningModal(true);
  };

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    setShowApplicationForm(true);
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
  };

  const getProjectTypeText = (type) => {
    const types = {
      film: 'فیلم',
      tv_series: 'سریال تلویزیونی',
      commercial: 'تبلیغات',
      theater: 'تئاتر',
      music_video: 'موزیک ویدیو',
      documentary: 'مستند',
      web_series: 'وب سریال',
      other: 'سایر'
    };
    return types[type] || type;
  };

  const getRoleTypeText = (type) => {
    const types = {
      lead: 'نقش اصلی',
      supporting: 'نقش مکمل',
      background: 'پس‌زمینه',
      extra: 'فیگوران',
      voice_over: 'صداپیشگی',
      other: 'سایر'
    };
    return types[type] || type;
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isExpired = () => {
    return getDaysRemaining(casting?.applicationDeadline) <= 0;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری جزئیات کستینگ..." />;
  }

  if (!casting) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">کستینگ یافت نشد</h2>
          <p className="text-gray-600 mb-4">کستینگ مورد نظر وجود ندارد یا حذف شده است</p>
          <Link to="/talent/jobs" className="btn-primary">
            بازگشت به لیست کستینگ‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/talent/jobs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="w-5 h-5 ml-2" />
          بازگشت به لیست کستینگ‌ها
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {casting.isPremium && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ ویژه
                </span>
              )}
              {casting.isUrgent && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  🔥 فوری
                </span>
              )}
              <span className={`status-${casting.status}`}>
                {casting.status === 'active' ? 'فعال' : casting.status}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {casting.title}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium ml-2">نوع پروژه:</span>
                {getProjectTypeText(casting.projectType)}
              </div>
              <div className="flex items-center">
                <span className="font-medium ml-2">نوع نقش:</span>
                {getRoleTypeText(casting.roleType)}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 ml-1" />
                {casting.location?.city}, {casting.location?.province}
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 ml-1" />
                {casting.views || 0} بازدید
              </div>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-5 h-5 ml-2 text-gray-500" />
            <span className="text-sm text-gray-600">
              مهلت درخواست: {new Date(casting.applicationDeadline).toLocaleDateString('fa-IR')}
            </span>
            {getDaysRemaining(casting.applicationDeadline) > 0 ? (
              <span className="mr-4 text-sm text-green-600 flex items-center">
                <ClockIcon className="w-4 h-4 ml-1" />
                {getDaysRemaining(casting.applicationDeadline)} روز باقی‌مانده
              </span>
            ) : (
              <span className="mr-4 text-sm text-red-600">منقضی شده</span>
            )}
          </div>

          <div>
            {hasApplied ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 ml-2" />
                <span className="font-medium">درخواست ارسال شده</span>
              </div>
            ) : isExpired() ? (
              <div className="flex items-center text-red-600">
                <XCircleIcon className="w-5 h-5 ml-2" />
                <span className="font-medium">مهلت درخواست به پایان رسیده</span>
              </div>
            ) : (
              <button
                onClick={handleStartApplication}
                disabled={applying || hasApplied}
                className="btn-primary disabled:opacity-50"
              >
                {applying ? 'در حال ارسال...' : hasApplied ? 'درخواست ارسال شده' : 'ارسال درخواست'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">توضیحات</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {casting.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Photos Gallery */}
          {casting.photos && casting.photos.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">عکس‌های کستینگ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {casting.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.url}
                        alt={photo.caption || `عکس کستینگ ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {photo.caption && (
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {casting.requirements && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">الزامات</h2>
              <div className="space-y-4">
                {casting.requirements.ageRange?.min && casting.requirements.ageRange?.max && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">محدوده سنی</h3>
                    <p className="text-gray-700">
                      {casting.requirements.ageRange.min} تا {casting.requirements.ageRange.max} سال
                    </p>
                  </div>
                )}

                {casting.requirements.gender && casting.requirements.gender !== 'any' && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">جنسیت</h3>
                    <p className="text-gray-700">
                      {casting.requirements.gender === 'male' ? 'مرد' : 
                       casting.requirements.gender === 'female' ? 'زن' : 'فرقی ندارد'}
                    </p>
                  </div>
                )}

                {casting.requirements.requiredSkills?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">مهارت‌های مورد نیاز</h3>
                    <div className="flex flex-wrap gap-2">
                      {casting.requirements.requiredSkills.map((skill, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compensation */}
          {casting.compensation && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">پرداخت</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">نوع:</span>
                  <p className="text-gray-600">
                    {casting.compensation.type === 'paid' ? 'پولی' : 
                     casting.compensation.type === 'unpaid' ? 'غیرپولی' : 'سایر'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Casting Director Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">کارگردان کستینگ</h3>
            <div className="flex items-center mb-3">
              <UserIcon className="w-8 h-8 text-gray-400 ml-3" />
              <div>
                <p className="font-medium text-gray-900">کارگردان کستینگ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationForm && !hasApplied && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">ارسال درخواست</h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">کستینگ:</h3>
                <p className="text-gray-700">{casting.title}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  پیام پوششی *
                </label>
                <textarea
                  value={applicationData.coverMessage}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverMessage: e.target.value }))}
                  rows={6}
                  className="input-field"
                  placeholder="چرا برای این نقش مناسب هستید؟ تجربیات و مهارت‌های مرتبط خود را بنویسید..."
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="btn-secondary"
                >
                  انصراف
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !applicationData.coverMessage.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {applying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      در حال ارسال...
                    </div>
                  ) : (
                    <>
                      <DocumentTextIcon className="w-5 h-5 ml-2" />
                      ارسال درخواست
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Casting Warning Modal */}
      <CastingWarningModal
        isOpen={showWarningModal}
        onClose={handleWarningCancel}
        onConfirm={handleWarningConfirm}
        castingTitle={casting?.title || "این پروژه"}
        isLoading={false}
      />
    </div>
  );
};

export default JobDetails;