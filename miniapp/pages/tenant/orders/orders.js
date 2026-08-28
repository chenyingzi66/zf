// pages/tenant/orders/orders.js
const app = getApp();
const { getTenantOrderList, updateOrderStatus } = require('../../../utils/api.js');

const STATUS_TABS = [
  { label: '全部', value: null },
  { label: '待确认', value: 0 },
  { label: '已确认', value: 1 },
  { label: '租住中', value: 2 },
  { label: '已完结', value: 3 },
  { label: '已取消', value: 4 }
];

const STATUS_MAP = {
  0: { label: '待确认', color: '#FA8C16' },
  1: { label: '已确认', color: '#4A90E2' },
  2: { label: '租住中', color: '#52C41A' },
  3: { label: '已完结', color: '#999' },
  4: { label: '已取消', color: '#FF4444' },
  5: { label: '已拒绝', color: '#FF4444' }
};

Page({
  data: {
    tabs: STATUS_TABS,
    activeTab: 0,
    currentStatus: null,
    list: [],
    loading: false,
    statusMap: STATUS_MAP
  },

  onLoad() {
    if (!app.checkLogin()) {
      wx.redirectTo({ url: '/pages/tenant/login/login' });
      return;
    }
    this.loadOrders();
  },

  onShow() {
    if (app.checkLogin()) {
      this.loadOrders();
    }
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  switchTab(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({ 
      activeTab: idx, 
      currentStatus: STATUS_TABS[idx].value 
    });
    this.loadOrders();
  },

  loadOrders() {
    this.setData({ loading: true });
    
    getTenantOrderList(this.data.currentStatus)
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.map(item => {
            const statusInfo = STATUS_MAP[item.orderStatus] || { label: '未知', color: '#999' };
            let rentUnit = '月';
            let rentCount = item.rentCount || item.months || 1;
            
            if (item.rentType === '日租') {
              rentUnit = '天';
              rentCount = item.rentCount || item.days || 1;
            } else if (item.rentType === '季租') {
              rentUnit = '季';
              rentCount = item.rentCount || Math.ceil((item.days || 90) / 90);
            } else if (item.rentType === '年租') {
              rentUnit = '年';
              rentCount = item.rentCount || Math.ceil((item.days || 365) / 365);
            }
            
            let houseImage = item.houseImage || '';
            if (!houseImage && item.houseId) {
              houseImage = '/assets/images/default-house.png';
            }
            
            const startDate = item.checkInDate || item.startDate || '';
            const endDate = item.checkOutDate || item.endDate || '';
            
            return {
              ...item,
              statusLabel: statusInfo.label,
              statusColor: statusInfo.color,
              rentUnit: rentUnit,
              rentCount: rentCount,
              houseTitle: item.houseTitle || '房源',
              houseImage: houseImage,
              startDate: startDate,
              endDate: endDate,
              totalAmount: item.totalAmount || 0,
              rentAmount: item.rentAmount || 0,
              deposit: item.deposit || 0,
              orderNo: item.orderNo || String(item.id)
            };
          });
          this.setData({ list, loading: false });
        } else {
          this.setData({ list: [], loading: false });
        }
      })
      .catch(() => {
        this.setData({ list: [], loading: false });
      });
  },

  cancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    const order = this.data.list.find(o => o.orderNo === id);
    if (!order || order.orderStatus !== 0) {
      wx.showToast({ title: '该订单不可取消', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      confirmColor: '#FF4444',
      success: res => {
        if (!res.confirm) return;
        updateOrderStatus(id, 4).then(() => {
          wx.showToast({ title: '已取消订单', icon: 'success' });
          this.loadOrders();
        }).catch(() => {
          wx.showToast({ title: '取消失败', icon: 'none' });
        });
      }
    });
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/tenant/order-detail/order-detail?id=${id}` });
  },

  contactLandlord(e) {
    const order = this.data.list.find(o => o.orderNo === e.currentTarget.dataset.id);
    if (!order) return;
    const userInfo = app.globalData.userInfo || {};
    const tenantId = userInfo.userId || userInfo.id || '';
    const landlordId = order.hostId || '';
    const houseId = order.houseId || '';
    const houseTitle = order.houseTitle || '';
    const conversationId = `conv_${tenantId}_${landlordId}_${houseId}`;
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${tenantId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle)}&conversationId=${conversationId}`
    });
  },

  goToHouseList() {
    wx.navigateTo({ url: '/pages/tenant/house-list/house-list' });
  }
});
