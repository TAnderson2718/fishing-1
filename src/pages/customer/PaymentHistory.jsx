import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataManager } from '../../utils/storage';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all'); // all, completed, failed, pending

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    const userPayments = dataManager.getUserPayments(user.id);
    const paymentStats = dataManager.getPaymentStats(user.id);
    
    // 按时间倒序排列
    const sortedPayments = userPayments.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    setPayments(sortedPayments);
    setStats(paymentStats);
  };

  const getFilteredPayments = () => {
    switch (filter) {
      case 'completed':
        return payments.filter(payment => payment.status === 'completed');
      case 'failed':
        return payments.filter(payment => payment.status === 'failed');
      case 'pending':
        return payments.filter(payment => payment.status === 'pending');
      default:
        return payments;
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircleIcon,
          text: '支付成功',
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          text: '支付失败',
          color: 'text-red-600',
          bg: 'bg-red-100'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          text: '处理中',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100'
        };
      default:
        return {
          icon: ClockIcon,
          text: '未知',
          color: 'text-gray-600',
          bg: 'bg-gray-100'
        };
    }
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      alipay: '支付宝',
      wechat: '微信支付',
      card: '银行卡'
    };
    return methods[method] || method;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">支付记录</h1>
        <p className="text-gray-600 mt-2">查看您的支付历史和统计信息</p>
      </div>

      {/* 支付统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">¥{stats.totalAmount || 0}</div>
          <div className="text-sm text-gray-600">总支付金额</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completedPayments || 0}</div>
          <div className="text-sm text-gray-600">成功支付</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
            <CreditCardIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPayments || 0}</div>
          <div className="text-sm text-gray-600">总交易数</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-3">
            <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">¥{Math.round(stats.averageAmount || 0)}</div>
          <div className="text-sm text-gray-600">平均金额</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'completed', label: '成功' },
            { key: 'failed', label: '失败' },
            { key: 'pending', label: '处理中' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 text-sm rounded-lg ${
                filter === filterOption.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* 支付记录列表 */}
      <div className="space-y-4">
        {getFilteredPayments().map((payment) => {
          const statusDisplay = getStatusDisplay(payment.status);
          
          return (
            <div key={payment.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 text-xs rounded mr-3 ${statusDisplay.bg} ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </span>
                    <span className="text-sm text-gray-500">
                      交易号: {payment.transactionId || payment.id}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">
                    {payment.description || '活动支付'}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">支付金额:</span>
                      <p className="text-lg font-bold text-gray-900">¥{payment.amount}</p>
                    </div>
                    <div>
                      <span className="font-medium">支付方式:</span>
                      <p>{getPaymentMethodName(payment.method)}</p>
                    </div>
                    <div>
                      <span className="font-medium">创建时间:</span>
                      <p>{formatDate(payment.createdAt)}</p>
                    </div>
                    {payment.completedAt && (
                      <div>
                        <span className="font-medium">完成时间:</span>
                        <p>{formatDate(payment.completedAt)}</p>
                      </div>
                    )}
                  </div>

                  {payment.orderId && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">关联订单:</span> {payment.orderId}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <statusDisplay.icon className={`h-8 w-8 ${statusDisplay.color}`} />
                </div>
              </div>
            </div>
          );
        })}
        
        {getFilteredPayments().length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无支付记录</h3>
            <p className="text-gray-600 mb-4">您还没有任何支付记录</p>
            <button
              onClick={() => window.location.hash = '#customer/home'}
              className="btn-primary"
            >
              去预订活动
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
