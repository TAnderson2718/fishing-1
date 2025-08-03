import React, { useState, useEffect } from 'react';
import { dataManager } from '../../utils/storage';
import { useToast } from '../../contexts/ToastContext';
import { 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ForumManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('posts'); // posts, comments, users, stats

  const categories = {
    general: '综合讨论',
    fishing: '钓鱼技巧',
    equipment: '装备交流',
    location: '钓点分享',
    experience: '经验分享'
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, filterCategory, filterStatus, sortBy]);

  const loadData = () => {
    const postsData = dataManager.getForumPosts();
    const usersData = dataManager.getUsers();
    setPosts(postsData);
    setUsers(usersData);
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(post => post.category === filterCategory);
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      if (filterStatus === 'reported') {
        filtered = filtered.filter(post => post.isReported);
      } else if (filterStatus === 'normal') {
        filtered = filtered.filter(post => !post.isReported);
      }
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments.length - a.comments.length;
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const handleDeletePost = (post) => {
    if (window.confirm(`确定要删除帖子"${post.title}"吗？此操作不可撤销。`)) {
      dataManager.deleteForumPost(post.id);
      toast.success('帖子删除成功');

      // ✅ 使用精确的状态更新，避免重新加载所有数据
      const updatedPosts = posts.filter(p => p.id !== post.id);
      setPosts(updatedPosts);
    }
  };

  const handleTogglePostStatus = (post) => {
    const newStatus = !post.isReported;
    dataManager.updateForumPost(post.id, { isReported: newStatus });
    toast.success(newStatus ? '帖子已标记为举报' : '帖子已恢复正常');

    // ✅ 使用精确的状态更新，避免重新加载所有数据
    const updatedPosts = posts.map(p =>
      p.id === post.id ? { ...p, isReported: newStatus } : p
    );
    setPosts(updatedPosts);
  };

  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      dataManager.deleteForumComment(postId, commentId);
      toast.success('评论删除成功');

      // ✅ 使用精确的状态更新，避免重新加载所有数据
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId)
          };
        }
        return post;
      });
      setPosts(updatedPosts);

      // 如果在详情页面，更新选中的帖子
      if (selectedPost && selectedPost.id === postId) {
        const updatedSelectedPost = {
          ...selectedPost,
          comments: selectedPost.comments.filter(comment => comment.id !== commentId)
        };
        setSelectedPost(updatedSelectedPost);
      }
    }
  };

  const handleBanUser = (userId, duration = 7) => {
    if (window.confirm(`确定要禁言该用户 ${duration} 天吗？`)) {
      const banUntil = new Date();
      banUntil.setDate(banUntil.getDate() + duration);
      
      dataManager.updateUser(userId, {
        isBanned: true,
        banUntil: banUntil.toISOString(),
        banReason: '违反社区规定'
      });
      
      toast.success(`用户已被禁言 ${duration} 天`);

      // ✅ 更新用户状态，避免重新加载所有数据
      const updatedUsers = users.map(user =>
        user.id === userId ? {
          ...user,
          isBanned: true,
          banUntil: banUntil.toISOString(),
          banReason: '违反社区规定'
        } : user
      );
      setUsers(updatedUsers);
    }
  };

  const handleUnbanUser = (userId) => {
    dataManager.updateUser(userId, {
      isBanned: false,
      banUntil: null,
      banReason: null
    });
    toast.success('用户禁言已解除');

    // ✅ 更新用户状态，避免重新加载所有数据
    const updatedUsers = users.map(user =>
      user.id === userId ? {
        ...user,
        isBanned: false,
        banUntil: null,
        banReason: null
      } : user
    );
    setUsers(updatedUsers);
  };

  const getPostStats = () => {
    const totalPosts = posts.length;
    const reportedPosts = posts.filter(p => p.isReported).length;
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    
    return {
      totalPosts,
      reportedPosts,
      totalComments,
      totalViews
    };
  };

  const getUserStats = () => {
    const activeUsers = users.filter(u => u.role === 'customer').length;
    const bannedUsers = users.filter(u => u.isBanned).length;
    const topPosters = users
      .filter(u => u.role === 'customer')
      .map(user => ({
        ...user,
        postCount: posts.filter(p => p.authorId === user.id).length
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
    
    return {
      activeUsers,
      bannedUsers,
      topPosters
    };
  };

  // 分页逻辑
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const stats = getPostStats();
  const userStats = getUserStats();

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">论坛管理</h1>
        <p className="text-gray-600 mt-1">管理社区内容和用户</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">总帖子数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">举报帖子</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.reportedPosts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">总评论数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalComments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">活跃用户</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'posts', name: '帖子管理', icon: ChatBubbleLeftRightIcon },
              { id: 'users', name: '用户管理', icon: UserIcon },
              { id: 'stats', name: '数据统计', icon: FunnelIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 帖子管理标签页 */}
          {activeTab === 'posts' && (
            <div>
              {/* 搜索和过滤器 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索帖子..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                  />
                </div>

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

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="all">所有状态</option>
                  <option value="normal">正常</option>
                  <option value="reported">已举报</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="createdAt">发布时间</option>
                  <option value="views">浏览量</option>
                  <option value="likes">点赞数</option>
                  <option value="comments">评论数</option>
                </select>
              </div>

              {/* 帖子列表 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        帖子信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        作者
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        统计
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
                    {currentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {categories[post.category]}
                              </span>
                              <span className="ml-2">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.authorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div>浏览: {post.views}</div>
                            <div>点赞: {post.likes}</div>
                            <div>评论: {post.comments.length}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.isReported 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {post.isReported ? '已举报' : '正常'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setShowPostDetail(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="查看详情"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleTogglePostStatus(post)}
                              className={`${
                                post.isReported 
                                  ? 'text-green-600 hover:text-green-900' 
                                  : 'text-yellow-600 hover:text-yellow-900'
                              }`}
                              title={post.isReported ? '恢复正常' : '标记举报'}
                            >
                              {post.isReported ? <CheckIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post)}
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
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {startIndex + 1} 到 {Math.min(endIndex, filteredPosts.length)} 条，
                    共 {filteredPosts.length} 条记录
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
              )}
            </div>
          )}

          {/* 用户管理标签页 */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">用户管理</h3>
                <p className="text-sm text-gray-600">管理社区用户和处理违规行为</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        发帖统计
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
                    {users.filter(user => user.role === 'customer').map((user) => {
                      const userPosts = posts.filter(p => p.authorId === user.id);
                      const userComments = posts.reduce((sum, post) =>
                        sum + post.comments.filter(c => c.authorId === user.id).length, 0
                      );

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div>帖子: {userPosts.length}</div>
                              <div>评论: {userComments}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isBanned ? (
                              <div>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  已禁言
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  至 {new Date(user.banUntil).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                正常
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {user.isBanned ? (
                                <button
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="解除禁言"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleBanUser(user.id, 3)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="禁言3天"
                                  >
                                    3天
                                  </button>
                                  <button
                                    onClick={() => handleBanUser(user.id, 7)}
                                    className="text-orange-600 hover:text-orange-900"
                                    title="禁言7天"
                                  >
                                    7天
                                  </button>
                                  <button
                                    onClick={() => handleBanUser(user.id, 30)}
                                    className="text-red-600 hover:text-red-900"
                                    title="禁言30天"
                                  >
                                    30天
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 数据统计标签页 */}
          {activeTab === 'stats' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">数据统计</h3>
                <p className="text-sm text-gray-600">社区活跃度和内容统计</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 内容统计 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">内容统计</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">总帖子数</span>
                      <span className="text-sm font-medium">{stats.totalPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">总评论数</span>
                      <span className="text-sm font-medium">{stats.totalComments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">总浏览量</span>
                      <span className="text-sm font-medium">{stats.totalViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">举报帖子</span>
                      <span className="text-sm font-medium text-red-600">{stats.reportedPosts}</span>
                    </div>
                  </div>
                </div>

                {/* 用户统计 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">用户统计</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">活跃用户</span>
                      <span className="text-sm font-medium">{userStats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">被禁用户</span>
                      <span className="text-sm font-medium text-red-600">{userStats.bannedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">平均每用户发帖</span>
                      <span className="text-sm font-medium">
                        {userStats.activeUsers > 0 ? (stats.totalPosts / userStats.activeUsers).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 热门用户 */}
                <div className="bg-gray-50 p-6 rounded-lg lg:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-4">发帖排行榜</h4>
                  <div className="space-y-3">
                    {userStats.topPosters.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-gray-900 ml-3">{user.name}</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {user.postCount} 篇帖子
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 分类统计 */}
                <div className="bg-gray-50 p-6 rounded-lg lg:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-4">分类统计</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(categories).map(([key, value]) => {
                      const categoryPosts = posts.filter(p => p.category === key);
                      return (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {categoryPosts.length}
                          </div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 帖子详情模态框 */}
      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">帖子详情</h2>
              <button
                onClick={() => setShowPostDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 帖子信息 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPost.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>作者: {selectedPost.authorName}</span>
                      <span>分类: {categories[selectedPost.category]}</span>
                      <span>发布时间: {new Date(selectedPost.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTogglePostStatus(selectedPost)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedPost.isReported
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {selectedPost.isReported ? '恢复正常' : '标记举报'}
                    </button>
                    <button
                      onClick={() => {
                        handleDeletePost(selectedPost);
                        setShowPostDetail(false);
                      }}
                      className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                    >
                      删除帖子
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                  <span>浏览: {selectedPost.views}</span>
                  <span>点赞: {selectedPost.likes}</span>
                  <span>评论: {selectedPost.comments.length}</span>
                </div>
              </div>

              {/* 评论列表 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  评论 ({selectedPost.comments.length})
                </h4>

                {selectedPost.comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无评论</p>
                ) : (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{comment.authorName}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                            className="text-red-600 hover:text-red-800 ml-4"
                            title="删除评论"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumManagement;
