// pages/tenant/profile/profile.js
const app = getApp();
const { getUserInfo } = require('../../../utils/api.js');
const { post } = require('../../../utils/request.js');

// 直接在页面中定义updateUserInfo函数
function updateUserInfo(data) {
  return post('/user/update', data, { showLoad: true });
}

Page({
  data: {
    userInfo: null,
    loading: false
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    if (!token || !userInfo) {
      wx.redirectTo({ url: '/pages/tenant/login/login' });
      return;
    }
    
    this.setData({ loading: true });
    getUserInfo()
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({ userInfo: res.data, loading: false });
          app.globalData.userInfo = res.data;
          wx.setStorageSync('userInfo', res.data);
        } else {
          this.setData({ userInfo: userInfo, loading: false });
        }
      })
      .catch(err => {
        console.error('获取用户信息失败', err);
        this.setData({ userInfo: userInfo, loading: false });
      });
  },

  goFavorites() {
    wx.navigateTo({ url: '/pages/tenant/favorites/favorites' });
  },

  goOrders() {
    wx.switchTab({ url: '/pages/tenant/orders/orders' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/tenant/feedback/feedback' });
  },

  goMessages() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  uploadAvatar(filePath) {
    const that = this;
    
    wx.uploadFile({
      url: 'http://localhost:8080/upload/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200 && data.data) {
          that.updateAvatar(data.data);
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  updateAvatar(avatarUrl) {
    this.setData({ loading: true });
    
    updateUserInfo({ avatar: avatarUrl })
      .then(res => {
        if (res.code === 200) {
          const userInfo = { ...this.data.userInfo, avatar: avatarUrl };
          this.setData({ userInfo, loading: false });
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          wx.showToast({ title: '头像更新成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.message || '更新失败', icon: 'none' });
          this.setData({ loading: false });
        }
      })
      .catch(err => {
        wx.showToast({ title: err.message || '更新失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  editNickname() {
    const currentNickname = this.data.userInfo ? this.data.userInfo.nickname || '' : '';
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: currentNickname,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.updateNickname(res.content.trim());
        }
      }
    });
  },

  updateNickname(nickname) {
    this.setData({ loading: true });
    updateUserInfo({ nickname })
      .then(res => {
        if (res.code === 200) {
          const userInfo = { ...this.data.userInfo, nickname };
          this.setData({ userInfo, loading: false });
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          wx.showToast({ title: '修改成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.message || '修改失败', icon: 'none' });
          this.setData({ loading: false });
        }
      })
      .catch(err => {
        wx.showToast({ title: err.message || '修改失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗?',
      confirmColor: '#FF4444',
      success: (res) => {
        if (!res.confirm) return;
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');
        wx.reLaunch({ url: '/pages/welcome/welcome' });
      }
    });
  }
});
