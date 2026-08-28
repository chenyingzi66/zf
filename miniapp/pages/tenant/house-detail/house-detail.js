// pages/tenant/house-detail/house-detail.js
const app = getApp();
const { getHouseDetail, checkFavorite, addFavorite, removeFavorite } = require('../../../utils/api.js');

Page({
  data: {
    houseId: '',
    house: null,
    picsArr: [],
    facilitiesArr: [],
    isFavorite: false,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ houseId: options.id });
      this.loadHouseDetail();
    } else {
      wx.showToast({ title: '房源不存在', icon: 'none' });
      wx.navigateBack();
    }
  },

  loadHouseDetail() {
    this.setData({ loading: true });
    getHouseDetail(this.data.houseId).then(res => {
      if (res.code === 200 && res.data) {
        const house = res.data;
        let picsArr = [];
        try {
          picsArr = JSON.parse(house.pics || '[]');
        } catch (e) {
          picsArr = [];
        }
        const facilitiesArr = house.facilities ? house.facilities.split(',').filter(Boolean) : [];
        
        this.setData({ 
          house, 
          picsArr, 
          facilitiesArr, 
          loading: false 
        });

        if (app.checkLogin()) {
          this.checkFavoriteStatus();
        }
      } else {
        wx.showToast({ title: '房源不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  checkFavoriteStatus() {
    checkFavorite(this.data.houseId).then(res => {
      if (res.code === 200) {
        this.setData({ isFavorite: res.data.isCollected });
      }
    }).catch(() => {});
  },

  previewImages(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: this.data.picsArr[index],
      urls: this.data.picsArr
    });
  },

  toggleFavorite() {
    if (!app.checkLogin()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    
    const houseId = this.data.houseId;
    console.log('toggleFavorite - houseId:', houseId);
    
    const wasFavorite = this.data.isFavorite;
    const action = wasFavorite ? removeFavorite : addFavorite;
    action(houseId).then((res) => {
      console.log('toggleFavorite success:', res);
      this.setData({ isFavorite: !wasFavorite });
      wx.showToast({ title: wasFavorite ? '已取消收藏' : '收藏成功', icon: 'success' });
    }).catch((err) => {
      console.error('toggleFavorite error:', err);
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    });
  },

  contactLandlord() {
    console.log('contactLandlord called');
    if (!app.checkLogin()) {
      console.log('User not logged in');
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    console.log('User logged in');
    const userInfo = app.globalData.userInfo || {};
    console.log('userInfo:', userInfo);
    const tenantId = userInfo.userId || userInfo.id || '';
    console.log('tenantId:', tenantId);
    const house = this.data.house;
    console.log('house:', house);
    const landlordId = house.hostId || '';
    console.log('landlordId:', landlordId);
    const houseId = this.data.houseId;
    console.log('houseId:', houseId);
    const houseTitle = house.title || '';
    console.log('houseTitle:', houseTitle);
    const conversationId = `conv_${tenantId}_${landlordId}_${houseId}`;
    console.log('conversationId:', conversationId);
    const url = `/pages/chat/chat?tenantId=${tenantId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle)}&conversationId=${conversationId}`;
    console.log('navigateTo url:', url);
    wx.navigateTo({
      url: url,
      success: function(res) {
        console.log('navigateTo success:', res);
      },
      fail: function(res) {
        console.log('navigateTo fail:', res);
      }
    });
  },

  bookNow() {
    if (!app.checkLogin()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/tenant/booking/booking?houseId=${this.data.houseId}`
    });
  }
});
