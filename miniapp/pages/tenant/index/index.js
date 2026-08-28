// pages/tenant/index/index.js
const app = getApp();
const { getBanners, getTenantHouseList } = require('../../../utils/api.js');

Page({
  data: {
    banners: [],
    houseList: [],
    searchKeyword: '',
    loading: false
  },

  onLoad(options) {
    console.log('租客首页 onLoad');
    this.loadBanners();
    this.loadHouseList();
  },

  onShow() {
    console.log('租客首页 onShow');
  },

  onPullDownRefresh() {
    this.loadHouseList();
    wx.stopPullDownRefresh();
  },

  loadBanners() {
    getBanners()
      .then(res => {
        console.log('轮播图数据:', res);
        if (res.code === 200 && res.data) {
          this.setData({ banners: res.data });
        }
      })
      .catch(err => {
        console.error('加载轮播图失败:', err);
      });
  },

  loadHouseList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    getTenantHouseList()
      .then(res => {
        console.log('房源数据:', res);
        if (res.code === 200 && res.data) {
          const list = res.data.map(item => {
            let picsArr = [];
            try {
              picsArr = JSON.parse(item.pics || '[]');
            } catch (e) {
              picsArr = [];
            }
            return { ...item, picsArr };
          });
          this.setData({ houseList: list, loading: false });
        } else {
          this.setData({ houseList: [], loading: false });
        }
      })
      .catch(err => {
        console.error('加载房源失败:', err);
        this.setData({ loading: false });
      });
  },

  handleSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  handleSearch() {
    const keyword = this.data.searchKeyword.trim();
    wx.navigateTo({
      url: `/pages/tenant/house-list/house-list?keyword=${encodeURIComponent(keyword)}`
    });
  },

  goToFilter(e) {
    const type = e.currentTarget.dataset.type || '';
    wx.navigateTo({
      url: `/pages/tenant/house-list/house-list?focus=${type}`
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/tenant/house-detail/house-detail?id=${id}`
    });
  }
});
