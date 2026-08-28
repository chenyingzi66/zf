// pages/tenant/login/login.js
const app = getApp();
const { tenantLogin } = require('../../../utils/api.js');

Page({
  data: {
    phone: '',
    password: '',
    agreed: false,
    submitting: false
  },

  onLoad(options) {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');
    if (token && userInfo && userRole === 'tenant') {
      wx.switchTab({ url: '/pages/tenant/index/index' });
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

  login() {
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

    this.setData({ submitting: true });

    tenantLogin(this.data.phone, this.data.password)
      .then(result => {
        console.log('租客登录结果:', result);
        if (result.code === 200 && result.data) {
          wx.setStorageSync('token', result.data.token);
          wx.setStorageSync('userInfo', result.data);
          wx.setStorageSync('userRole', 'tenant');
          
          app.globalData.token = result.data.token;
          app.globalData.userInfo = result.data;
          app.globalData.userRole = 'tenant';
          app.globalData.isLogin = true;
          
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/tenant/index/index' });
          }, 800);
        } else {
          wx.showToast({ title: result.message || '登录失败', icon: 'none' });
        }
      })
      .catch(err => {
        console.error('登录错误:', err);
        wx.showToast({ title: err.message || '登录失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  handleAgreementChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用“随心住”住房租订系统！\n\n1. 服务条款\n- 您必须是具有完全民事行为能力的自然人，或者是具有合法经营资格的组织。\n- 您在使用本系统时，必须遵守国家法律法规和社会公德。\n- 您不得利用本系统从事任何违法违规活动。\n\n2. 用户账号\n- 您需要通过手机号注册账号，确保提供的信息真实、准确、完整。\n- 您应妥善保管账号和密码，对账号下的所有行为负责。\n- 如发现账号被他人非法使用，应立即联系客服。\n\n3. 服务内容\n- 本系统提供房源浏览、搜索、预约、订单管理、实时沟通等服务。\n- 房东可以发布房源、管理订单、查看收益统计等。\n- 系统管理员负责平台运营和管理。\n\n4. 违约责任\n- 如您违反本协议，我们有权暂停或终止您的账号。\n- 因您的行为给他人造成损失的，您应承担相应的法律责任。\n\n5. 协议修改\n- 我们有权根据业务发展需要修改本协议。\n- 修改后的协议将在系统中公布，您继续使用本系统即视为同意修改后的协议。\n\n6. 法律适用\n- 本协议的订立、执行、解释及争议的解决均适用中华人民共和国法律。\n- 如发生争议，双方应协商解决；协商不成的，任何一方均有权向有管辖权的人民法院提起诉讼。',
      showCancel: false,
      confirmText: '我已阅读',
      confirmColor: '#667eea'
    });
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '感谢您使用“随心住”住房租订系统！我们重视您的隐私保护，致力于为您提供安全、可靠的服务。\n\n1. 收集的信息\n- 个人信息：包括您的手机号、姓名、身份证号等用于身份验证和联系的信息。\n- 使用信息：包括您的浏览记录、搜索历史、订单信息等。\n- 设备信息：包括您的设备型号、操作系统版本、IP地址等。\n\n2. 信息使用\n- 用于提供和改进我们的服务，如房源推荐、订单管理等。\n- 用于身份验证和安全保障，防止欺诈行为。\n- 用于与您沟通，如发送验证码、订单状态通知等。\n- 用于数据分析和统计，以优化系统性能和用户体验。\n\n3. 信息保护\n- 我们采用加密技术保护您的个人信息，防止未授权访问。\n- 我们严格限制访问您个人信息的人员范围。\n- 我们定期对系统进行安全评估和更新，确保信息安全。\n\n4. 信息共享\n- 我们不会向第三方出售您的个人信息。\n- 为了提供服务，我们可能会与第三方服务提供商共享必要的信息。\n- 法律法规要求或政府部门要求时，我们可能会披露您的信息。\n\n5. 您的权利\n- 您有权访问、修改、删除您的个人信息。\n- 您有权拒绝我们收集和使用您的某些信息。\n- 您有权注销您的账号。\n\n6. 隐私政策更新\n- 我们可能会根据业务发展和法律法规变化更新本隐私政策。\n- 更新后的隐私政策将在系统中公布，您继续使用本系统即视为同意更新后的隐私政策。',
      showCancel: false,
      confirmText: '我已阅读',
      confirmColor: '#667eea'
    });
  },

  goBack() {
    wx.navigateBack({ fail: () => { wx.reLaunch({ url: '/pages/welcome/welcome' }); } });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/tenant/register/register' });
  }
});
