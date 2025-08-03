import React, { useState, useEffect } from 'react';
import { dataManager, storage } from '../../utils/storage';
import { 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  TrophyIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const StaffAnalytics = () => {
  const [timeRange, setTimeRange] = useState('today'); // today, week, month
  const [analytics, setAnalytics] = useState({
    ticketsScanned: 0,
    customersServed: 0,
    issuesResolved: 0,
    averageServiceTime: 0,
    totalRevenue: 0,
    performanceScore: 0
  });
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    calculateAnalytics();
  }, [timeRange]);

  const calculateAnalytics = () => {
    const orders = dataManager.getOrders();
    const issues = storage.get('customerIssues') || [];
    const now = new Date();
    let startDate;

    // 确定时间范围
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // 计算核销票务数量
    const scannedOrders = orders.filter(order => {
      if (!order.isUsed || !order.usedAt) return false;
      const usedDate = new Date(order.usedAt);
      return usedDate >= startDate;
    });

    // 计算服务客户数量（去重）
    const servedCustomers = new Set(scannedOrders.map(order => order.customerId));

    // 计算解决的问题数量
    const resolvedIssues = issues.filter(issue => {
      if (issue.status !== 'resolved' || !issue.resolvedAt) return false;
      const resolvedDate = new Date(issue.resolvedAt);
      return resolvedDate >= startDate;
    });

    // 计算总收入
    const totalRevenue = scannedOrders.reduce((sum, order) => sum + order.finalPrice, 0);

    // 计算平均服务时间（模拟数据）
    const averageServiceTime = scannedOrders.length > 0 ? 
      Math.round((Math.random() * 5 + 2) * 10) / 10 : 0;

    // 计算绩效分数（基于多个指标的综合评分）
    const performanceScore = Math.min(100, Math.round(
      (scannedOrders.length * 10) + 
      (servedCustomers.size * 15) + 
      (resolvedIssues.length * 20) + 
      (averageServiceTime > 0 ? (10 - averageServiceTime) * 5 : 0)
    ));

    setAnalytics({
      ticketsScanned: scannedOrders.length,
      customersServed: servedCustomers.size,
      issuesResolved: resolvedIssues.length,
      averageServiceTime,
      totalRevenue,
      performanceScore: Math.max(0, performanceScore)
    });

    // 生成每日数据（用于图表）
    generateDailyData(startDate, now, orders);
    generateWeeklyData(orders);
  };

  const generateDailyData = (startDate, endDate, orders) => {
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      
      const dayOrders = orders.filter(order => {
        if (!order.isUsed || !order.usedAt) return false;
        const usedDate = new Date(order.usedAt);
        return usedDate >= dayStart && usedDate < dayEnd;
      });

      days.push({
        date: currentDate.toISOString().split('T')[0],
        tickets: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.finalPrice, 0),
        customers: new Set(dayOrders.map(order => order.customerId)).size
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setDailyData(days);
  };

  const generateWeeklyData = (orders) => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekOrders = orders.filter(order => {
        if (!order.isUsed || !order.usedAt) return false;
        const usedDate = new Date(order.usedAt);
        return usedDate >= weekStart && usedDate < weekEnd;
      });

      weeks.unshift({
        week: `第${4-i}周`,
        tickets: weekOrders.length,
        revenue: weekOrders.reduce((sum, order) => sum + order.finalPrice, 0),
        customers: new Set(weekOrders.map(order => order.customerId)).size
      });
    }
    
    setWeeklyData(weeks);
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { level: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { level: '一般', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: '需改进', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performance = getPerformanceLevel(analytics.performanceScore);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">员工分析</h1>
            <p className="text-gray-600 mt-2">工作绩效和数据统计</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="today">今日</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">核销票务</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.ticketsScanned}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">服务客户</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.customersServed}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">解决问题</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.issuesResolved}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">平均服务时间</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageServiceTime}分钟</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">处理收入</p>
              <p className="text-2xl font-bold text-gray-900">¥{analytics.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 ${performance.bg} rounded-lg`}>
              <TrophyIcon className={`h-6 w-6 ${performance.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">绩效评分</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{analytics.performanceScore}</p>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${performance.bg} ${performance.color}`}>
                  {performance.level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">每日工作量</h2>
          <div className="space-y-4">
            {dailyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{day.date}</div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-blue-600">{day.tickets}票</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-green-600">{day.customers}客户</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-purple-600">¥{day.revenue}</span>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (day.tickets / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">周度对比</h2>
          <div className="space-y-4">
            {weeklyData.map((week, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{week.week}</div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-blue-600">{week.tickets}票</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-green-600">{week.customers}客户</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-purple-600">¥{week.revenue}</span>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (week.tickets / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 绩效建议 */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold mb-4">绩效建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">优势</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {analytics.ticketsScanned > 5 && <li>• 票务核销效率高</li>}
              {analytics.customersServed > 3 && <li>• 客户服务覆盖面广</li>}
              {analytics.issuesResolved > 2 && <li>• 问题解决能力强</li>}
              {analytics.averageServiceTime < 5 && <li>• 服务响应速度快</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">改进建议</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {analytics.ticketsScanned <= 5 && <li>• 提高票务核销效率</li>}
              {analytics.customersServed <= 3 && <li>• 增加客户服务互动</li>}
              {analytics.issuesResolved <= 2 && <li>• 主动跟进客户问题</li>}
              {analytics.averageServiceTime >= 5 && <li>• 优化服务流程，提高效率</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAnalytics;
