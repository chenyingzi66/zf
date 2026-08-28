// pages/chat/chat.js - 在线沟通页（租客↔房东，消息严格绑定 tenantId+landlordId+houseId）
const app = getApp();
const { getMessageList, sendMessage, getConversations, getConversationHistory, getUnreadCount, markMessagesAsRead } = require('../../utils/api.js');

Page({
  data: {
    conversationId: '',
    tenantId: '',
    landlordId: '',
    houseId: '',
    houseTitle: '',
    messages: [],
    inputText: '',
    sending: false,
    currentUserId: '',
    currentUserAvatar: '',
    currentUserName: '',
    role: '',
    peerInfo: {},
    showConvList: false,
    convList: [],
    convLoading: false,
    messageStatus: {},
    loading: false,
    loadingMore: false,
    networkError: false,
    localMessages: {}
  },

  onLoad(options) {
    // 权限检查
    if (!app.globalData.isLogin) {
      wx.reLaunch({ url: '/pages/welcome/welcome' });
      return;
    }

    const userInfo = app.globalData.userInfo || {};
    const role = app.globalData.userRole || 'tenant';
    
    // 根据用户角色获取正确的ID
    let currentUserId = '';
    if (role === 'landlord') {
      currentUserId = userInfo.hostId || userInfo.userId || userInfo.id || '';
    } else {
      currentUserId = userInfo.userId || userInfo.id || '';
    }
    
    const currentUserAvatar = userInfo.avatar || userInfo.avatarUrl || '';
    const currentUserName = userInfo.nickname || userInfo.name || (role === 'tenant' ? '租客' : '房东');
    
    // 初始化本地存储
    this.initLocalStorage();

    // 从路由参数中解析会话信息
    const tenantId = options.tenantId || (role === 'tenant' ? currentUserId : '');
    const landlordId = options.landlordId || (role === 'landlord' ? currentUserId : '');
    const houseId = options.houseId || '';
    const houseTitle = options.houseTitle ? decodeURIComponent(options.houseTitle) : '';
    // conversationId 严格绑定 tenantId + landlordId + houseId，确保一对一精准对应
    const conversationId = options.conversationId ||
      (tenantId && landlordId && houseId ? `conv_${tenantId}_${landlordId}_${houseId}` : '');

    this.setData({
      tenantId,
      landlordId,
      houseId,
      houseTitle,
      conversationId,
      currentUserId,
      currentUserAvatar,
      currentUserName,
      role,
      // 若没有指定具体会话，则展示会话列表
      showConvList: !conversationId
    });

    if (conversationId) {
      wx.setNavigationBarTitle({
        title: houseTitle ? `咨询·${houseTitle}` : '在线沟通'
      });
      this.loadMessages();
    } else {
      wx.setNavigationBarTitle({ title: '消息' });
      this.loadConvList();
    }

    // 复用 app.js 的 WebSocket，注册消息监听器
    this.registerMessageListener();
  },

  onShow() {
    // 未读角标（当前页已读，清除，容错处理）
    try { wx.removeTabBarBadge({ index: 2 }); } catch (e) {}
    if (this.data.showConvList) {
      this.loadConvList();
    }
  },

  onUnload() {
    this.unregisterMessageListener();
    this.refreshUnreadCount();
  },

  registerMessageListener() {
    this._messageHandler = (data) => {
      if (data === 'NEW_MESSAGE') {
        if (this.data.showConvList) {
          this.loadConvList();
        } else {
          this.loadMessages();
        }
      }
    };
    app.addMessageListener(this._messageHandler);
  },

  unregisterMessageListener() {
    if (this._messageHandler) {
      app.removeMessageListener(this._messageHandler);
      this._messageHandler = null;
    }
  },

  // ==================== 会话列表 ====================

  loadConvList() {
    this.setData({ convLoading: true });
    getConversations().then(res => {
      if (res && res.code === 200 && res.data) {
        this.setData({ convList: res.data, convLoading: false });
      } else {
        this.setData({ convList: [], convLoading: false });
      }
    }).catch(() => {
      this.setData({ convList: [], convLoading: false });
    });
  },

  openConversation(e) {
    const { conversationId, houseId, houseTitle, peerId, tenantId, landlordId } = e.currentTarget.dataset;
    const role = this.data.role;
    let targetTenantId = tenantId || '';
    let targetLandlordId = landlordId || '';
    
    if (!targetTenantId || !targetLandlordId) {
      if (role === 'tenant') {
        targetTenantId = this.data.currentUserId;
        targetLandlordId = peerId;
      } else {
        targetLandlordId = this.data.currentUserId;
        targetTenantId = peerId;
      }
    }

    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${targetTenantId}&landlordId=${targetLandlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle || '')}&conversationId=${conversationId}`
    });
  },

  // ==================== 聊天消息 ====================

  loadMessages() {
    const { tenantId, landlordId, houseId, role, currentUserId } = this.data;
    
    // 先加载本地消息
    const localMessages = this.loadMessagesFromLocal();
    if (localMessages.length > 0) {
      this.setData({ messages: localMessages });
      this.scrollToBottom();
    }
    
    // 加载对方信息
    this.loadPeerInfo();
    
    if (tenantId && landlordId && houseId) {
      // 按会话ID加载消息
      getConversationHistory(tenantId, landlordId, houseId).then(res => {
        if (res && res.code === 200 && res.data) {
          this.formatMessages(res.data);
          // 标记消息为已读
          this.markAsRead();
        }
      }).catch(() => {
        // 静默处理错误，避免干扰用户
      });
    } else {
      // 按用户ID加载消息
      const targetId = role === 'tenant' ? landlordId : tenantId;
      if (!targetId || !currentUserId) return;

      getMessageList(targetId, currentUserId).then(res => {
        if (res && res.code === 200 && res.data) {
          this.formatMessages(res.data);
          // 标记消息为已读
          this.markAsRead();
        }
      }).catch(() => {
        // 静默处理错误，避免干扰用户
      });
    }
  },

  // 标记消息为已读
  markAsRead() {
    const { tenantId, landlordId, houseId, role, currentUserId } = this.data;
    const peerId = role === 'tenant' ? landlordId : tenantId;
    
    if (!peerId || !currentUserId) return;
    
    markMessagesAsRead(peerId, tenantId, landlordId).then(res => {
      if (res && res.code === 200) {
        console.log('标记已读成功');
        // 刷新未读数
        this.refreshUnreadCount();
      }
    }).catch(err => {
      console.error('标记已读失败:', err);
    });
  },

  // 刷新未读数
  refreshUnreadCount() {
    // 通知上一页刷新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.loadConversations) {
      prevPage.loadConversations();
    }
    if (prevPage && prevPage.loadUnreadCount) {
      prevPage.loadUnreadCount();
    }
    if (prevPage && prevPage.loadTenants) {
      prevPage.loadTenants();
    }
    // 更新TabBar未读数
    getUnreadCount().then(res => {
      if (res.code === 200 && res.data) {
        const count = res.data.count || 0;
        if (count > 0) {
          wx.setTabBarBadge({
            index: 1,
            text: count > 99 ? '99+' : String(count)
          });
        } else {
          wx.removeTabBarBadge({ index: 1 });
        }
      }
    });
  },

  loadPeerInfo() {
    const { tenantId, landlordId, houseId, role, currentUserId } = this.data;
    const peerId = role === 'tenant' ? landlordId : tenantId;
    
    if (!peerId) {
      // 如果没有对方ID，使用默认信息
      this.setData({
        peerInfo: {
          name: role === 'tenant' ? '房东' : '租客',
          avatar: ''
        }
      });
      return;
    }
    
    // 从会话列表中获取对方信息
    getConversations().then(res => {
      if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
        // 尝试找到匹配的会话
        const conversation = res.data.find(conv => {
          return conv && conv.peerId === peerId;
        });
        
        if (conversation) {
          this.setData({
            peerInfo: {
              name: conversation.peerName || (role === 'tenant' ? '房东' : '租客'),
              avatar: conversation.peerAvatar || ''
            }
          });
        } else {
          // 如果没有会话记录，使用默认信息
          this.setData({
            peerInfo: {
              name: role === 'tenant' ? '房东' : '租客',
              avatar: ''
            }
          });
        }
      } else {
        // 如果获取会话列表失败，使用默认信息
        this.setData({
          peerInfo: {
            name: role === 'tenant' ? '房东' : '租客',
            avatar: ''
          }
        });
      }
    }).catch(() => {
      // 错误时使用默认信息
      this.setData({
        peerInfo: {
          name: role === 'tenant' ? '房东' : '租客',
          avatar: ''
        }
      });
    });
  },

  formatMessages(rawMessages) {
    const formatted = rawMessages.map(m => {
      const messageId = m.id || m.messageId;
      const status = this.data.messageStatus[messageId] || 'sent';
      
      return {
        id: messageId,
        content: m.content,
        senderId: m.senderId || m.sendId,
        receiveId: m.receiveId,
        isSelf: String(m.senderId || m.sendId) === String(this.data.currentUserId),
        createTime: m.createTime,
        isRead: m.isRead,
        role: String(m.senderId || m.sendId) === String(this.data.landlordId) ? 'landlord' : 'tenant',
        status: status
      };
    });
    this.setData({ messages: formatted });
    this.saveMessagesToLocal(formatted);
    this.scrollToBottom();
  },

  onInput(e) { this.setData({ inputText: e.detail.value }); },

  sendChatMessage() {
    const text = this.data.inputText.trim();
    if (!text) {
      wx.showToast({ title: '请输入消息内容', icon: 'none' });
      return;
    }
    if (this.data.sending) return;

    const { tenantId, landlordId, houseId, role, currentUserId } = this.data;
    const receiverId = role === 'tenant' ? landlordId : tenantId;

    if (!receiverId) {
      wx.showToast({ title: '无法获取对方信息', icon: 'none' });
      return;
    }

    this.setData({ sending: true });

    const tempMessageId = 'temp_' + Date.now();
    
    const tempMessage = {
      id: tempMessageId,
      content: text,
      senderId: currentUserId,
      receiveId: receiverId,
      isSelf: true,
      createTime: new Date().toLocaleString(),
      isRead: false,
      role: role,
      status: 'sending'
    };
    
    const messages = [...this.data.messages, tempMessage];
    this.setData({ messages });
    this.scrollToBottom();

    // 确保extra对象中的字段正确
    const extra = {
      tenantId: role === 'tenant' ? currentUserId : tenantId,
      landlordId: role === 'landlord' ? currentUserId : landlordId,
      houseId: houseId
    };

    console.log('开始发送消息:', { receiverId, text, extra });
    console.log('当前用户ID:', currentUserId);
    console.log('tenantId:', extra.tenantId, 'landlordId:', extra.landlordId, 'houseId:', houseId);
    
    sendMessage(receiverId, text, extra).then(res => {
      console.log('发送消息返回:', res);
      
      if (res && res.code === 200) {
        this.setData({ inputText: '', sending: false });
        
        const updatedMessages = messages.map(msg => {
          if (msg.id === tempMessageId) {
            return { ...msg, status: 'sent' };
          }
          return msg;
        });
        
        this.setData({ messages: updatedMessages });
        
        setTimeout(() => {
          this.loadMessages();
        }, 500);
      } else {
        console.error('发送消息返回错误:', res);
        this.setData({ sending: false });
        
        const updatedMessages = messages.map(msg => {
          if (msg.id === tempMessageId) {
            return { ...msg, status: 'failed' };
          }
          return msg;
        });
        
        this.setData({ messages: updatedMessages });
        wx.showToast({ title: res && res.message || '发送失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('发送消息失败:', err);
      console.error('错误详情:', JSON.stringify(err));
      this.setData({ sending: false });
      
      const updatedMessages = messages.map(msg => {
        if (msg.id === tempMessageId) {
          return { ...msg, status: 'failed' };
        }
        return msg;
      });
      
      this.setData({ messages: updatedMessages });
      wx.showToast({ title: err && err.message || '发送失败，请重试', icon: 'none', duration: 3000 });
    });
  },

  scrollToBottom() {
    wx.pageScrollTo({ scrollTop: 99999, duration: 100 });
  },

  // ==================== 本地存储 ====================

  initLocalStorage() {
    try {
      const localMessages = wx.getStorageSync('chat_local_messages') || {};
      this.setData({ localMessages });
    } catch (e) {
      console.error('初始化本地存储失败:', e);
    }
  },

  saveMessagesToLocal(messages) {
    try {
      const { conversationId } = this.data;
      if (!conversationId) return;

      const localMessages = { ...this.data.localMessages };
      localMessages[conversationId] = messages;
      
      // 只保存最近50条消息
      if (messages.length > 50) {
        localMessages[conversationId] = messages.slice(-50);
      }
      
      wx.setStorageSync('chat_local_messages', localMessages);
      this.setData({ localMessages });
    } catch (e) {
      console.error('保存消息到本地失败:', e);
    }
  },

  loadMessagesFromLocal() {
    try {
      const { conversationId } = this.data;
      if (!conversationId) return [];

      const localMessages = wx.getStorageSync('chat_local_messages') || {};
      return localMessages[conversationId] || [];
    } catch (e) {
      console.error('从本地加载消息失败:', e);
      return [];
    }
  },

  // ==================== 消息状态管理 ====================

  updateMessageStatus(messageId, status) {
    const messageStatus = { ...this.data.messageStatus };
    messageStatus[messageId] = status;
    this.setData({ messageStatus });
  },

  // ==================== 网络错误处理 ====================

  showNetworkError() {
    this.setData({ networkError: true });
    wx.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
  },

  hideNetworkError() {
    this.setData({ networkError: false });
  },

  // ==================== 加载更多消息 ====================

  loadMoreMessages() {
    if (this.data.loadingMore) return;
    
    this.setData({ loadingMore: true });
    // 这里可以实现加载更多历史消息的逻辑
    // 目前简化处理，直接结束加载状态
    setTimeout(() => {
      this.setData({ loadingMore: false });
    }, 1000);
  }
});
