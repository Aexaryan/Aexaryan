import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  ExclamationTriangleIcon, EyeIcon, TrashIcon, DocumentTextIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const IdentificationManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, not_submitted: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
    fetchStats();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/identification/pending');
      setPendingUsers(response.data.pendingUsers);
    } catch (error) {
      toast.error('خطا در دریافت درخواست‌های در انتظار');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/identification/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReview = async (action) => {
    if (!selectedUser) return;
    setProcessing(true);
    
    try {
      const payload = { action };
      if (action === 'reject' && rejectionReason.trim()) {
        payload.rejectionReason = rejectionReason.trim();
      }

      await api.post(`/identification/review/${selectedUser._id}`, payload);
      toast.success(action === 'approve' ? 'کاربر با موفقیت تایید شد' : 'درخواست رد شد');
      
      await fetchPendingUsers();
      await fetchStats();
      setShowReviewModal(false);
      setShowPhotoModal(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('خطا در بررسی درخواست');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'talent': return 'استعداد';
      case 'casting_director': return 'کارگردان';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'talent': return 'bg-blue-100 text-blue-800';
      case 'casting_director': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری درخواست‌های شناسایی..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت شناسایی کاربران</h1>
        <p className="text-gray-600">بررسی و تایید عکس‌های شناسایی کاربران</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">در انتظار بررسی</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
              <div className="text-sm text-gray-600">تایید شده</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
              <div className="text-sm text-gray-600">رد شده</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{stats.not_submitted}</div>
              <div className="text-sm text-gray-600">ارسال نشده</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            درخواست‌های در انتظار بررسی ({pendingUsers.length} مورد)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        آپلود شده در: {formatDate(user.uploadedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPhotoModal(true);
                      }}
                      className="btn-outline flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 ml-2" />
                      مشاهده عکس
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowReviewModal(true);
                      }}
                      className="btn-primary flex items-center"
                    >
                      <ShieldCheckIcon className="w-4 h-4 ml-2" />
                      بررسی
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                هیچ درخواستی در انتظار بررسی نیست
              </h3>
              <p className="text-gray-500">تمام درخواست‌های شناسایی بررسی شده‌اند</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  عکس شناسایی - {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <button onClick={() => setShowPhotoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="mb-4">
                <img src={selectedUser.photoUrl} alt="عکس شناسایی" className="w-full rounded-lg border border-gray-200" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  آپلود شده در: {formatDate(selectedUser.uploadedAt)}
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => {
                      setShowPhotoModal(false);
                      setShowReviewModal(true);
                    }}
                    className="btn-primary"
                  >
                    بررسی و تصمیم‌گیری
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">بررسی درخواست شناسایی</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  کاربر: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                </p>
                <p className="text-gray-600 mb-4">
                  نقش: <strong>{getRoleText(selectedUser.role)}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">دلیل رد (اختیاری)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="در صورت رد درخواست، دلیل را وارد کنید..."
                    className="input-field"
                    rows="3"
                  />
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleReview('approve')}
                    disabled={processing}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    {processing ? 'در حال تایید...' : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 ml-2" />
                        تایید
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleReview('reject')}
                    disabled={processing}
                    className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex-1 flex items-center justify-center"
                  >
                    {processing ? 'در حال رد...' : (
                      <>
                        <XCircleIcon className="w-4 h-4 ml-2" />
                        رد
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentificationManagement;
