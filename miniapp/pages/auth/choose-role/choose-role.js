// pages/auth/choose-role/choose-role.js

Page({
  data: {},

  onLoad() {
    // 检查是否已登录
    const app = getApp();
    if (app.checkLogin()) {
      const role = wx.getStorageSync('userRole');
      if (role === 'tenant') {
        wx.switchTab({ url: '/pages/tenant/index/index' });
      } else if (role === 'landlord') {
        wx.switchTab({ url: '/pages/landlord/index/index' });
      }
    }
  },

  // 选择租客身份
  chooseTenant() {
    wx.navigateTo({
      url: '/pages/tenant/login/login'
    });
  },

  // 选择房东身份
  chooseLandlord() {
    wx.navigateTo({
      url: '/pages/landlord/login/login'
    });
  },

  // 显示用户协议
  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议的详细内容...',
      showCancel: false
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的详细内容...',
      showCancel: false
    });
  }
});
