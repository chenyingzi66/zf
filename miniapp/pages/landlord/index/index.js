// pages/landlord/index/index.js
const app = getApp();
const { getLandlordStats, getLandlordPendingOrders, getUnreadCount, getConversations } = require('../../../utils/api.js');

Page({
  data: {
    landlordInfo: {
      name: '房东',
      avatar: '',
      hostId: ''
    },
    stats: { 
      totalHouses: 0, 
      rentedHouses: 0, 
      pendingOrders: 0, 
      monthIncome: 0 
    },
    pendingOrders: [],
    loading: false,
    ws: null,
    unreadTotal: 0
  },

  onLoad(options) {
    console.log('房东首页 onLoad, options:', options);
    this.initPage();
    // WebSocket由app.js统一管理
    const app = getApp();
    this._messageListener = (message) => {
      console.log('房东首页收到消息:', message);
      if (message === 'NEW_MESSAGE') {
        this.loadData();
        this.loadUnreadCount();
      }
    };
    app.addMessageListener(this._messageListener);
  },

  onShow() {
    console.log('房东首页 onShow');
    this.loadUnreadCount();
  },

  onUnload() {
    // 移除消息监听器
    const app = getApp();
    if (this._messageListener) {
      app.removeMessageListener(this._messageListener);
    }
  },

  initPage() {
    const app = getApp();
    
    // 如果globalData中没有登录信息，尝试从storage恢复
    if (!app.globalData.isLogin) {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      const userRole = wx.getStorageSync('userRole');
      
      if (token && userInfo) {
        app.globalData.token = token;
        app.globalData.userInfo = userInfo;
        app.globalData.userRole = userRole || 'landlord';
        app.globalData.isLogin = true;
        console.log('initPage - 从storage恢复登录状态');
      }
    }
    
    const token = app.globalData.token;
    const userInfo = app.globalData.userInfo;
    const userRole = app.globalData.userRole;
    
    console.log('token:', token ? '有' : '无');
    console.log('userInfo:', userInfo);
    console.log('userRole:', userRole);
    
    if (!token || !userInfo) {
      console.log('未登录，跳转到登录页');
      wx.redirectTo({ url: '/pages/landlord/login/login' });
      return;
    }
    
    this.setData({ 
      landlordInfo: {
        name: userInfo.name || userInfo.hostId || '房东',
        avatar: userInfo.avatar || '',
        hostId: userInfo.hostId || ''
      }
    });
    
    this.loadData();
    this.loadUnreadCount();
  },

  loadUnreadCount() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const userId = userInfo.hostId || userInfo.userId || userInfo.id || '';
    
    if (!userId) {
      console.log('loadUnreadCount - 无法获取userId');
      return;
    }

    getConversations().then(res => {
      if (res.code === 200 && res.data) {
        const conversations = res.data;
        const unreadTotal = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        this.setData({ unreadTotal });
      }
    }).catch((err) => {
      console.error('加载未读数失败:', err);
    });
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  },

  loadData() {
    this.setData({ loading: true });

    Promise.all([
      getLandlordStats().catch(() => ({ code: 200, data: {} })),
      getLandlordPendingOrders().catch(() => ({ code: 200, data: [] })),
      getUnreadCount().catch(() => ({ code: 200, data: { count: 0 } }))
    ]).then(([statsRes, ordersRes, msgRes]) => {
      const statsData = (statsRes && statsRes.code === 200 ? statsRes.data : {}) || {};
      const orders = (ordersRes && ordersRes.code === 200 ? ordersRes.data : []) || [];
      
      const stats = {
        totalHouses: statsData.totalHouses || 0,
        rentedHouses: statsData.rentedHouses || 0,
        pendingOrders: orders.length,
        monthIncome: statsData.monthIncome || 0
      };

      this.setData({ 
        stats, 
        pendingOrders: orders.slice(0, 5),
        loading: false 
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  goHouses() { wx.navigateTo({ url: '/pages/landlord/houses/houses' }); },
  goOrders() { wx.navigateTo({ url: '/pages/landlord/orders/orders' }); },
  goTenants() { wx.navigateTo({ url: '/pages/landlord/tenants/tenants' }); },
  goStats() { wx.navigateTo({ url: '/pages/landlord/stats/stats' }); },
  goProfile() { wx.navigateTo({ url: '/pages/landlord/profile/profile' }); },
  goPublish() { wx.navigateTo({ url: '/pages/landlord/publishHouse/publishHouse' }); },

  goOrderDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log('goOrderDetail called, id:', id, 'dataset:', e.currentTarget.dataset);
    if (!id) {
      wx.showToast({ title: '订单数据异常', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/landlord/order-detail/order-detail?id=${id}` });
  }
});
