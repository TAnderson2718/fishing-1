import React, { useState } from 'react';
import AdminDashboard from '../pages/AdminDashboard';
import StaffManagement from '../pages/admin/StaffManagement';
import CustomerManagement from '../pages/admin/CustomerManagement';
import ActivityManagement from '../pages/admin/ActivityManagement';
import ForumManagement from '../pages/admin/ForumManagement';
import OrderManagement from '../pages/admin/OrderManagement';

const AdminRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 监听URL hash变化来实现简单路由
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('admin/')) {
        const page = hash.split('/')[1] || 'dashboard';
        setCurrentPage(page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 初始化

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'staff':
        return <StaffManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'activities':
        return <ActivityManagement />;
      case 'forum':
        return <ForumManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return renderPage();
};

export default AdminRouter;
