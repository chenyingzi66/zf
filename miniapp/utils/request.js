// utils/request.js - 网络请求封装
const config = require('../config/index.js');

function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoad = false,
    silent = false
  } = options;

  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  if (showLoad) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    let token = '';
    try {
      const app = getApp();
      token = app.globalData ? app.globalData.token : '';
    } catch (e) {}

    const fullUrl = url.startsWith('http') ? url : config.apiBaseUrl + url;

    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };

    if (token) {
      requestHeader['Authorization'] = 'Bearer ' + token;
    }

    console.log(`[REQUEST] ${requestId} ${method} ${fullUrl}`, { data: JSON.stringify(data).substring(0, 200) });

    wx.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      timeout: config.apiTimeout || 30000,
      success: (res) => {
        if (showLoad) wx.hideLoading();
        
        const { statusCode, data: respData } = res;
        console.log(`[RESPONSE] ${requestId} ${statusCode}`, respData ? { code: respData.code, message: respData.message } : {});

        if (statusCode === 200) {
          if (respData.code === 200) {
            resolve(respData);
          } else if (respData.code === 401 || respData.code === 4001) {
            handleTokenExpired();
            reject({ message: respData.message || '登录已过期', code: respData.code });
          } else {
            if (!silent) {
              wx.showToast({ title: respData.message || '请求失败', icon: 'none', duration: 2000 });
            }
            reject({ message: respData.message || '请求失败', code: respData.code });
          }
        } else if (statusCode === 401) {
          handleTokenExpired();
          reject({ message: '登录已过期', code: 401 });
        } else {
          if (!silent) {
            wx.showToast({ title: '服务异常，请稍后重试', icon: 'none', duration: 2000 });
          }
          reject({ message: '网络请求失败，状态码: ' + statusCode, code: statusCode });
        }
      },
      fail: (err) => {
        if (showLoad) wx.hideLoading();
        console.error(`[REQUEST_ERROR] ${requestId} ${method} ${fullUrl}`, err);
        if (!silent) {
          wx.showToast({ title: '网络连接失败，请检查网络', icon: 'none', duration: 2000 });
        }
        reject({ message: '网络连接失败，请检查网络或后端服务', err });
      }
    });
  });
}

function handleTokenExpired() {
  try {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
  } catch (e) {}
  
  wx.showToast({ title: '登录已过期', icon: 'none', duration: 2000 });
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/welcome/welcome' });
  }, 2000);
}

function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

function put(url, data = {}, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

function del(url, data = {}, options = {}) {
  return request({ url, method: 'DELETE', data, ...options });
}

function uploadFile(uploadUrl, filePath, options = {}) {
  const { showLoad = true, name = 'file' } = options;
  
  if (showLoad) {
    wx.showLoading({ title: '上传中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    let token = '';
    try {
      const app = getApp();
      token = app.globalData ? app.globalData.token : '';
    } catch (e) {}

    const fullUrl = uploadUrl.startsWith('http') ? uploadUrl : config.apiBaseUrl + uploadUrl;

    wx.uploadFile({
      url: fullUrl,
      filePath: filePath,
      name: name,
      header: token ? { 'Authorization': 'Bearer ' + token } : {},
      success: (res) => {
        if (showLoad) wx.hideLoading();
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject({ message: data.message || '上传失败' });
          }
        } catch (e) {
          reject({ message: '上传响应解析失败' });
        }
      },
      fail: (err) => {
        if (showLoad) wx.hideLoading();
        console.error('上传失败:', err);
        reject({ message: '网络连接失败' });
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile
};
