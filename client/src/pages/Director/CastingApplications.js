import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowRightIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const CastingApplications = () => {
  const { id } = useParams();
  const [casting, setCasting] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState([]);

  useEffect(() => {
    fetchCastingApplications();
  }, [id, filter]);

  const fetchCastingApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const [castingRes, applicationsRes] = await Promise.all([
        axios.get(`/castings/${id}`),
        axios.get(`/castings/${id}/applications?${params.toString()}`)
      ]);

      setCasting(castingRes.data.casting);
      setApplications(applicationsRes.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus, notes = '') => {
    try {
      await axios.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
        directorNotes: notes
      });
      
      fetchCastingApplications();
      toast.success('وضعیت درخواست تغییر کرد');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedApplications.length === 0) {
      toast.error('لطفاً حداقل یک درخواست انتخاب کنید');
      return;
    }

    try {
      await axios.patch('/applications/bulk/status', {
        applicationIds: selectedApplications,
        status: newStatus
      });
      
      setSelectedApplications([]);
      fetchCastingApplications();
      toast.success(`وضعیت ${selectedApplications.length} درخواست تغییر کرد`);
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    const allIds = applications.map(app => app._id);
    setSelectedApplications(
      selectedApplications.length === applications.length ? [] : allIds
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'در انتظار',
      reviewed: 'بررسی شده',
      shortlisted: 'فهرست کوتاه',
      accepted: 'پذیرفته شده',
      rejected: 'رد شده',
      withdrawn: 'لغو شده'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'shortlisted':
        return <CheckCircleIcon className="w-5 h-5 text-purple-600" />;
      case 'reviewed':
        return <EyeIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری درخواست‌ها..." />;
  }

  if (!casting) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">کستینگ یافت نشد</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/director/castings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="w-5 h-5 ml-2" />
          بازگشت به کستینگ‌ها
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          درخواست‌های کستینگ
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">{casting.title}</h2>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>نوع پروژه: {casting.projectType}</span>
          <span>نوع نقش: {casting.roleType}</span>
          <span>کل درخواست‌ها: {applications.length}</span>
        </div>
      </div>

      {/* Filter and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">فیلتر:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">همه درخواست‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="reviewed">بررسی شده</option>
              <option value="shortlisted">فهرست کوتاه</option>
              <option value="accepted">پذیرفته شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>

          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedApplications.length} انتخاب شده
              </span>
              <button
                onClick={() => handleBulkStatusChange('reviewed')}
                className="btn-outline btn-sm"
              >
                علامت‌گذاری به عنوان بررسی شده
              </button>
              <button
                onClick={() => handleBulkStatusChange('shortlisted')}
                className="btn-outline btn-sm"
              >
                اضافه به فهرست کوتاه
              </button>
              <button
                onClick={() => handleBulkStatusChange('rejected')}
                className="btn-secondary btn-sm text-red-600"
              >
                رد کردن
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedApplications.length === applications.length && applications.length > 0}
              onChange={selectAllApplications}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="mr-2 text-sm font-medium text-gray-700">
              انتخاب همه ({applications.length} درخواست)
            </label>
          </div>

          {applications.map((application) => (
            <div key={application._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedApplications.includes(application._id)}
                  onChange={() => toggleApplicationSelection(application._id)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />

                {/* Talent Info */}
                <div className="flex-shrink-0">
                  {application.talentSnapshot?.headshot ? (
                    <img
                      src={application.talentSnapshot.headshot}
                      alt={application.talentSnapshot.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.talentSnapshot?.name || 'نام نامشخص'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {application.talentSnapshot?.age && (
                          <span>{application.talentSnapshot.age} سال</span>
                        )}
                        {application.talentSnapshot?.height && (
                          <span>{application.talentSnapshot.height} سانتی‌متر</span>
                        )}
                        <span>
                          ارسال شده: {new Date(application.submittedAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <span className={`status-${application.status} font-medium`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.talentSnapshot?.skills?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">مهارت‌ها:</h4>
                      <div className="flex flex-wrap gap-1">
                        {application.talentSnapshot.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                        {application.talentSnapshot.skills.length > 4 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{application.talentSnapshot.skills.length - 4} مورد دیگر
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cover Message */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">پیام پوششی:</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {application.coverMessage}
                    </p>
                  </div>

                  {/* Director Notes */}
                  {application.directorNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">یادداشت شما:</h4>
                      <p className="text-sm text-yellow-800">{application.directorNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/director/talents/${application.talent._id}`}
                        className="btn-outline btn-sm"
                      >
                        مشاهده پروفایل
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application._id, 'reviewed')}
                            className="btn-outline btn-sm"
                          >
                            بررسی شده
                          </button>
                          <button
                            onClick={() => handleStatusChange(application._id, 'shortlisted')}
                            className="btn-primary btn-sm"
                          >
                            فهرست کوتاه
                          </button>
                        </>
                      )}
                      
                      {['pending', 'reviewed', 'shortlisted'].includes(application.status) && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application._id, 'accepted')}
                            className="btn-primary btn-sm bg-green-600 hover:bg-green-700"
                          >
                            پذیرش
                          </button>
                          <button
                            onClick={() => handleStatusChange(application._id, 'rejected')}
                            className="btn-secondary btn-sm text-red-600 hover:bg-red-50"
                          >
                            رد
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filter === 'all' ? 'هنوز درخواستی دریافت نکرده‌اید' : 'درخواستی با این وضعیت یافت نشد'}
          </h2>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'صبر کنید تا استعدادها درخواست ارسال کنند'
              : 'فیلتر را تغییر دهید تا درخواست‌های دیگر را مشاهده کنید'
            }
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="btn-primary">
              مشاهده همه درخواست‌ها
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CastingApplications;