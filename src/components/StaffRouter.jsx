import React, { useState } from 'react';
import StaffDashboard from '../pages/StaffDashboard';
import CustomerService from '../pages/staff/CustomerService';
import QRScanning from '../pages/staff/QRScanning';
import StaffAnalytics from '../pages/staff/StaffAnalytics';
import ShiftManagement from '../pages/staff/ShiftManagement';

const StaffRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 监听URL hash变化来实现简单路由
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('staff/')) {
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
        return <StaffDashboard />;
      case 'scan':
        return <QRScanning />;
      case 'service':
        return <CustomerService />;
      case 'analytics':
        return <StaffAnalytics />;
      case 'shift':
        return <ShiftManagement />;
      default:
        return <StaffDashboard />;
    }
  };

  return renderPage();
};

export default StaffRouter;
