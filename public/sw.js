const CACHE_NAME = 'fishing-platform-v1';
const STATIC_CACHE = 'fishing-static-v1';
const DYNAMIC_CACHE = 'fishing-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // 添加其他静态资源
];

// 需要缓存的API路径模式
const CACHE_PATTERNS = [
  /^https:\/\/api\.fishing-platform\.com\//,
  /^https:\/\/cdn\./,
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 处理导航请求（页面请求）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 如果网络请求成功，返回响应
          return response;
        })
        .catch(() => {
          // 如果网络请求失败，返回缓存的index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 处理静态资源请求
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request);
        })
    );
    return;
  }

  // 处理API请求和其他动态内容
  if (CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // 如果请求成功，缓存响应
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // 如果网络请求失败，尝试从缓存获取
              return cache.match(request);
            });
        })
    );
    return;
  }

  // 对于其他请求，使用网络优先策略
  event.respondWith(
    fetch(request)
      .catch(() => {
        // 如果网络请求失败，尝试从缓存获取
        return caches.match(request);
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 执行后台同步任务
      syncData()
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('钓鱼平台', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    // 打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 数据同步函数
async function syncData() {
  try {
    // 这里可以实现数据同步逻辑
    console.log('Service Worker: Syncing data...');
    
    // 示例：同步离线时的操作
    const offlineActions = await getOfflineActions();
    for (const action of offlineActions) {
      await processOfflineAction(action);
    }
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Data sync failed', error);
  }
}

// 获取离线操作
async function getOfflineActions() {
  // 从IndexedDB或localStorage获取离线操作
  return [];
}

// 处理离线操作
async function processOfflineAction(action) {
  // 处理单个离线操作
  console.log('Processing offline action:', action);
}

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});
