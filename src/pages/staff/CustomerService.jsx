import React, { useState, useEffect } from 'react';
import { dataManager, storage } from '../../utils/storage';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  PhoneIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const CustomerService = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // name, phone, orderId
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerIssues, setCustomerIssues] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newIssue, setNewIssue] = useState({
    type: 'general',
    priority: 'medium',
    description: '',
    notes: ''
  });

  useEffect(() => {
    // 初始化客户问题数据
    if (!storage.get('customerIssues')) {
      storage.set('customerIssues', []);
    }
    if (!storage.get('staffNotes')) {
      storage.set('staffNotes', []);
    }
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const users = dataManager.getUsers().filter(u => u.role === 'customer');
    const orders = dataManager.getOrders();
    let results = [];

    switch (searchType) {
      case 'name':
        results = users.filter(u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'phone':
        results = users.filter(u => 
          u.phone.includes(searchTerm)
        );
        break;
      case 'orderId':
        const order = orders.find(o => o.id.includes(searchTerm));
        if (order) {
          const customer = users.find(u => u.id === order.customerId);
          if (customer) {
            results = [customer];
          }
        }
        break;
      default:
        results = [];
    }

    setSearchResults(results);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    const orders = dataManager.getOrders().filter(o => o.customerId === customer.id);
    setCustomerOrders(orders);
    
    // 获取客户问题记录
    const issues = storage.get('customerIssues') || [];
    const customerIssueList = issues.filter(issue => issue.customerId === customer.id);
    setCustomerIssues(customerIssueList);
  };

  const handleQuickAction = (action, order) => {
    setSelectedOrder(order);
    setShowActionModal(true);
  };

  const executeQuickAction = (action) => {
    if (!selectedOrder) return;

    const orders = dataManager.getOrders();
    const orderIndex = orders.findIndex(o => o.id === selectedOrder.id);
    
    if (orderIndex === -1) return;

    switch (action) {
      case 'refund':
        orders[orderIndex].status = 'refunded';
        orders[orderIndex].refundDate = new Date().toISOString();
        break;
      case 'reschedule':
        // 这里可以添加重新安排逻辑
        orders[orderIndex].status = 'rescheduled';
        break;
      case 'cancel':
        orders[orderIndex].status = 'cancelled';
        orders[orderIndex].cancelDate = new Date().toISOString();
        break;
    }

    storage.set('orders', orders);
    setCustomerOrders(orders.filter(o => o.customerId === selectedCustomer.id));
    setShowActionModal(false);
    setSelectedOrder(null);

    // 添加操作记录到客户问题
    const newIssueRecord = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      type: 'action',
      priority: 'medium',
      description: `执行快速操作: ${action} - 订单 ${selectedOrder.id}`,
      status: 'resolved',
      createdAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
      staffId: 'current_staff' // 实际应用中应该是当前登录员工ID
    };

    const issues = storage.get('customerIssues') || [];
    storage.set('customerIssues', [...issues, newIssueRecord]);
    setCustomerIssues([...customerIssues, newIssueRecord]);
  };

  const createIssue = () => {
    if (!selectedCustomer || !newIssue.description.trim()) return;

    const issue = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      type: newIssue.type,
      priority: newIssue.priority,
      description: newIssue.description,
      notes: newIssue.notes,
      status: 'open',
      createdAt: new Date().toISOString(),
      staffId: 'current_staff'
    };

    const issues = storage.get('customerIssues') || [];
    storage.set('customerIssues', [...issues, issue]);
    setCustomerIssues([...customerIssues, issue]);
    
    setShowIssueModal(false);
    setNewIssue({
      type: 'general',
      priority: 'medium',
      description: '',
      notes: ''
    });
  };

  const resolveIssue = (issueId) => {
    const issues = storage.get('customerIssues') || [];
    const updatedIssues = issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: 'resolved', resolvedAt: new Date().toISOString() }
        : issue
    );
    storage.set('customerIssues', updatedIssues);
    setCustomerIssues(updatedIssues.filter(issue => issue.customerId === selectedCustomer.id));
  };

  const IssueModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">创建客户问题记录</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题类型</label>
            <select
              value={newIssue.type}
              onChange={(e) => setNewIssue({...newIssue, type: e.target.value})}
              className="input-field"
            >
              <option value="general">一般咨询</option>
              <option value="complaint">投诉</option>
              <option value="refund">退款申请</option>
              <option value="technical">技术问题</option>
              <option value="booking">预订问题</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select
              value={newIssue.priority}
              onChange={(e) => setNewIssue({...newIssue, priority: e.target.value})}
              className="input-field"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
            <textarea
              value={newIssue.description}
              onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
              className="input-field h-24 resize-none"
              placeholder="请详细描述客户问题..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">处理备注</label>
            <textarea
              value={newIssue.notes}
              onChange={(e) => setNewIssue({...newIssue, notes: e.target.value})}
              className="input-field h-20 resize-none"
              placeholder="处理过程和备注..."
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowIssueModal(false)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={createIssue}
            className="flex-1 btn-primary"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );

  const ActionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">快速操作</h3>
        <p className="text-gray-600 mb-4">
          订单: {selectedOrder?.id} - {selectedOrder?.activityTitle}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => executeQuickAction('refund')}
            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">申请退款</div>
            <div className="text-sm text-gray-500">为客户处理退款申请</div>
          </button>
          <button
            onClick={() => executeQuickAction('reschedule')}
            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">重新安排</div>
            <div className="text-sm text-gray-500">帮助客户重新安排时间</div>
          </button>
          <button
            onClick={() => executeQuickAction('cancel')}
            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">取消订单</div>
            <div className="text-sm text-gray-500">取消客户订单</div>
          </button>
        </div>
        <button
          onClick={() => setShowActionModal(false)}
          className="w-full btn-secondary mt-4"
        >
          关闭
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">客户服务</h1>
        <p className="text-gray-600 mt-2">客户查询、问题跟踪和快速操作</p>
      </div>

      {/* 搜索区域 */}
      <div className="card p-6 mb-8">
        <div className="flex items-center mb-4">
          <MagnifyingGlassIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">客户查询</h2>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="input-field w-32"
          >
            <option value="name">姓名</option>
            <option value="phone">电话</option>
            <option value="orderId">订单号</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`请输入${searchType === 'name' ? '客户姓名' : searchType === 'phone' ? '电话号码' : '订单号'}`}
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            搜索
          </button>
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">搜索结果</h3>
            <div className="space-y-2">
              {searchResults.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone} • {customer.email}</div>
                  </div>
                  {customer.isMember && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">会员</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 客户详情 */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 客户信息和订单 */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">客户信息</h2>
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="btn-primary flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  创建问题
                </button>
              </div>
              <div className="space-y-3">
                <div><strong>姓名:</strong> {selectedCustomer.name}</div>
                <div><strong>电话:</strong> {selectedCustomer.phone}</div>
                <div><strong>邮箱:</strong> {selectedCustomer.email}</div>
                <div>
                  <strong>会员状态:</strong>
                  {selectedCustomer.isMember ? (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      会员 (至{selectedCustomer.membershipExpiry})
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      普通用户
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">订单记录</h2>
              <div className="space-y-3">
                {customerOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{order.activityTitle}</div>
                        <div className="text-sm text-gray-500">
                          {order.id} • {order.date} {order.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">¥{order.finalPrice}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                          order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status === 'confirmed' ? '已确认' :
                           order.status === 'refunded' ? '已退款' :
                           order.status === 'cancelled' ? '已取消' : order.status}
                        </span>
                      </div>
                    </div>
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleQuickAction('action', order)}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        快速操作
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 问题跟踪 */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold">问题跟踪</h2>
            </div>
            
            <div className="space-y-4">
              {customerIssues.map(issue => (
                <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded mr-2 ${
                        issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.priority === 'urgent' ? '紧急' :
                         issue.priority === 'high' ? '高' :
                         issue.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className="text-sm text-gray-500">{issue.type}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.status === 'resolved' ? '已解决' : '处理中'}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{issue.description}</p>
                  {issue.notes && (
                    <p className="text-xs text-gray-500 mb-2">备注: {issue.notes}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(issue.createdAt).toLocaleString()}</span>
                    {issue.status === 'open' && (
                      <button
                        onClick={() => resolveIssue(issue.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        标记为已解决
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {customerIssues.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无问题记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showIssueModal && <IssueModal />}
      {showActionModal && <ActionModal />}
    </div>
  );
};

export default CustomerService;
