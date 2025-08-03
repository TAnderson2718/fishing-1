import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    storageUsage: { used: 0, available: 0, percentage: 0 },
    memoryUsage: 0,
    networkStatus: 'online'
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 监控页面加载性能
    const measurePerformance = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const renderTime = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
        
        setMetrics(prev => ({
          ...prev,
          loadTime,
          renderTime
        }));
      }
    };

    // 监控存储使用情况
    const monitorStorage = () => {
      const usage = storage.getUsage();
      setMetrics(prev => ({
        ...prev,
        storageUsage: usage
      }));
    };

    // 监控内存使用情况
    const monitorMemory = () => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));
      }
    };

    // 监控网络状态
    const updateNetworkStatus = () => {
      setMetrics(prev => ({
        ...prev,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      }));
    };

    // 初始测量
    setTimeout(measurePerformance, 1000);
    monitorStorage();
    monitorMemory();
    updateNetworkStatus();

    // 定期更新
    const interval = setInterval(() => {
      monitorStorage();
      monitorMemory();
    }, 5000);

    // 监听网络状态变化
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 监听存储变化
    window.addEventListener('storageUpdate', monitorStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      window.removeEventListener('storageUpdate', monitorStorage);
    };
  }, []);

  // 开发环境下显示性能监控
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value < thresholds.good) return 'text-green-600';
    if (value < thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 切换按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors mb-2"
        title="性能监控"
      >
        📊
      </button>

      {/* 性能面板 */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">性能监控</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* 页面加载性能 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1">页面性能</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">加载时间:</span>
                  <span className={`ml-1 font-mono ${getPerformanceColor(metrics.loadTime, { good: 2000, warning: 5000 })}`}>
                    {formatTime(metrics.loadTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">渲染时间:</span>
                  <span className={`ml-1 font-mono ${getPerformanceColor(metrics.renderTime, { good: 100, warning: 500 })}`}>
                    {formatTime(metrics.renderTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* 存储使用情况 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1">存储使用</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">已使用:</span>
                  <span className="font-mono">{formatBytes(metrics.storageUsage.used)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metrics.storageUsage.percentage > 80 ? 'bg-red-500' :
                      metrics.storageUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metrics.storageUsage.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {metrics.storageUsage.percentage.toFixed(1)}% 已使用
                </div>
              </div>
            </div>

            {/* 内存使用情况 */}
            {metrics.memoryUsage > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">内存使用</h4>
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.memoryUsage > 80 ? 'bg-red-500' :
                        metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.memoryUsage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {metrics.memoryUsage.toFixed(1)}% 已使用
                  </div>
                </div>
              </div>
            )}

            {/* 网络状态 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1">网络状态</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  metrics.networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs capitalize">{metrics.networkStatus}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => storage.cleanup()}
                  className="flex-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  清理存储
                </button>
                <button
                  onClick={() => {
                    const backup = storage.backup();
                    if (backup) {
                      const blob = new Blob([backup], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `fishing-platform-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  备份数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
