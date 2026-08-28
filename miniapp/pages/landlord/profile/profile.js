// pages/landlord/profile/profile.js
const app = getApp();
const { getLandlordInfo } = require('../../../utils/api.js');
const { post } = require('../../../utils/request.js');

// 直接在页面中定义updateLandlordInfo函数
function updateLandlordInfo(data) {
  return post('/host/update', data, { showLoad: true });
}

Page({
  data: { 
    landlord: null, 
    loading: false,
    editField: '',
    editValue: '',
    showEditModal: false
  },

  onLoad() { 
    this.loadProfile(); 
  },
  
  onShow() { 
    this.loadProfile(); 
  },
  
  onPullDownRefresh() { 
    this.loadProfile(); 
    wx.stopPullDownRefresh(); 
  },

  loadProfile() {
    this.setData({ loading: true });
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    if (!token || !userInfo) {
      wx.redirectTo({ url: '/pages/landlord/login/login' });
      return;
    }
    
    getLandlordInfo()
      .then(res => {
        if (res.code === 200 && res.data) {
          const landlord = res.data;
          const idCard = landlord.idCard || '';
          landlord.idCardMasked = idCard.length >= 8
            ? idCard.slice(0, 4) + '****' + idCard.slice(-4)
            : (idCard ? idCard : '未填写');
          this.setData({ landlord, loading: false });
          app.globalData.userInfo = landlord;
          wx.setStorageSync('userInfo', landlord);
        } else {
          this.setData({ 
            landlord: userInfo, 
            loading: false 
          });
        }
      })
      .catch(err => {
        console.error('获取房东信息失败', err);
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({ 
          landlord: userInfo || { hostId: '未知' }, 
          loading: false 
        });
      });
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/landlord/index/index' });
      }
    });
  },

  goHome() {
    wx.reLaunch({ url: '/pages/landlord/index/index' });
  },

  showEditDialog(e) {
    const field = e.currentTarget.dataset.field;
    const fieldNames = {
      name: '房东名称',
      realName: '真实姓名',
      idCard: '身份证号',
      avatar: '头像'
    };
    
    if (field === 'avatar') {
      this.chooseAvatar();
      return;
    }
    
    const landlord = this.data.landlord;
    let currentValue = '';
    if (field === 'name') {
      currentValue = landlord.name || '';
    } else if (field === 'realName') {
      currentValue = landlord.realName || '';
    } else if (field === 'idCard') {
      currentValue = landlord.idCard || '';
    }
    
    this.setData({
      editField: field,
      editValue: currentValue,
      editTitle: fieldNames[field]
    });
    
    wx.showModal({
      title: '修改' + fieldNames[field],
      editable: true,
      placeholderText: '请输入' + fieldNames[field],
      content: currentValue,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.updateField(field, res.content.trim());
        }
      }
    });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  uploadAvatar(filePath) {
    const that = this;
    
    wx.uploadFile({
      url: 'http://localhost:8080/upload/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200 && data.data) {
          that.updateAvatar(data.data);
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  updateAvatar(avatarUrl) {
    this.setData({ loading: true });
    
    updateLandlordInfo({ avatar: avatarUrl })
      .then(res => {
        if (res.code === 200) {
          const landlord = { ...this.data.landlord, avatar: avatarUrl };
          this.setData({ landlord, loading: false });
          app.globalData.userInfo = landlord;
          wx.setStorageSync('userInfo', landlord);
          wx.showToast({ title: '头像更新成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.message || '更新失败', icon: 'none' });
          this.setData({ loading: false });
        }
      })
      .catch(err => {
        wx.showToast({ title: err.message || '更新失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  updateField(field, value) {
    if (field === 'idCard' && value && !/^\d{17}[\dXx]$/.test(value)) {
      wx.showToast({ title: '请输入正确的身份证号', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    const updateData = {};
    updateData[field] = value;
    
    updateLandlordInfo(updateData)
      .then(res => {
        if (res.code === 200) {
          const landlord = { ...this.data.landlord };
          landlord[field] = value;
          
          if (field === 'idCard') {
            landlord.idCardMasked = value.length >= 8
              ? value.slice(0, 4) + '****' + value.slice(-4)
              : value;
          }
          
          this.setData({ landlord, loading: false });
          app.globalData.userInfo = landlord;
          wx.setStorageSync('userInfo', landlord);
          wx.showToast({ title: '修改成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.message || '修改失败', icon: 'none' });
          this.setData({ loading: false });
        }
      })
      .catch(err => {
        wx.showToast({ title: err.message || '修改失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  goFeedback() { 
    wx.navigateTo({ url: '/pages/landlord/feedback/feedback' }); 
  },

  switchToTenant() {
    wx.showModal({
      title: '切换角色', 
      content: '确认切换回租客端？',
      success: res => {
        if (!res.confirm) return;
        wx.setStorageSync('userRole', 'tenant');
        wx.switchTab({ url: '/pages/tenant/index/index' });
      }
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录', 
      content: '确认退出房东账号？', 
      confirmColor: '#FF4444',
      success: res => {
        if (!res.confirm) return;
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');
        wx.reLaunch({ url: '/pages/welcome/welcome' });
      }
    });
  }
});
