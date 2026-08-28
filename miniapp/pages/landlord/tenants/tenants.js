// pages/landlord/tenants/tenants.js
const { getLandlordOrderList, getConversations } = require('../../../utils/api.js');

Page({
  data: { 
    list: [], 
    loading: false,
    ws: null,
    unreadTotal: 0
  },

  onLoad() { 
    this.checkAuth(); 
    this.loadTenants();
    // WebSocket由app.js统一管理
    const app = getApp();
    this._messageListener = (message) => {
      console.log('房东租客管理收到消息:', message);
      if (message === 'NEW_MESSAGE') {
        this.loadTenants();
        this.loadUnreadCount();
      }
    };
    app.addMessageListener(this._messageListener);
  },
  
  onShow() { 
    this.loadTenants();
    this.loadUnreadCount();
  },
  
  onUnload() {
    // 移除消息监听器
    const app = getApp();
    if (this._messageListener) {
      app.removeMessageListener(this._messageListener);
    }
  },

  onPullDownRefresh() { 
    this.loadTenants(); 
    this.loadUnreadCount();
    wx.stopPullDownRefresh(); 
  },

  checkAuth() {
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
        console.log('checkAuth - 从storage恢复登录状态');
      } else {
        wx.reLaunch({ url: '/pages/welcome/welcome' });
        return;
      }
    }
    
    if (app.globalData.userRole !== 'landlord') { 
      wx.reLaunch({ url: '/pages/tenant/index/index' }); 
    }
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
        
        if (unreadTotal > 0) {
          try {
            wx.setTabBarBadge({
              index: 1,
              text: unreadTotal > 99 ? '99+' : String(unreadTotal)
            });
          } catch (e) {
            console.error('设置角标失败:', e);
          }
        } else {
          try {
            wx.removeTabBarBadge({ index: 1 });
          } catch (e) {
            console.error('移除角标失败:', e);
          }
        }
      }
    }).catch(() => {
      console.error('加载未读数失败');
    });
  },

  loadTenants() {
    this.setData({ loading: true });
    
    // 先加载会话列表（消息）
    this.loadConversationsAsTenants();
  },

  loadConversationsAsTenants() {
    getConversations().then(res => {
      console.log('房东端获取会话列表:', res);
      // 使用Map存储会话，键为 conversationId，这样可以区分同一租客的不同房源
      const conversationMap = new Map();
      
      if (res.code === 200 && res.data) {
        const conversations = res.data;
        console.log('房东端会话数量:', conversations.length);
        console.log('房东端会话详情:', conversations);
        
        conversations.forEach(conv => {
          console.log('处理会话:', conv.conversationId, '租客:', conv.peerName, '房源:', conv.houseTitle);
          // 使用 conversationId 作为键，确保每个房源的会话都独立显示
          const key = conv.conversationId || `${conv.tenantId}_${conv.houseId}`;
          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              id: key,
              tenantId: conv.tenantId,
              name: conv.peerName || '租客',
              phone: '',
              avatar: conv.peerAvatar || '/assets/images/default-avatar.png',
              houseTitle: conv.houseTitle || '咨询房源',
              houseId: conv.houseId,
              rentStatus: '咨询中',
              rentStatusColor: '#4A90E2',
              contractStart: '-',
              contractEnd: '-',
              lastMsg: conv.lastMsg || '',
              unreadCount: conv.unreadCount || 0,
              lastTime: conv.lastTime || '',
              lastTimeFormatted: this.formatTime(conv.lastTime),
              hasNewMessage: conv.unreadCount > 0,
              conversationId: conv.conversationId
            });
          } else {
            console.log('会话已存在，跳过:', key);
          }
        });
      }
      
      // 只使用消息会话，不加载订单记录
      const tenantList = Array.from(conversationMap.values());
      
      // 格式化时间并排序
      tenantList.forEach(tenant => {
        if (!tenant.lastTimeFormatted) {
          tenant.lastTimeFormatted = this.formatTime(tenant.lastTime);
        }
      });
      
      // 按最后消息时间排序（有未读消息的排在前面）
      tenantList.sort((a, b) => {
        // 有未读消息的优先
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        // 然后按时间排序
        if (!a.lastTime) return 1;
        if (!b.lastTime) return -1;
        return new Date(b.lastTime) - new Date(a.lastTime);
      });
      
      this.setData({ list: tenantList, loading: false });
    }).catch(() => {
      // 如果获取会话失败，显示空列表
      this.setData({ list: [], loading: false });
    });
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    }
    // 小于24小时
    if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    }
    // 小于7天
    if (diff < 604800000) {
      return Math.floor(diff / 86400000) + '天前';
    }
    
    // 超过7天显示日期
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  },



  viewOrders(e) {
    const { tenantId, houseId } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/landlord/orders/orders?tenantId=${tenantId}&houseId=${houseId}` });
  },

  contactTenant(e) {
    const { tenantId, houseId, houseTitle } = e.currentTarget.dataset;
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const landlordId = userInfo.hostId || userInfo.userId || userInfo.id;
    const conversationId = `conv_${tenantId}_${landlordId}_${houseId}`;
    
    console.log('contactTenant - landlordId:', landlordId, 'tenantId:', tenantId, 'houseId:', houseId);
    
    // 标记该租客的消息为已读
    const { markMessagesAsRead } = require('../../../utils/api.js');
    markMessagesAsRead(tenantId, tenantId, landlordId, houseId).then(res => {
      if (res && res.code === 200) {
        console.log('标记已读成功');
        // 刷新当前页面的租客列表
        this.loadTenants();
      }
    }).catch(err => {
      console.error('标记已读失败:', err);
    });
    
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${tenantId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle || '')}&conversationId=${conversationId}`
    });
  },

  deleteTenantMessage(e) {
    const { tenantId, houseId } = e.currentTarget.dataset;
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const landlordId = userInfo.hostId || userInfo.userId || userInfo.id;
    
    console.log('deleteTenantMessage - 开始删除操作');
    console.log('deleteTenantMessage - landlordId:', landlordId);
    console.log('deleteTenantMessage - tenantId:', tenantId);
    console.log('deleteTenantMessage - houseId:', houseId);
    console.log('deleteTenantMessage - userInfo:', userInfo);
    
    if (!landlordId) {
      console.error('删除消息失败: 无法获取房东ID');
      wx.showToast({ title: '删除失败：无法获取房东信息', icon: 'none' });
      return;
    }
    
    if (!tenantId) {
      console.error('删除消息失败: 无法获取租户ID');
      wx.showToast({ title: '删除失败：无法获取租户信息', icon: 'none' });
      return;
    }
    
    if (!houseId) {
      console.error('删除消息失败: 无法获取房源ID');
      wx.showToast({ title: '删除失败：无法获取房源信息', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条消息记录吗？删除后不可恢复。',
      success: (res) => {
        if (res.confirm) {
          console.log('deleteTenantMessage - 用户确认删除');
          const { deleteMessages } = require('../../../utils/api.js');
          console.log('deleteTenantMessage - 调用deleteMessages API');
          deleteMessages(tenantId, landlordId, houseId).then(res => {
            console.log('deleteTenantMessage - API返回结果:', res);
            if (res && res.code === 200) {
              console.log('deleteTenantMessage - 删除成功');
              wx.showToast({ title: '删除成功', icon: 'success' });
              // 刷新当前页面的租客列表
              this.loadTenants();
            } else {
              console.log('deleteTenantMessage - 删除失败，API返回:', res);
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }).catch(err => {
            console.error('删除消息失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  }
});
