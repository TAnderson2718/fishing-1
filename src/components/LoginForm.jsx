import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const quickLogin = (role) => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      staff: { username: 'staff001', password: 'staff123' },
      customer: { username: 'customer001', password: 'customer123' }
    };

    const cred = credentials[role];
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            钓鱼户外平台
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请选择角色或输入账号密码登录
          </p>
        </div>
        
        {/* 快速登录按钮 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">快速登录演示:</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => quickLogin('admin')}
              className="btn-primary text-xs py-2"
            >
              管理员
            </button>
            <button
              onClick={() => quickLogin('staff')}
              className="btn-secondary text-xs py-2"
            >
              员工
            </button>
            <button
              onClick={() => quickLogin('customer')}
              className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              顾客
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field mt-1"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="请输入密码"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>

        {/* 演示账号信息 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">演示账号:</h4>
          <div className="text-xs text-blue-600 space-y-1">
            <div>管理员: admin / admin123</div>
            <div>员工: staff001 / staff123</div>
            <div>顾客: customer001 / customer123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
