import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataManager, storage } from '../../utils/storage';
import { 
  PlusIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const CustomerForum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const forumPosts = dataManager.getForumPosts();
    // 按创建时间倒序排列
    const sortedPosts = forumPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPosts(sortedPosts);
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const postData = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      authorId: user.id,
      authorName: user.name,
      views: 0
    };

    dataManager.createForumPost(postData);
    loadPosts();
    setShowCreateModal(false);
    setNewPost({ title: '', content: '', category: 'general' });
  };

  const handleLikePost = (postId) => {
    const forumPosts = dataManager.getForumPosts();
    const postIndex = forumPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) return;

    const post = forumPosts[postIndex];
    const userLikes = storage.get('userLikes') || {};
    const userPostLikes = userLikes[user.id] || [];

    if (userPostLikes.includes(postId)) {
      // 取消点赞
      post.likes = Math.max(0, post.likes - 1);
      userLikes[user.id] = userPostLikes.filter(id => id !== postId);
    } else {
      // 点赞
      post.likes += 1;
      userLikes[user.id] = [...userPostLikes, postId];
    }

    storage.set('forumPosts', forumPosts);
    storage.set('userLikes', userLikes);

    // 更新本地状态，避免重新加载所有数据
    const updatedPosts = posts.map(p =>
      p.id === postId ? { ...p, likes: post.likes } : p
    );
    setPosts(updatedPosts);

    // 如果在详情页面，更新选中的帖子
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: post.likes });
    }
  };

  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;

    const forumPosts = dataManager.getForumPosts();
    const postIndex = forumPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) return;

    const comment = {
      id: Date.now(),
      content: newComment,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString()
    };

    forumPosts[postIndex].comments.push(comment);
    storage.set('forumPosts', forumPosts);

    setNewComment('');

    // 更新本地状态，避免重新加载所有数据
    const updatedPosts = posts.map(post =>
      post.id === postId ? forumPosts[postIndex] : post
    );
    setPosts(updatedPosts);

    // 如果在详情页面，更新选中的帖子
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(forumPosts[postIndex]);
    }
  };

  const handleViewPost = (post) => {
    // 增加浏览量
    const forumPosts = dataManager.getForumPosts();
    const postIndex = forumPosts.findIndex(p => p.id === post.id);
    
    if (postIndex !== -1) {
      forumPosts[postIndex].views += 1;
      storage.set('forumPosts', forumPosts);
    }

    setSelectedPost({ ...post, views: post.views + 1 });
    setShowPostDetail(true);
  };

  const isPostLiked = (postId) => {
    const userLikes = storage.get('userLikes') || {};
    const userPostLikes = userLikes[user.id] || [];
    return userPostLikes.includes(postId);
  };

  const getCategoryName = (category) => {
    const categories = {
      general: '综合讨论',
      fishing: '钓鱼技巧',
      equipment: '装备交流',
      location: '地点推荐',
      experience: '经验分享'
    };
    return categories[category] || category;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">发布新帖</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              className="input-field"
            >
              <option value="general">综合讨论</option>
              <option value="fishing">钓鱼技巧</option>
              <option value="equipment">装备交流</option>
              <option value="location">地点推荐</option>
              <option value="experience">经验分享</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              placeholder="请输入帖子标题..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              placeholder="分享您的想法和经验..."
              className="input-field h-32 resize-none"
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleCreatePost}
            className="flex-1 btn-primary"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  );

  const PostDetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded mb-2">
              {getCategoryName(selectedPost?.category)}
            </span>
            <h2 className="text-xl font-bold">{selectedPost?.title}</h2>
          </div>
          <button
            onClick={() => setShowPostDetail(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <UserIcon className="h-4 w-4 mr-1" />
          <span className="mr-4">{selectedPost?.authorName}</span>
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="mr-4">{formatTimeAgo(selectedPost?.createdAt)}</span>
          <EyeIcon className="h-4 w-4 mr-1" />
          <span>{selectedPost?.views} 浏览</span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{selectedPost?.content}</p>
        </div>

        <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
          <button
            onClick={() => handleLikePost(selectedPost?.id)}
            className={`flex items-center space-x-1 ${
              isPostLiked(selectedPost?.id) ? 'text-red-600' : 'text-gray-600'
            } hover:text-red-600`}
          >
            {isPostLiked(selectedPost?.id) ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{selectedPost?.likes}</span>
          </button>
          <div className="flex items-center space-x-1 text-gray-600">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{selectedPost?.comments?.length || 0}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">评论 ({selectedPost?.comments?.length || 0})</h3>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下您的评论..."
              className="input-field flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost?.id)}
            />
            <button
              onClick={() => handleAddComment(selectedPost?.id)}
              className="btn-primary"
            >
              评论
            </button>
          </div>

          <div className="space-y-3">
            {selectedPost?.comments?.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span className="mr-4">{comment.authorName}</span>
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-gray-800">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">社区论坛</h1>
            <p className="text-gray-600 mt-2">分享经验，交流心得</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            发布新帖
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded mr-3">
                    {getCategoryName(post.category)}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.authorName}</span>
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2 cursor-pointer hover:text-primary-600"
                  onClick={() => handleViewPost(post)}
                >
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-1 ${
                      isPostLiked(post.id) ? 'text-red-600' : 'text-gray-600'
                    } hover:text-red-600`}
                  >
                    {isPostLiked(post.id) ? (
                      <HeartSolidIcon className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                    <span>{post.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <PencilIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有帖子</h3>
            <p className="text-gray-600 mb-4">成为第一个分享经验的人吧！</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              发布第一篇帖子
            </button>
          </div>
        )}
      </div>

      {showCreateModal && <CreatePostModal />}
      {showPostDetail && <PostDetailModal />}
    </div>
  );
};

export default CustomerForum;
