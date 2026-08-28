// pages/landlord/order-detail/order-detail.js
const { getOrderDetail, updateOrderStatus } = require('../../../utils/api.js');

const STATUS_MAP = {
  0: { key: 'pending', label: '待确认', color: '#FA8C16', bg: '#FFF7E6', icon: '⏳', desc: '等待房东确认' },
  1: { key: 'confirmed', label: '已确认', color: '#4A90E2', bg: '#E6F4FF', icon: '✓', desc: '房东已确认，等待入住' },
  2: { key: 'renting', label: '租住中', color: '#52C41A', bg: '#F0FFF0', icon: '🏠', desc: '租客正在租住' },
  3: { key: 'completed', label: '已完结', color: '#999999', bg: '#F5F5F5', icon: '📋', desc: '订单已完成' },
  4: { key: 'cancelled', label: '已取消', color: '#FF4444', bg: '#FFF1F0', icon: '✕', desc: '订单已取消' },
  5: { key: 'rejected', label: '已拒绝', color: '#FF4444', bg: '#FFF1F0', icon: '✕', desc: '订单已被拒绝' }
};

Page({
  data: { 
    order: null, 
    operating: false,
    loading: true
  },

  onLoad(options) { 
    this.loadDetail(options.id); 
  },

  onShow() { 
    if (this.data.order) {
      this.loadDetail(this.data.order.id); 
    }
  },

  loadDetail(id) {
    this.setData({ loading: true });
    getOrderDetail(id).then(res => {
      if (res.data) {
        const o = res.data;
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

        const order = {
          ...o,
          statusKey: statusInfo.key,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          statusBg: statusInfo.bg,
          statusIcon: statusInfo.icon,
          statusDesc: statusInfo.desc,
          rentUnit,
          rentCountDisplay: rentCount,
          displayAmount: o.totalAmount || o.rentAmount || 0,
          tenantName: o.guestName || o.realName || '未填写',
          tenantPhone: o.guestPhone || o.phone || ''
        };
        
        this.setData({ order, loading: false });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '订单不存在', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  confirmOrder() {
    if (this.data.operating) return;
    const { id, orderStatus } = this.data.order;
    if (orderStatus !== 0) { 
      wx.showToast({ title: '订单状态不允许此操作', icon: 'none' }); 
      return; 
    }
    
    wx.showModal({ 
      title: '确认订单', 
      content: '确认接受该租赁订单？', 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(this.data.order.orderNo, 1).then(() => {
          wx.showToast({ title: '已确认', icon: 'success' });
          this.setData({ operating: false });
          this.notifyPrevPage();
          setTimeout(() => wx.navigateBack(), 1500);
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  rejectOrder() {
    if (this.data.operating) return;
    const { id, orderStatus } = this.data.order;
    if (orderStatus !== 0) { 
      wx.showToast({ title: '订单状态不允许此操作', icon: 'none' }); 
      return; 
    }
    
    wx.showModal({ 
      title: '拒绝订单', 
      content: '确认拒绝该租赁订单？拒绝后不可恢复。', 
      confirmColor: '#FF4444', 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(this.data.order.orderNo, 5).then(() => {
          wx.showToast({ title: '已拒绝', icon: 'success' });
          this.setData({ operating: false });
          this.notifyPrevPage();
          setTimeout(() => wx.navigateBack(), 1500);
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  startRenting() {
    if (this.data.operating) return;
    const { orderStatus } = this.data.order;
    if (orderStatus !== 1) { 
      wx.showToast({ title: '订单状态不允许此操作', icon: 'none' }); 
      return; 
    }
    
    wx.showModal({ 
      title: '确认入住', 
      content: '确认租客已入住？', 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(this.data.order.orderNo, 2).then(() => {
          wx.showToast({ title: '已确认入住', icon: 'success' });
          this.setData({ operating: false });
          this.notifyPrevPage();
          this.loadDetail(this.data.order.id);
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  completeOrder() {
    if (this.data.operating) return;
    const { orderStatus } = this.data.order;
    if (orderStatus !== 2) { 
      wx.showToast({ title: '订单状态不允许此操作', icon: 'none' }); 
      return; 
    }
    
    wx.showModal({ 
      title: '完结订单', 
      content: '确认完结该租赁订单？完结后订单将标记为已完成。', 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        updateOrderStatus(this.data.order.orderNo, 3).then(() => {
          wx.showToast({ title: '已完结', icon: 'success' });
          this.setData({ operating: false });
          this.notifyPrevPage();
          setTimeout(() => wx.navigateBack(), 1500);
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  contactTenant() {
    const o = this.data.order;
    wx.navigateTo({
      url: `/pages/chat/chat?tenantId=${o.userId}&landlordId=${o.hostId}&houseId=${o.houseId}&houseTitle=${encodeURIComponent(o.houseTitle || '')}`
    });
  },

  callTenant() {
    const phone = this.data.order.tenantPhone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    } else {
      wx.showToast({ title: '暂无联系电话', icon: 'none' });
    }
  },

  notifyPrevPage() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.loadOrders) {
      prevPage.loadOrders();
    }
  }
});
