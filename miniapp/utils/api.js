// utils/api.js - API 请求封装
const { get, post } = require('./request.js');

function getUserId() {
  let userId = '';
  try {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const userRole = app.globalData.userRole || 'tenant';
    
    if (userRole === 'landlord') {
      userId = userInfo.hostId || userInfo.userId || userInfo.id || '';
    } else {
      userId = userInfo.userId || userInfo.id || '';
    }
  } catch (e) {
    console.error('获取用户ID失败:', e);
  }
  return userId;
}

function getUserRole() {
  try {
    const app = getApp();
    return app.globalData.userRole || 'tenant';
  } catch (e) {
    return 'tenant';
  }
}

// ==================== 认证相关 API ====================

function tenantLogin(phone, password) {
  return post('/user/login', { phone, password }, { showLoad: true });
}

function tenantRegister(phone, password, code) {
  return post('/user/register', { phone, password, code }, { showLoad: true });
}

function sendTenantSms(phone) {
  return post('/user/sms', { phone }, { showLoad: false });
}

function landlordLogin(phone, password) {
  return post('/host/login', { phone, password }, { showLoad: true });
}

function landlordRegister(phone, password, code, name) {
  return post('/host/register', { phone, password, code, name }, { showLoad: true });
}

function sendLandlordSms(phone) {
  return post('/host/sms', { phone }, { showLoad: false });
}

function getUserInfo() {
  return get('/user/info', {}, { showLoad: true });
}

function updateUserInfo(data) {
  return post('/user/update', data, { showLoad: true });
}

function getLandlordInfo() {
  return get('/host/info', {}, { showLoad: true });
}

function updateLandlordInfo(data) {
  return post('/host/update', data, { showLoad: true });
}

// ==================== 房源相关 API ====================

function getBanners() {
  return get('/banner/list', {}, { showLoad: false });
}

function getHouseList(params = {}) {
  return get('/house/list', params, { showLoad: true });
}

function getTenantHouseList() {
  return get('/house/active', {}, { showLoad: true });
}

function getHouseDetail(houseId) {
  return get('/house/detail/' + houseId);
}

// 收藏相关
function getFavoriteList() {
  return get('/collect/list');
}

function addFavorite(houseId) {
  return post('/collect/add', { houseId });
}

function removeFavorite(houseId) {
  return post('/collect/cancel', { houseId });
}

function checkFavorite(houseId) {
  return get('/collect/check/' + houseId);
}

function collectHouse(houseId) {
  return post('/collect/add', { houseId }, { showLoad: true });
}

function cancelCollect(houseId) {
  return post('/collect/cancel', { houseId }, { showLoad: true });
}

function publishHouse(data) {
  return post('/house/publish', data, { showLoad: true });
}

function updateHouse(data) {
  return post('/house/update', data, { showLoad: true });
}

function getLandlordHouseList() {
  return get('/house/host/list', {}, { showLoad: true });
}

function toggleHouseStatus(houseId, status) {
  return post(`/house/status/${houseId}/${status}`, {}, { showLoad: true });
}

function deleteHouse(houseId) {
  return post('/house/delete/' + houseId, {}, { showLoad: true });
}

// ==================== 订单相关 API ====================

function createOrder(data) {
  return post('/order/create', data, { showLoad: true });
}

function getTenantOrderList(status) {
  const params = {};
  if (status !== null && status !== undefined) {
    params.status = status;
  }
  return get('/order/user/list', params, { showLoad: true });
}

function getLandlordOrderList(status) {
  const params = {};
  if (status !== null && status !== undefined) {
    params.status = status;
  }
  return get('/order/host/list', params, { showLoad: true });
}

function getOrderDetail(orderId) {
  return get('/order/detail/' + orderId, {}, { showLoad: true });
}

function updateOrderStatus(orderNo, status) {
  return post('/order/status', { orderNo, status }, { showLoad: true });
}

function getLandlordPendingOrders() {
  return get('/order/host/pending', {}, { showLoad: true });
}

function getLandlordStats() {
  return get('/host/stats', {}, { showLoad: true });
}

// ==================== 消息相关 API ====================

function getMessageList(peerId) {
  const userId = getUserId();
  return get('/message/history/' + peerId, { userId }, { showLoad: true });
}

function sendMessage(receiveId, content, extra = {}) {
  const sendId = getUserId();
  return post('/message/send', { sendId, receiveId, content, ...extra }, { showLoad: false });
}

function getUnreadCount() {
  const userId = getUserId();
  return get('/message/unread', { userId }, { showLoad: false });
}

function getConversations() {
  const userId = getUserId();
  return get('/message/conversations', { userId }, { showLoad: true });
}

function getConversationHistory(tenantId, landlordId, houseId) {
  const userId = getUserId();
  return get('/message/conversation', { tenantId, landlordId, houseId, userId }, { showLoad: true });
}

function markMessagesAsRead(peerId, tenantId, landlordId, houseId) {
  const userId = getUserId();
  return post('/message/read', { userId, peerId, tenantId, landlordId, houseId }, { showLoad: false });
}

function deleteMessages(tenantId, landlordId, houseId) {
  return post('/message/delete', { tenantId, landlordId, houseId }, { showLoad: true });
}

// ==================== 反馈相关 API ====================

function submitFeedback(data) {
  return post('/feedback/submit', data, { showLoad: true });
}

function getUserFeedback() {
  return get('/feedback/list', {}, { showLoad: true });
}

module.exports = {
  // 认证相关
  tenantLogin,
  tenantRegister,
  sendTenantSms,
  landlordLogin,
  landlordRegister,
  sendLandlordSms,
  getUserInfo,
  updateUserInfo,
  getLandlordInfo,
  updateLandlordInfo,
  
  // 房源相关
  getBanners,
  getHouseList,
  getTenantHouseList,
  getHouseDetail,
  collectHouse,
  cancelCollect,
  checkFavorite,
  getFavoriteList,
  addFavorite,
  removeFavorite,
  publishHouse,
  updateHouse,
  getLandlordHouseList,
  toggleHouseStatus,
  deleteHouse,
  
  // 订单相关
  createOrder,
  getTenantOrderList,
  getLandlordOrderList,
  getOrderDetail,
  updateOrderStatus,
  getLandlordPendingOrders,
  getLandlordStats,
  
  // 消息相关
  getMessageList,
  sendMessage,
  getUnreadCount,
  getConversations,
  getConversationHistory,
  markMessagesAsRead,
  deleteMessages,
  
  // 反馈相关
  submitFeedback,
  getUserFeedback
};
