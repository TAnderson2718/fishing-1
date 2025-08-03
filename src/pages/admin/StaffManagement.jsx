import React, { useState, useEffect, useCallback } from 'react';
import { dataManager, storage } from '../../utils/storage';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// ✅ 将 StaffModal 移到组件外部，避免每次重新渲染时重新创建
const StaffModal = React.memo(({
  showModal,
  editingStaff,
  formData,
  onFormDataChange,
  onSubmit,
  onClose
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {editingStaff ? '编辑员工' : '添加员工'}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => onFormDataChange({...formData, username: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => onFormDataChange({...formData, password: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              电话
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => onFormDataChange({...formData, phone: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {editingStaff ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    const users = dataManager.getUsers();
    const staffUsers = users.filter(user => user.role === 'staff');
    setStaff(staffUsers);
  };

  // ✅ 使用 useCallback 优化事件处理器，避免不必要的重新渲染
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (editingStaff) {
      // 更新员工
      const users = dataManager.getUsers();
      const index = users.findIndex(u => u.id === editingStaff.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...formData };
        storage.set('users', users);

        // ✅ 使用精确的状态更新，避免重新加载所有数据
        const updatedStaff = staff.map(s =>
          s.id === editingStaff.id ? { ...s, ...formData } : s
        );
        setStaff(updatedStaff);
      }
    } else {
      // 创建新员工
      const newStaff = {
        ...formData,
        role: 'staff'
      };
      const createdStaff = dataManager.createUser(newStaff);

      // ✅ 直接添加新员工到现有状态，避免重新加载所有数据
      setStaff(prevStaff => [...prevStaff, createdStaff]);
    }

    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: ''
    });
  }, [editingStaff, formData, staff]);

  // ✅ 使用 useCallback 优化表单数据更新
  const handleFormDataChange = useCallback((newFormData) => {
    setFormData(newFormData);
  }, []);

  // ✅ 使用 useCallback 优化关闭模态框
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: ''
    });
  }, []);

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      password: staffMember.password,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone
    });
    setShowModal(true);
  };

  const handleDelete = (staffId) => {
    if (confirm('确定要删除这个员工吗？')) {
      const users = dataManager.getUsers();
      const filteredUsers = users.filter(u => u.id !== staffId);
      storage.set('users', filteredUsers);

      // ✅ 使用精确的状态更新，避免重新加载所有数据
      const updatedStaff = staff.filter(s => s.id !== staffId);
      setStaff(updatedStaff);
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">员工管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          添加员工
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  员工信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账号信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {staffMember.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {staffMember.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staffMember.email}</div>
                    <div className="text-sm text-gray-500">{staffMember.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staffMember.username}</div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      员工
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffModal
        showModal={showModal}
        editingStaff={editingStaff}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StaffManagement;
