// pages/landlord/orders/orders.js
const { getLandlordOrderList, updateOrderStatus } = require('../../../utils/api.js');

const STATUS_MAP = {
  0: { key: 'pending', label: '待确认', color: '#FA8C16', bg: '#FFF7E6', icon: '⏳' },
  1: { key: 'confirmed', label: '已确认', color: '#4A90E2', bg: '#E6F4FF', icon: '✓' },
  2: { key: 'renting', label: '租住中', color: '#52C41A', bg: '#F0FFF0', icon: '🏠' },
  3: { key: 'completed', label: '已完结', color: '#999999', bg: '#F5F5F5', icon: '📋' },
  4: { key: 'cancelled', label: '已取消', color: '#FF4444', bg: '#FFF1F0', icon: '✕' },
  5: { key: 'rejected', label: '已拒绝', color: '#FF4444', bg: '#FFF1F0', icon: '✕' }
};

const TABS = [
  { key: 'all', label: '全部', status: null },
  { key: 'pending', label: '待确认', status: 0 },
  { key: 'confirmed', label: '已确认', status: 1 },
  { key: 'renting', label: '租住中', status: 2 },
  { key: 'completed', label: '已完结', status: 3 }
];

Page({
  data: {
    tabs: TABS,
    curTab: 'all',
    list: [],
    loading: false,
    operating: false,
    lastRefresh: ''
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ curTab: key });
    this.loadOrders();
  },

  loadOrders() {
    this.setData({ loading: true });
    
    const curTabData = TABS.find(t => t.key === this.data.curTab);
    const status = curTabData ? curTabData.status : null;
    
    getLandlordOrderList(status).then(res => {
      let rawList = res.data || [];
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const list = rawList.map(o => {
        const statusInfo = STATUS_MAP[o.orderStatus] || STATUS_MAP[0];
        
        let rentUnit = '月';
        let rentCount = o.rentCount || o.months || 1;
        if (o.rentType === '日租') {
          rentUnit = '天';
          rentCount = o.rentCount || o.days || 1;
        } else if (o.rentType === '季租') {
          rentUnit = '季';
        } else if (o.rentType === '年租') {
          rentUnit = '年';
        }

        return {
          ...o,
          statusKey: statusInfo.key,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          statusBg: statusInfo.bg,
          statusIcon: statusInfo.icon,
          rentUnit,
          rentCountDisplay: rentCount,
          displayAmount: o.totalAmount || o.rentAmount || 0
        };
      });

      this.setData({ list, loading: false, lastRefresh: this.formatTime(now) });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/landlord/order-detail/order-detail?id=${id}` });
  },

  confirmOrder(e) {
    if (this.data.operating) return;
    const { id, orderno } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认订单',
      content: '确认接受该租赁订单？确认后租客即可入住。',
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(orderno, 1).then(() => {
          wx.showToast({ title: '已确认', icon: 'success' });
          this.setData({ operating: false });
          this.loadOrders();
        }).catch(() => {
          this.setData({ operating: false });
        });
      }
    });
  },

  rejectOrder(e) {
    if (this.data.operating) return;
    const { id, orderno } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '拒绝订单',
      content: '确认拒绝该租赁订单？拒绝后不可恢复。',
      confirmColor: '#FF4444',
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(orderno, 5).then(() => {
          wx.showToast({ title: '已拒绝', icon: 'success' });
          this.setData({ operating: false });
          this.loadOrders();
        }).catch(() => {
          this.setData({ operating: false });
        });
      }
    });
  },

  completeOrder(e) {
    if (this.data.operating) return;
    const { id, orderno } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '完结订单',
      content: '确认完结该租赁订单？',
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(orderno, 3).then(() => {
          wx.showToast({ title: '已完结', icon: 'success' });
          this.setData({ operating: false });
          this.loadOrders();
        }).catch(() => {
          this.setData({ operating: false });
        });
      }
    });
  },

  contactTenant(e) {
    const item = e.currentTarget.dataset.item;
    const tenantId = item.userId || '';
    const landlordId = item.hostId || '';
    const houseId = item.houseId || '';
    const houseTitle = item.houseTitle || '';
    const conversationId = `conv_${tenantId}_${landlordId}_${houseId}`;
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${tenantId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle)}&conversationId=${conversationId}`
    });
  },

  onRefresh() {
    this.loadOrders();
  }
});
