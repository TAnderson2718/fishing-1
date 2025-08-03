import React, { useState } from 'react';
import { 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PaymentSystem = ({ 
  amount, 
  orderInfo, 
  onSuccess, 
  onCancel, 
  onError,
  title = "支付订单"
}) => {
  const [selectedMethod, setSelectedMethod] = useState('alipay');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  const paymentMethods = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: DevicePhoneMobileIcon,
      description: '使用支付宝扫码支付',
      color: 'text-blue-600'
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: QrCodeIcon,
      description: '使用微信扫码支付',
      color: 'text-green-600'
    },
    {
      id: 'card',
      name: '银行卡',
      icon: CreditCardIcon,
      description: '使用银行卡支付',
      color: 'text-purple-600'
    }
  ];

  const simulatePayment = async () => {
    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // 模拟支付处理时间
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟支付结果（90%成功率）
      const success = Math.random() > 0.1;

      if (success) {
        setPaymentStatus('success');
        
        // 生成支付记录
        const paymentRecord = {
          id: `pay_${Date.now()}`,
          orderId: orderInfo.orderId,
          amount: amount,
          method: selectedMethod,
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        setTimeout(() => {
          onSuccess && onSuccess(paymentRecord);
        }, 1000);
      } else {
        setPaymentStatus('failed');
        setTimeout(() => {
          onError && onError('支付失败，请重试');
          setPaymentStatus('pending');
          setProcessing(false);
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('failed');
      setTimeout(() => {
        onError && onError('支付过程中发生错误');
        setPaymentStatus('pending');
        setProcessing(false);
      }, 2000);
    }
  };

  const handlePayment = () => {
    if (processing) return;
    simulatePayment();
  };

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'processing':
        return {
          icon: ClockIcon,
          text: '支付处理中...',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        };
      case 'success':
        return {
          icon: CheckCircleIcon,
          text: '支付成功！',
          color: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          text: '支付失败',
          color: 'text-red-600',
          bg: 'bg-red-50'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-6">{title}</h2>

        {/* 订单信息 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">订单金额</span>
            <span className="text-2xl font-bold text-primary-600">¥{amount}</span>
          </div>
          {orderInfo && (
            <div className="text-sm text-gray-600">
              <p>订单号: {orderInfo.orderId}</p>
              {orderInfo.description && <p>{orderInfo.description}</p>}
            </div>
          )}
        </div>

        {/* 支付状态显示 */}
        {statusDisplay && (
          <div className={`flex items-center justify-center p-4 rounded-lg mb-6 ${statusDisplay.bg}`}>
            <statusDisplay.icon className={`h-6 w-6 mr-2 ${statusDisplay.color}`} />
            <span className={`font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>
        )}

        {/* 支付方式选择 */}
        {paymentStatus === 'pending' && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">选择支付方式</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="sr-only"
                    />
                    <method.icon className={`h-6 w-6 mr-3 ${method.color}`} />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 支付按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 btn-secondary"
                disabled={processing}
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 btn-primary"
                disabled={processing}
              >
                {processing ? '处理中...' : `确认支付 ¥${amount}`}
              </button>
            </div>
          </>
        )}

        {/* 支付处理中的提示 */}
        {paymentStatus === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">请稍候，正在处理您的支付...</p>
            <p className="text-sm text-gray-500 mt-2">请不要关闭此页面</p>
          </div>
        )}

        {/* 支付成功 */}
        {paymentStatus === 'success' && (
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">支付成功！</p>
            <p className="text-gray-600">您的订单已确认，感谢您的购买</p>
          </div>
        )}

        {/* 支付失败 */}
        {paymentStatus === 'failed' && (
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">支付失败</p>
            <p className="text-gray-600 mb-4">请检查支付信息后重试</p>
            <button
              onClick={() => {
                setPaymentStatus('pending');
                setProcessing(false);
              }}
              className="btn-primary"
            >
              重新支付
            </button>
          </div>
        )}

        {/* 安全提示 */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            🔒 这是模拟支付环境，不会产生真实费用
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;
