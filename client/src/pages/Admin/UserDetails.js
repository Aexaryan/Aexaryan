import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ApprovalBadge from '../../components/Common/ApprovalBadge';
import {
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('خطا در دریافت اطلاعات کاربر');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      setUser(prev => ({ ...prev, status: newStatus }));
      toast.success(`وضعیت کاربر با موفقیت تغییر یافت`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('خطا در تغییر وضعیت کاربر');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'فعال' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'معلق' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      talent: { color: 'bg-blue-100 text-blue-800', text: 'استعداد' },
      casting_director: { color: 'bg-purple-100 text-purple-800', text: 'کارگردان' },
      admin: { color: 'bg-gray-100 text-gray-800', text: 'مدیر' },
    };
    const config = roleConfig[role] || roleConfig.talent;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">کاربر یافت نشد</h2>
          <p className="text-gray-600 mb-4">کاربر مورد نظر وجود ندارد یا حذف شده است.</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-secondary"
          >
            بازگشت به لیست کاربران
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
                onClick={() => navigate('/admin/users')}
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-5 h-5 ml-2" />
                بازگشت
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">جزئیات کاربر</h1>
                <p className="text-gray-600">مشاهده و مدیریت اطلاعات کاربر</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">اطلاعات کاربر</h2>
              </div>
              <div className="p-6">
                {/* Profile Picture */}
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 h-20 w-20">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user.talentProfile?.headshot?.url || user.castingDirectorProfile?.profileImage?.url ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={user.talentProfile?.headshot?.url || user.castingDirectorProfile?.profileImage?.url}
                          alt="تصویر پروفایل"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center" style={{ display: user.talentProfile?.headshot?.url || user.castingDirectorProfile?.profileImage?.url ? 'none' : 'flex' }}>
                        <UserIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.identificationStatus === 'approved' && (
                        <div className="flex items-center gap-1">
                          <ApprovalBadge size="md" />
                          <span className="text-xs text-gray-500">(مدارک تأیید شده)</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2 space-x-2 space-x-reverse">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تلفن
                    </label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user.phone || 'ثبت نشده'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ عضویت
                    </label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آخرین ورود
                    </label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('fa-IR')
                          : 'هیچ‌وقت'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأیید ایمیل
                    </label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {user.isVerified ? 'تأیید شده' : 'تأیید نشده'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأیید مدارک
                    </label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {user.identificationStatus === 'approved' ? 'تأیید شده' : 
                         user.identificationStatus === 'pending' ? 'در انتظار' :
                         user.identificationStatus === 'rejected' ? 'رد شده' : 'ثبت نشده'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            {user.role === 'talent' && user.talentProfile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">پروفایل استعداد</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سن
                      </label>
                      <span className="text-gray-900">{user.talentProfile.age || 'ثبت نشده'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        جنسیت
                      </label>
                      <span className="text-gray-900">{user.talentProfile.gender || 'ثبت نشده'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        قد
                      </label>
                      <span className="text-gray-900">{user.talentProfile.height || 'ثبت نشده'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وزن
                      </label>
                      <span className="text-gray-900">{user.talentProfile.weight || 'ثبت نشده'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بیوگرافی
                      </label>
                      <p className="text-gray-900">
                        {user.talentProfile.bio || 'بیوگرافی ثبت نشده است.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'casting_director' && user.castingDirectorProfile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">پروفایل کارگردان</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شرکت/استودیو
                      </label>
                      <span className="text-gray-900">{user.castingDirectorProfile.company || 'ثبت نشده'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        موقعیت شغلی
                      </label>
                      <span className="text-gray-900">{user.castingDirectorProfile.position || 'ثبت نشده'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        درباره
                      </label>
                      <p className="text-gray-900">
                        {user.castingDirectorProfile.about || 'اطلاعات ثبت نشده است.'}
                      </p>
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
                        onClick={() => handleStatusChange('active')}
                        disabled={updating || user.status === 'active'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckIcon className="w-4 h-4 ml-2" />
                        فعال کردن
                      </button>
                      <button
                        onClick={() => handleStatusChange('suspended')}
                        disabled={updating || user.status === 'suspended'}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          user.status === 'suspended'
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <XMarkIcon className="w-4 h-4 ml-2" />
                        تعلیق کردن
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="w-full btn-secondary"
                    >
                      <ArrowLeftIcon className="w-4 h-4 ml-2" />
                      بازگشت به لیست کاربران
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
                    <span className="text-sm text-gray-600">تعداد کستینگ‌ها</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.castingsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد درخواست‌ها</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.applicationsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تعداد پیام‌ها</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.messagesCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
