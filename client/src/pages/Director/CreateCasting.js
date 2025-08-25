import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import PublishingModal from '../../components/Director/PublishingModal';
import DraftNotificationModal from '../../components/Director/DraftNotificationModal';

const CreateCasting = () => {
  const { user, loading: authLoading, token } = useAuth(); // Get user, loading state, and token from context

  // Initial form state
  const initialFormData = {
    title: '',
    description: '',
    projectType: 'film',
    roleType: 'lead',
    location: {
      city: '',
      province: '',
      specificLocation: ''
    },
    shootingSchedule: {
      startDate: '',
      endDate: '',
      duration: '',
      timeCommitment: ''
    },
    requirements: {
      ageRange: { min: '', max: '' },
      gender: 'any',
      heightRange: { min: '', max: '' },
      requiredSkills: [],
      languages: [],
      physicalRequirements: '',
      experienceLevel: 'any'
    },
    compensation: {
      type: 'paid',
      amount: { min: '', max: '', currency: 'IRR' },
      paymentStructure: '',
      additionalBenefits: ''
    },
    applicationDeadline: '',
    applicationInstructions: '',
    tags: [],
    isPremium: false,
    isUrgent: false,
  };

  // State for the main form data, structured to match the Mongoose schema
  const [formData, setFormData] = useState(initialFormData);

  // State for dynamic fields like skills, languages, and tags
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'intermediate' });
  const [newTag, setNewTag] = useState('');

  
  // State for photos
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // State for publishing modals
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [createdCastingId, setCreatedCastingId] = useState(null);
  const [publishingLoading, setPublishingLoading] = useState(false);

  // Generic handler for one-level nested objects (e.g., location, shootingSchedule)
  const handleNestedChange = (e, parentKey) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [name]: value
      }
    }));
  };

  // Handler for two-level nested objects (e.g., ageRange, heightRange, amount)
  const handleDeepNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: {
          ...prev[parentKey][childKey],
          [name]: value
        }
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !formData.requirements.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          requiredSkills: [...prev.requirements.requiredSkills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        requiredSkills: prev.requirements.requiredSkills.filter(s => s !== skill)
      }
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.language.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          languages: [...prev.requirements.languages, newLanguage]
        }
      }));
      setNewLanguage({ language: '', proficiency: 'intermediate' });
    }
  };
  
  const handleRemoveLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        languages: prev.requirements.languages.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() !== '' && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Photo upload handlers
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً فقط فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    // Validate number of photos
    if (photos.length >= 4) {
      toast.error('حداکثر ۴ عکس مجاز است');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post('/upload/casting-photo', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const newPhoto = {
        url: response.data.url,
        caption: '',
        uploadedAt: new Date()
      };

      setPhotos(prev => [...prev, newPhoto]);
      toast.success('عکس با موفقیت آپلود شد');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error.response?.data?.error || 'خطا در آپلود عکس');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoCaptionChange = (index, caption) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, caption } : photo
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the user is authenticated and has the correct role
    if (!user || !token) {
      toast.error('برای ایجاد کستینگ باید وارد حساب کاربری خود شوید.');
      return;
    }

    // New check for user role
    if (user.role !== 'casting_director') {
      toast.error('شما به عنوان کارگردان کستینگ مجاز به ایجاد کستینگ هستید.');
      return;
    }

    // Validate payment structure when compensation type is 'paid'
    if (formData.compensation.type === 'paid' && !formData.compensation.paymentStructure) {
      toast.error('لطفاً ساختار پرداخت را انتخاب کنید.');
      return;
    }

    // Validate amount when compensation type is 'paid'
    if (formData.compensation.type === 'paid' && 
        (!formData.compensation.amount.min && !formData.compensation.amount.max)) {
      toast.error('لطفاً حداقل یا حداکثر مبلغ را وارد کنید.');
      return;
    }

    // Validate photos requirement
    if (photos.length === 0) {
      toast.error('حداقل یک عکس برای کستینگ الزامی است.');
      return;
    }

    // Show publishing modal instead of directly submitting
    setShowPublishingModal(true);
  };

  // Function to prepare casting data
  const prepareCastingData = (status = 'draft') => {
    const cleanedFormData = {
      ...formData,
      status: status,
      applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
      compensation: {
        ...formData.compensation,
        paymentStructure: formData.compensation.paymentStructure || undefined,
        amount: {
          ...formData.compensation.amount,
          min: formData.compensation.amount.min || undefined,
          max: formData.compensation.amount.max || undefined
        }
      },
      requirements: {
        ...formData.requirements,
        ageRange: {
          min: formData.requirements.ageRange.min || undefined,
          max: formData.requirements.ageRange.max || undefined
        },
        heightRange: {
          min: formData.requirements.heightRange.min || undefined,
          max: formData.requirements.heightRange.max || undefined
        }
      }
    };

    return {
      ...cleanedFormData,
      photos: photos
    };
  };

  // Function to publish casting immediately
  const handlePublish = async () => {
    setPublishingLoading(true);
    try {
      const castingData = prepareCastingData('active');
      
      const response = await api.post('/castings', castingData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('کستینگ با موفقیت منتشر شد!');
      console.log('Casting published:', response.data);
      
      // Reset form and close modal
      setFormData(initialFormData);
      setNewSkill('');
      setNewLanguage({ language: '', proficiency: 'intermediate' });
      setNewTag('');
      setPhotos([]);
      setShowPublishingModal(false);
      
      // Optional: Redirect to my castings page
      // window.location.href = '/director/my-castings';
      
    } catch (error) {
      console.error('Casting publishing error:', error);
      toast.error(error.response?.data?.error || 'خطا در انتشار کستینگ');
    } finally {
      setPublishingLoading(false);
    }
  };

  // Function to save casting as draft
  const handleSaveDraft = async () => {
    setPublishingLoading(true);
    try {
      const castingData = prepareCastingData('draft');
      
      const response = await api.post('/castings', castingData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Casting saved as draft:', response.data);
      
      // Set the created casting ID for the notification modal
      setCreatedCastingId(response.data._id);
      
      // Close publishing modal and show draft notification
      setShowPublishingModal(false);
      setShowDraftNotification(true);
      
    } catch (error) {
      console.error('Casting draft save error:', error);
      toast.error(error.response?.data?.error || 'خطا در ذخیره کستینگ');
    } finally {
      setPublishingLoading(false);
    }
  };

  // Function to close draft notification and reset form
  const handleCloseDraftNotification = () => {
    setShowDraftNotification(false);
    setCreatedCastingId(null);
    
    // Reset form
    setFormData(initialFormData);
    setNewSkill('');
    setNewLanguage({ language: '', proficiency: 'intermediate' });
    setNewTag('');
    setPhotos([]);
  };

  // Show a loading spinner if authentication is in progress
  if (authLoading) {
    return <LoadingSpinner text="در حال بارگذاری..." />;
  }
  
  // Show a message if the user is not authenticated
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">شما وارد حساب کاربری خود نشده‌اید</h2>
        <p className="text-gray-600">برای ایجاد یک کستینگ جدید، لطفا وارد حساب کاربری خود شوید.</p>
      </div>
    );
  }

  // Show a message if the user is not a casting director
  if (user.role !== 'casting_director') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">دسترسی محدود</h2>
        <p className="text-gray-600">فقط کارگردانان کستینگ می‌توانند کستینگ جدید ایجاد کنند.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ایجاد کستینگ جدید</h1>
        <p className="text-gray-600">انتشار فرصت شغلی جدید</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
        {/* Basic Information */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">اطلاعات پایه</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="مثلا: فراخوان بازیگر برای فیلم کوتاه در تهران"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="input-field"
              placeholder="شرح کامل پروژه، داستان، نقش و ..."
              required
            />
          </div>
        </div>

        {/* Photos Section */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">عکس‌های کستینگ</h2>
          <p className="text-sm text-gray-600 mb-4">
            حداقل ۱ و حداکثر ۴ عکس برای کستینگ الزامی است. عکس‌ها باید کیفیت خوبی داشته باشند.
          </p>
          
          {/* Photo Upload Area */}
          <div className="space-y-4">
            {/* Upload Button */}
            {photos.length < 4 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhoto}
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingPhoto ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 ml-2"></div>
                      در حال آپلود...
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-gray-600">برای آپلود عکس کلیک کنید</span>
                      <span className="text-sm text-gray-500 mt-1">
                        حداکثر ۵ مگابایت - فرمت‌های JPG، PNG، GIF
                      </span>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Photo Counter */}
            <div className="text-sm text-gray-600">
              {photos.length} از ۴ عکس آپلود شده
            </div>

            {/* Uploaded Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.url}
                        alt={`عکس کستینگ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Caption Input */}
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => handlePhotoCaptionChange(index, e.target.value)}
                      placeholder="توضیح عکس (اختیاری)"
                      className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">جزئیات پروژه</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع پروژه *</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="input-field-select"
                required
              >
                <option value="film">فیلم</option>
                <option value="tv_series">سریال تلویزیونی</option>
                <option value="commercial">تبلیغات</option>
                <option value="theater">تئاتر</option>
                <option value="music_video">موزیک ویدیو</option>
                <option value="documentary">مستند</option>
                <option value="web_series">سریال اینترنتی</option>
                <option value="educational_course">دوره آموزشی</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع نقش *</label>
              <select
                name="roleType"
                value={formData.roleType}
                onChange={handleInputChange}
                className="input-field-select"
                required
              >
                <option value="lead">نقش اصلی</option>
                <option value="supporting">نقش مکمل</option>
                <option value="background">پس‌زمینه</option>
                <option value="extra">سیاهی لشگر</option>
                <option value="voice_over">صدا پیشه</option>
                <option value="other">سایر</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">مکان و زمان</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شهر *</label>
              <input
                type="text"
                name="city"
                value={formData.location.city}
                onChange={(e) => handleNestedChange(e, 'location')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">استان *</label>
              <input
                type="text"
                name="province"
                value={formData.location.province}
                onChange={(e) => handleNestedChange(e, 'location')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">محل دقیق (اختیاری)</label>
              <input
                type="text"
                name="specificLocation"
                value={formData.location.specificLocation}
                onChange={(e) => handleNestedChange(e, 'location')}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع فیلمبرداری</label>
              <input
                type="date"
                name="startDate"
                value={formData.shootingSchedule.startDate}
                onChange={(e) => handleNestedChange(e, 'shootingSchedule')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان فیلمبرداری</label>
              <input
                type="date"
                name="endDate"
                value={formData.shootingSchedule.endDate}
                onChange={(e) => handleNestedChange(e, 'shootingSchedule')}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مدت زمان</label>
              <input
                type="text"
                name="duration"
                value={formData.shootingSchedule.duration}
                onChange={(e) => handleNestedChange(e, 'shootingSchedule')}
                className="input-field"
                placeholder="مثلا: ۲ هفته، ۳ ماه"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع تعهد زمانی</label>
              <input
                type="text"
                name="timeCommitment"
                value={formData.shootingSchedule.timeCommitment}
                onChange={(e) => handleNestedChange(e, 'shootingSchedule')}
                className="input-field"
                placeholder="مثلا: تمام وقت، پاره وقت"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">شرایط مورد نیاز</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رنج سنی (سال)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="min"
                  value={formData.requirements.ageRange.min}
                  onChange={(e) => handleDeepNestedChange(e, 'requirements', 'ageRange')}
                  className="input-field flex-1"
                  placeholder="حداقل"
                />
                <span>تا</span>
                <input
                  type="number"
                  name="max"
                  value={formData.requirements.ageRange.max}
                  onChange={(e) => handleDeepNestedChange(e, 'requirements', 'ageRange')}
                  className="input-field flex-1"
                  placeholder="حداکثر"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
              <select
                name="gender"
                value={formData.requirements.gender}
                onChange={(e) => handleNestedChange(e, 'requirements')}
                className="input-field-select"
              >
                <option value="any">فرقی نمی‌کند</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
                <option value="non_binary">غیر باینری</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رنج قد (سانتی‌متر)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="min"
                  value={formData.requirements.heightRange.min}
                  onChange={(e) => handleDeepNestedChange(e, 'requirements', 'heightRange')}
                  className="input-field flex-1"
                  placeholder="حداقل"
                />
                <span>تا</span>
                <input
                  type="number"
                  name="max"
                  value={formData.requirements.heightRange.max}
                  onChange={(e) => handleDeepNestedChange(e, 'requirements', 'heightRange')}
                  className="input-field flex-1"
                  placeholder="حداکثر"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سطح تجربه</label>
              <select
                name="experienceLevel"
                value={formData.requirements.experienceLevel}
                onChange={(e) => handleNestedChange(e, 'requirements')}
                className="input-field-select"
              >
                <option value="any">فرقی نمی‌کند</option>
                <option value="beginner">مبتدی</option>
                <option value="intermediate">متوسط</option>
                <option value="experienced">با تجربه</option>
                <option value="professional">حرفه‌ای</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مهارت‌های مورد نیاز</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="input-field flex-1"
                  placeholder="مهارت جدید..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-outline"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="mr-2 text-gray-600 hover:text-gray-800"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">زبان‌ها</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLanguage.language}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, language: e.target.value }))}
                  className="input-field flex-1"
                  placeholder="زبان..."
                />
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, proficiency: e.target.value }))}
                  className="input-field-select"
                >
                  <option value="beginner">مبتدی</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">پیشرفته</option>
                  <option value="native">زبان مادری</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="btn-outline"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-sm text-gray-600 mr-2">
                        ({lang.proficiency === 'beginner' ? 'مبتدی' :
                          lang.proficiency === 'intermediate' ? 'متوسط' :
                          lang.proficiency === 'advanced' ? 'پیشرفته' : 'زبان مادری'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(index)}
                      className="bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded transition-colors duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات فیزیکی (اختیاری)</label>
              <textarea
                name="physicalRequirements"
                value={formData.requirements.physicalRequirements}
                onChange={(e) => handleNestedChange(e, 'requirements')}
                rows={3}
                className="input-field"
                placeholder="مثلا: اندام ورزشی، ظاهر خاص"
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">جبران خدمت</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع پرداخت</label>
            <select
              name="type"
              value={formData.compensation.type}
              onChange={(e) => handleNestedChange(e, 'compensation')}
              className="input-field-select"
            >
              <option value="paid">پرداخت نقدی</option>
              <option value="unpaid">بدون پرداخت</option>
              <option value="deferred">پرداخت موکول به زمان دیگر</option>
              <option value="copy_credit_meals">کپی، اعتبار، وعده غذایی</option>
            </select>
          </div>
          {formData.compensation.type === 'paid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رنج مبلغ (ریال) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="min"
                    value={formData.compensation.amount.min}
                    onChange={(e) => handleDeepNestedChange(e, 'compensation', 'amount')}
                    className="input-field flex-1"
                    placeholder="حداقل"
                  />
                  <span>تا</span>
                  <input
                    type="number"
                    name="max"
                    value={formData.compensation.amount.max}
                    onChange={(e) => handleDeepNestedChange(e, 'compensation', 'amount')}
                    className="input-field flex-1"
                    placeholder="حداکثر"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ساختار پرداخت *</label>
                <select
                  name="paymentStructure"
                  value={formData.compensation.paymentStructure}
                  onChange={(e) => handleNestedChange(e, 'compensation')}
                  className="input-field-select"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  <option value="per_day">روزانه</option>
                  <option value="per_hour">ساعتی</option>
                  <option value="flat_rate">مقطوع</option>
                  <option value="percentage">درصدی از فروش</option>
                  <option value="other">سایر</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مزایای دیگر (اختیاری)</label>
            <textarea
              name="additionalBenefits"
              value={formData.compensation.additionalBenefits}
              onChange={(e) => handleNestedChange(e, 'compensation')}
              rows={3}
              className="input-field"
              placeholder="مثلا: هزینه حمل و نقل، لباس"
            />
          </div>
        </div>

        {/* Application Details & Metadata */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">جزئیات درخواست و برچسب‌ها</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">آخرین مهلت ارسال درخواست *</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">دستورالعمل‌های درخواست</label>
            <textarea
              name="applicationInstructions"
              value={formData.applicationInstructions}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="توضیحات تکمیلی برای متقاضیان"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">برچسب‌ها</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field flex-1"
                placeholder="برچسب جدید (مثلا: سینما، نقش اول)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-outline"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="mr-2 bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded transition-colors duration-200"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleInputChange}
                className="checkbox"
              />
              <label className="text-sm font-medium text-gray-700">فوری</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleInputChange}
                className="checkbox"
              />
              <label className="text-sm font-medium text-gray-700">کستینگ ویژه</label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            ادامه و انتخاب نحوه انتشار
          </button>
        </div>
      </form>

      {/* Publishing Modal */}
      <PublishingModal
        isOpen={showPublishingModal}
        onClose={() => setShowPublishingModal(false)}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        loading={publishingLoading}
      />

      {/* Draft Notification Modal */}
      <DraftNotificationModal
        isOpen={showDraftNotification}
        onClose={handleCloseDraftNotification}
        castingId={createdCastingId}
      />
    </div>
  );
};

export default CreateCasting;
