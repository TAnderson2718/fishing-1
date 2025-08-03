import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataManager, storage } from '../../utils/storage';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import {
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  StarIcon,
  ArrowPathIcon,
  EyeIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [rating, setRating] = useState({
    score: 5,
    comment: ''
  });
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = dataManager.getOrders();
    const userOrders = allOrders.filter(order => order.customerId === user.id);
    // 按创建时间倒序排列
    const sortedOrders = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(sortedOrders);
  };

  const getFilteredOrders = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return orders.filter(order => 
          order.date >= today && 
          !order.isUsed && 
          order.status !== 'cancelled' && 
          order.status !== 'refunded'
        );
      case 'completed':
        return orders.filter(order => order.isUsed || order.date < today);
      case 'cancelled':
        return orders.filter(order => 
          order.status === 'cancelled' || order.status === 'refunded'
        );
      default:
        return orders;
    }
  };

  const handleRebookActivity = (order) => {
    // 重新预订逻辑 - 跳转到活动页面
    window.location.hash = '#customer/home';
    // 这里可以添加更复杂的逻辑，比如预填充活动信息
  };

  const handleRateOrder = (order) => {
    setSelectedOrder(order);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (!selectedOrder) return;

    const ratings = storage.get('orderRatings') || {};
    ratings[selectedOrder.id] = {
      orderId: selectedOrder.id,
      customerId: user.id,
      activityId: selectedOrder.activityId,
      score: rating.score,
      comment: rating.comment,
      createdAt: new Date().toISOString()
    };

    storage.set('orderRatings', ratings);
    
    setShowRatingModal(false);
    setRating({ score: 5, comment: '' });
    setSelectedOrder(null);
    
    alert('评价提交成功！');
  };

  const getOrderRating = (orderId) => {
    const ratings = storage.get('orderRatings') || {};
    return ratings[orderId];
  };

  const getOrderStatus = (order) => {
    if (order.status === 'cancelled') return { text: '已取消', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (order.status === 'refunded') return { text: '已退款', color: 'text-red-600', bg: 'bg-red-100' };
    if (order.isUsed) return { text: '已完成', color: 'text-green-600', bg: 'bg-green-100' };
    
    const now = new Date();
    const orderDate = new Date(order.date);
    
    if (orderDate < now) return { text: '已过期', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { text: '待使用', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const generateQRCode = (order) => {
    return {
      type: 'activity_ticket',
      orderId: order.id,
      customerId: order.customerId,
      customerName: user.name,
      activityId: order.activityId,
      activityTitle: order.activityTitle,
      date: order.date,
      time: order.time,
      participants: order.participants,
      amount: order.finalPrice,
      timestamp: Date.now(),
      version: '1.0'
    };
  };

  const OrderDetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">订单详情</h3>
          <button
            onClick={() => setShowOrderDetail(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">订单号:</span>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              <div>
                <span className="text-gray-500">状态:</span>
                <span className={`px-2 py-1 text-xs rounded ${getOrderStatus(selectedOrder).bg} ${getOrderStatus(selectedOrder).color}`}>
                  {getOrderStatus(selectedOrder).text}
                </span>
              </div>
              <div>
                <span className="text-gray-500">活动:</span>
                <p className="font-medium">{selectedOrder.activityTitle}</p>
              </div>
              <div>
                <span className="text-gray-500">时间:</span>
                <p className="font-medium">{selectedOrder.date} {selectedOrder.time}</p>
              </div>
              <div>
                <span className="text-gray-500">人数:</span>
                <p className="font-medium">{selectedOrder.participants}人</p>
              </div>
              <div>
                <span className="text-gray-500">金额:</span>
                <p className="font-medium">¥{selectedOrder.finalPrice}</p>
              </div>
            </div>

            {selectedOrder.isMemberPrice && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 text-sm">
                  🎉 您享受了会员价格优惠！
                  原价: ¥{selectedOrder.originalPrice} → 会员价: ¥{selectedOrder.finalPrice}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              {!selectedOrder.isUsed && 
               selectedOrder.status !== 'cancelled' && 
               selectedOrder.status !== 'refunded' && (
                <button
                  onClick={() => {
                    setShowOrderDetail(false);
                    setShowQRModal(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <QrCodeIcon className="h-4 w-4 mr-1" />
                  查看二维码
                </button>
              )}
              
              {(selectedOrder.isUsed || new Date(selectedOrder.date) < new Date()) && 
               !getOrderRating(selectedOrder.id) && (
                <button
                  onClick={() => {
                    setShowOrderDetail(false);
                    handleRateOrder(selectedOrder);
                  }}
                  className="btn-secondary flex items-center"
                >
                  <StarIcon className="h-4 w-4 mr-1" />
                  评价活动
                </button>
              )}
              
              <button
                onClick={() => handleRebookActivity(selectedOrder)}
                className="btn-secondary flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                重新预订
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RatingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">评价活动</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating({...rating, score: star})}
                  className="text-2xl"
                >
                  {star <= rating.score ? (
                    <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
            <textarea
              value={rating.comment}
              onChange={(e) => setRating({...rating, comment: e.target.value})}
              placeholder="分享您的体验..."
              className="input-field h-24 resize-none"
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowRatingModal(false)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={submitRating}
            className="flex-1 btn-primary"
          >
            提交评价
          </button>
        </div>
      </div>
    </div>
  );

  const QRModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">订单二维码</h3>
          <button
            onClick={() => setShowQRModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {selectedOrder && (
          <div>
            <QRCodeGenerator
              data={generateQRCode(selectedOrder)}
              size={250}
              title="活动入场券"
              showDownload={true}
              showCopy={false}
              className="mb-4"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3 text-center">
                请在活动现场向工作人员出示此二维码
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="font-medium">订单号:</span>
                  <p className="break-all">{selectedOrder.id}</p>
                </div>
                <div>
                  <span className="font-medium">活动:</span>
                  <p>{selectedOrder.activityTitle}</p>
                </div>
                <div>
                  <span className="font-medium">时间:</span>
                  <p>{selectedOrder.date} {selectedOrder.time}</p>
                </div>
                <div>
                  <span className="font-medium">人数:</span>
                  <p>{selectedOrder.participants}人</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">我的订单</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">查看和管理您的活动订单</p>
      </div>

      {/* 筛选器 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'upcoming', label: '待使用' },
            { key: 'completed', label: '已完成' },
            { key: 'cancelled', label: '已取消' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 md:px-4 py-2 text-sm rounded-lg transition-colors ${
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

      {/* 订单列表 */}
      <div className="space-y-4">
        {getFilteredOrders().map((order) => {
          const status = getOrderStatus(order);
          const orderRating = getOrderRating(order.id);
          
          return (
            <div key={order.id} className="card p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-2 sm:space-y-0">
                    <span className={`px-2 py-1 text-xs rounded mr-0 sm:mr-3 self-start ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                    <span className="text-sm text-gray-500">订单号: {order.id}</span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{order.activityTitle}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{order.date} {order.time}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      <span>{order.participants}人</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">¥{order.finalPrice}</span>
                      {order.isMemberPrice && (
                        <span className="text-green-600 text-xs ml-1">(会员价)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {orderRating && (
                    <div className="flex items-center mb-3">
                      <span className="text-sm text-gray-600 mr-2">我的评价:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= orderRating.score ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {orderRating.comment && (
                        <span className="text-sm text-gray-600 ml-2">"{orderRating.comment}"</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetail(true);
                      }}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      查看详情
                    </button>
                    
                    {!order.isUsed && 
                     order.status !== 'cancelled' && 
                     order.status !== 'refunded' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowQRModal(true);
                        }}
                        className="btn-primary text-sm flex items-center"
                      >
                        <QrCodeIcon className="h-4 w-4 mr-1" />
                        二维码
                      </button>
                    )}
                    
                    {(order.isUsed || new Date(order.date) < new Date()) && 
                     !orderRating && (
                      <button
                        onClick={() => handleRateOrder(order)}
                        className="btn-secondary text-sm flex items-center"
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        评价
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {getFilteredOrders().length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
            <p className="text-gray-600 mb-4">您还没有任何订单记录</p>
            <button
              onClick={() => window.location.hash = '#customer/home'}
              className="btn-primary"
            >
              去预订活动
            </button>
          </div>
        )}
      </div>

      {showOrderDetail && <OrderDetailModal />}
      {showRatingModal && <RatingModal />}
      {showQRModal && <QRModal />}
    </div>
  );
};

export default CustomerOrders;
