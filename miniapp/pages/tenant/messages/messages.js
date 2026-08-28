// pages/tenant/messages/messages.js - 租客消息列表页
const app = getApp();
const { getConversations, getUnreadCount } = require('../../../utils/api.js');

Page({
  data: {
    conversationList: [],
    loading: false,
    unreadTotal: 0,
    ws: null
  },

  onLoad() {
    this.checkAuth();
    this.loadConversations();
    // WebSocket由app.js统一管理
    const app = getApp();
    this._messageListener = (message) => {
      console.log('租客消息列表收到消息:', message);
      if (message === 'NEW_MESSAGE') {
        this.loadConversations();
        this.loadUnreadCount();
      }
    };
    app.addMessageListener(this._messageListener);
  },

  onShow() {
    this.loadConversations();
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
    this.loadConversations();
    this.loadUnreadCount();
    wx.stopPullDownRefresh();
  },

  checkAuth() {
    if (!app.globalData.isLogin) {
      wx.reLaunch({ url: '/pages/welcome/welcome' });
      return;
    }
    if (app.globalData.userRole !== 'tenant') {
      wx.reLaunch({ url: '/pages/landlord/index/index' });
    }
  },

  loadConversations() {
    this.setData({ loading: true });
    
    getConversations().then(res => {
      console.log('获取会话列表:', res);
      
      if (res.code === 200 && res.data) {
        const conversations = res.data.map(conv => ({
          ...conv,
          lastTimeFormatted: this.formatTime(conv.lastTime)
        }));
        
        this.setData({ 
          conversationList: conversations,
          loading: false 
        });
      } else {
        this.setData({ 
          conversationList: [],
          loading: false 
        });
      }
    }).catch(err => {
      console.error('获取会话列表失败:', err);
      this.setData({ 
        conversationList: [],
        loading: false 
      });
    });
  },

  loadUnreadCount() {
    getUnreadCount().then(res => {
      if (res.code === 200 && res.data) {
        const count = res.data.count || 0;
        this.setData({ unreadTotal: count });
        
        if (count > 0) {
          wx.setTabBarBadge({
            index: 1,
            text: count > 99 ? '99+' : String(count)
          });
        } else {
          wx.removeTabBarBadge({ index: 1 });
        }
      }
    }).catch(() => {
      console.error('获取未读数失败');
    });
  },

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

  openChat(e) {
    const { conversationId, houseId, houseTitle, tenantId, landlordId, peerName } = e.currentTarget.dataset;
    
    const userInfo = app.globalData.userInfo || {};
    const currentUserId = userInfo.userId || userInfo.id || '';
    
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${tenantId || currentUserId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle || '')}&conversationId=${conversationId}`
    });
  },

  deleteConversation(e) {
    const { conversationId, tenantId, landlordId, houseId } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: '确定删除该会话吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用删除会话的API
          const { deleteMessages } = require('../../../utils/api.js');
          deleteMessages(tenantId, landlordId, houseId).then(res => {
            if (res && res.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadConversations();
              this.loadUnreadCount();
            } else {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }).catch(err => {
            console.error('删除会话失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  goHome() {
    wx.switchTab({
      url: '/pages/tenant/index/index'
    });
  }
});
