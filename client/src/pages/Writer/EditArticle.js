import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  EyeIcon,
  PhotoIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    imageAlt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isPublished: false,
    isBreaking: false,
    isFeatured: false
  });

  const categories = [
    { value: 'interviews', label: 'مصاحبه‌ها' },
    { value: 'reviews', label: 'نقد و بررسی' },
    { value: 'tutorials', label: 'آموزشی' },
    { value: 'news', label: 'اخبار' },
    { value: 'analysis', label: 'تحلیل' },
    { value: 'opinion', label: 'نظر شخصی' }
  ];

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/writer/articles/${id}`);
      const article = response.data.article;
      
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        imageAlt: article.imageAlt || '',
        seoTitle: article.seo?.title || '',
        seoDescription: article.seo?.description || '',
        seoKeywords: article.seo?.keywords || '',
        isPublished: article.status === 'published',
        isBreaking: article.isBreaking || false,
        isFeatured: article.isFeatured || false
      });

      if (article.featuredImage) {
        setOriginalImage(article.featuredImage);
        setImagePreview(article.featuredImage);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('خطا در دریافت مقاله');
      navigate('/writer/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('عنوان و محتوا الزامی است');
      return;
    }

    if (formData.content.trim().length < 100) {
      toast.error('محتوا باید حداقل 100 کاراکتر باشد');
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category', formData.category);
      
      // Convert tags string to JSON array
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      formDataToSend.append('tags', JSON.stringify(tagsArray));
      
      formDataToSend.append('imageAlt', formData.imageAlt);
      
      // SEO data
      const seoData = {
        title: formData.seoTitle || formData.title,
        description: formData.seoDescription || formData.excerpt,
        keywords: formData.seoKeywords || formData.tags || ''
      };
      formDataToSend.append('seo', JSON.stringify(seoData));
      
      // Publishing options
      formDataToSend.append('isPublished', formData.isPublished);
      formDataToSend.append('isBreaking', formData.isBreaking);
      formDataToSend.append('isFeatured', formData.isFeatured);
      
      if (featuredImage) {
        formDataToSend.append('featuredImage', featuredImage);
      }

      const response = await api.put(`/writer/articles/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('مقاله با موفقیت ویرایش شد');
      navigate('/writer/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      const message = error.response?.data?.error || 'خطا در ویرایش مقاله';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">پیش‌نمایش مقاله</h2>
        
        {imagePreview && (
          <div className="mb-6">
            <img 
              src={imagePreview} 
              alt={formData.imageAlt || formData.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'عنوان مقاله'}</h1>
        
        {formData.excerpt && (
          <p className="text-gray-600 text-lg mb-4">{formData.excerpt}</p>
        )}
        
        {formData.category && (
          <div className="mb-4">
            <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
              {categories.find(cat => cat.value === formData.category)?.label || formData.category}
            </span>
          </div>
        )}
        
        {formData.tags && (
          <div className="mb-4 flex flex-wrap gap-2">
            {formData.tags.split(',').map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>محتوا اینجا نمایش داده می‌شود...</p>' }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری مقاله..." />;
  }

  return (
    <WriterLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-primary-600 ml-3" />
              <h1 className="text-2xl font-bold text-gray-900">ویرایش مقاله</h1>
            </div>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <EyeIcon className="w-4 h-4 ml-2" />
              {previewMode ? 'ویرایش' : 'پیش‌نمایش'}
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            تغییرات شما پس از ذخیره اعمال خواهد شد
          </p>
        </div>

        {previewMode ? (
          renderPreview()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات اصلی</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان مقاله *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="عنوان مقاله را وارد کنید"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خلاصه مقاله
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="خلاصه کوتاهی از مقاله بنویسید"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      دسته‌بندی
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">انتخاب دسته‌بندی</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      برچسب‌ها
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="برچسب‌ها را با کاما جدا کنید"
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    انتخاب تصویر
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">کلیک کنید</span> یا تصویر را اینجا بکشید
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG یا GIF تا 10MB</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          پیش‌نمایش تصویر انتخاب شده
                        </label>
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="پیش‌نمایش تصویر"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFeaturedImage(null);
                              setImagePreview(originalImage);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      متن جایگزین تصویر
                    </label>
                    <input
                      type="text"
                      name="imageAlt"
                      value={formData.imageAlt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="توضیح تصویر برای دسترسی‌پذیری"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">محتوا *</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محتوای مقاله
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="محتوای مقاله را اینجا بنویسید..."
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    می‌توانید از HTML برای فرمت‌بندی استفاده کنید
                  </p>
                  <p className={`text-sm ${formData.content.length < 100 ? 'text-red-500' : 'text-green-500'}`}>
                    {formData.content.length}/100 کاراکتر
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">تنظیمات SEO</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان SEO
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="عنوان بهینه‌سازی شده برای موتورهای جستجو"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات SEO
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="توضیحات بهینه‌سازی شده برای موتورهای جستجو"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کلمات کلیدی SEO
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="کلمات کلیدی را با کاما جدا کنید"
                  />
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">تنظیمات انتشار</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    منتشر کردن مقاله
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBreaking"
                    checked={formData.isBreaking}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    خبر فوری
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    مقاله ویژه
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/writer/articles')}
                className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </form>
        )}
      </div>
    </WriterLayout>
  );
};

export default EditArticle;
