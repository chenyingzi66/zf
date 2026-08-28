// utils/util.js - 通用工具函数

// 全局Loading计数器，解决重复调用导致的配对警告
let _loadingCount = 0;

/**
 * 格式化日期时间
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 格式化日期（仅日期）
 */
function formatDate(date) {
  return formatTime(date, 'YYYY-MM-DD');
}

/**
 * 计算两个日期之间的天数
 */
function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 判断日期是否为今天
 */
function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
}

/**
 * 格式化金额（保留两位小数）
 */
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toFixed(2);
}

/**
 * 格式化手机号（中间四位隐藏）
 */
function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 防抖函数
 */
function debounce(fn, delay = 500) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
function throttle(fn, delay = 1000) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 验证手机号
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证身份证号
 */
function validateIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
}

/**
 * 验证邮箱
 */
function validateEmail(email) {
  return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email);
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloneObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key]);
    }
  }
  return cloneObj;
}

/**
 * 生成唯一ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 获取图片临时路径（用于预览）
 */
function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 本地临时路径
  return path;
}

/**
 * 计算距离（米转换为公里）
 */
function formatDistance(distance) {
  if (!distance) return '';
  if (distance < 1000) {
    return distance + 'm';
  }
  return (distance / 1000).toFixed(1) + 'km';
}

/**
 * 获取相对时间描述
 */
function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前';
  } else {
    return formatDate(date);
  }
}

/**
 * 显示加载提示（修复版）
 */
function showLoading(title = '加载中...') {
  if (_loadingCount === 0) {
    wx.showLoading({
      title,
      mask: true
    });
  }
  _loadingCount++;
}

/**
 * 隐藏加载提示（修复版）
 */
function hideLoading() {
  if (_loadingCount > 0) {
    _loadingCount--;
  }
  if (_loadingCount <= 0) {
    _loadingCount = 0;
    wx.hideLoading();
  }
}

/**
 * 显示成功提示
 */
function showSuccess(title = '操作成功') {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  });
}

/**
 * 显示失败提示
 */
function showError(title = '操作失败') {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 显示确认对话框
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          reject(false);
        }
      },
      fail: reject
    });
  });
}

/**
 * 跳转页面（带权限检查）
 */
function navigateTo(url, needLogin) {
  needLogin = needLogin !== false;
  const app = getApp();
  
  if (needLogin && !app.checkLogin()) {
    wx.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/welcome/welcome' });
    }, 1500);
    return;
  }
  
  wx.navigateTo({
    url,
    fail: () => {
      wx.switchTab({
        url,
        fail: () => {
          wx.redirectTo({ url, fail: () => showError('页面跳转失败') });
        }
      });
    }
  });
}

/**
 * 返回上一页
 */
function navigateBack(delta = 1) {
  wx.navigateBack({
    delta,
    fail: () => {
      wx.switchTab({
        url: '/pages/tenant/index/index'
      });
    }
  });
}

/**
 * 获取当前页面路径
 */
function getCurrentPage() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}

/**
 * 存储数据到本地
 */
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, data);
    return true;
  } catch (e) {
    console.error('存储数据失败', e);
    return false;
  }
}

/**
 * 从本地获取数据
 */
function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('获取数据失败', e);
    return null;
  }
}

/**
 * 删除本地数据
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('删除数据失败', e);
    return false;
  }
}

module.exports = {
  formatTime,
  formatDate,
  getDaysBetween,
  isToday,
  formatMoney,
  formatPhone,
  debounce,
  throttle,
  validatePhone,
  validateIdCard,
  validateEmail,
  deepClone,
  generateId,
  getImageUrl,
  formatDistance,
  getRelativeTime,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  navigateTo,
  navigateBack,
  getCurrentPage,
  setStorage,
  getStorage,
  removeStorage
};