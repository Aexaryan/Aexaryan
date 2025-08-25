import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const IdentificationUpload = () => {
  const { user } = useAuth();
  const [identificationStatus, setIdentificationStatus] = useState('not_submitted');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [uploadedAt, setUploadedAt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdentificationStatus();
  }, []);

  const fetchIdentificationStatus = async () => {
    try {
      const response = await api.get('/identification/status');
      const { identificationStatus, hasPhoto, uploadedAt, rejectionReason } = response.data;
      
      setIdentificationStatus(identificationStatus);
      setHasPhoto(hasPhoto);
      setUploadedAt(uploadedAt);
      setRejectionReason(rejectionReason);
    } catch (error) {
      console.error('Error fetching identification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('لطفاً یک عکس انتخاب کنید');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('identificationPhoto', selectedFile);

    try {
      await api.post('/identification/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('عکس شناسایی با موفقیت آپلود شد و در انتظار بررسی است');
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh status
      await fetchIdentificationStatus();
      
    } catch (error) {
      console.error('Error uploading identification photo:', error);
      
      // Provide more specific error messages
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('خطا در آپلود عکس شناسایی');
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusInfo = () => {
    switch (identificationStatus) {
      case 'not_submitted':
        return {
          icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />,
          title: 'عکس شناسایی ارسال نشده',
          description: 'برای تایید حساب کاربری، لطفاً عکس شناسایی خود را آپلود کنید',
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800'
        };
      
      case 'pending':
        return {
          icon: <ClockIcon className="w-8 h-8 text-blue-600" />,
          title: 'در انتظار بررسی',
          description: 'عکس شناسایی شما ارسال شده و در حال بررسی است',
          color: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800'
        };
      
      case 'approved':
        return {
          icon: <CheckCircleIcon className="w-8 h-8 text-green-600" />,
          title: 'تایید شده',
          description: 'حساب کاربری شما تایید شده است',
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800'
        };
      
      case 'rejected':
        return {
          icon: <XCircleIcon className="w-8 h-8 text-red-600" />,
          title: 'رد شده',
          description: rejectionReason || 'عکس شناسایی شما رد شده است',
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800'
        };
      
      default:
        return {
          icon: <ExclamationTriangleIcon className="w-8 h-8 text-gray-600" />,
          title: 'وضعیت نامشخص',
          description: 'وضعیت شناسایی شما مشخص نیست',
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">تایید شناسایی</h2>
        <p className="text-gray-600">
          برای اطمینان از هویت شما، لطفاً عکس شناسایی خود را آپلود کنید
        </p>
      </div>

      {/* Status Display */}
      <div className={`mb-6 p-4 rounded-lg border ${statusInfo.color}`}>
        <div className="flex items-center space-x-3 space-x-reverse">
          {statusInfo.icon}
          <div>
            <h3 className={`font-medium ${statusInfo.textColor}`}>
              {statusInfo.title}
            </h3>
            <p className={`text-sm ${statusInfo.textColor} opacity-80`}>
              {statusInfo.description}
            </p>
            {uploadedAt && (
              <p className={`text-xs ${statusInfo.textColor} opacity-60 mt-1`}>
                آپلود شده در: {formatDate(uploadedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Form - Only show if not submitted or rejected */}
      {(identificationStatus === 'not_submitted' || identificationStatus === 'rejected') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عکس شناسایی
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-2 text-center">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto h-32 w-auto rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      حذف عکس
                    </button>
                  </div>
                ) : (
                  <>
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                        <span>انتخاب عکس</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                      <p className="mr-1">یا فایل را اینجا بکشید</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG تا 5 مگابایت
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ArrowUpTrayIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">راهنمای آپلود عکس شناسایی:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• عکس واضح از کارت ملی یا پاسپورت خود بگیرید</li>
              <li>• عکس را در دست خود نگه دارید تا چهره شما مشخص باشد</li>
              <li>• مطمئن شوید که تمام اطلاعات کارت قابل خواندن است</li>
              <li>• عکس باید در نور مناسب و واضح باشد</li>
            </ul>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال آپلود...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-4 h-4 ml-2" />
                آپلود عکس شناسایی
              </>
            )}
          </button>
        </div>
      )}

      {/* Approved Badge */}
      {identificationStatus === 'approved' && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 space-x-reverse">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              حساب کاربری شما تایید شده است
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            شما می‌توانید از تمام امکانات پلتفرم استفاده کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default IdentificationUpload;
