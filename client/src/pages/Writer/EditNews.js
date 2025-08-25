import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  NewspaperIcon,
  PhotoIcon,
  TagIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EditNews = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: null,
    imageAlt: '',
    isPublished: false,
    isBreaking: false,
    isFeatured: false,
    priority: 'normal',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchNews();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/writer/news/${id}`);
      const news = response.data.news;
      
      setFormData({
        title: news.title || '',
        content: news.content || '',
        excerpt: news.excerpt || '',
        category: news.category || '',
        tags: Array.isArray(news.tags) ? news.tags.join(', ') : news.tags || '',
        featuredImage: null,
        imageAlt: news.imageAlt || '',
        isPublished: news.status === 'published',
        isBreaking: news.isBreaking || false,
        isFeatured: news.isFeatured || false,
        priority: news.priority || 'normal',
        seoTitle: news.seo?.title || '',
        seoDescription: news.seo?.description || '',
        seoKeywords: news.seo?.keywords ? news.seo.keywords.join(', ') : ''
      });

      if (news.featuredImage?.url) {
        setOriginalImage(news.featuredImage.url);
        setImagePreview(news.featuredImage.url);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('خطا در دریافت خبر');
      navigate('/writer/news');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('عنوان و محتوا الزامی است');
      return;
    }

    if (formData.content.trim().length < 50) {
      toast.error('محتوا باید حداقل 50 کاراکتر باشد');
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('imageAlt', formData.imageAlt);
      
      const seoData = {
        title: formData.seoTitle || formData.title,
        description: formData.seoDescription || formData.excerpt,
        keywords: formData.seoKeywords || formData.tags || ''
      };
      formDataToSend.append('seo', JSON.stringify(seoData));
      
      formDataToSend.append('isPublished', formData.isPublished);
      formDataToSend.append('isBreaking', formData.isBreaking);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('priority', formData.priority);
      
      if (formData.featuredImage) {
        formDataToSend.append('featuredImage', formData.featuredImage);
      }

      const response = await api.put(`/writer/news/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('خبر با موفقیت ویرایش شد');
      navigate('/writer/news');
    } catch (error) {
      console.error('Error updating news:', error);
      const message = error.response?.data?.error || 'خطا در ویرایش خبر';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, isPublished: false }));
    await handleSubmit(new Event('submit'));
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری خبر..." />;
  }

  return (
    <WriterLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ویرایش خبر
          </h1>
          <p className="text-gray-600">
            ویرایش و به‌روزرسانی خبر موجود
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <NewspaperIcon className="w-6 h-6" />
              محتوای خبر
            </h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان خبر *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="عنوان خبر را وارد کنید..."
                required
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محتوای خبر *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="محتوای خبر را بنویسید..."
                required
              />
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                خلاصه خبر
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="خلاصه کوتاهی از خبر بنویسید..."
              />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <TagIcon className="w-6 h-6" />
              تنظیمات خبر
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اولویت
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">کم</option>
                  <option value="normal">عادی</option>
                  <option value="high">زیاد</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  برچسب‌ها
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="برچسب‌ها را با کاما جدا کنید..."
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصویر شاخص
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  name="featuredImage"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {(imagePreview || originalImage) && (
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview || originalImage}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              {/* Image Alt Text */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  متن جایگزین تصویر
                </label>
                <input
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="توضیح مختصری برای تصویر..."
                />
              </div>
            </div>

            {/* Options */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="mr-2 block text-sm text-gray-900">
                  منتشر کردن خبر
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isBreaking"
                  checked={formData.isBreaking}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="mr-2 block text-sm text-gray-900 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                  خبر فوری
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="mr-2 block text-sm text-gray-900">
                  خبر ویژه
                </label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <EyeIcon className="w-6 h-6" />
              تنظیمات SEO
            </h2>

            <div className="space-y-6">
              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان SEO
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="عنوان SEO (اختیاری - اگر خالی باشد از عنوان خبر استفاده می‌شود)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.seoTitle.length}/60 کاراکتر
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات SEO
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="توضیحات SEO (اختیاری - اگر خالی باشد از خلاصه خبر استفاده می‌شود)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.seoDescription.length}/160 کاراکتر
                </p>
              </div>

              {/* SEO Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کلمات کلیدی SEO
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="کلمات کلیدی SEO (اختیاری - اگر خالی باشد از برچسب‌ها استفاده می‌شود)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/writer/news')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                ذخیره پیش‌نویس
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">در حال ذخیره...</span>
                  </div>
                ) : (
                  'ذخیره تغییرات'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </WriterLayout>
  );
};

export default EditNews;
