import React, { useState, useEffect } from 'react';
import { dataManager } from '../../utils/storage';
import { useToast } from '../../contexts/ToastContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const ActivityManagement = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lure_fishing',
    price: '',
    memberPrice: '',
    duration: '',
    maxParticipants: '',
    location: '',
    image: '',
    features: [''],
    status: 'active'
  });

  const categories = {
    lure_fishing: '路亚钓鱼',
    forest_yoga: '森林瑜伽',
    family_fishing: '亲子钓鱼',
    hiking: '徒步登山',
    camping: '野外露营'
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchTerm, filterCategory, filterStatus, sortBy]);

  const loadActivities = () => {
    const activitiesData = dataManager.getActivities();
    setActivities(activitiesData);
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === filterCategory);
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price':
          return a.price - b.price;
        case 'createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('请填写活动标题和描述');
      return;
    }

    if (!formData.price || !formData.memberPrice) {
      toast.error('请填写价格信息');
      return;
    }

    const activityData = {
      ...formData,
      price: parseFloat(formData.price),
      memberPrice: parseFloat(formData.memberPrice),
      maxParticipants: parseInt(formData.maxParticipants),
      features: formData.features.filter(f => f.trim()),
      createdAt: editingActivity ? editingActivity.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingActivity) {
      dataManager.updateActivity(editingActivity.id, activityData);
      toast.success('活动更新成功');

      // ✅ 使用精确的状态更新，避免重新加载所有数据
      const updatedActivities = activities.map(a =>
        a.id === editingActivity.id ? { ...a, ...activityData } : a
      );
      setActivities(updatedActivities);
    } else {
      const createdActivity = dataManager.createActivity(activityData);
      toast.success('活动创建成功');

      // ✅ 直接添加新活动到现有状态，避免重新加载所有数据
      setActivities(prevActivities => [...prevActivities, createdActivity]);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      price: activity.price.toString(),
      memberPrice: activity.memberPrice.toString(),
      duration: activity.duration,
      maxParticipants: activity.maxParticipants.toString(),
      location: activity.location,
      image: activity.image || '',
      features: activity.features || [''],
      status: activity.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (activity) => {
    if (window.confirm(`确定要删除活动"${activity.title}"吗？此操作不可撤销。`)) {
      dataManager.deleteActivity(activity.id);
      toast.success('活动删除成功');

      // ✅ 使用精确的状态更新，避免重新加载所有数据
      const updatedActivities = activities.filter(a => a.id !== activity.id);
      setActivities(updatedActivities);
    }
  };

  const handleViewDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'lure_fishing',
      price: '',
      memberPrice: '',
      duration: '',
      maxParticipants: '',
      location: '',
      image: '',
      features: [''],
      status: 'active'
    });
    setEditingActivity(null);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  // 分页逻辑
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">活动管理</h1>
          <p className="text-gray-600 mt-1">管理所有户外活动项目</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          创建活动
        </button>
      </div>

      {/* 搜索和过滤器 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* 分类过滤 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">所有分类</option>
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* 状态过滤 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">所有状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="createdAt">创建时间</option>
            <option value="title">活动名称</option>
            <option value="price">价格</option>
          </select>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活动信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {activity.image ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={activity.image}
                            alt={activity.title}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.location} · {activity.duration}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {categories[activity.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>¥{activity.price}</div>
                      <div className="text-xs text-gray-500">会员价: ¥{activity.memberPrice}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(activity)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(activity)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="编辑"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity)}
                        className="text-red-600 hover:text-red-900"
                        title="删除"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示 {startIndex + 1} 到 {Math.min(endIndex, filteredActivities.length)} 条，
                共 {filteredActivities.length} 条记录
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑活动模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingActivity ? '编辑活动' : '创建活动'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动分类 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="input-field"
                  required
                />
              </div>

              {/* 价格和时长 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    原价 (¥) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会员价 (¥) *
                  </label>
                  <input
                    type="number"
                    value={formData.memberPrice}
                    onChange={(e) => setFormData({...formData, memberPrice: e.target.value})}
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动时长 *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="input-field"
                    placeholder="如: 4小时"
                    required
                  />
                </div>
              </div>

              {/* 地点和人数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动地点 *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大参与人数 *
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* 活动图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动图片URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* 特色服务 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特色服务
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 input-field"
                      placeholder="输入特色服务"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + 添加特色服务
                </button>
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingActivity ? '更新活动' : '创建活动'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 活动详情模态框 */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">活动详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 活动图片 */}
              <div>
                {selectedActivity.image ? (
                  <img
                    src={selectedActivity.image}
                    alt={selectedActivity.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 活动信息 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedActivity.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedActivity.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">分类:</span>
                    <span className="ml-2">{categories[selectedActivity.category]}</span>
                  </div>
                  <div>
                    <span className="font-medium">时长:</span>
                    <span className="ml-2">{selectedActivity.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium">地点:</span>
                    <span className="ml-2">{selectedActivity.location}</span>
                  </div>
                  <div>
                    <span className="font-medium">最大人数:</span>
                    <span className="ml-2">{selectedActivity.maxParticipants}人</span>
                  </div>
                  <div>
                    <span className="font-medium">原价:</span>
                    <span className="ml-2">¥{selectedActivity.price}</span>
                  </div>
                  <div>
                    <span className="font-medium">会员价:</span>
                    <span className="ml-2">¥{selectedActivity.memberPrice}</span>
                  </div>
                </div>

                {selectedActivity.features && selectedActivity.features.length > 0 && (
                  <div>
                    <span className="font-medium">特色服务:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedActivity.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium">状态:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    selectedActivity.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedActivity.status === 'active' ? '启用' : '禁用'}
                  </span>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-3">预订统计</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">总预订数</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">¥0</div>
                  <div className="text-sm text-gray-600">总收入</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">参与人数</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManagement;
