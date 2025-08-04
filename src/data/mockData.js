// 模拟数据
export const activities = [
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

export const users = [
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

export const orders = [
  {
    id: "ORD001",
    customerId: 3,
    customerName: "李大华",
    activityId: 1,
    activityTitle: "路亚钓鱼体验",
    date: "2024-08-05",
    time: "08:00-11:00",
    participants: 1,
    originalPrice: 288,
    finalPrice: 228,
    isMemberPrice: true,
    status: "confirmed",
    qrCode: "QR_ORD001_2024",
    isUsed: false,
    createdAt: "2024-08-01T10:30:00Z"
  },
  {
    id: "ORD002",
    customerId: 4,
    customerName: "王小红",
    activityId: 2,
    activityTitle: "森林瑜伽静修",
    date: "2024-08-05",
    time: "17:00-19:00",
    participants: 1,
    originalPrice: 168,
    finalPrice: 168,
    isMemberPrice: false,
    status: "confirmed",
    qrCode: "QR_ORD002_2024",
    isUsed: false,
    createdAt: "2024-08-02T14:20:00Z"
  }
];

export const forumPosts = [
  {
    id: 1,
    authorId: 3,
    authorName: "李大华",
    title: "路亚钓鱼心得分享",
    content: "今天参加了路亚钓鱼活动，收获满满！教练很专业，学到了很多技巧...",
    category: "experience",
    likes: 15,
    comments: [
      {
        id: 1,
        authorId: 4,
        authorName: "王小红",
        content: "看起来很有趣，我也想试试！",
        createdAt: "2024-08-02T16:30:00Z"
      }
    ],
    createdAt: "2024-08-02T15:00:00Z",
    isReported: false
  },
  {
    id: 2,
    authorId: 4,
    authorName: "王小红",
    title: "森林瑜伽体验感受",
    content: "在大自然中做瑜伽真的很棒，空气清新，心情舒畅...",
    category: "experience",
    likes: 8,
    comments: [],
    createdAt: "2024-08-03T09:15:00Z",
    isReported: false
  }
];

export const membershipPlans = [
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
