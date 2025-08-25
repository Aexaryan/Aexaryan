import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import WriterLayout from '../../components/Writer/WriterLayout';
import WriterStats from '../../components/Writer/WriterStats';
import WriterRecentActivity from '../../components/Writer/WriterRecentActivity';
import WriterQuickActions from '../../components/Writer/WriterQuickActions';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const WriterDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    pendingArticles: 0,
    approvedArticles: 0,
    rejectedArticles: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, articlesRes, newsRes] = await Promise.all([
        api.get('/writer/stats'),
        api.get('/writer/recent-articles'),
        api.get('/writer/recent-news')
      ]);

      setStats(statsRes.data);
      setRecentArticles(articlesRes.data.articles || []);
      setRecentNews(newsRes.data.news || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('خطا در بارگذاری اطلاعات داشبورد');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری داشبورد نویسنده..." />;
  }

  return (
    <WriterLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-600 mb-2">
          داشبورد نویسنده
        </h1>
        <p className="text-black">
          خوش آمدید {user?.name}! اینجا می‌توانید محتوای خود را مدیریت کنید.
        </p>
      </div>

          {/* Stats Cards */}
          <WriterStats stats={stats} />

          {/* Quick Actions */}
          <WriterQuickActions />

          {/* Recent Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Recent Articles */}
            <div className="bg-white rounded shadow border border-secondary-200 p-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                آخرین مقالات
              </h2>
              <WriterRecentActivity 
                items={recentArticles} 
                type="articles"
                emptyMessage="هنوز مقاله‌ای منتشر نکرده‌اید"
              />
            </div>

            {/* Recent News */}
            <div className="bg-white rounded shadow border border-secondary-200 p-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                آخرین اخبار
              </h2>
              <WriterRecentActivity 
                items={recentNews} 
                type="news"
                emptyMessage="هنوز خبری منتشر نکرده‌اید"
              />
            </div>
          </div>
        </WriterLayout>
      );
    };

export default WriterDashboard;
