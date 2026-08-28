// utils/mock.js - 模拟数据（完整版）

// ==================== 基础数据 ====================

const mockHouses = [
  {
    id: 'house_001',
    title: '精装两室一厅 近地铁 拎包入住',
    description: '房屋位于市中心，交通便利，周边配套设施齐全，精装修，家具家电齐全，拎包入住。',
    price: 3500,
    deposit: 3500,
    area: 85,
    floor: '10/20',
    orientation: '南北',
    houseType: '2室1厅1卫',
    region: '朝阳区',
    address: '北京市朝阳区建国路88号',
    latitude: 39.908823,
    longitude: 116.397470,
    images: [
      'https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House1-1',
      'https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House1-2',
      'https://via.placeholder.com/750x500/FA8C16/FFFFFF?text=House1-3'
    ],
    facilities: ['空调', '冰箱', '洗衣机', '热水器', '宽带', '电视', '沙发', '床'],
    status: 'online',
    viewCount: 128,
    landlordId: 'landlord_001',
    landlordName: '张先生',
    landlordPhone: '13800138001',
    landlordAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=L1',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-03-10 15:20:00'
  },
  {
    id: 'house_002',
    title: '温馨单间 独立卫浴 价格实惠',
    description: '单间出租，独立卫浴，采光好，安静舒适，适合单身人士或情侣居住。',
    price: 1800,
    deposit: 1800,
    area: 25,
    floor: '5/10',
    orientation: '南',
    houseType: '1室0厅1卫',
    region: '海淀区',
    address: '北京市海淀区中关村大街100号',
    latitude: 39.988823,
    longitude: 116.317470,
    images: [
      'https://via.placeholder.com/750x500/FF4444/FFFFFF?text=House2-1',
      'https://via.placeholder.com/750x500/9C27B0/FFFFFF?text=House2-2'
    ],
    facilities: ['空调', '热水器', '宽带', '床', '衣柜'],
    status: 'online',
    viewCount: 89,
    landlordId: 'landlord_002',
    landlordName: '李女士',
    landlordPhone: '13900139002',
    landlordAvatar: 'https://via.placeholder.com/200x200/FF4444/FFFFFF?text=L2',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-03-12 11:00:00'
  },
  {
    id: 'house_003',
    title: '豪华三室两厅 高层景观房',
    description: '豪华装修，高层景观房，视野开阔，采光极佳，小区环境优美，物业管理完善。',
    price: 6800,
    deposit: 6800,
    area: 120,
    floor: '18/25',
    orientation: '南',
    houseType: '3室2厅2卫',
    region: '东城区',
    address: '北京市东城区王府井大街50号',
    latitude: 39.918823,
    longitude: 116.407470,
    images: [
      'https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House3-1',
      'https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House3-2',
      'https://via.placeholder.com/750x500/FA8C16/FFFFFF?text=House3-3',
      'https://via.placeholder.com/750x500/9C27B0/FFFFFF?text=House3-4'
    ],
    facilities: ['空调', '冰箱', '洗衣机', '热水器', '宽带', '电视', '沙发', '床', '衣柜', '书桌'],
    status: 'online',
    viewCount: 256,
    landlordId: 'landlord_001',
    landlordName: '张先生',
    landlordPhone: '13800138001',
    landlordAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=L1',
    createdAt: '2024-01-20 14:00:00',
    updatedAt: '2024-03-11 16:30:00'
  },
  {
    id: 'house_004',
    title: '朝南两室 电梯房 停车方便',
    description: '标准两室户型，采光充足，配套电梯，小区内设停车位，生活便利。',
    price: 4200,
    deposit: 4200,
    area: 90,
    floor: '8/15',
    orientation: '南',
    houseType: '2室1厅1卫',
    region: '朝阳区',
    address: '北京市朝阳区望京路20号',
    latitude: 39.998823,
    longitude: 116.487470,
    images: [
      'https://via.placeholder.com/750x500/FA8C16/FFFFFF?text=House4-1',
      'https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House4-2'
    ],
    facilities: ['空调', '冰箱', '洗衣机', '热水器', '宽带', '床', '衣柜'],
    status: 'offline',
    viewCount: 67,
    landlordId: 'landlord_001',
    landlordName: '张先生',
    landlordPhone: '13800138001',
    landlordAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=L1',
    createdAt: '2024-02-10 10:00:00',
    updatedAt: '2024-03-01 09:00:00'
  }
];

const mockOrders = [
  {
    id: 'order_001',
    orderNo: 'SXZ202403130001',
    houseId: 'house_001',
    houseTitle: '精装两室一厅 近地铁 拎包入住',
    houseImage: 'https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House1-1',
    tenantId: 'tenant_001',
    tenantName: '王小明',
    tenantPhone: '13700137001',
    tenantAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    landlordId: 'landlord_001',
    landlordName: '张先生',
    checkInDate: '2024-04-01',
    checkOutDate: '2024-07-01',
    days: 91,
    rentPrice: 3500,
    deposit: 3500,
    totalAmount: 10500,
    remark: '希望提前入住',
    status: 'pending',
    createdAt: '2024-03-13 10:00:00',
    updatedAt: '2024-03-13 10:00:00'
  },
  {
    id: 'order_002',
    orderNo: 'SXZ202403120001',
    houseId: 'house_002',
    houseTitle: '温馨单间 独立卫浴 价格实惠',
    houseImage: 'https://via.placeholder.com/750x500/FF4444/FFFFFF?text=House2-1',
    tenantId: 'tenant_001',
    tenantName: '王小明',
    tenantPhone: '13700137001',
    tenantAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    landlordId: 'landlord_002',
    landlordName: '李女士',
    checkInDate: '2024-03-15',
    checkOutDate: '2024-06-15',
    days: 92,
    rentPrice: 1800,
    deposit: 1800,
    totalAmount: 5400,
    remark: '',
    status: 'confirmed',
    createdAt: '2024-03-12 15:30:00',
    updatedAt: '2024-03-12 16:00:00'
  },
  {
    id: 'order_003',
    orderNo: 'SXZ202402200001',
    houseId: 'house_003',
    houseTitle: '豪华三室两厅 高层景观房',
    houseImage: 'https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House3-1',
    tenantId: 'tenant_002',
    tenantName: '刘晓华',
    tenantPhone: '13600136001',
    tenantAvatar: 'https://via.placeholder.com/200x200/FA8C16/FFFFFF?text=T2',
    landlordId: 'landlord_001',
    landlordName: '张先生',
    checkInDate: '2024-03-01',
    checkOutDate: '2024-09-01',
    days: 184,
    rentPrice: 6800,
    deposit: 6800,
    totalAmount: 40800,
    remark: '需要带宠物入住',
    status: 'completed',
    createdAt: '2024-02-20 09:00:00',
    updatedAt: '2024-03-01 10:00:00'
  }
];

const mockFavorites = ['house_001', 'house_003'];

const mockMessages = [
  {
    id: 'msg_001',
    conversationId: 'conv_tenant001_landlord001_house001',
    senderId: 'tenant_001',
    senderName: '王小明',
    senderAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    receiverId: 'landlord_001',
    receiverName: '张先生',
    receiverAvatar: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1',
    houseId: 'house_001',
    houseTitle: '精装两室一厅 近地铁 拎包入住',
    type: 'text',
    content: '您好，这个房子还在出租吗？',
    isRead: true,
    createdAt: '2024-03-13 09:00:00'
  },
  {
    id: 'msg_002',
    conversationId: 'conv_tenant001_landlord001_house001',
    senderId: 'landlord_001',
    senderName: '张先生',
    senderAvatar: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1',
    receiverId: 'tenant_001',
    receiverName: '王小明',
    receiverAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    houseId: 'house_001',
    houseTitle: '精装两室一厅 近地铁 拎包入住',
    type: 'text',
    content: '在的，欢迎随时看房！',
    isRead: true,
    createdAt: '2024-03-13 09:05:00'
  },
  {
    id: 'msg_003',
    conversationId: 'conv_tenant001_landlord001_house001',
    senderId: 'tenant_001',
    senderName: '王小明',
    senderAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    receiverId: 'landlord_001',
    receiverName: '张先生',
    receiverAvatar: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1',
    houseId: 'house_001',
    houseTitle: '精装两室一厅 近地铁 拎包入住',
    type: 'text',
    content: '请问可以周末看房吗？',
    isRead: false,
    createdAt: '2024-03-13 09:10:00'
  }
];

const mockBanners = [
  { id: 'banner_001', image: 'https://via.placeholder.com/750x300/4A90E2/FFFFFF?text=随心住优质租房', link: '', title: '优质租房平台' },
  { id: 'banner_002', image: 'https://via.placeholder.com/750x300/52C41A/FFFFFF?text=精选房源推荐', link: '', title: '精选房源' },
  { id: 'banner_003', image: 'https://via.placeholder.com/750x300/FA8C16/FFFFFF?text=新用户专享', link: '', title: '新用户专享' }
];

// 模拟租客数据（用于房东租客管理）
const mockTenants = [
  {
    id: 'tenant_001',
    tenantId: 'tenant_001',
    nickName: '王小明',
    phone: '137****7001',
    avatarUrl: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
    houseId: 'house_001',
    houseTitle: '精装两室一厅 近地铁 拎包入住',
    landlordId: 'landlord_001',
    startDate: '2024-04-01',
    endDate: '2024-07-01',
    orderId: 'order_001'
  },
  {
    id: 'tenant_002',
    tenantId: 'tenant_002',
    nickName: '刘晓华',
    phone: '136****6001',
    avatarUrl: 'https://via.placeholder.com/200x200/FA8C16/FFFFFF?text=T2',
    houseId: 'house_003',
    houseTitle: '豪华三室两厅 高层景观房',
    landlordId: 'landlord_001',
    startDate: '2024-03-01',
    endDate: '2024-09-01',
    orderId: 'order_003'
  }
];

// ==================== Mock API ====================

const mockApi = {
  // ---------- 公共 ----------
  tenantLogin: () => ({
    code: 200, message: '登录成功',
    data: {
      token: 'mock_token_tenant_' + Date.now(),
      userInfo: { id: 'tenant_001', nickName: '王小明', avatarUrl: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=User', phone: '13700137001', role: 'tenant' }
    }
  }),

  landlordLogin: () => ({
    code: 200, message: '登录成功',
    data: {
      token: 'mock_token_landlord_' + Date.now(),
      userInfo: { id: 'landlord_001', nickName: '张先生', avatarUrl: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1', phone: '13800138001', role: 'landlord', certStatus: 'approved', realName: '张三', idCard: '110101199001011234', joinTime: '2024-01-01' }
    }
  }),

  // ---------- 租客端 ----------
  getBanners: () => ({ code: 200, message: '获取成功', data: mockBanners }),

  getHouseList: (data) => {
    let list = mockHouses.filter(h => h.status === 'online');
    if (data && data.keyword) list = list.filter(h => h.title.includes(data.keyword) || h.address.includes(data.keyword));
    if (data && data.region) list = list.filter(h => h.region === data.region);
    if (data && data.houseType) list = list.filter(h => h.houseType.startsWith(data.houseType));
    if (data && data.minPrice) list = list.filter(h => h.price >= data.minPrice);
    if (data && data.maxPrice) list = list.filter(h => h.price <= data.maxPrice);
    if (data && data.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (data && data.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (data && data.sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { code: 200, message: '获取成功', data: { list, total: list.length, page: (data && data.page) || 1, pageSize: (data && data.pageSize) || 10 } };
  },

  getHouseDetail: (data) => {
    const house = mockHouses.find(h => h.id === data.id);
    return { code: 200, message: '获取成功', data: house || null };
  },

  checkFavorite: (data) => ({
    code: 200, message: '获取成功',
    data: { isFavorite: mockFavorites.includes(data.houseId) }
  }),

  getFavorites: () => {
    const list = mockHouses.filter(h => mockFavorites.includes(h.id));
    return { code: 200, message: '获取成功', data: list };
  },

  addFavorite: (data) => {
    if (!mockFavorites.includes(data.houseId)) mockFavorites.push(data.houseId);
    return { code: 200, message: '收藏成功', data: null };
  },

  removeFavorite: (data) => {
    const idx = mockFavorites.indexOf(data.houseId);
    if (idx > -1) mockFavorites.splice(idx, 1);
    return { code: 200, message: '取消成功', data: null };
  },

  createOrder: (data) => {
    // 检查日期冲突（同一房源同一时段）
    const conflict = mockOrders.find(o =>
      o.houseId === data.houseId &&
      ['pending', 'confirmed'].includes(o.status) &&
      data.checkInDate < o.checkOutDate &&
      data.checkOutDate > o.checkInDate
    );
    if (conflict) return { code: 409, message: '该时段已有预定，请选择其他日期', data: null };

    const newOrder = {
      id: 'order_' + Date.now(),
      orderNo: 'SXZ' + Date.now(),
      houseImage: (mockHouses.find(h => h.id === data.houseId) || {}).images && (mockHouses.find(h => h.id === data.houseId) || {}).images[0] || '',
      tenantName: '王小明',
      tenantPhone: '13700137001',
      tenantAvatar: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1',
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      ...data
    };
    mockOrders.unshift(newOrder);
    return { code: 200, message: '预定成功', data: newOrder };
  },

  getOrderList: (data) => {
    let list = mockOrders.filter(o => o.tenantId === 'tenant_001');
    if (data && data.status) list = list.filter(o => o.status === data.status);
    return { code: 200, message: '获取成功', data: { list, total: list.length } };
  },

  getOrderDetail: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    return { code: 200, message: '获取成功', data: order || null };
  },

  cancelOrder: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    if (!['pending'].includes(order.status)) return { code: 400, message: '当前状态不可取消', data: null };
    order.status = 'cancelled';
    order.updatedAt = new Date().toLocaleString();
    return { code: 200, message: '取消成功', data: null };
  },

  getTenantProfile: () => ({
    code: 200, message: '获取成功',
    data: { id: 'tenant_001', nickName: '王小明', avatarUrl: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=User', phone: '13700137001', role: 'tenant', joinTime: '2024-01-15' }
  }),

  submitFeedback: () => ({ code: 200, message: '提交成功', data: null }),

  // ---------- 消息 ----------
  getConversationList: (data) => {
    const userId = data && data.userId;
    const role = data && data.role;
    // 按会话分组，取最新一条
    const convMap = {};
    mockMessages.forEach(msg => {
      if (role === 'landlord' && msg.receiverId !== userId && msg.senderId !== userId) return;
      if (role === 'tenant' && msg.receiverId !== userId && msg.senderId !== userId) return;
      const key = msg.conversationId;
      if (!convMap[key] || msg.createdAt > convMap[key].lastMsg.createdAt) {
        convMap[key] = {
          conversationId: key,
          houseId: msg.houseId,
          houseTitle: msg.houseTitle,
          peerId: msg.senderId === userId ? msg.receiverId : msg.senderId,
          peerName: msg.senderId === userId ? msg.receiverName : msg.senderName,
          peerAvatar: msg.senderId === userId ? msg.receiverAvatar : msg.senderAvatar,
          lastMsg: msg,
          unreadCount: 0
        };
      }
    });
    const list = Object.values(convMap);
    return { code: 200, message: '获取成功', data: list };
  },

  getMessageList: (data) => {
    const { conversationId } = data || {};
    let list = mockMessages;
    if (conversationId) list = list.filter(m => m.conversationId === conversationId);
    return { code: 200, message: '获取成功', data: list };
  },

  sendMessage: (data) => {
    const newMsg = {
      id: 'msg_' + Date.now(),
      type: 'text',
      isRead: false,
      createdAt: new Date().toLocaleString(),
      ...data
    };
    mockMessages.push(newMsg);
    return { code: 200, message: '发送成功', data: newMsg };
  },

  markRead: () => ({ code: 200, message: '已读', data: null }),

  // ---------- 房东端 ----------
  getLandlordProfile: () => ({
    code: 200, message: '获取成功',
    data: {
      id: 'landlord_001',
      nickName: '张先生',
      avatarUrl: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1',
      phone: '13800138001',
      role: 'landlord',
      certStatus: 'approved',
      realName: '张三',
      idCard: '110101199001011234',
      joinTime: '2024-01-01'
    }
  }),

  getLandlordHouses: (data) => {
    let list = mockHouses.filter(h => h.landlordId === 'landlord_001');
    if (data && data.keyword) list = list.filter(h => h.title.includes(data.keyword));
    if (data && data.status) list = list.filter(h => h.status === data.status);
    return { code: 200, message: '获取成功', data: { list, total: list.length } };
  },

  publishHouse: (data) => {
    const newHouse = {
      id: 'house_' + Date.now(),
      landlordId: 'landlord_001',
      landlordName: '张先生',
      landlordPhone: '13800138001',
      landlordAvatar: 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1',
      status: 'pending',
      viewCount: 0,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      ...data
    };
    mockHouses.push(newHouse);
    return { code: 200, message: '发布成功，等待审核', data: newHouse };
  },

  updateHouse: (data) => {
    const house = mockHouses.find(h => h.id === data.id);
    if (!house) return { code: 404, message: '房源不存在', data: null };
    Object.assign(house, data, { updatedAt: new Date().toLocaleString() });
    return { code: 200, message: '更新成功', data: house };
  },

  toggleHouseStatus: (data) => {
    const house = mockHouses.find(h => h.id === data.id);
    if (!house) return { code: 404, message: '房源不存在', data: null };
    house.status = data.status;
    house.updatedAt = new Date().toLocaleString();
    return { code: 200, message: data.status === 'online' ? '上架成功' : '下架成功', data: house };
  },

  deleteHouse: (data) => {
    const idx = mockHouses.findIndex(h => h.id === data.id);
    if (idx > -1) mockHouses.splice(idx, 1);
    return { code: 200, message: '删除成功', data: null };
  },

  getLandlordOrders: (data) => {
    let list = mockOrders.filter(o => o.landlordId === 'landlord_001');
    if (data && data.status) list = list.filter(o => o.status === data.status);
    return { code: 200, message: '获取成功', data: { list, total: list.length } };
  },

  getLandlordOrderDetail: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    return { code: 200, message: '获取成功', data: order || null };
  },

  confirmOrder: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    if (order.status !== 'pending') return { code: 400, message: '订单状态不允许此操作', data: null };
    order.status = 'confirmed';
    order.updatedAt = new Date().toLocaleString();
    return { code: 200, message: '确认成功', data: null };
  },

  rejectOrder: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    if (order.status !== 'pending') return { code: 400, message: '订单状态不允许此操作', data: null };
    order.status = 'rejected';
    order.rejectReason = data.reason || '房东拒绝';
    order.updatedAt = new Date().toLocaleString();
    return { code: 200, message: '已拒绝', data: null };
  },

  completeOrder: (data) => {
    const order = mockOrders.find(o => o.id === data.id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    if (order.status !== 'confirmed') return { code: 400, message: '订单状态不允许此操作', data: null };
    order.status = 'completed';
    order.updatedAt = new Date().toLocaleString();
    return { code: 200, message: '已完结', data: null };
  },

  getLandlordTenants: () => ({
    code: 200, message: '获取成功',
    data: mockTenants.filter(t => t.landlordId === 'landlord_001')
  }),

  getLandlordStats: (data) => {
    const month = (data && data.month) || '';
    return {
      code: 200, message: '获取成功',
      data: {
        month,
        monthIncome: 28500,
        newOrders: 5,
        activeTenants: 2,
        totalViews: 473,
        totalHouses: 4,
        rentedHouses: 3,
        vacantHouses: 1,
        rentRate: 75,
        pendingOrders: 1,
        completedOrders: 8,
        cancelledOrders: 2,
        conversionRate: 72,
        totalIncome: 186800,
        totalOrders: 15,
        totalTenants: 9
      }
    };
  },

  getLandlordDashboard: () => ({
    code: 200, message: '获取成功',
    data: {
      pendingOrders: 1,
      unreadMessages: 2,
      totalHouses: 4,
      rentedHouses: 3,
      monthIncome: 28500,
      newOrdersToday: 1
    }
  }),

  // 短信验证码（模拟）
  sendSmsCode: () => ({ code: 200, message: '验证码已发送', data: null }),

  // 租客 手机绑定
  bindPhone: () => ({
    code: 200, message: '绑定成功',
    data: {
      token: 'mock_token_tenant_' + Date.now(),
      userInfo: { id: 'tenant_001', nickName: '王小明', avatarUrl: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=User', phone: '13700137001', role: 'tenant' }
    }
  }),

  // 房东实名认证提交
  submitCert: () => ({ code: 200, message: '认证提交成功，等待审核', data: null }),

  // 用户协议相关
  getAgreement: () => ({ code: 200, message: '获取成功', data: { content: '本协议仅供演示使用，请遵守相关法律法规。' } })
};

module.exports = mockApi;
