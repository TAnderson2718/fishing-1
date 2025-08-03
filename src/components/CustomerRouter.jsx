import React, { useState, useEffect } from 'react';
import CustomerHome from '../pages/CustomerHome';
import CustomerOrders from '../pages/customer/CustomerOrders';
import CustomerForum from '../pages/customer/CustomerForum';
import CustomerMembership from '../pages/customer/CustomerMembership';
import PaymentHistory from '../pages/customer/PaymentHistory';

const CustomerRouter = () => {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // 监听hash变化
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#customer/')) {
        const page = hash.replace('#customer/', '');
        setCurrentPage(page);
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化页面
    handleHashChange();
    
    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'orders':
        return <CustomerOrders />;
      case 'forum':
        return <CustomerForum />;
      case 'membership':
        return <CustomerMembership />;
      case 'payments':
        return <PaymentHistory />;
      case 'home':
      default:
        return <CustomerHome />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default CustomerRouter;
