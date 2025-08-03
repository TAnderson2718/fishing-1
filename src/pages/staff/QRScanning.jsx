import React, { useState, useEffect } from 'react';
import { dataManager } from '../../utils/storage';
import { QrCodeIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const QRScanning = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // 检查网络状态
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
            order: null,
            errorType: 'NOT_FOUND'
          });
        } else if (order.isUsed) {
          setScanResult({
            success: false,
            message: '此订单已被使用',
            order: order,
            errorType: 'ALREADY_USED'
          });
        } else {
          // 检查订单日期是否匹配
          const today = new Date().toISOString().split('T')[0];
          if (order.date !== today) {
            setScanResult({
              success: false,
              message: `订单日期不匹配，预约日期为 ${order.date}`,
              order: order,
              errorType: 'DATE_MISMATCH'
            });
          } else {
            setScanResult({
              success: true,
              message: '订单验证成功',
              order: order,
              errorType: null
            });
          }
        }
      } catch (error) {
        setScanResult({
          success: false,
          message: '无效的二维码格式',
          order: null,
          errorType: 'INVALID_FORMAT'
        });
      }
      
      setIsScanning(false);
    }, 1000);
  };

  const handleConfirmUse = () => {
    if (scanResult?.order && !scanResult.order.isUsed) {
      if (offlineMode) {
        // 离线模式：添加到队列
        const offlineItem = {
          orderId: scanResult.order.id,
          timestamp: Date.now(),
          customerName: scanResult.order.customerName,
          activityTitle: scanResult.order.activityTitle
        };
        setOfflineQueue([...offlineQueue, offlineItem]);
        setScanResult({
          ...scanResult,
          message: '已添加到离线队列，将在网络恢复后同步'
        });
      } else {
        // 在线模式：立即核销
        const usedOrder = dataManager.useOrder(scanResult.order.id);
        if (usedOrder) {
          setScanResult({
            ...scanResult,
            order: usedOrder,
            message: '订单核销成功！'
          });
          
          if (batchMode) {
            setBatchResults([...batchResults, {
              orderId: usedOrder.id,
              customerName: usedOrder.customerName,
              status: 'success',
              timestamp: Date.now()
            }]);
          }
        }
      }
      
      setShowConfirmDialog(false);
      setQrInput('');
    }
  };

  const handleBatchScan = () => {
    if (batchMode) {
      // 结束批量模式
      setBatchMode(false);
      setBatchResults([]);
    } else {
      // 开始批量模式
      setBatchMode(true);
      setBatchResults([]);
    }
  };

  const syncOfflineQueue = () => {
    offlineQueue.forEach(item => {
      dataManager.useOrder(item.orderId);
    });
    setOfflineQueue([]);
    alert(`已同步 ${offlineQueue.length} 个离线核销记录`);
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

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold">确认核销</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">请确认以下订单信息无误后进行核销：</p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div><strong>客户：</strong>{scanResult?.order?.customerName}</div>
            <div><strong>活动：</strong>{scanResult?.order?.activityTitle}</div>
            <div><strong>时间：</strong>{scanResult?.order?.date} {scanResult?.order?.time}</div>
            <div><strong>人数：</strong>{scanResult?.order?.participants}人</div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleConfirmUse}
            className="flex-1 btn-primary"
          >
            确认核销
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">二维码核销</h1>
            <p className="text-gray-600 mt-2">扫描客户订单二维码进行核销验证</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {offlineMode && (
              <div className="flex items-center text-orange-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">离线模式</span>
              </div>
            )}
            
            {offlineQueue.length > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="btn-primary text-sm"
              >
                同步离线记录 ({offlineQueue.length})
              </button>
            )}
            
            <button
              onClick={handleBatchScan}
              className={`flex items-center ${batchMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {batchMode ? '结束批量' : '批量模式'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 二维码扫描区域 */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <QrCodeIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">扫描区域</h2>
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
                      onClick={() => setShowConfirmDialog(true)}
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

      {/* 批量扫描结果 */}
      {batchMode && batchResults.length > 0 && (
        <div className="mt-8 card p-6">
          <h2 className="text-lg font-semibold mb-4">批量核销记录</h2>
          <div className="space-y-2">
            {batchResults.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span>{result.customerName} - {result.orderId}</span>
                <span className="text-sm text-green-600">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
};

export default QRScanning;
