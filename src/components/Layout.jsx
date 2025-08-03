import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  QrCodeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout, switchRole, isAdmin, isStaff, isCustomer } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    if (isAdmin) {
      return [
        { name: '仪表板', href: '#admin/dashboard', icon: HomeIcon },
        { name: '员工管理', href: '#admin/staff', icon: UserGroupIcon },
        { name: '客户管理', href: '#admin/customers', icon: UserIcon },
        { name: '活动管理', href: '#admin/activities', icon: CalendarIcon },
        { name: '论坛管理', href: '#admin/forum', icon: ChatBubbleLeftRightIcon },
        { name: '订单管理', href: '#admin/orders', icon: ClipboardDocumentListIcon },
      ];
    } else if (isStaff) {
      return [
        { name: '工作台', href: '#staff/dashboard', icon: HomeIcon },
        { name: '票务核销', href: '#staff/scan', icon: QrCodeIcon },
        { name: '客户服务', href: '#staff/service', icon: UserIcon },
        { name: '数据分析', href: '#staff/analytics', icon: ChartBarIcon },
        { name: '班次管理', href: '#staff/shift', icon: ClockIcon },
      ];
    } else if (isCustomer) {
      return [
        { name: '首页', href: '#customer/home', icon: HomeIcon },
        { name: '我的订单', href: '#customer/orders', icon: ClipboardDocumentListIcon },
        { name: '论坛', href: '#customer/forum', icon: ChatBubbleLeftRightIcon },
        { name: '会员中心', href: '#customer/membership', icon: UserIcon },
        { name: '支付记录', href: '#customer/payments', icon: CreditCardIcon },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">
                  钓鱼户外平台
                </h1>
              </div>
            </div>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 角色切换 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">切换角色:</span>
                <select
                  value={user?.role || ''}
                  onChange={(e) => switchRole(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="admin">管理员</option>
                  <option value="staff">员工</option>
                  <option value="customer">顾客</option>
                </select>
              </div>

              {/* 用户信息 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                  {user?.role === 'admin' ? '管理员' :
                   user?.role === 'staff' ? '员工' : '顾客'}
                </span>
              </div>

              {/* 登出按钮 */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="text-sm">登出</span>
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* 用户信息 */}
              <div className="flex items-center px-3 py-2 border-b border-gray-200 mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role === 'admin' ? '管理员' :
                     user?.role === 'staff' ? '员工' : '顾客'}
                  </div>
                </div>
              </div>

              {/* 角色切换 */}
              <div className="px-3 py-2">
                <label className="block text-sm text-gray-500 mb-1">切换角色:</label>
                <select
                  value={user?.role || ''}
                  onChange={(e) => switchRole(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="admin">管理员</option>
                  <option value="staff">员工</option>
                  <option value="customer">顾客</option>
                </select>
              </div>

              {/* 导航菜单 */}
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              ))}

              {/* 登出按钮 */}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                登出
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="flex">
        {/* 桌面端侧边栏 */}
        <div className="hidden md:block w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors duration-200"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 bg-gray-50 min-h-screen">
          <main className="py-4 md:py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
