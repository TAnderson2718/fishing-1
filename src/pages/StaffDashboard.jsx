import React, { useState } from 'react';
import { dataManager } from '../utils/storage';
import { QrCodeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = () => {
    if (!qrInput.trim()) {
      alert('请输入二维码内容');
      return;
    }

    setIsScanning(true);
    
    // 模拟扫描延迟
    setTimeout(() => {
      try {
        // 尝试解析二维码数据
        const qrData = JSON.parse(qrInput);
        const order = dataManager.getOrders().find(o => o.id === qrData.orderId);
        
        if (!order) {
          setScanResult({
            success: false,
            message: '订单不存在',
            order: null
          });
        } else if (order.isUsed) {
          setScanResult({
            success: false,
            message: '此订单已被使用',
            order: order
          });
        } else {
          setScanResult({
            success: true,
            message: '订单验证成功',
            order: order
          });
        }
      } catch (error) {
        setScanResult({
          success: false,
          message: '无效的二维码格式',
          order: null
        });
      }
      
      setIsScanning(false);
    }, 1000);
  };

  const handleUseOrder = () => {
    if (scanResult?.order && !scanResult.order.isUsed) {
      const usedOrder = dataManager.useOrder(scanResult.order.id);
      if (usedOrder) {
        setScanResult({
          ...scanResult,
          order: usedOrder,
          message: '订单核销成功！'
        });
        setQrInput('');
      }
    }
  };

  const generateSampleQR = () => {
    const orders = dataManager.getOrders();
    const unusedOrder = orders.find(o => !o.isUsed);
    if (unusedOrder) {
      const qrData = {
        orderId: unusedOrder.id,
        customerId: unusedOrder.customerId,
        activityId: unusedOrder.activityId,
        date: unusedOrder.date,
        time: unusedOrder.time,
        timestamp: Date.now()
      };
      setQrInput(JSON.stringify(qrData));
    } else {
      alert('没有可用的未使用订单');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">员工工作台</h1>
        <p className="text-gray-600 mt-2">票务核销和客户服务</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 二维码扫描区域 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <QrCodeIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">二维码核销</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                扫描或输入二维码内容
              </label>
              <textarea
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="请扫描客户的订单二维码或手动输入..."
                className="input-field h-24 resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleQRScan}
                disabled={isScanning}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isScanning ? '验证中...' : '验证订单'}
              </button>
              <button
                onClick={generateSampleQR}
                className="btn-secondary"
              >
                生成示例
              </button>
            </div>
          </div>
        </div>

        {/* 扫描结果显示 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">验证结果</h2>
          
          {!scanResult ? (
            <div className="text-center py-8 text-gray-500">
              <QrCodeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>请扫描二维码查看订单信息</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center p-3 rounded-lg ${
                scanResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {scanResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{scanResult.message}</span>
              </div>

              {scanResult.order && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">订单号:</span>
                      <p className="font-medium">{scanResult.order.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">客户:</span>
                      <p className="font-medium">{scanResult.order.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">活动:</span>
                      <p className="font-medium">{scanResult.order.activityTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">时间:</span>
                      <p className="font-medium">{scanResult.order.date} {scanResult.order.time}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">人数:</span>
                      <p className="font-medium">{scanResult.order.participants}人</p>
                    </div>
                    <div>
                      <span className="text-gray-500">金额:</span>
                      <p className="font-medium">¥{scanResult.order.finalPrice}</p>
                    </div>
                  </div>

                  {scanResult.success && !scanResult.order.isUsed && (
                    <button
                      onClick={handleUseOrder}
                      className="w-full btn-primary mt-4"
                    >
                      确认核销
                    </button>
                  )}

                  {scanResult.order.isUsed && (
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-gray-600 text-sm">
                        此订单已于 {new Date(scanResult.order.usedAt).toLocaleString()} 核销
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 今日核销统计 */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold mb-4">今日核销统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {dataManager.getOrders().filter(o => o.isUsed).length}
            </p>
            <p className="text-sm text-blue-600">已核销订单</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {dataManager.getOrders().filter(o => !o.isUsed).length}
            </p>
            <p className="text-sm text-green-600">待核销订单</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              ¥{dataManager.getOrders().filter(o => o.isUsed).reduce((sum, o) => sum + o.finalPrice, 0)}
            </p>
            <p className="text-sm text-purple-600">核销金额</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
