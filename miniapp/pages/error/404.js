// pages/error/404.js
Page({
  goHome() {
    const role = wx.getStorageSync('role');
    if (role === 'landlord') {
      wx.reLaunch({ url: '/pages/landlord/index/index' });
    } else {
      wx.reLaunch({ url: '/pages/tenant/index/index' });
    }
  }
});
