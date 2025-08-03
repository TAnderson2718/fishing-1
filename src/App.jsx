import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import CustomerRouter from './components/CustomerRouter';
import AdminRouter from './components/AdminRouter';
import StaffRouter from './components/StaffRouter';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout>
      {user.role === 'customer' && <CustomerRouter />}
      {user.role === 'admin' && <AdminRouter />}
      {user.role === 'staff' && <StaffRouter />}
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <PerformanceMonitor />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
