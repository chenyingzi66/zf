// pages/landlord/register/register.js
const app = getApp();
const { landlordRegister, sendLandlordSms } = require('../../../utils/api.js');

Page({
  data: {
    phone: '',
    password: '',
    code: '',
    name: '',
    sendingCode: false,
    countdown: 0,
    submitting: false,
    agreed: false
  },

  onLoad(options) {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      wx.reLaunch({ url: '/pages/landlord/index/index' });
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    let value = e.detail.value;
    if (field === 'phone') {
      value = value.replace(/\s+/g, '');
    }
    this.setData({ [field]: value });
  },

  sendCode() {
    if (this.data.sendingCode || this.data.countdown > 0) return;
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ sendingCode: true });

    sendLandlordSms(this.data.phone)
      .then(() => {
        this.setData({ sendingCode: false, countdown: 60 });
        wx.showToast({ title: '验证码已发送，演示验证码为123456', icon: 'none', duration: 2000 });
        const timer = setInterval(() => {
          const next = this.data.countdown - 1;
          if (next <= 0) {
            clearInterval(timer);
            this.setData({ countdown: 0 });
          } else {
            this.setData({ countdown: next });
          }
        }, 1000);
      })
      .catch(() => {
        this.setData({ sendingCode: false });
        wx.showToast({ title: '发送失败', icon: 'none' });
      });
  },

  register() {
    if (this.data.submitting) return;
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!this.data.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (this.data.password.length < 6) {
      wx.showToast({ title: '密码长度至少6位', icon: 'none' });
      return;
    }
    if (!this.data.code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    landlordRegister(this.data.phone, this.data.password, this.data.code, this.data.name)
      .then(result => {
        console.log('房东注册结果:', result);
        if (result.code === 200 && result.data) {
          wx.setStorageSync('token', result.data.token);
          wx.setStorageSync('userInfo', result.data);
          wx.setStorageSync('userRole', 'landlord');
          
          app.globalData.token = result.data.token;
          app.globalData.userInfo = result.data;
          app.globalData.userRole = 'landlord';
          app.globalData.isLogin = true;
          
          wx.showToast({ title: '注册成功', icon: 'success' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/landlord/index/index' });
          }, 800);
        } else {
          wx.showToast({ title: result.message || '注册失败', icon: 'none' });
        }
      })
      .catch(err => {
        console.error('注册错误:', err);
        wx.showToast({ title: err.message || '注册失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  handleAgreementChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  goLogin() {
    wx.redirectTo({ url: '/pages/landlord/login/login' });
  },

  showAgreement() {
    wx.showModal({ title: '用户协议', content: '这里是用户协议的详细内容...', showCancel: false });
  },

  showPrivacy() {
    wx.showModal({ title: '隐私政策', content: '这里是隐私政策的详细内容...', showCancel: false });
  }
});
