// utils/account.js - 本地账号管理

/**
 * 获取所有租客账号
 */
function getTenantAccounts() {
  const accounts = wx.getStorageSync('tenantAccounts') || [];
  return accounts;
}

/**
 * 获取所有房东账号
 */
function getLandlordAccounts() {
  const accounts = wx.getStorageSync('landlordAccounts') || [];
  return accounts;
}

/**
 * 注册租客账号
 */
function registerTenant(phone, code) {
  const accounts = getTenantAccounts();
  
  // 检查手机号是否已注册
  const exists = accounts.find(acc => acc.phone === phone);
  if (exists) {
    return { success: false, message: '该手机号已注册' };
  }

  // 创建新账号
  const newAccount = {
    id: 'tenant_' + Date.now(),
    phone: phone,
    nickname: '租客用户',
    avatar: '/assets/images/default-avatar.png',
    createdAt: new Date().getTime()
  };

  accounts.push(newAccount);
  wx.setStorageSync('tenantAccounts', accounts);

  return { success: true, data: newAccount };
}

/**
 * 注册房东账号
 */
function registerLandlord(phone, password, code) {
  const accounts = getLandlordAccounts();
  
  // 检查手机号是否已注册
  const exists = accounts.find(acc => acc.phone === phone);
  if (exists) {
    return { success: false, message: '该手机号已注册' };
  }

  // 创建新账号
  const newAccount = {
    id: 'landlord_' + Date.now(),
    phone: phone,
    password: password,
    nickname: '房东用户',
    avatar: '/assets/images/default-avatar.png',
    authStatus: 'none', // none / pending / approved / rejected
    createdAt: new Date().getTime()
  };

  accounts.push(newAccount);
  wx.setStorageSync('landlordAccounts', accounts);

  return { success: true, data: newAccount };
}

/**
 * 租客登录
 */
function tenantLogin(phone, code) {
  const accounts = getTenantAccounts();
  const account = accounts.find(acc => acc.phone === phone);

  if (!account) {
    return { success: false, message: '账号不存在，请先注册' };
  }

  // 生成 token
  const token = 'tenant_token_' + phone + '_' + Date.now();
  
  return {
    success: true,
    data: {
      token: token,
      userInfo: account
    }
  };
}

/**
 * 房东登录
 */
function landlordLogin(phone, password) {
  const accounts = getLandlordAccounts();
  const account = accounts.find(acc => acc.phone === phone);

  if (!account) {
    return { success: false, message: '账号不存在，请先注册' };
  }

  if (account.password !== password) {
    return { success: false, message: '密码错误' };
  }

  // 生成 token
  const token = 'landlord_token_' + phone + '_' + Date.now();
  
  return {
    success: true,
    data: {
      token: token,
      landlord: account,
      authStatus: account.authStatus
    }
  };
}

/**
 * 更新租客信息
 */
function updateTenantInfo(phone, updates) {
  const accounts = getTenantAccounts();
  const index = accounts.findIndex(acc => acc.phone === phone);

  if (index === -1) {
    return { success: false, message: '账号不存在' };
  }

  accounts[index] = { ...accounts[index], ...updates };
  wx.setStorageSync('tenantAccounts', accounts);

  return { success: true, data: accounts[index] };
}

/**
 * 更新房东信息
 */
function updateLandlordInfo(phone, updates) {
  const accounts = getLandlordAccounts();
  const index = accounts.findIndex(acc => acc.phone === phone);

  if (index === -1) {
    return { success: false, message: '账号不存在' };
  }

  accounts[index] = { ...accounts[index], ...updates };
  wx.setStorageSync('landlordAccounts', accounts);

  return { success: true, data: accounts[index] };
}

module.exports = {
  getTenantAccounts,
  getLandlordAccounts,
  registerTenant,
  registerLandlord,
  tenantLogin,
  landlordLogin,
  updateTenantInfo,
  updateLandlordInfo
};
