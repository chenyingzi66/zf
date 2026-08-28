// pages/tenant/order-detail/order-detail.js
const { getOrderDetail, updateOrderStatus } = require('../../../utils/api.js');

const STATUS_MAP = {
  0: { label: '待确认', color: '#FA8C16', desc: '等待房东确认中' },
  1: { label: '已确认', color: '#4A90E2', desc: '房东已确认，请按时入住' },
  2: { label: '租住中', color: '#52C41A', desc: '您正在租住此房源' },
  3: { label: '已完结', color: '#999', desc: '租约已完结' },
  4: { label: '已取消', color: '#FF4444', desc: '订单已取消' },
  5: { label: '已拒绝', color: '#FF4444', desc: '订单已被拒绝' }
};

Page({
  data: {
    orderId: '',
    order: null,
    loading: false,
    operating: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadDetail();
    }
  },

  loadDetail() {
    this.setData({ loading: true });
    getOrderDetail(this.data.orderId).then(res => {
      if (res.data) {
        const order = res.data;
        const statusInfo = STATUS_MAP[order.orderStatus] || { label: '未知', color: '#999', desc: '' };
        
        let rentUnit = '月';
        let rentCount = order.rentCount || order.months || 1;
        if (order.rentType === '日租') {
          rentUnit = '天';
          rentCount = order.rentCount || order.days || 1;
        } else if (order.rentType === '季租') {
          rentUnit = '季';
        } else if (order.rentType === '年租') {
          rentUnit = '年';
        }

        order.statusLabel = statusInfo.label;
        order.statusColor = statusInfo.color;
        order.statusDesc = statusInfo.desc;
        order.rentUnit = rentUnit;
        order.rentCountDisplay = rentCount;
        
        this.setData({ order, loading: false });
      }
    }).catch(() => this.setData({ loading: false }));
  },

  cancelOrder() {
    const { order } = this.data;
    if (!order || order.orderStatus !== 0 || this.data.operating) return;
    wx.showModal({ title: '确认取消', content: '确定要取消这个订单吗？', confirmColor: '#FF4444', success: res => {
      if (!res.confirm) return;
      this.setData({ operating: true });
      updateOrderStatus(order.orderNo, 4).then(() => {
        wx.showToast({ title: '已取消订单', icon: 'success' });
        this.setData({ operating: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadOrders) {
          prevPage.loadOrders();
        }
        setTimeout(() => wx.navigateBack(), 1500);
      }).catch(() => this.setData({ operating: false }));
    }});
  },

  contactLandlord() {
    const { order } = this.data;
    if (!order) return;
    const tenantId = order.userId || '';
    const landlordId = order.hostId || '';
    const houseId = order.houseId || '';
    const houseTitle = order.houseTitle || '';
    const conversationId = `conv_${tenantId}_${landlordId}_${houseId}`;
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${tenantId}&landlordId=${landlordId}&houseId=${houseId}&houseTitle=${encodeURIComponent(houseTitle)}&conversationId=${conversationId}`
    });
  },

  viewHouse() {
    const { order } = this.data;
    if (!order) return;
    wx.navigateTo({ url: `/pages/tenant/house-detail/house-detail?id=${order.houseId}` });
  }
});
