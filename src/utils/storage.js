// 本地存储工具函数
export const storage = {
  // 获取数据
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  },

  // 设置数据
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // 触发存储事件，用于数据同步
      window.dispatchEvent(new CustomEvent('storageUpdate', {
        detail: { key, value }
      }));
      return true;
    } catch (error) {
      console.error('Error setting data to localStorage:', error);
      // 如果存储空间不足，尝试清理旧数据
      if (error.name === 'QuotaExceededError') {
        storage.cleanup();
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError);
          return false;
        }
      }
      return false;
    }
  },

  // 删除数据
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent('storageUpdate', {
        detail: { key, value: null }
      }));
      return true;
    } catch (error) {
      console.error('Error removing data from localStorage:', error);
      return false;
    }
  },

  // 清空所有数据
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // 清理旧数据
  cleanup: () => {
    try {
      const keys = Object.keys(localStorage);
      const dataKeys = keys.filter(key =>
        !['currentUser', 'users'].includes(key)
      );

      // 按时间戳排序，删除最旧的数据
      dataKeys.sort().slice(0, Math.floor(dataKeys.length / 2)).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return false;
    }
  },

  // 获取存储使用情况
  getUsage: () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      return {
        used: total,
        available: 5 * 1024 * 1024 - total, // 假设5MB限制
        percentage: (total / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  },

  // 备份数据
  backup: () => {
    try {
      const backup = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          backup[key] = localStorage[key];
        }
      }
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  },

  // 恢复数据
  restore: (backupData) => {
    try {
      const data = JSON.parse(backupData);
      for (let key in data) {
        localStorage.setItem(key, data[key]);
      }
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
};

// 数据管理器
export class DataManager {
  constructor() {
    this.initializeData();
  }

  // 初始化数据
  initializeData() {
    // 如果本地没有数据，则使用模拟数据初始化
    if (!storage.get('activities')) {
      this.initActivities();
    }
    if (!storage.get('users')) {
      this.initUsers();
    }
    if (!storage.get('orders')) {
      this.initOrders();
    }
    if (!storage.get('forumPosts')) {
      this.initForumPosts();
    }
    if (!storage.get('membershipPlans')) {
      this.initMembershipPlans();
    }
  }

  // 重置所有数据（开发用）
  resetAllData() {
    storage.clear();
    this.initializeData();
    console.log('所有数据已重置');
  }

  initActivities() {
    const activities = [
      {
        id: 1,
        title: "路亚钓鱼体验",
        description: "专业教练指导，体验路亚钓鱼的乐趣",
        category: "lure_fishing",
        price: 288,
        memberPrice: 228,
        duration: "3小时",
        maxParticipants: 8,
        location: "东湖钓鱼基地",
        image: "/api/placeholder/400/300",
        features: ["专业教练", "装备提供", "鱼获保证"],
        schedule: [
          { date: "2024-08-05", time: "08:00-11:00", available: 6 },
          { date: "2024-08-05", time: "14:00-17:00", available: 3 },
          { date: "2024-08-06", time: "08:00-11:00", available: 8 },
        ]
      },
      {
        id: 2,
        title: "森林瑜伽静修",
        description: "在大自然中放松身心，体验瑜伽的宁静",
        category: "forest_yoga",
        price: 168,
        memberPrice: 128,
        duration: "2小时",
        maxParticipants: 12,
        location: "青山森林公园",
        image: "/api/placeholder/400/300",
        features: ["专业瑜伽师", "瑜伽垫提供", "茶歇服务"],
        schedule: [
          { date: "2024-08-05", time: "07:00-09:00", available: 8 },
          { date: "2024-08-05", time: "17:00-19:00", available: 12 },
          { date: "2024-08-06", time: "07:00-09:00", available: 5 },
        ]
      },
      {
        id: 3,
        title: "亲子钓鱼套餐",
        description: "两大一小家庭套餐，享受亲子时光",
        category: "family_fishing",
        price: 388,
        memberPrice: 328,
        duration: "6小时",
        maxParticipants: 3,
        location: "湖心岛钓鱼场",
        image: "/api/placeholder/400/300",
        features: ["家庭套餐", "儿童装备", "午餐包含", "摄影服务"],
        schedule: [
          { date: "2024-08-05", time: "09:00-15:00", available: 2 },
          { date: "2024-08-06", time: "09:00-15:00", available: 4 },
          { date: "2024-08-07", time: "09:00-15:00", available: 3 },
        ]
      }
    ];
    storage.set('activities', activities);
  }

  initUsers() {
    const users = [
      {
        id: 1,
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "系统管理员",
        email: "admin@fishing.com",
        phone: "13800138000"
      },
      {
        id: 2,
        username: "staff001",
        password: "staff123",
        role: "staff",
        name: "张小明",
        email: "zhang@fishing.com",
        phone: "13800138001"
      },
      {
        id: 3,
        username: "customer001",
        password: "customer123",
        role: "customer",
        name: "李大华",
        email: "li@example.com",
        phone: "13800138002",
        isMember: true,
        membershipExpiry: "2024-09-05"
      },
      {
        id: 4,
        username: "customer002",
        password: "customer123",
        role: "customer",
        name: "王小红",
        email: "wang@example.com",
        phone: "13800138003",
        isMember: false,
        membershipExpiry: null
      }
    ];
    storage.set('users', users);
  }

  initOrders() {
    const orders = [
      {
        id: "ORD001",
        customerId: 3,
        customerName: "李大华",
        customerPhone: "13800138001",
        activityId: 1,
        activityTitle: "路亚钓鱼体验",
        activityDate: "2024-08-05",
        date: "2024-08-05",
        time: "08:00-11:00",
        participants: 1,
        unitPrice: 228,
        originalPrice: 288,
        finalPrice: 228,
        totalAmount: 228,
        isMemberPrice: true,
        status: "confirmed",
        paymentStatus: "paid",
        qrCode: "QR_ORD001_2024",
        isUsed: false,
        specialRequests: "希望安排靠近湖边的位置",
        createdAt: "2024-08-01T10:30:00Z"
      },
      {
        id: "ORD002",
        customerId: 4,
        customerName: "王小红",
        customerPhone: "13900139002",
        activityId: 2,
        activityTitle: "森林瑜伽静修",
        activityDate: "2024-08-05",
        date: "2024-08-05",
        time: "17:00-19:00",
        participants: 1,
        unitPrice: 168,
        originalPrice: 168,
        finalPrice: 168,
        totalAmount: 168,
        isMemberPrice: false,
        status: "confirmed",
        paymentStatus: "paid",
        qrCode: "QR_ORD002_2024",
        isUsed: false,
        createdAt: "2024-08-02T14:20:00Z"
      },
      {
        id: "ORD003",
        customerId: 5,
        customerName: "张三",
        customerPhone: "13700137003",
        activityId: 3,
        activityTitle: "户外徒步探险",
        activityDate: "2024-08-06",
        date: "2024-08-06",
        time: "09:00-17:00",
        participants: 2,
        unitPrice: 199,
        originalPrice: 398,
        finalPrice: 398,
        totalAmount: 398,
        isMemberPrice: false,
        status: "pending",
        paymentStatus: "pending",
        qrCode: "QR_ORD003_2024",
        isUsed: false,
        specialRequests: "需要素食餐",
        createdAt: "2024-08-03T09:15:00Z"
      }
    ];
    storage.set('orders', orders);
  }

  initForumPosts() {
    const forumPosts = [
      {
        id: 1,
        title: '新手钓鱼技巧分享',
        content: '作为一个钓鱼新手，我想分享一些最近学到的技巧。首先是选择钓点很重要，要观察水面情况...',
        category: 'fishing',
        authorId: 2,
        authorName: '张三',
        views: 156,
        likes: 23,
        isReported: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
          {
            id: 1,
            content: '很实用的技巧，谢谢分享！',
            authorId: 3,
            authorName: '李四',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 2,
        title: '路亚装备推荐',
        content: '最近入手了一些新的路亚装备，效果不错，推荐给大家...',
        category: 'equipment',
        authorId: 3,
        authorName: '李四',
        views: 89,
        likes: 15,
        isReported: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        comments: []
      }
    ];
    storage.set('forumPosts', forumPosts);
  }

  initMembershipPlans() {
    const membershipPlans = [
      {
        id: 1,
        name: "月度会员",
        price: 68,
        duration: 30,
        benefits: [
          "所有活动享受会员价",
          "优先预订权",
          "专属客服",
          "生日特惠"
        ]
      }
    ];
    storage.set('membershipPlans', membershipPlans);
  }

  // 获取活动列表
  getActivities() {
    return storage.get('activities') || [];
  }

  // 获取单个活动
  getActivity(id) {
    const activities = this.getActivities();
    return activities.find(activity => activity.id === parseInt(id));
  }

  // 创建活动
  createActivity(activityData) {
    const activities = this.getActivities();
    const newActivity = {
      id: Math.max(...activities.map(a => a.id), 0) + 1,
      createdAt: new Date().toISOString(),
      status: 'active',
      ...activityData
    };
    activities.push(newActivity);
    storage.set('activities', activities);
    return newActivity;
  }

  // 更新活动
  updateActivity(id, data) {
    const activities = this.getActivities();
    const index = activities.findIndex(activity => activity.id === parseInt(id));
    if (index !== -1) {
      activities[index] = { ...activities[index], ...data };
      storage.set('activities', activities);
      return activities[index];
    }
    return null;
  }

  // 删除活动
  deleteActivity(id) {
    const activities = this.getActivities();
    const filteredActivities = activities.filter(activity => activity.id !== parseInt(id));
    storage.set('activities', filteredActivities);
    return true;
  }

  // 获取用户列表
  getUsers() {
    return storage.get('users') || [];
  }

  // 获取单个用户
  getUser(id) {
    const users = this.getUsers();
    return users.find(user => user.id === parseInt(id));
  }

  // 通过用户名获取用户
  getUserByUsername(username) {
    const users = this.getUsers();
    return users.find(user => user.username === username);
  }

  // 创建用户
  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData
    };
    users.push(newUser);
    storage.set('users', users);
    return newUser;
  }

  // 获取订单列表
  getOrders() {
    return storage.get('orders') || [];
  }

  // 创建订单
  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      qrCode: `QR_ORD${String(orders.length + 1).padStart(3, '0')}_2024`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      isUsed: false,
      ...orderData
    };
    orders.push(newOrder);
    storage.set('orders', orders);
    return newOrder;
  }

  // 获取单个订单
  getOrder(id) {
    const orders = this.getOrders();
    return orders.find(order => order.id === id);
  }

  // 更新订单
  updateOrder(id, data) {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...data };
      storage.set('orders', orders);
      return orders[index];
    }
    return null;
  }

  // 删除订单
  deleteOrder(id) {
    const orders = this.getOrders();
    const filteredOrders = orders.filter(order => order.id !== id);
    storage.set('orders', filteredOrders);
    return true;
  }

  // 核销订单
  useOrder(orderId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order && !order.isUsed) {
      order.isUsed = true;
      order.usedAt = new Date().toISOString();
      storage.set('orders', orders);
      return order;
    }
    return null;
  }

  // 获取论坛帖子
  getForumPosts() {
    return storage.get('forumPosts') || [];
  }

  // 创建论坛帖子
  createForumPost(postData) {
    const posts = this.getForumPosts();
    const newPost = {
      id: Math.max(...posts.map(p => p.id), 0) + 1,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isReported: false,
      ...postData
    };
    posts.push(newPost);
    storage.set('forumPosts', posts);
    return newPost;
  }

  // 更新论坛帖子
  updateForumPost(id, data) {
    const posts = this.getForumPosts();
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index !== -1) {
      posts[index] = { ...posts[index], ...data };
      storage.set('forumPosts', posts);
      return posts[index];
    }
    return null;
  }

  // 获取单个论坛帖子
  getForumPost(id) {
    const posts = this.getForumPosts();
    return posts.find(post => post.id === parseInt(id));
  }

  // 删除论坛帖子
  deleteForumPost(id) {
    const posts = this.getForumPosts();
    const filteredPosts = posts.filter(post => post.id !== parseInt(id));
    storage.set('forumPosts', filteredPosts);
    return true;
  }

  // 删除论坛评论
  deleteForumComment(postId, commentId) {
    const posts = this.getForumPosts();
    const postIndex = posts.findIndex(post => post.id === parseInt(postId));
    if (postIndex !== -1) {
      posts[postIndex].comments = posts[postIndex].comments.filter(
        comment => comment.id !== parseInt(commentId)
      );
      storage.set('forumPosts', posts);
      return true;
    }
    return false;
  }

  // 获取客户问题记录
  getCustomerIssues() {
    return storage.get('customerIssues') || [];
  }

  // 创建客户问题记录
  createCustomerIssue(issueData) {
    const issues = this.getCustomerIssues();
    const newIssue = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'open',
      ...issueData
    };
    issues.push(newIssue);
    storage.set('customerIssues', issues);
    return newIssue;
  }

  // 获取员工班次记录
  getStaffShifts() {
    return storage.get('staffShifts') || [];
  }

  // 获取员工休息记录
  getStaffBreaks() {
    return storage.get('staffBreaks') || [];
  }

  // 获取会员计划
  getMembershipPlans() {
    return storage.get('membershipPlans') || [
      {
        id: 1,
        name: '基础会员',
        level: 'basic',
        price: 99,
        duration: 1,
        description: '享受基础会员权益',
        benefits: [
          '所有活动9折优惠',
          '优先预订权',
          '会员专属客服',
          '生日特别优惠'
        ],
        isPopular: false
      },
      {
        id: 2,
        name: '黄金会员',
        level: 'gold',
        price: 299,
        duration: 3,
        description: '最受欢迎的会员计划',
        benefits: [
          '所有活动8折优惠',
          '优先预订权',
          '会员专属客服',
          '生日特别优惠',
          '免费活动装备租借',
          '会员专属活动'
        ],
        isPopular: true
      },
      {
        id: 3,
        name: '钻石会员',
        level: 'diamond',
        price: 999,
        duration: 12,
        description: '尊享顶级会员体验',
        benefits: [
          '所有活动7折优惠',
          '优先预订权',
          '会员专属客服',
          '生日特别优惠',
          '免费活动装备租借',
          '会员专属活动',
          '私人定制活动',
          '专属活动教练',
          '年度免费体检'
        ],
        isPopular: false
      }
    ];
  }

  // 获取支付记录
  getPayments() {
    return storage.get('payments') || [];
  }

  // 保存支付记录
  savePayments(payments) {
    storage.set('payments', payments);
  }

  // 创建支付记录
  createPayment(paymentData) {
    const payments = this.getPayments();
    const payment = {
      id: paymentData.id || `pay_${Date.now()}`,
      orderId: paymentData.orderId,
      customerId: paymentData.customerId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: paymentData.status || 'completed',
      transactionId: paymentData.transactionId,
      createdAt: paymentData.createdAt || new Date().toISOString(),
      completedAt: paymentData.completedAt,
      description: paymentData.description
    };

    payments.push(payment);
    this.savePayments(payments);
    return payment;
  }

  // 获取用户支付记录
  getUserPayments(userId) {
    const payments = this.getPayments();
    return payments.filter(payment => payment.customerId === userId);
  }

  // 更新支付状态
  updatePaymentStatus(paymentId, status) {
    const payments = this.getPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);

    if (paymentIndex !== -1) {
      payments[paymentIndex].status = status;
      if (status === 'completed') {
        payments[paymentIndex].completedAt = new Date().toISOString();
      }
      this.savePayments(payments);
      return payments[paymentIndex];
    }
    return null;
  }

  // 获取支付统计
  getPaymentStats(userId = null) {
    const payments = userId ? this.getUserPayments(userId) : this.getPayments();
    const completedPayments = payments.filter(p => p.status === 'completed');

    return {
      totalPayments: payments.length,
      completedPayments: completedPayments.length,
      totalAmount: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      averageAmount: completedPayments.length > 0
        ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length
        : 0
    };
  }
}

export const dataManager = new DataManager();
