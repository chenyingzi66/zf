// pages/tenant/favorites/favorites.js
const { getFavoriteList, removeFavorite, getHouseDetail } = require('../../../utils/api.js');

Page({
  data: {
    list: [],
    loading: false
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  // 加载收藏列表
  loadFavorites() {
    this.setData({ loading: true });
    
    getFavoriteList().then(res => {
      console.log('收藏列表返回:', res);
      if (res.code === 200 && res.data) {
        let list = res.data.list || [];
        
        // 处理数据格式
        list = list.map(item => {
          // 处理图片
          let images = [];
          if (item.pics) {
            try {
              images = JSON.parse(item.pics);
            } catch (e) {
              images = item.pics.split(',').filter(Boolean);
            }
          }
          
          // 处理价格
          let price = 0;
          if (item.price) {
            price = parseFloat(item.price);
          }
          
          // 处理区域
          const region = [item.province, item.city, item.district].filter(Boolean).join(' ');
          
          return {
            ...item,
            images: images,
            coverImage: images[0] || '',
            price: price,
            region: region,
            title: item.title || item.houseTitle || '未知房源',
            houseType: item.houseType || '未知房型',
            area: item.area || 0,
            floor: item.floor || '低楼层'
          };
        });
        
        console.log('处理后的收藏列表:', list);
        
        this.setData({ 
          list: list,
          loading: false 
        });
      } else {
        this.setData({ 
          list: [],
          loading: false 
        });
      }
    }).catch((err) => {
      console.error('加载收藏列表失败:', err);
      this.setData({ 
        list: [],
        loading: false 
      });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 跳转到房源详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      wx.showToast({ title: '房源ID无效', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/tenant/house-detail/house-detail?id=${id}` });
  },

  // 联系房东
  contactLandlord(e) {
    const { id, hostId, title } = e.currentTarget.dataset;
    if (!id || !hostId) {
      wx.showToast({ title: '无法获取房东信息', icon: 'none' });
      return;
    }
    
    // 跳转到聊天页面
    wx.navigateTo({ 
      url: `/pages/chat/chat?landlordId=${hostId}&houseId=${id}&houseTitle=${encodeURIComponent(title || '咨询房源')}&role=tenant` 
    });
  },

  // 立即预定
  bookNow(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      wx.showToast({ title: '房源ID无效', icon: 'none' });
      return;
    }
    
    // 先获取房源详情，然后跳转到预定页面
    getHouseDetail(id).then(res => {
      if (res.code === 200 && res.data) {
        const house = res.data;
        wx.navigateTo({ 
          url: `/pages/tenant/booking/booking?houseId=${id}&price=${house.price}&title=${encodeURIComponent(house.title || house.houseTitle)}` 
        });
      } else {
        wx.showToast({ title: '获取房源信息失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '获取房源信息失败', icon: 'none' });
    });
  },

  // 取消收藏
  removeFavorite(e) {
    const { id, index } = e.currentTarget.dataset;
    if (!id) {
      wx.showToast({ title: '收藏ID无效', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定取消收藏该房源吗？',
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          // 获取房源ID用于取消收藏
          const houseId = this.data.list[index].houseId;
          removeFavorite(houseId).then(res => {
            if (res.code === 200) {
              wx.showToast({ title: '已取消收藏', icon: 'success' });
              // 从列表中移除
              const list = this.data.list;
              list.splice(index, 1);
              this.setData({ list });
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 去探索房源
  goExplore() {
    wx.switchTab({ url: '/pages/tenant/index/index' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  }
});
