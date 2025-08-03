import React from 'react';

// 基础加载旋转器
const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} ${colorClasses[color]}
        animate-spin rounded-full border-2 border-current border-t-transparent
      `}
    />
  );
};

// 页面级加载组件
const PageLoading = ({ message = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 py-12">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
};

// 全屏加载遮罩
const LoadingOverlay = ({ message = '处理中...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 mx-4 max-w-sm w-full">
        <Spinner size="lg" />
        <p className="text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
};

// 按钮内加载状态
const ButtonLoading = ({ loading = false, children, className = '', ...props }) => {
  return (
    <button
      className={`
        ${className}
        ${loading ? 'opacity-75 cursor-not-allowed' : ''}
        flex items-center justify-center space-x-2
      `}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      <span>{children}</span>
    </button>
  );
};

// 骨架屏组件
const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => {
  return (
    <div
      className={`
        ${width} ${height} ${className}
        bg-gray-200 rounded animate-pulse
      `}
    />
  );
};

// 卡片骨架屏
const CardSkeleton = () => {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton width="w-12" height="h-12" className="rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-3" />
        <Skeleton width="w-5/6" height="h-3" />
        <Skeleton width="w-4/6" height="h-3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton width="w-20" height="h-8" className="rounded" />
        <Skeleton width="w-16" height="h-6" />
      </div>
    </div>
  );
};

// 表格骨架屏
const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} width="w-full" height="h-6" />
        ))}
      </div>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="w-full" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

// 列表骨架屏
const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton width="w-10" height="h-10" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" height="h-4" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
          <Skeleton width="w-20" height="h-8" className="rounded" />
        </div>
      ))}
    </div>
  );
};

export {
  Spinner,
  PageLoading,
  LoadingOverlay,
  ButtonLoading,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton
};

export default Spinner;
