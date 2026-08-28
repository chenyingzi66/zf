// pages/landlord/house-detail/house-detail.js
const { getHouseDetail, toggleHouseStatus, deleteHouse } = require('../../../utils/api.js');

const STATUS_MAP = {
  0: { label: '已下架', color: '#999', bg: '#f5f5f5' },
  1: { label: '已上架', color: '#52C41A', bg: '#e6f7e6' },
  2: { label: '审核中', color: '#FA8C16', bg: '#fff7e6' }
};

const AUDIT_STATUS_MAP = {
  0: { label: '待审核', color: '#FA8C16' },
  1: { label: '审核通过', color: '#52C41A' },
  2: { label: '审核驳回', color: '#FF4444' }
};

Page({
  data: {
    houseId: '',
    house: null,
    images: [],
    currentImg: 0,
    loading: true,
    operating: false,
    statusMap: STATUS_MAP,
    auditStatusMap: AUDIT_STATUS_MAP
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ houseId: options.id });
      this.loadDetail();
    }
  },

  onShow() {
    if (this.data.houseId) {
      this.loadDetail();
    }
  },

  loadDetail() {
    this.setData({ loading: true });
    getHouseDetail(this.data.houseId).then(res => {
      if (res.code === 200 && res.data) {
        const house = res.data;
        let images = [];
        if (house.pics) {
          try {
            images = typeof house.pics === 'string' ? JSON.parse(house.pics) : house.pics;
          } catch(e) {
            images = house.pics.split(',').filter(Boolean);
          }
        }

        const facilities = house.facilities ? house.facilities.split(',').filter(Boolean) : [];

        let displayStatus = house.status;
        if (house.auditStatus === 0) {
          displayStatus = 2; // 审核中
        } else if (house.auditStatus === 1) {
          displayStatus = 1; // 已上架
        }

        house.statusLabel = STATUS_MAP[displayStatus]?.label || '未知';
        house.statusColor = STATUS_MAP[displayStatus]?.color || '#999';
        house.statusBg = STATUS_MAP[displayStatus]?.bg || '#f5f5f5';
        house.auditStatusLabel = AUDIT_STATUS_MAP[house.auditStatus]?.label || '未知';
        house.auditStatusColor = AUDIT_STATUS_MAP[house.auditStatus]?.color || '#999';
        house.rentUnit = house.rentType === '日租' ? '天' : house.rentType === '季租' ? '季' : house.rentType === '年租' ? '年' : '月';

        this.setData({ 
          house, 
          images, 
          facilities,
          loading: false 
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '房源不存在', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onSwiperChange(e) {
    this.setData({ currentImg: e.detail.current });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images
    });
  },

  goEdit() {
    wx.navigateTo({ 
      url: `/pages/landlord/publishHouse/publishHouse?id=${this.data.houseId}` 
    });
  },

  toggleStatus() {
    if (this.data.operating) return;
    const house = this.data.house;
    
    if (house.status === 2) {
      wx.showToast({ title: '审核中无法操作', icon: 'none' });
      return;
    }

    const action = house.status === 1 ? '下架' : '上架';
    const newStatus = house.status === 1 ? 0 : 1;

    wx.showModal({
      title: `确认${action}`,
      content: `确定要${action}这个房源吗？`,
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        toggleHouseStatus(this.data.houseId, newStatus).then(() => {
          wx.showToast({ title: `已${action}`, icon: 'success' });
          this.setData({ operating: false });
          this.loadDetail();
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  deleteHouseAction() {
    if (this.data.operating) return;
    const house = this.data.house;

    if (house.status === 1) {
      wx.showToast({ title: '请先下架再删除', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个房源吗？',
      confirmColor: '#FF4444',
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        deleteHouse(this.data.houseId).then(() => {
          wx.showToast({ title: '已删除', icon: 'success' });
          this.setData({ operating: false });
          setTimeout(() => wx.navigateBack(), 1500);
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  callPhone() {
    const phone = this.data.house.hostPhone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  }
});
