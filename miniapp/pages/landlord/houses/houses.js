// pages/landlord/houses/houses.js
const { getLandlordHouseList, toggleHouseStatus, deleteHouse, getHouseDetail } = require('../../../utils/api.js');

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
    list: [], 
    keyword: '', 
    loading: false, 
    statusMap: STATUS_MAP,
    auditStatusMap: AUDIT_STATUS_MAP,
    operating: false,
    activeFilter: 'all'
  },

  onLoad() { this.loadHouses(); },
  onShow() { this.loadHouses(); },
  onPullDownRefresh() { this.loadHouses(); wx.stopPullDownRefresh(); },

  onInput(e) { this.setData({ keyword: e.detail.value }); },
  doSearch() { this.loadHouses(); },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.loadHouses();
  },

  loadHouses() {
    this.setData({ loading: true });
    getLandlordHouseList().then(res => {
      let rawList = res.data || [];
      console.log('Raw houses data:', rawList);
      
      if (this.data.keyword) {
        const kw = this.data.keyword.toLowerCase();
        rawList = rawList.filter(h => (h.title || '').toLowerCase().includes(kw));
      }

      if (this.data.activeFilter !== 'all') {
        const filter = parseInt(this.data.activeFilter);
        console.log('Active filter:', filter);
        const filtered = rawList.filter(h => {
          // 转换为数字类型进行比较
          const auditStatus = parseInt(h.auditStatus) || 0;
          const status = parseInt(h.status) || 0;
          
          let include = false;
          if (filter === 2) {
            // 审核中分类：显示审核中的房源
            include = auditStatus === 0;
          } else if (filter === 1) {
            // 已上架分类：显示审核通过且状态为上架的房源
            include = auditStatus === 1 && status === 1;
          } else if (filter === 0) {
            // 已下架分类：显示所有非上架状态的房源
            include = !(auditStatus === 1 && status === 1);
          }
          
          console.log('Filtering', h.title, 'auditStatus:', auditStatus, 'status:', status, 'include:', include);
          return include;
        });
        console.log('Filtered list:', filtered.map(h => h.title));
        rawList = filtered;
      }

      const list = rawList.map(h => {
        let images = [];
        if (h.pics) {
          try {
            images = typeof h.pics === 'string' ? JSON.parse(h.pics) : h.pics;
          } catch(e) {
            images = h.pics.split(',').filter(Boolean);
          }
        }
        
        // 转换为数字类型
        const auditStatus = parseInt(h.auditStatus) || 0;
        const status = parseInt(h.status) || 0;
        console.log('Processing house:', h.houseId, 'title:', h.title, 'auditStatus:', auditStatus, 'status:', status);
        let displayStatus = status;
        if (auditStatus === 0) {
          displayStatus = 2; // 审核中
        } else if (auditStatus === 1) {
          // 保持原有的status值，1是已上架，0是已下架
          displayStatus = status;
        }
        console.log('Display status for', h.title, ':', displayStatus, 'Status label:', STATUS_MAP[displayStatus]?.label);
        
        return {
          ...h,
          coverImage: images[0] || '/assets/images/default-house.png',
          statusLabel: STATUS_MAP[displayStatus]?.label || '未知',
          statusColor: STATUS_MAP[displayStatus]?.color || '#999',
          statusBg: STATUS_MAP[displayStatus]?.bg || '#f5f5f5',
          auditStatusLabel: AUDIT_STATUS_MAP[h.auditStatus]?.label || '未知',
          auditStatusColor: AUDIT_STATUS_MAP[h.auditStatus]?.color || '#999',
          displayStatus
        };
      });
      this.setData({ list, loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  goPublish() { 
    wx.navigateTo({ url: '/pages/landlord/publishHouse/publishHouse' }); 
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/landlord/house-detail/house-detail?id=${id}` });
  },

  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/landlord/publishHouse/publishHouse?id=${id}` });
  },

  toggleStatus(e) {
    if (this.data.operating) return;
    const { id, status } = e.currentTarget.dataset;
    
    if (status === 2) {
      wx.showToast({ title: '审核中无法操作', icon: 'none' }); 
      return;
    }
    
    const action = status === 1 ? '下架' : '上架';
    const newStatus = status === 1 ? 0 : 1;
    
    wx.showModal({ 
      title: `确认${action}`, 
      content: `确定要${action}这个房源吗？`, 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        toggleHouseStatus(id, newStatus).then(() => {
          wx.showToast({ title: `已${action}`, icon: 'success' });
          this.setData({ operating: false });
          this.loadHouses();
        }).catch(() => this.setData({ operating: false }));
      }
    });
  },

  deleteHouseAction(e) {
    if (this.data.operating) return;
    const { id, status } = e.currentTarget.dataset;
    
    wx.showModal({ 
      title: '确认删除', 
      content: '删除后不可恢复，确定要删除这个房源吗？', 
      confirmColor: '#FF4444', 
      success: res => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        deleteHouse(id).then(() => {
          wx.showToast({ title: '已删除', icon: 'success' });
          this.setData({ operating: false });
          this.loadHouses();
        }).catch(() => this.setData({ operating: false }));
      }
    });
  }
});
