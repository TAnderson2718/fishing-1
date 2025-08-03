import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 可以在这里添加错误上报逻辑
    // reportErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // 自定义降级后的 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                出现了一些问题
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {this.props.fallbackMessage || '应用遇到了意外错误，请尝试刷新页面或联系技术支持。'}
              </p>
            </div>

            {/* 开发环境下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">错误详情:</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center justify-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                重试
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                刷新页面
              </button>
            </div>

            {this.props.showContactInfo !== false && (
              <div className="text-center text-sm text-gray-500">
                <p>如果问题持续存在，请联系技术支持</p>
                <p className="mt-1">
                  邮箱: support@fishing-platform.com
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 函数式错误边界组件（用于特定组件的错误处理）
const ErrorFallback = ({ 
  error, 
  resetErrorBoundary, 
  title = '加载失败',
  message = '组件加载时出现错误，请重试。'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
            查看错误详情
          </summary>
          <pre className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded overflow-auto max-h-32">
            {error.toString()}
          </pre>
        </details>
      )}
      
      <button
        onClick={resetErrorBoundary}
        className="btn-primary flex items-center"
      >
        <ArrowPathIcon className="h-4 w-4 mr-2" />
        重试
      </button>
    </div>
  );
};

// 高阶组件：为组件添加错误边界
const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
export { ErrorFallback, withErrorBoundary };
