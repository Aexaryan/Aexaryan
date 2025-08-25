import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ChartBarIcon,
  UsersIcon,
  FilmIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  ChartPieIcon,
  SignalIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };



  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Chart configurations
  const visitorTrendsChartData = {
    labels: analytics?.visitorMetrics?.visitorTrends?.map(item => item.date) || [],
    datasets: [
      {
        label: 'بازدیدکنندگان',
        data: analytics?.visitorMetrics?.visitorTrends?.map(item => item.visitors) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const userGrowthChartData = {
    labels: analytics?.userMetrics?.userGrowth?.map(item => item.date) || [],
    datasets: [
      {
        label: 'کاربران جدید',
        data: analytics?.userMetrics?.userGrowth?.map(item => item.newUsers) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  const contentMetricsChartData = {
    labels: ['کستینگ‌ها', 'درخواست‌ها', 'مقالات', 'اخبار'],
    datasets: [
      {
        label: 'کل',
        data: [
          analytics?.contentMetrics?.castings?.total || 0,
          analytics?.contentMetrics?.applications?.total || 0,
          analytics?.contentMetrics?.blogs?.total || 0,
          analytics?.contentMetrics?.news?.total || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const deviceBreakdownChartData = {
    labels: analytics?.deviceData?.deviceBreakdown?.map(item => item.device) || [],
    datasets: [
      {
        data: analytics?.deviceData?.deviceBreakdown?.map(item => item.percentage) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }
    ]
  };

  const engagementMetricsChartData = {
    labels: ['زمان متوسط جلسه', 'صفحات در جلسه', 'نرخ تعامل'],
    datasets: [
      {
        label: 'معیارهای تعامل',
        data: [
          analytics?.engagementMetrics?.averageSessionDuration || 0,
          analytics?.engagementMetrics?.pagesPerSession || 0,
          analytics?.engagementMetrics?.engagementRate || 0
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Vazirmatn, sans-serif'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Vazirmatn, sans-serif'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Vazirmatn, sans-serif'
          }
        }
      }
    }
  };

  const tabs = [
    { id: 'overview', name: 'نمای کلی', icon: ChartBarIcon },
    { id: 'visitors', name: 'بازدیدکنندگان', icon: EyeIcon },
    { id: 'users', name: 'کاربران', icon: UsersIcon },
    { id: 'content', name: 'محتوا', icon: DocumentTextIcon },
    { id: 'engagement', name: 'تعامل', icon: CursorArrowRaysIcon },
    { id: 'conversion', name: 'تبدیل', icon: FunnelIcon },
    { id: 'geographic', name: 'جغرافیایی', icon: GlobeAltIcon },
    { id: 'devices', name: 'دستگاه‌ها', icon: DevicePhoneMobileIcon },
    { id: 'performance', name: 'عملکرد', icon: SignalIcon }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحلیل و آمار</h1>
          <p className="text-gray-600">نمای جامع از عملکرد پلتفرم و رفتار کاربران</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="text-sm font-medium text-gray-700">بازه زمانی:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 روز گذشته</option>
              <option value="30d">30 روز گذشته</option>
              <option value="90d">90 روز گذشته</option>
              <option value="1y">1 سال گذشته</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 space-x-reverse overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="کل بازدیدکنندگان"
                value={formatNumber(analytics?.visitorMetrics?.totalVisitors || 0)}
                icon={EyeIcon}
                trend={getGrowthPercentage(
                  analytics?.visitorMetrics?.totalVisitors || 0,
                  analytics?.visitorMetrics?.totalVisitors || 0
                )}
                color="blue"
              />
              <MetricCard
                title="کاربران فعال"
                value={formatNumber(analytics?.userMetrics?.activeUsers || 0)}
                icon={UsersIcon}
                trend={getGrowthPercentage(
                  analytics?.userMetrics?.activeUsers || 0,
                  analytics?.userMetrics?.activeUsers || 0
                )}
                color="green"
              />
              <MetricCard
                title="کستینگ‌های فعال"
                value={formatNumber(analytics?.contentMetrics?.castings?.active || 0)}
                icon={FilmIcon}
                trend={getGrowthPercentage(
                  analytics?.contentMetrics?.castings?.active || 0,
                  analytics?.contentMetrics?.castings?.active || 0
                )}
                color="purple"
              />
              <MetricCard
                title="نرخ تبدیل"
                value={`${analytics?.conversionMetrics?.registrationRate || 0}%`}
                icon={FunnelIcon}
                trend={getGrowthPercentage(
                  analytics?.conversionMetrics?.registrationRate || 0,
                  analytics?.conversionMetrics?.registrationRate || 0
                )}
                color="orange"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">روند بازدیدکنندگان</h3>
                <div className="h-64">
                  <Line data={visitorTrendsChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">رشد کاربران</h3>
                <div className="h-64">
                  <Bar data={userGrowthChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معیارهای تعامل</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">زمان متوسط جلسه:</span>
                    <span className="font-semibold">
                      {formatDuration(analytics?.engagementMetrics?.averageSessionDuration || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">صفحات در جلسه:</span>
                    <span className="font-semibold">
                      {analytics?.engagementMetrics?.pagesPerSession || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">نرخ تعامل:</span>
                    <span className="font-semibold">
                      {analytics?.engagementMetrics?.engagementRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">توزیع دستگاه‌ها</h3>
                <div className="h-48">
                  <Doughnut data={deviceBreakdownChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار محتوا</h3>
                <div className="h-48">
                  <Bar data={contentMetricsChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitors Tab */}
        {activeTab === 'visitors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="کل بازدیدکنندگان"
                value={formatNumber(analytics?.visitorMetrics?.totalVisitors || 0)}
                icon={EyeIcon}
                color="blue"
              />
              <MetricCard
                title="بازدیدکنندگان منحصر به فرد"
                value={formatNumber(analytics?.visitorMetrics?.uniqueVisitors || 0)}
                icon={UsersIcon}
                color="green"
              />
              <MetricCard
                title="بازدیدکنندگان بازگشتی"
                value={formatNumber(analytics?.visitorMetrics?.returningVisitors || 0)}
                icon={ArrowTrendingUpIcon}
                color="purple"
              />
              <MetricCard
                title="نرخ پرش"
                value={`${analytics?.visitorMetrics?.bounceRate || 0}%`}
                icon={ArrowTrendingDownIcon}
                color="red"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">روند بازدیدکنندگان</h3>
              <div className="h-80">
                <Line data={visitorTrendsChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="کل کاربران"
                value={formatNumber(analytics?.userMetrics?.totalUsers || 0)}
                icon={UsersIcon}
                color="blue"
              />
              <MetricCard
                title="کاربران جدید"
                value={formatNumber(analytics?.userMetrics?.newUsers || 0)}
                icon={ArrowTrendingUpIcon}
                color="green"
              />
              <MetricCard
                title="کاربران فعال"
                value={formatNumber(analytics?.userMetrics?.activeUsers || 0)}
                icon={StarIcon}
                color="purple"
              />
              <MetricCard
                title="نرخ نگهداری"
                value={`${analytics?.userMetrics?.userRetention || 0}%`}
                icon={ClockIcon}
                color="orange"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">رشد کاربران</h3>
              <div className="h-80">
                <Bar data={userGrowthChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="کل کستینگ‌ها"
                value={formatNumber(analytics?.contentMetrics?.castings?.total || 0)}
                icon={FilmIcon}
                color="blue"
              />
              <MetricCard
                title="کستینگ‌های فعال"
                value={formatNumber(analytics?.contentMetrics?.castings?.active || 0)}
                icon={StarIcon}
                color="green"
              />
              <MetricCard
                title="کل درخواست‌ها"
                value={formatNumber(analytics?.contentMetrics?.applications?.total || 0)}
                icon={DocumentTextIcon}
                color="purple"
              />
              <MetricCard
                title="نرخ درخواست"
                value={`${analytics?.contentMetrics?.applications?.rate || 0}%`}
                icon={FunnelIcon}
                color="orange"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار محتوا</h3>
              <div className="h-80">
                <Bar data={contentMetricsChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="زمان متوسط جلسه"
                value={formatDuration(analytics?.engagementMetrics?.averageSessionDuration || 0)}
                icon={ClockIcon}
                color="blue"
              />
              <MetricCard
                title="صفحات در جلسه"
                value={analytics?.engagementMetrics?.pagesPerSession || 0}
                icon={DocumentTextIcon}
                color="green"
              />
              <MetricCard
                title="نرخ تعامل"
                value={`${analytics?.engagementMetrics?.engagementRate || 0}%`}
                icon={CursorArrowRaysIcon}
                color="purple"
              />
              <MetricCard
                title="زمان در سایت"
                value={formatDuration(analytics?.engagementMetrics?.timeOnSite || 0)}
                icon={ClockIcon}
                color="orange"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معیارهای تعامل</h3>
              <div className="h-80">
                <Radar data={engagementMetricsChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Conversion Tab */}
        {activeTab === 'conversion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="نرخ ثبت نام"
                value={`${analytics?.conversionMetrics?.registrationRate || 0}%`}
                icon={UsersIcon}
                color="blue"
              />
              <MetricCard
                title="نرخ درخواست"
                value={`${analytics?.conversionMetrics?.applicationRate || 0}%`}
                icon={DocumentTextIcon}
                color="green"
              />
              <MetricCard
                title="نرخ ایجاد کستینگ"
                value={`${analytics?.conversionMetrics?.castingCreationRate || 0}%`}
                icon={FilmIcon}
                color="purple"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">قیف تبدیل</h3>
              <div className="space-y-4">
                {analytics?.conversionMetrics?.conversionFunnel?.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{stage.stage}</span>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="font-semibold">{stage.count}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stage.conversion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{stage.conversion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geographic Tab */}
        {activeTab === 'geographic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">کشورهای برتر</h3>
                <div className="space-y-3">
                  {analytics?.geographicData?.topCountries?.slice(0, 10).map((country, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{country.country}</span>
                      <span className="font-semibold">{formatNumber(country.visitors)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">شهرهای برتر</h3>
                <div className="space-y-3">
                  {analytics?.geographicData?.topCities?.slice(0, 10).map((city, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{city.city}</span>
                      <span className="font-semibold">{formatNumber(city.visitors)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="دسکتاپ"
                value={`${analytics?.deviceData?.deviceBreakdown?.find(d => d.device === 'desktop')?.percentage || 0}%`}
                icon={ComputerDesktopIcon}
                color="blue"
              />
              <MetricCard
                title="موبایل"
                value={`${analytics?.deviceData?.deviceBreakdown?.find(d => d.device === 'mobile')?.percentage || 0}%`}
                icon={DevicePhoneMobileIcon}
                color="green"
              />
              <MetricCard
                title="تبلت"
                value={`${analytics?.deviceData?.deviceBreakdown?.find(d => d.device === 'tablet')?.percentage || 0}%`}
                icon={DevicePhoneMobileIcon}
                color="purple"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">توزیع دستگاه‌ها</h3>
              <div className="h-80">
                <Doughnut data={deviceBreakdownChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="زمان بارگذاری متوسط"
                value={`${analytics?.performanceData?.averageLoadTime || 0}ms`}
                icon={ClockIcon}
                color="blue"
              />
              <MetricCard
                title="زمان پاسخ سرور"
                value={`${analytics?.performanceData?.averageResponseTime || 0}ms`}
                icon={SignalIcon}
                color="green"
              />
              <MetricCard
                title="نرخ خطا"
                value={`${analytics?.performanceData?.errorRate || 0}%`}
                icon={ArrowTrendingDownIcon}
                color="red"
              />
              <MetricCard
                title="زمان کارکرد"
                value={`${analytics?.performanceData?.uptimePercentage || 100}%`}
                icon={SignalIcon}
                color="purple"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



// Helper function to get growth icon
const getGrowthIcon = (trend) => {
  if (trend > 0) {
    return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
  } else if (trend < 0) {
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
  } else {
    return <MinusIcon className="w-4 h-4 text-gray-600" />;
  }
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {getGrowthIcon(trend)}
              <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
