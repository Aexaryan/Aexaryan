import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  DocumentTextIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    imageAlt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  const categories = [
    { value: 'casting_tips', label: 'نکات کستینگ' },
    { value: 'industry_news', label: 'اخبار صنعت' },
    { value: 'success_stories', label: 'داستان‌های موفقیت' },
    { value: 'interviews', label: 'مصاحبه‌ها' },
    { value: 'tutorials', label: 'آموزش‌ها' },
    { value: 'career_advice', label: 'مشاوره شغلی' },
    { value: 'technology', label: 'فناوری' },
    { value: 'events', label: 'رویدادها' },
    { value: 'other', label: 'سایر' }
  ];

  useEffect(() => {
    if (id) {
      fetchBlogData();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${id}/edit`);
      const blog = response.data.blog;
      
      // Check if user is the author
      if (blog.author._id !== response.data.currentUser?.id) {
        toast.error('شما مجاز به ویرایش این مقاله نیستید');
        navigate('/director/blogs');
        return;
      }

      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category || '',
        tags: blog.tags ? blog.tags.join(', ') : '',
        imageAlt: blog.featuredImage?.alt || '',
        seoTitle: blog.seo?.title || '',
        seoDescription: blog.seo?.description || '',
        seoKeywords: blog.seo?.keywords || ''
      });

      if (blog.featuredImage?.url) {
        setImagePreview(blog.featuredImage.url);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('خطا در دریافت اطلاعات مقاله');
      navigate('/director/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      setSubmitting(true);
      
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
      
      if (featuredImage) {
        formDataToSend.append('featuredImage', featuredImage);
      }

      const response = await api.put(`/blogs/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message);
      navigate('/director/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      const message = error.response?.data?.error || 'خطا در به‌روزرسانی مقاله';
      toast.error(message);
    } finally {
      setSubmitting(false);
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
        
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-primary-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">ویرایش مقاله</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 ml-2" />
                  {previewMode ? 'خروج از پیش‌نمایش' : 'پیش‌نمایش'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/director/blogs')}
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              ویرایش و به‌روزرسانی مقاله خود
            </p>
          </div>

          {previewMode ? (
            renderPreview()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">اطلاعات اصلی</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان مقاله *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input-field"
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
                      className="input-field"
                      placeholder="خلاصه کوتاهی از مقاله (اختیاری)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      دسته‌بندی
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">انتخاب دسته‌بندی</option>
                      {categories.map((category) => (
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
                      className="input-field"
                      placeholder="برچسب‌ها را با کاما جدا کنید (مثال: کستینگ، سینما، بازیگری)"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">محتوای مقاله</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محتوای مقاله *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={15}
                    className="input-field"
                    placeholder="محتوای مقاله را وارد کنید..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    حداقل 100 کاراکتر مورد نیاز است. ({formData.content.length} کاراکتر)
                  </p>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">تصویر شاخص</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      انتخاب تصویر
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">کلیک کنید</span> یا فایل را بکشید
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG یا GIF (حداکثر 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      متن جایگزین تصویر
                    </label>
                    <input
                      type="text"
                      name="imageAlt"
                      value={formData.imageAlt}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="توضیح تصویر برای موتورهای جستجو"
                    />
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      پیش‌نمایش تصویر
                    </label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">تنظیمات SEO</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان SEO
                    </label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="عنوان برای موتورهای جستجو (اختیاری)"
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
                      className="input-field"
                      placeholder="توضیحات برای موتورهای جستجو (اختیاری)"
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
                      className="input-field"
                      placeholder="کلمات کلیدی را با کاما جدا کنید (اختیاری)"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/director/blogs')}
                  className="btn-secondary"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      در حال به‌روزرسانی...
                    </div>
                  ) : (
                    'به‌روزرسانی مقاله'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
