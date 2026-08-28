// pages/landlord/stats/stats.js
const { getLandlordStats, getLandlordOrderList, getLandlordHouseList } = require('../../../utils/api.js');

Page({
  data: { 
    stats: null, 
    loading: false, 
    curMonth: '' 
  },

  onLoad() {
    const now = new Date();
    const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ curMonth: m });
    this.loadStats();
  },
  
  onPullDownRefresh() { 
    this.loadStats(); 
    wx.stopPullDownRefresh(); 
  },

  loadStats() {
    this.setData({ loading: true });
    
    // 并行获取统计数据、订单列表、房源列表
    Promise.all([
      getLandlordStats().catch(() => ({ code: 200, data: {} })),
      getLandlordOrderList().catch(() => ({ code: 200, data: [] })),
      getLandlordHouseList().catch(() => ({ code: 200, data: [] }))
    ]).then(([statsRes, ordersRes, housesRes]) => {
      const statsData = (statsRes && statsRes.code === 200 ? statsRes.data : {}) || {};
      // 后端返回的是数组，不是 { list: [] } 格式
      let orders = [];
      if (ordersRes && ordersRes.code === 200) {
        orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.list || []);
      }
      // 后端返回的是数组
      let houses = [];
      if (housesRes && housesRes.code === 200) {
        houses = Array.isArray(housesRes.data) ? housesRes.data : (housesRes.data.list || []);
      }
      
      console.log('订单数据:', orders);
      console.log('房源数据:', houses);
      
      const [curYear, curMonthStr] = this.data.curMonth.split('-');
      const targetPrefix = `${curYear}-${curMonthStr}`;
      
      // 计算本月订单统计
      let monthIncome = 0;
      let monthOrders = 0;
      let pendingOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;
      
      // 计算累计数据
      let totalIncome = 0;
      let totalOrders = orders.length;
      
      orders.forEach(o => {
        // 兼容驼峰和下划线两种字段名格式
        const orderStatus = o.orderStatus !== undefined ? o.orderStatus : (o.order_status !== undefined ? o.order_status : o.status);
        const orderAmount = parseFloat(o.totalAmount || o.total_amount || o.rentPrice || o.rent_price || 0);
        // 按照起租日计算月度数据
        const checkInDate = o.checkInDate || o.check_in_date || '';
        
        console.log('处理订单:', o.orderNo || o.order_no, '状态:', orderStatus, '金额:', orderAmount, '起租日:', checkInDate);
        
        // 累计数据（所有已支付/已完成订单）
        if (orderStatus === 2 || orderStatus === 3) {
          totalIncome += orderAmount;
        }
        
        // 统计各状态订单
        if (orderStatus === 0) pendingOrders++;
        else if (orderStatus === 2 || orderStatus === 3) completedOrders++;
        else if (orderStatus === 4 || orderStatus === -1) cancelledOrders++;
        
        // 本月数据：按照起租日计算
        if (checkInDate && checkInDate.startsWith(targetPrefix)) {
          if (orderStatus === 2 || orderStatus === 3) {
            monthIncome += orderAmount;
            monthOrders++;
            console.log('计入本月:', orderAmount);
          }
        }
      });
      
      console.log('本月收益:', monthIncome, '本月订单:', monthOrders);
      
      // 房源统计
      const totalHouses = houses.length;
      const rentedHouses = houses.filter(h => h.status === 1).length;
      const vacantHouses = totalHouses - rentedHouses;
      const rentRate = totalHouses > 0 ? ((rentedHouses / totalHouses) * 100).toFixed(1) : 0;
      
      // 计算转化率
      const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
      
      // 计算浏览量（从房源的 view_count 累加）
      const totalViews = houses.reduce((sum, h) => sum + (h.viewCount || h.view_count || 0), 0);
      
      this.setData({
        stats: {
          // 核心指标
          monthIncome: monthIncome.toFixed(2),
          monthOrders: monthOrders,
          activeTenants: rentedHouses,
          totalViews: totalViews,
          
          // 房源概况
          totalHouses: totalHouses,
          rentedHouses: rentedHouses,
          vacantHouses: vacantHouses,
          rentRate: rentRate,
          
          // 订单统计
          pendingOrders: pendingOrders,
          completedOrders: completedOrders,
          cancelledOrders: cancelledOrders,
          conversionRate: conversionRate,
          
          // 累计数据
          totalIncome: totalIncome.toFixed(2),
          totalOrders: totalOrders,
          totalTenants: completedOrders
        },
        loading: false
      });
    }).catch((err) => {
      console.error('加载统计数据失败:', err);
      this.setData({ loading: false });
    });
  },

  prevMonth() {
    const [y, m] = this.data.curMonth.split('-').map(Number);
    let ny = y, nm = m - 1;
    if (nm < 1) { ny--; nm = 12; }
    this.setData({ curMonth: `${ny}-${String(nm).padStart(2, '0')}` });
    this.loadStats();
  },

  nextMonth() {
    const [y, m] = this.data.curMonth.split('-').map(Number);
    const now = new Date();
    const nowY = now.getFullYear(), nowM = now.getMonth() + 1;
    if (y > nowY || (y === nowY && m >= nowM)) {
      wx.showToast({ title: '不能超过当前月份', icon: 'none' }); 
      return;
    }
    let ny = y, nm = m + 1;
    if (nm > 12) { ny++; nm = 1; }
    this.setData({ curMonth: `${ny}-${String(nm).padStart(2, '0')}` });
    this.loadStats();
  }
});
