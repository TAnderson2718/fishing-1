import React, { useState, useEffect } from 'react';
import { dataManager } from '../../utils/storage';
import { useToast } from '../../contexts/ToastContext';
import {
  EyeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refundReason, setRefundReason] = useState('');

  const orderStatuses = {
    pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: '进行中', color: 'bg-purple-100 text-purple-800' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
    refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' }
  };

  const paymentStatuses = {
    pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
    refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' },
    failed: { label: '支付失败', color: 'bg-red-100 text-red-800' }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, filterStatus, filterPayment, sortBy]);

  const loadData = () => {
    const ordersData = dataManager.getOrders();
    const activitiesData = dataManager.getActivities();
    const usersData = dataManager.getUsers();
    
    setOrders(ordersData);
    setActivities(activitiesData);
    setUsers(usersData);
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.activityTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // 支付状态过滤
    if (filterPayment !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filterPayment);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'customerName':
          return a.customerName.localeCompare(b.customerName);
        case 'activityTitle':
          return a.activityTitle.localeCompare(b.activityTitle);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updateData = { status: newStatus };

    // 如果是完成订单，更新完成时间
    if (newStatus === 'completed') {
      updateData.completedAt = new Date().toISOString();
    }

    dataManager.updateOrder(orderId, updateData);
    toast.success('订单状态更新成功');

    // ✅ 使用精确的状态更新，避免重新加载所有数据
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...updateData } : order
    );
    setOrders(updatedOrders);

    // 如果在详情页面，更新选中的订单
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, ...updateData });
    }
  };

  const handleRefund = () => {
    if (!refundReason.trim()) {
      toast.error('请填写退款原因');
      return;
    }

    const refundData = {
      status: 'refunded',
      paymentStatus: 'refunded',
      refundedAt: new Date().toISOString(),
      refundReason: refundReason,
      refundAmount: selectedOrder.totalAmount
    };

    dataManager.updateOrder(selectedOrder.id, refundData);
    toast.success('退款处理成功');

    setShowRefundModal(false);
    setRefundReason('');

    // ✅ 使用精确的状态更新，避免重新加载所有数据
    const updatedOrders = orders.map(order =>
      order.id === selectedOrder.id ? { ...order, ...refundData } : order
    );
    setOrders(updatedOrders);

    // 更新选中的订单
    setSelectedOrder({ ...selectedOrder, ...refundData });
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid' && order.status !== 'refunded')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders
    };
  };

  const getActivityName = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.title : '未知活动';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : '未知用户';
  };

  // 分页逻辑
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const stats = getOrderStats();

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-600 mt-1">管理所有活动预订订单</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">总订单数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">总收入</p>
              <p className="text-2xl font-semibold text-gray-900">¥{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">待处理</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">已完成</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤器 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* 订单状态过滤 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">所有状态</option>
            {Object.entries(orderStatuses).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          {/* 支付状态过滤 */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="input-field"
          >
            <option value="all">所有支付状态</option>
            {Object.entries(paymentStatuses).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="createdAt">创建时间</option>
            <option value="amount">订单金额</option>
            <option value="customerName">客户姓名</option>
            <option value="activityTitle">活动名称</option>
          </select>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活动信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.activityTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.participants}人 · {order.activityDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${orderStatuses[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {orderStatuses[order.status]?.label || order.status}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatuses[order.paymentStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {paymentStatuses[order.paymentStatus]?.label || order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                          title="确认订单"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="text-purple-600 hover:text-purple-900"
                          title="完成订单"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed') && order.paymentStatus === 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRefundModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="退款"
                        >
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示 {startIndex + 1} 到 {Math.min(endIndex, filteredOrders.length)} 条，
                共 {filteredOrders.length} 条记录
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 订单详情模态框 */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">订单详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 订单基本信息 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">订单信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">订单号:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">创建时间:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">订单状态:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${orderStatuses[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {orderStatuses[selectedOrder.status]?.label || selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">支付状态:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentStatuses[selectedOrder.paymentStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {paymentStatuses[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">完成时间:</span>
                        <span>{new Date(selectedOrder.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 客户信息 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">客户信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">姓名:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">电话:</span>
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">邮箱:</span>
                      <span>{selectedOrder.customerEmail || '未提供'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 活动信息 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">活动信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">活动名称:</span>
                      <span className="font-medium">{selectedOrder.activityTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">活动日期:</span>
                      <span>{selectedOrder.activityDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">参与人数:</span>
                      <span>{selectedOrder.participants}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">单价:</span>
                      <span>¥{selectedOrder.unitPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">总金额:</span>
                      <span className="font-medium text-lg">¥{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* 特殊要求 */}
                {selectedOrder.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">特殊要求</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedOrder.specialRequests}
                    </p>
                  </div>
                )}

                {/* 退款信息 */}
                {selectedOrder.refundedAt && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">退款信息</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">退款时间:</span>
                        <span>{new Date(selectedOrder.refundedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">退款金额:</span>
                        <span>¥{selectedOrder.refundAmount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">退款原因:</span>
                        <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">
                          {selectedOrder.refundReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'confirmed');
                    }}
                    className="btn-primary"
                  >
                    确认订单
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'completed');
                    }}
                    className="btn-primary"
                  >
                    完成订单
                  </button>
                )}
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') &&
                 selectedOrder.paymentStatus === 'paid' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRefundModal(true);
                    }}
                    className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                  >
                    申请退款
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-secondary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 退款模态框 */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">处理退款</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  订单号
                </label>
                <input
                  type="text"
                  value={selectedOrder.id}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  退款金额
                </label>
                <input
                  type="text"
                  value={`¥${selectedOrder.totalAmount}`}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  退款原因 *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="请输入退款原因..."
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
              >
                确认退款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
