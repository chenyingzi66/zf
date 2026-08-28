/**
 * 管理后台 API 请求模块
 * 与后端 SpringBoot 接口对接
 */

// API 基础配置
const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',  // 后端服务地址
  timeout: 10000,
  // 业务状态码
  statusCode: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  }
};

/**
 * 通用请求方法
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    headers = {},
    timeout = API_CONFIG.timeout
  } = options;

  const fullUrl = url.startsWith('http') ? url : API_CONFIG.baseUrl + url;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = timeout;

    // 设置请求头
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // 添加 token
    const token = localStorage.getItem('admin_token');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }

    // 添加自定义请求头
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.onload = function() {
      try {
        const response = JSON.parse(xhr.responseText);
        
        if (xhr.status === 200 || xhr.status === 201) {
          // 处理业务状态码
          if (response.code === API_CONFIG.statusCode.SUCCESS || 
              response.code === API_CONFIG.statusCode.CREATED) {
            resolve(response);
          } else if (response.code === API_CONFIG.statusCode.UNAUTHORIZED) {
            // Token 失效
            handleTokenExpired();
            reject(response);
          } else {
            reject(response);
          }
        } else if (xhr.status === 401) {
          handleTokenExpired();
          reject(response);
        } else if (xhr.status === 404) {
          reject({ code: 404, message: '请求的资源不存在' });
        } else if (xhr.status >= 500) {
          reject({ code: 500, message: '服务器错误' });
        } else {
          reject(response);
        }
      } catch (e) {
        reject({ code: 500, message: '响应解析失败' });
      }
    };

    xhr.onerror = function() {
      reject({ code: 0, message: '网络连接失败' });
    };

    xhr.ontimeout = function() {
      reject({ code: 0, message: '请求超时' });
    };

    xhr.open(method, fullUrl, true);
    xhr.send(JSON.stringify(data));
  });
}

/**
 * 处理 Token 过期
 */
function handleTokenExpired() {
  localStorage.removeItem('admin_logged');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  window.location.reload();
}

/**
 * GET 请求
 */
function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return request({ url: fullUrl, method: 'GET' });
}

/**
 * POST 请求
 */
function post(url, data = {}) {
  return request({ url, method: 'POST', data });
}

/**
 * PUT 请求
 */
function put(url, data = {}) {
  return request({ url, method: 'PUT', data });
}

/**
 * DELETE 请求
 */
function del(url, data = {}) {
  return request({ url, method: 'DELETE', data });
}

// ==================== 认证相关 API ====================

/**
 * 管理员登录
 */
function adminLogin(username, password) {
  return post('/api/admin/login', { username, password });
}

/**
 * 获取管理员信息
 */
function getAdminInfo() {
  return get('/api/admin/info');
}

/**
 * 获取后台仪表盘数据
 */
function getDashboard() {
  return get('/api/admin/dashboard');
}

/**
 * 修改管理员密码
 */
function updateAdminPassword(oldPassword, newPassword) {
  return put('/api/admin/password', { oldPassword, newPassword });
}

// ==================== 房源管理 API ====================

/**
 * 获取房源列表
 */
function getHouseList(params = {}) {
  return get('/api/admin/houses', params);
}

/**
 * 获取房源详情
 */
function getHouseDetail(id) {
  return get(`/api/admin/houses/${id}`);
}

/**
 * 审核通过房源
 */
function approveHouse(id) {
  // 后端审核接口统一为 /api/admin/houses/{id}/audit
  return put(`/api/admin/houses/${id}/audit`, { status: 1 });
}

/**
 * 拒绝房源审核
 */
function rejectHouse(id, reason = '') {
  return put(`/api/admin/houses/${id}/audit`, { status: 3, reason });
}

/**
 * 上架房源
 */
function publishHouse(id) {
  return put(`/api/admin/houses/${id}/publish`);
}

/**
 * 下架房源
 */
function unpublishHouse(id) {
  return put(`/api/admin/houses/${id}/unpublish`);
}

/**
 * 删除房源
 */
function deleteHouse(id) {
  return del(`/api/admin/houses/${id}`);
}

// ==================== 订单管理 API ====================

/**
 * 获取订单列表
 */
function getOrderList(params = {}) {
  return get('/api/admin/orders', params);
}

/**
 * 获取订单详情
 */
function getOrderDetail(id) {
  return get(`/api/admin/orders/${id}`);
}

// ==================== 租客管理 API ====================

/**
 * 获取租客列表
 */
function getTenantList(params = {}) {
  return get('/api/admin/tenants', params);
}

/**
 * 获取租客详情
 */
function getTenantDetail(id) {
  return get(`/api/admin/tenants/${id}`);
}

/**
 * 删除租客
 */
function deleteTenant(id) {
  return del(`/api/admin/tenants/${id}`);
}

// ==================== 房东管理 API ====================

/**
 * 获取房东列表
 */
function getLandlordList(params = {}) {
  return get('/api/admin/landlords', params);
}

/**
 * 获取房东详情
 */
function getLandlordDetail(id) {
  return get(`/api/admin/landlords/${id}`);
}

/**
 * 审核通过房东认证
 */
function approveLandlord(id) {
  return put(`/api/admin/landlords/${id}/approve`);
}

/**
 * 拒绝房东认证
 */
function rejectLandlord(id, reason = '') {
  return put(`/api/admin/landlords/${id}/reject`, { reason });
}

/**
 * 删除房东
 */
function deleteLandlord(id) {
  return del(`/api/admin/landlords/${id}`);
}

// ==================== 反馈管理 API ====================

/**
 * 获取反馈列表
 */
function getFeedbackList(params = {}) {
  return get('/api/admin/feedbacks', params);
}

/**
 * 标记反馈为已处理
 */
function handleFeedback(id) {
  return put(`/api/admin/feedbacks/${id}/handle`);
}

// ==================== 数据统计 API ====================

/**
 * 获取仪表板数据
 */
function getDashboardData() {
  return get('/api/admin/dashboard');
}

/**
 * 获取待审核房源
 */
function getPendingHouses() {
  return get('/api/admin/houses', { status: 0, limit: 5 });
}

/**
 * 获取最新订单
 */
function getRecentOrders() {
  return get('/api/admin/orders', { limit: 5, sort: 'createTime,desc' });
}

module.exports = {
  // 认证
  adminLogin,
  getAdminInfo,
  updateAdminPassword,
  
  // 房源
  getHouseList,
  getHouseDetail,
  approveHouse,
  rejectHouse,
  publishHouse,
  unpublishHouse,
  deleteHouse,
  
  // 订单
  getOrderList,
  getOrderDetail,
  
  // 租客
  getTenantList,
  getTenantDetail,
  deleteTenant,
  
  // 房东
  getLandlordList,
  getLandlordDetail,
  approveLandlord,
  rejectLandlord,
  deleteLandlord,
  
  // 反馈
  getFeedbackList,
  handleFeedback,
  
  // 数据统计
  getDashboardData,
  getPendingHouses,
  getRecentOrders
};
