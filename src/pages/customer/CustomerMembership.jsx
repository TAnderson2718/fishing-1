import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataManager, storage } from '../../utils/storage';
import PaymentSystem from '../../components/PaymentSystem';
import {
  StarIcon,
  GiftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const CustomerMembership = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [membershipStats, setMembershipStats] = useState({
    totalSavings: 0,
    activitiesBooked: 0,
    memberSince: null
  });

  useEffect(() => {
    loadMembershipData();
    calculateMembershipStats();
  }, []);

  const loadMembershipData = () => {
    const plans = dataManager.getMembershipPlans();
    setMembershipPlans(plans);
  };

  const calculateMembershipStats = () => {
    if (!user.isMember) return;

    const orders = dataManager.getOrders().filter(order => order.customerId === user.id);
    const memberOrders = orders.filter(order => order.isMemberPrice);
    
    const totalSavings = memberOrders.reduce((sum, order) => {
      return sum + (order.originalPrice - order.finalPrice);
    }, 0);

    setMembershipStats({
      totalSavings,
      activitiesBooked: memberOrders.length,
      memberSince: user.membershipStartDate || '2024-01-01'
    });
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleRenew = () => {
    // 找到当前会员等级对应的续费计划
    const currentPlan = membershipPlans.find(plan => plan.level === user.membershipLevel);
    if (currentPlan) {
      handleSubscribe(currentPlan);
    }
  };

  const handlePaymentSuccess = (paymentRecord) => {
    if (!selectedPlan) return;

    // 保存支付记录
    const payment = dataManager.createPayment({
      ...paymentRecord,
      customerId: user.id,
      description: `${selectedPlan.name}会员订阅`,
      planId: selectedPlan.id
    });

    // 更新用户会员状态
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + selectedPlan.duration);

    const updatedUser = {
      ...user,
      isMember: true,
      membershipLevel: selectedPlan.level,
      membershipExpiry: newExpiryDate.toISOString().split('T')[0],
      membershipStartDate: user.membershipStartDate || new Date().toISOString().split('T')[0]
    };

    updateUser(updatedUser);

    setShowPaymentModal(false);
    setSelectedPlan(null);

    toast.success(`恭喜！您已成功订阅${selectedPlan.name}会员！`);
    calculateMembershipStats();
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const handlePaymentError = (error) => {
    toast.error(`支付失败: ${error}`);
  };

  const getMembershipStatus = () => {
    if (!user.isMember) {
      return { status: 'inactive', text: '未开通', color: 'text-gray-600', bg: 'bg-gray-100' };
    }

    const expiryDate = new Date(user.membershipExpiry);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { status: 'expired', text: '已过期', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (daysLeft <= 7) {
      return { status: 'expiring', text: `${daysLeft}天后过期`, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { status: 'active', text: '有效', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const membershipStatus = getMembershipStatus();

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {selectedPlan && (
        <PaymentSystem
          amount={selectedPlan.price}
          orderInfo={{
            orderId: `membership_${selectedPlan.id}_${Date.now()}`,
            description: `${selectedPlan.name}会员订阅 (${selectedPlan.duration}个月)`
          }}
          title={`订阅${selectedPlan.name}`}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onError={handlePaymentError}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">会员中心</h1>
        <p className="text-gray-600 mt-2">享受专属权益和优惠价格</p>
      </div>

      {/* 当前会员状态 */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg mr-4">
              <TrophyIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.isMember ? `${user.membershipLevel}会员` : '普通用户'}
              </h2>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs rounded ${membershipStatus.bg} ${membershipStatus.color}`}>
                  {membershipStatus.text}
                </span>
                {user.isMember && (
                  <span className="text-sm text-gray-600 ml-3">
                    有效期至: {user.membershipExpiry}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {user.isMember && (
            <button
              onClick={handleRenew}
              className="btn-primary"
            >
              续费会员
            </button>
          )}
        </div>

        {user.isMember && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">¥{membershipStats.totalSavings}</div>
              <div className="text-sm text-gray-600">累计节省</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{membershipStats.activitiesBooked}</div>
              <div className="text-sm text-gray-600">会员活动</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor((new Date() - new Date(membershipStats.memberSince)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">会员天数</div>
            </div>
          </div>
        )}
      </div>

      {/* 会员计划 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">会员计划</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {membershipPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`card p-6 relative ${
                plan.isPopular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 text-xs rounded-full flex items-center">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    推荐
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  ¥{plan.price}
                </div>
                <div className="text-sm text-gray-600">{plan.duration}个月</div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={user.isMember && user.membershipLevel === plan.level}
                className={`w-full ${
                  user.isMember && user.membershipLevel === plan.level
                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                    : plan.isPopular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {user.isMember && user.membershipLevel === plan.level
                  ? '当前计划'
                  : user.isMember
                  ? '升级/降级'
                  : '立即订阅'
                }
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 会员权益说明 */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <GiftIcon className="h-6 w-6 text-primary-600 mr-2" />
          会员专属权益
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <StarSolidIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">专享优惠价格</h3>
                <p className="text-sm text-gray-600">所有活动享受会员专属价格，最高可节省30%</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">优先预订</h3>
                <p className="text-sm text-gray-600">热门活动优先预订权，抢先体验精彩活动</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <GiftIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">专属活动</h3>
                <p className="text-sm text-gray-600">参与会员专属活动和特殊体验项目</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <TrophyIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">积分奖励</h3>
                <p className="text-sm text-gray-600">每次消费获得积分，可兑换礼品和优惠券</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default CustomerMembership;
