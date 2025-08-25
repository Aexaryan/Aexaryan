import React, { useState } from 'react';
import { XMarkIcon, FlagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, reportType, targetId, targetTitle }) => {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    evidenceLinks: []
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportCategories = {
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

  const reportTypeLabels = {
    casting: 'کستینگ',
    user: 'کاربر',
    application: 'درخواست',
    system: 'سیستم',
    other: 'سایر'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      toast.error('حداکثر 5 فایل مجاز است');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addEvidenceLink = () => {
    setFormData(prev => ({
      ...prev,
      evidenceLinks: [...prev.evidenceLinks, { url: '', description: '' }]
    }));
  };

  const updateEvidenceLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      evidenceLinks: prev.evidenceLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeEvidenceLink = (index) => {
    setFormData(prev => ({
      ...prev,
      evidenceLinks: prev.evidenceLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.description) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('reportType', reportType);
      if (targetId) formDataToSend.append('targetId', targetId);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      if (formData.evidenceLinks.length > 0) {
        formDataToSend.append('evidenceLinks', JSON.stringify(formData.evidenceLinks));
      }

      files.forEach(file => {
        formDataToSend.append('evidence', file);
      });

      const response = await api.post('/reports', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('گزارش با موفقیت ارسال شد');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting report:', error);
      const message = error.response?.data?.error || 'خطا در ارسال گزارش';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      evidenceLinks: []
    });
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FlagIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ارسال گزارش</h2>
              <p className="text-sm text-gray-600">
                گزارش {reportTypeLabels[reportType]}
                {targetTitle && `: ${targetTitle}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دسته‌بندی گزارش *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">انتخاب کنید</option>
              {Object.entries(reportCategories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان گزارش *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="عنوان کوتاه و واضح برای گزارش"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="توضیحات کامل و دقیق درباره مشکل"
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 کاراکتر
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فایل‌های پیوست (اختیاری)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FlagIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  کلیک کنید یا فایل‌ها را اینجا بکشید
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  حداکثر 5 فایل (تصاویر، PDF، Word)
                </span>
              </label>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                لینک‌های مرتبط (اختیاری)
              </label>
              <button
                type="button"
                onClick={addEvidenceLink}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + افزودن لینک
              </button>
            </div>
            
            {formData.evidenceLinks.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateEvidenceLink(index, 'url', e.target.value)}
                  placeholder="لینک"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={link.description}
                  onChange={(e) => updateEvidenceLink(index, 'description', e.target.value)}
                  placeholder="توضیحات"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeEvidenceLink(index)}
                  className="px-3 py-2 text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">توجه:</p>
                <p>گزارش‌های نادرست ممکن است منجر به محدودیت حساب کاربری شما شود. لطفاً فقط موارد واقعی را گزارش دهید.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال گزارش'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
