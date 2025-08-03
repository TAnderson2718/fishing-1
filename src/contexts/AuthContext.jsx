import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { dataManager } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const foundUser = dataManager.getUserByUsername(username);
      
      if (!foundUser) {
        throw new Error('用户不存在');
      }

      if (foundUser.password !== password) {
        throw new Error('密码错误');
      }

      // 不保存密码到状态中
      const userWithoutPassword = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        isMember: foundUser.isMember,
        membershipExpiry: foundUser.membershipExpiry
      };

      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userData) => {
    // 支持部分更新和完整更新
    const updatedUser = typeof userData === 'object' && userData.id
      ? userData  // 完整用户对象
      : { ...user, ...userData };  // 部分更新

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // 同时更新users数组中的用户信息
    const users = dataManager.getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      storage.set('users', users);
    }
  };

  const switchRole = (role) => {
    // 这是一个演示功能，允许在不同角色之间切换
    // 在实际应用中，这应该通过适当的权限验证
    const demoUsers = {
      admin: {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: '系统管理员',
        email: 'admin@fishing.com',
        phone: '13800138000'
      },
      staff: {
        id: 2,
        username: 'staff001',
        role: 'staff',
        name: '张小明',
        email: 'zhang@fishing.com',
        phone: '13800138001'
      },
      customer: {
        id: 3,
        username: 'customer001',
        role: 'customer',
        name: '李大华',
        email: 'li@example.com',
        phone: '13800138002',
        isMember: true,
        membershipExpiry: '2024-09-05'
      }
    };

    const newUser = demoUsers[role];
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
  };



  const hasPermission = (permission) => {
    if (!user) return false;

    const permissions = {
      admin: [
        'manage_staff',
        'manage_customers',
        'manage_activities',
        'manage_forum',
        'manage_orders',
        'view_all_data'
      ],
      staff: [
        'scan_qr',
        'basic_customer_service'
      ],
      customer: [
        'book_activities',
        'view_orders',
        'use_forum',
        'manage_membership'
      ]
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  // ✅ 使用 useMemo 优化 context value，避免不必要的重新渲染
  const value = useMemo(() => ({
    user,
    login,
    logout,
    switchRole,
    updateUser,
    hasPermission,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isCustomer: user?.role === 'customer'
  }), [user, login, logout, switchRole, updateUser, hasPermission, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
