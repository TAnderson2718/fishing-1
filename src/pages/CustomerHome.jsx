import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataManager } from '../utils/storage';
import PaymentSystem from '../components/PaymentSystem';
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CustomerHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    setActivities(dataManager.getActivities());
  }, []);

  const getCategoryName = (category) => {
    const categories = {
      lure_fishing: '路亚钓鱼',
      forest_yoga: '森林瑜伽',
      family_fishing: '亲子钓鱼'
    };
    return categories[category] || category;
  };

  const handleBookActivity = (activity) => {
    setSelectedActivity(activity);
    setShowBookingModal(true);
  };

  // 支付相关处理函数
  const handlePaymentSuccess = (paymentRecord) => {
    if (!orderData) return;

    // 更新订单数据，设置支付状态
    const finalOrderData = {
      ...orderData,
      status: 'confirmed',
      paymentStatus: 'paid'
    };

    // 创建订单
    const newOrder = dataManager.createOrder(finalOrderData);

    // 更新活动可用人数
    if (orderData.schedule && selectedActivity) {
      const updatedActivity = { ...selectedActivity };
      const scheduleIndex = updatedActivity.schedule.findIndex(s =>
        s.date === orderData.schedule.date && s.time === orderData.schedule.time
      );

      if (scheduleIndex !== -1) {
        updatedActivity.schedule[scheduleIndex].available -= orderData.participants;
        dataManager.updateActivity(selectedActivity.id, updatedActivity);
      }
    }

    // 保存支付记录
    const payment = dataManager.createPayment({
      ...paymentRecord,
      orderId: newOrder.id,
      customerId: user.id,
      description: `${orderData.activityTitle} - ${orderData.date} ${orderData.time}`
    });

    setShowPaymentModal(false);
    setSelectedActivity(null);
    setOrderData(null);

    toast.success(`预订成功！订单号: ${newOrder.id}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setShowBookingModal(true);
  };

  const handlePaymentError = (error) => {
    toast.error(`支付失败: ${error}`);
  };

  const BookingModal = () => {
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [participants, setParticipants] = useState(1);

    const handleBooking = () => {
      if (!selectedSchedule) {
        toast.warning('请选择时间段');
        return;
      }

      const schedule = selectedActivity.schedule.find(s =>
        `${s.date}-${s.time}` === selectedSchedule
      );

      if (!schedule || schedule.available < participants) {
        toast.error('选择的时间段人数不足');
        return;
      }

      const price = user.isMember ? selectedActivity.memberPrice : selectedActivity.price;
      const totalPrice = price * participants;

      const newOrderData = {
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone || '',
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        activityDate: schedule.date,
        date: schedule.date,
        time: schedule.time,
        participants: participants,
        unitPrice: price,
        originalPrice: selectedActivity.price * participants,
        finalPrice: totalPrice,
        totalAmount: totalPrice,
        isMemberPrice: user.isMember,
        status: 'pending',
        paymentStatus: 'pending',
        schedule: schedule // 保存schedule引用用于后续更新
      };

      setOrderData(newOrderData);
      setShowBookingModal(false);
      setShowPaymentModal(true);
    };



    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">预订活动</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{selectedActivity?.title}</h4>
              <p className="text-sm text-gray-600">{selectedActivity?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择时间段
              </label>
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="input-field"
              >
                <option value="">请选择时间段</option>
                {selectedActivity?.schedule.map((schedule, index) => (
                  <option 
                    key={index} 
                    value={`${schedule.date}-${schedule.time}`}
                    disabled={schedule.available === 0}
                  >
                    {schedule.date} {schedule.time} (剩余{schedule.available}位)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参与人数
              </label>
              <input
                type="number"
                min="1"
                max={selectedActivity?.maxParticipants}
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value))}
                className="input-field"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>单价:</span>
                <span>
                  {user.isMember ? (
                    <>
                      <span className="line-through text-gray-400">¥{selectedActivity?.price}</span>
                      <span className="text-green-600 ml-2">¥{selectedActivity?.memberPrice}</span>
                    </>
                  ) : (
                    <span>¥{selectedActivity?.price}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>总价:</span>
                <span>
                  ¥{user.isMember ? 
                    selectedActivity?.memberPrice * participants : 
                    selectedActivity?.price * participants}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 btn-primary"
              >
                确认预订
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">欢迎回来，{user?.name}！</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">探索精彩的户外活动</p>
        {user?.isMember && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              🎉 您是会员用户，享受所有活动的会员价格！
              <span className="block md:inline md:ml-1">
                会员有效期至: {user.membershipExpiry}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="card p-4 md:p-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-40 md:h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                  {getCategoryName(activity.category)}
                </span>
                <h3 className="text-lg font-semibold mt-2">{activity.title}</h3>
                <p className="text-gray-600 text-sm">{activity.description}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{activity.duration}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  <span>最多{activity.maxParticipants}人</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {user?.isMember ? (
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        ¥{activity.memberPrice}
                      </span>
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ¥{activity.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      ¥{activity.price}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleBookActivity(activity)}
                  className="btn-primary text-sm"
                >
                  立即预订
                </button>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">特色服务:</h4>
                <div className="flex flex-wrap gap-1">
                  {activity.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showBookingModal && <BookingModal />}

      {showPaymentModal && orderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PaymentSystem
            amount={orderData.finalPrice}
            orderInfo={{
              orderId: `temp_${Date.now()}`,
              description: `${orderData.activityTitle} - ${orderData.date} ${orderData.time} (${orderData.participants}人)`
            }}
            title="支付活动费用"
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            onError={handlePaymentError}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
