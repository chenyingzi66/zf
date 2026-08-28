// pages/tenant/booking/booking.js
const { getHouseDetail, createOrder } = require('../../../utils/api.js');

Page({
  data: {
    houseId: '',
    house: null,
    guestName: '',
    guestPhone: '',
    startDate: '',
    endDate: '',
    days: 0,
    months: 0,
    unitPrice: 0,
    rentAmount: 0,
    deposit: 0,
    totalAmount: 0,
    remark: '',
    submitting: false,
    canSubmit: false,
    today: '',
    nameErr: false,
    phoneErr: false,
    startDateErr: false,
    endDateErr: false,
    rentType: '月租',
    rentUnit: '月',
    rentCount: 0,
    priceDetail: null,
    rentCountOptions: [],
    selectedRentCount: 1
  },

  onLoad(options) {
    const today = new Date();
    const todayStr = this.formatDate(today);
    this.setData({ houseId: options.houseId || '', today: todayStr });
    
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        guestName: userInfo.nickname || '',
        guestPhone: userInfo.phone || ''
      });
    }
    
    if (options.houseId) {
      this.loadHouseInfo(options.houseId);
    }
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  loadHouseInfo(id) {
    getHouseDetail(id).then(res => {
      if (res.data) {
        let images = [];
        try {
          images = JSON.parse(res.data.pics || '[]');
        } catch (e) {
          images = [];
        }
        const house = {
          ...res.data,
          images: images
        };
        const deposit = parseFloat(res.data.price) || 1000;
        const rentType = res.data.rentType || '月租';
        
        this.setData({ 
          house: house, 
          deposit: deposit,
          rentType: rentType
        });
        this.updateRentUnit();
        this.generateRentCountOptions();
        this.checkCanSubmit();
      }
    }).catch(() => {
      wx.showToast({ title: '加载房源失败', icon: 'none' });
    });
  },

  updateRentUnit() {
    const rentType = this.data.rentType;
    let rentUnit = '月';
    switch (rentType) {
      case '日租': rentUnit = '天'; break;
      case '月租': rentUnit = '月'; break;
      case '季租': rentUnit = '季'; break;
      case '年租': rentUnit = '年'; break;
      default: rentUnit = '月';
    }
    this.setData({ rentUnit });
  },

  generateRentCountOptions() {
    const rentType = this.data.rentType;
    let options = [];
    
    switch (rentType) {
      case '日租':
        for (let i = 1; i <= 30; i++) {
          options.push({ value: i, label: `${i}天` });
        }
        break;
      case '月租':
        for (let i = 1; i <= 12; i++) {
          options.push({ value: i, label: `${i}个月` });
        }
        break;
      case '季租':
        for (let i = 1; i <= 4; i++) {
          options.push({ value: i, label: `${i}个季` });
        }
        break;
      case '年租':
        for (let i = 1; i <= 3; i++) {
          options.push({ value: i, label: `${i}年` });
        }
        break;
      default:
        for (let i = 1; i <= 12; i++) {
          options.push({ value: i, label: `${i}个月` });
        }
    }
    
    this.setData({ rentCountOptions: options, selectedRentCount: 1 });
  },

  onNameInput(e) {
    this.setData({ guestName: e.detail.value, nameErr: false });
    this.checkCanSubmit();
  },

  onPhoneInput(e) {
    this.setData({ guestPhone: e.detail.value, phoneErr: false });
    this.checkCanSubmit();
  },

  pickStartDate(e) {
    const val = e.detail.value;
    if (val < this.data.today) {
      wx.showToast({ title: '不能选择过去的日期', icon: 'none' });
      return;
    }
    this.setData({ startDate: val, startDateErr: false });
    this.calcAmount();
  },

  onRentCountChange(e) {
    const index = e.detail.value;
    const selectedOption = this.data.rentCountOptions[index];
    this.setData({ selectedRentCount: selectedOption.value });
    this.calcAmount();
  },

  calcAmount() {
    const { startDate, house, rentType, selectedRentCount } = this.data;
    if (!startDate || !house) {
      this.checkCanSubmit();
      return;
    }

    const basePrice = parseFloat(house.price) || 0;
    let rentCount = selectedRentCount || 1;
    let unitPrice = 0;
    let rentAmount = 0;
    let priceDetail = null;
    let days = 0;

    switch (rentType) {
      case '日租':
        days = rentCount;
        unitPrice = basePrice;
        rentAmount = this.round2(rentCount * unitPrice);
        priceDetail = {
          type: '日租',
          unit: '天',
          count: rentCount,
          unitPrice: unitPrice,
          formula: `${rentCount}天 × ¥${unitPrice}/天`
        };
        break;
        
      case '月租':
        days = rentCount * 30;
        unitPrice = basePrice;
        rentAmount = this.round2(rentCount * unitPrice);
        priceDetail = {
          type: '月租',
          unit: '月',
          count: rentCount,
          unitPrice: unitPrice,
          formula: `${rentCount}月 × ¥${unitPrice}/月`
        };
        break;
        
      case '季租':
        days = rentCount * 90;
        unitPrice = this.round2(basePrice * 3);
        rentAmount = this.round2(rentCount * unitPrice);
        priceDetail = {
          type: '季租',
          unit: '季',
          count: rentCount,
          unitPrice: unitPrice,
          formula: `${rentCount}季 × ¥${unitPrice}/季`
        };
        break;
        
      case '年租':
        days = rentCount * 365;
        unitPrice = this.round2(basePrice * 12);
        rentAmount = this.round2(rentCount * unitPrice);
        priceDetail = {
          type: '年租',
          unit: '年',
          count: rentCount,
          unitPrice: unitPrice,
          formula: `${rentCount}年 × ¥${unitPrice}/年`
        };
        break;
        
      default:
        days = rentCount * 30;
        unitPrice = basePrice;
        rentAmount = this.round2(rentCount * unitPrice);
        priceDetail = {
          type: '月租',
          unit: '月',
          count: rentCount,
          unitPrice: unitPrice,
          formula: `${rentCount}月 × ¥${unitPrice}/月`
        };
    }

    const deposit = parseFloat(house.deposit) || basePrice;
    const totalAmount = this.round2(rentAmount + deposit);
    
    const endDate = this.calculateEndDate(startDate, days);
    
    this.setData({ 
      days: days, 
      months: Math.ceil(days / 30), 
      rentCount,
      unitPrice,
      rentAmount, 
      deposit, 
      totalAmount,
      priceDetail,
      endDate: endDate
    });
    this.checkCanSubmit();
  },

  calculateEndDate(startDate, days) {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    return this.formatDate(end);
  },

  round2(num) {
    return Math.round(num * 100) / 100;
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  checkCanSubmit() {
    const { guestName, guestPhone, startDate, house, days } = this.data;
    const phoneValid = /^1[3-9]\d{9}$/.test(guestPhone);
    const canSubmit = guestName.trim() && phoneValid && startDate && house && days > 0;
    this.setData({ canSubmit });
  },

  validateForm() {
    const { guestName, guestPhone, startDate, days } = this.data;
    let valid = true;
    
    if (!guestName || !guestName.trim()) {
      this.setData({ nameErr: true });
      wx.showToast({ title: '请输入入住人姓名', icon: 'none' });
      valid = false;
    }
    
    if (!/^1[3-9]\d{9}$/.test(guestPhone)) {
      this.setData({ phoneErr: true });
      if (valid) wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      valid = false;
    }
    
    if (!startDate) {
      this.setData({ startDateErr: true });
      if (valid) wx.showToast({ title: '请选择入住日期', icon: 'none' });
      valid = false;
    }
    
    if (days <= 0) {
      wx.showToast({ title: '租期必须大于0', icon: 'none' });
      valid = false;
    }
    
    return valid;
  },

  submitOrder() {
    if (this.data.submitting || !this.data.canSubmit) return;
    if (!this.validateForm()) return;

    const { houseId, house, guestName, guestPhone, startDate, endDate, totalAmount, deposit, rentAmount, remark, days, rentCount, rentType, unitPrice, priceDetail } = this.data;

    const priceInfo = priceDetail ? 
      `租住方式：${priceDetail.type}\n租期：${priceDetail.count}${priceDetail.unit}（共${days}天）\n单价：¥${priceDetail.unitPrice}/${priceDetail.unit}\n租金：¥${rentAmount}\n押金：¥${deposit}\n总计：¥${totalAmount}` :
      `租金：¥${rentAmount}\n押金：¥${deposit}\n总计：¥${totalAmount}`;

    wx.showModal({
      title: '确认预定',
      content: `入住人：${guestName}\n手机号：${guestPhone}\n入住日期：${startDate}\n退房日期：${endDate}\n\n${priceInfo}\n\n确认提交订单？`,
      confirmText: '确认预定',
      confirmColor: '#4A90E2',
      success: (res) => {
        if (!res.confirm) return;
        
        this.setData({ submitting: true });

        const orderData = {
          houseId: houseId,
          houseTitle: house.title,
          houseImage: house.images[0] || '',
          housePrice: house.price,
          houseAddress: `${house.city} ${house.district} ${house.address || ''}`,
          hostId: house.hostId,
          guestName: guestName,
          guestPhone: guestPhone,
          startDate: startDate,
          endDate: endDate,
          days: days,
          months: rentCount,
          rentType: rentType,
          rentCount: rentCount,
          unitPrice: unitPrice,
          rentAmount: rentAmount,
          deposit: deposit,
          totalAmount: totalAmount,
          remark: remark
        };

        createOrder(orderData).then(orderRes => {
          this.setData({ submitting: false });
          if (orderRes.code === 200) {
            wx.showToast({ title: '预定成功', icon: 'success' });
            setTimeout(() => {
              wx.switchTab({ url: '/pages/tenant/orders/orders' });
            }, 1500);
          } else {
            wx.showToast({ title: orderRes.message || '预定失败', icon: 'none' });
          }
        }).catch(() => {
          this.setData({ submitting: false });
          wx.showToast({ title: '网络错误，请重试', icon: 'none' });
        });
      }
    });
  }
});
