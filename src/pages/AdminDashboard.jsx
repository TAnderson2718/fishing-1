import React, { useState, useEffect } from 'react';
import { dataManager } from '../utils/storage';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });

  useEffect(() => {
    const users = dataManager.getUsers();
    const activities = dataManager.getActivities();
    const orders = dataManager.getOrders();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalPrice, 0);
    const recentOrders = orders.slice(-5).reverse();

    setStats({
      totalUsers: users.filter(u => u.role === 'customer').length,
      totalActivities: activities.length,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理员仪表板</h1>
        <p className="text-gray-600 mt-2">系统概览和数据统计</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总用户数"
          value={stats.totalUsers}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="活动数量"
          value={stats.totalActivities}
          icon={CalendarIcon}
          color="bg-green-500"
        />
        <StatCard
          title="订单总数"
          value={stats.totalOrders}
          icon={ClipboardDocumentListIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="总收入"
          value={`¥${stats.totalRevenue}`}
          icon={CurrencyDollarIcon}
          color="bg-purple-500"
        />
      </div>

      {/* 最近订单 */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">最近订单</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活动
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.activityTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{order.finalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.isUsed 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.isUsed ? '已使用' : '未使用'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
