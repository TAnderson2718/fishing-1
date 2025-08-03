import React, { useState, useEffect } from 'react';
import { dataManager } from '../../utils/storage';
import { UserIcon, StarIcon } from '@heroicons/react/24/outline';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const users = dataManager.getUsers();
    const customerUsers = users.filter(user => user.role === 'customer');
    setCustomers(customerUsers);
  };

  const getCustomerOrders = (customerId) => {
    const orders = dataManager.getOrders();
    return orders.filter(order => order.customerId === customerId);
  };

  const getCustomerStats = (customerId) => {
    const orders = getCustomerOrders(customerId);
    const totalSpent = orders.reduce((sum, order) => sum + order.finalPrice, 0);
    const totalOrders = orders.length;
    const usedOrders = orders.filter(order => order.isUsed).length;
    
    return {
      totalSpent,
      totalOrders,
      usedOrders,
      unusedOrders: totalOrders - usedOrders
    };
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const CustomerDetailModal = () => {
    if (!selectedCustomer) return null;

    const orders = getCustomerOrders(selectedCustomer.id);
    const stats = getCustomerStats(selectedCustomer.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">客户详情</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 客户基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card p-4">
              <h4 className="font-medium text-gray-900 mb-3">基本信息</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">姓名:</span> {selectedCustomer.name}</div>
                <div><span className="text-gray-500">用户名:</span> {selectedCustomer.username}</div>
                <div><span className="text-gray-500">邮箱:</span> {selectedCustomer.email}</div>
                <div><span className="text-gray-500">电话:</span> {selectedCustomer.phone}</div>
                <div>
                  <span className="text-gray-500">会员状态:</span>
                  {selectedCustomer.isMember ? (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      会员 (至{selectedCustomer.membershipExpiry})
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      普通用户
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-medium text-gray-900 mb-3">消费统计</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">总消费:</span> ¥{stats.totalSpent}</div>
                <div><span className="text-gray-500">订单总数:</span> {stats.totalOrders}</div>
                <div><span className="text-gray-500">已使用:</span> {stats.usedOrders}</div>
                <div><span className="text-gray-500">未使用:</span> {stats.unusedOrders}</div>
              </div>
            </div>
          </div>

          {/* 订单历史 */}
          <div className="card">
            <div className="px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">订单历史</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      订单号
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      活动
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      时间
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      金额
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {order.activityTitle}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {order.date} {order.time}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        ¥{order.finalPrice}
                      </td>
                      <td className="px-4 py-2">
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
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
        <p className="text-gray-600 mt-2">查看和管理所有客户信息</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会员状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  消费统计
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {customer.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.isMember ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <StarIcon className="h-3 w-3 mr-1" />
                            会员
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            至 {customer.membershipExpiry}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          普通用户
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">¥{stats.totalSpent}</div>
                      <div className="text-sm text-gray-500">{stats.totalOrders} 订单</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && <CustomerDetailModal />}
    </div>
  );
};

export default CustomerManagement;
