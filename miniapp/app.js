// app.js
App({
  globalData: {
    userInfo: null,
    userRole: '', // 'tenant' 租客 | 'landlord' 房东
    token: '',
    isLogin: false,
    hasAgreedPrivacy: false,
    unreadMessageCount: 0,
    socketTask: null,
    isSocketConnected: false,
    messageListeners: [],
    reconnectCount: 0,
    maxReconnectCount: 10
  },
  
  onLaunch(options) {
    console.log('小程序启动', options);
    // 从缓存恢复登录状态
    this.restoreLoginState();
    // 检查更新
    this.checkUpdate();
  },

  onShow(options) {
    console.log('小程序显示', options);
    this.connectWebSocket();
  },

  onHide() {
    console.log('小程序隐藏');
    this.closeWebSocket();
  },

  // 连接 WebSocket
  connectWebSocket() {
    if (!this.globalData.isLogin || !this.globalData.userInfo) return;
    if (this.globalData.isSocketConnected) return;

    // 获取正确的userId
    const userInfo = this.globalData.userInfo || {};
    let userId = '';
    if (this.globalData.userRole === 'landlord') {
      userId = userInfo.hostId || userInfo.userId || userInfo.id || '';
    } else {
      userId = userInfo.userId || userInfo.id || '';
    }

    if (!userId) {
      console.log('无法获取userId，跳过WebSocket连接');
      return;
    }

    let wsUrl = 'ws://localhost:8080/ws/' + userId;
    console.log('连接WebSocket，userId:', userId, 'userRole:', this.globalData.userRole);

    this.globalData.socketTask = wx.connectSocket({
      url: wsUrl,
      success: () => console.log('WebSocket 连接请求成功')
    });

    this.globalData.socketTask.onOpen(() => {
      console.log('WebSocket 已连接，userId:', userId);
      this.globalData.isSocketConnected = true;
      this.globalData.reconnectCount = 0;
      // 发送心跳
      this.globalData.heartbeatTimer = setInterval(() => {
        try {
          this.globalData.socketTask.send({ data: 'PING' });
        } catch (e) {
          console.error('发送心跳失败:', e);
        }
      }, 30000);
    });

    this.globalData.socketTask.onMessage((res) => {
      console.log('收到 WebSocket 消息:', res.data);
      // 通知所有监听器
      this.globalData.messageListeners.forEach(listener => {
        try {
          listener(res.data);
        } catch (e) {
          console.error('消息监听器执行失败:', e);
        }
      });
      
      if (res.data === 'NEW_MESSAGE') {
        // 通知当前页面刷新消息，或者更新未读数
        try {
          wx.showTabBarRedDot({ index: 2 }); // 消息在第三个tab（索引2）
        } catch(e) {}
      }
    });

    this.globalData.socketTask.onClose(() => {
      console.log('WebSocket 已断开');
      this.globalData.isSocketConnected = false;
      this.globalData.socketTask = null;
      // 清除心跳定时器
      if (this.globalData.heartbeatTimer) {
        clearInterval(this.globalData.heartbeatTimer);
        this.globalData.heartbeatTimer = null;
      }
      // 重连次数限制
      if (this.globalData.reconnectCount < this.globalData.maxReconnectCount) {
        this.globalData.reconnectCount++;
        const delay = Math.min(5000 * this.globalData.reconnectCount, 30000);
        setTimeout(() => {
          console.log(`尝试重连WebSocket (${this.globalData.reconnectCount}/${this.globalData.maxReconnectCount})`);
          this.connectWebSocket();
        }, delay);
      } else {
        console.log('WebSocket重连次数已达上限，停止重连');
      }
    });

    this.globalData.socketTask.onError((err) => {
      console.error('WebSocket 错误:', err);
      this.globalData.isSocketConnected = false;
    });
  },

  closeWebSocket() {
    if (this.globalData.socketTask) {
      try {
        this.globalData.socketTask.close();
      } catch (e) {
        console.error('关闭WebSocket失败:', e);
      }
    }
    this.globalData.isSocketConnected = false;
    this.globalData.socketTask = null;
    // 清除心跳定时器
    if (this.globalData.heartbeatTimer) {
      clearInterval(this.globalData.heartbeatTimer);
      this.globalData.heartbeatTimer = null;
    }
  },

  // 添加消息监听器（去重）
  addMessageListener(listener) {
    if (typeof listener === 'function') {
      const exists = this.globalData.messageListeners.some(l => l === listener);
      if (!exists) {
        this.globalData.messageListeners.push(listener);
      }
    }
  },

  // 移除消息监听器
  removeMessageListener(listener) {
    const index = this.globalData.messageListeners.indexOf(listener);
    if (index > -1) {
      this.globalData.messageListeners.splice(index, 1);
    }
  },

  // 恢复登录状态
  restoreLoginState() {
    try {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      const userRole = wx.getStorageSync('userRole');
      const hasAgreedPrivacy = wx.getStorageSync('hasAgreedPrivacy');

      if (token && userInfo) {
        this.globalData.token = token;
        this.globalData.userInfo = userInfo;
        this.globalData.userRole = userRole || 'tenant';
        this.globalData.isLogin = true;
      }

      if (hasAgreedPrivacy) {
        this.globalData.hasAgreedPrivacy = true;
      }
    } catch (e) {
      console.error('恢复登录状态失败', e);
    }
  },

  // 设置登录信息
  setLoginInfo(token, userInfo, userRole) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.userRole = userRole;
    this.globalData.isLogin = true;

    try {
      wx.setStorageSync('token', token);
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('userRole', userRole);
    } catch (e) {
      console.error('保存登录信息失败', e);
    }

    this.connectWebSocket();
  },

  // 清除登录信息
  clearLoginInfo() {
    this.closeWebSocket();
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.userRole = '';
    this.globalData.isLogin = false;
    this.globalData.unreadMessageCount = 0;

    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('userRole');
    } catch (e) {
      console.error('清除登录信息失败', e);
    }
  },

  // 设置隐私协议同意状态
  setPrivacyAgreed() {
    this.globalData.hasAgreedPrivacy = true;
    try {
      wx.setStorageSync('hasAgreedPrivacy', true);
    } catch (e) {
      console.error('保存隐私协议状态失败', e);
    }
  },

  // 检查是否已登录
  checkLogin() {
    return this.globalData.isLogin && this.globalData.token;
  },

  // 登录 + 角色校验封装，未通过则跳转对应登录页
  requireLoginAndRole(requiredRole) {
    const okLogin = this.checkLogin();
    const okRole = requiredRole ? this.globalData.userRole === requiredRole : true;
    if (!okLogin || !okRole) {
      const target = requiredRole === 'landlord'
        ? '/pages/landlord/login/login'
        : '/pages/tenant/login/login';
      wx.redirectTo({ url: target });
      return false;
    }
    return true;
  },

  // 检查用户角色
  checkRole(requiredRole) {
    return this.globalData.userRole === requiredRole;
  },

  // 更新未读消息数（容错处理：TabBar 未渲染时会报错，忽略即可）
  updateUnreadCount(count) {
    this.globalData.unreadMessageCount = count;
    try {
      if (count > 0) {
        wx.setTabBarBadge({
          index: 1,
          text: count > 99 ? '99+' : count.toString()
        });
      } else {
        wx.removeTabBarBadge({ index: 1 });
      }
    } catch (e) {
      // TabBar 页面未加载时忽略
    }
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });

          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            });
          });
        }
      });
    }
  }
});
