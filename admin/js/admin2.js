const { createApp, ref, reactive, computed, onMounted } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

const ADMIN_CREDENTIALS = window.MOCK_ADMIN || { username: 'admin', password: '123456' };

const app = createApp({
  setup() {
    const isLogin = ref(false);
    const loginLoading = ref(false);
    const adminName = ref('管理员');
    const activePage = ref('dashboard');

    const loginForm = reactive({ username: '', password: '', rememberMe: false });

    const dashboardCards = ref([
      { key: 'houses', title: '总房源', value: 0, icon: '🏠', color: '#409EFF' },
      { key: 'orders', title: '总订单', value: 0, icon: '📋', color: '#67C23A' },
      { key: 'tenants', title: '租客数', value: 0, icon: '👤', color: '#E6A23C' },
      { key: 'landlords', title: '房东数', value: 0, icon: '👨‍💼', color: '#909399' },
    ]);

    const pendingHouses = ref([]);
    const recentOrders = ref([]);

    const houseList = ref([]);
    const houseLoading = ref(false);
    const houseKeyword = ref('');
    const houseStatusFilter = ref('');
    const houseTotal = ref(0);
    const housePage = ref(1);
    const pageSize = ref(10);

    const orderList = ref([]);
    const orderLoading = ref(false);
    const orderStatusFilter = ref('');
    const orderTotal = ref(0);
    const orderPage = ref(1);

    const tenantList = ref([]);
    const tenantLoading = ref(false);
    const tenantTotal = ref(0);
    const tenantPage = ref(1);

    const landlordList = ref([]);
    const landlordLoading = ref(false);
    const landlordTotal = ref(0);
    const landlordPage = ref(1);

    const feedbackList = ref([]);
    const feedbackLoading = ref(false);
    const feedbackTotal = ref(0);
    const feedbackPage = ref(1);

    const profileDialogVisible = ref(false);
    const passwordDialogVisible = ref(false);
    const adminProfile = reactive({
      username: 'admin',
      realName: '管理员',
      email: '',
      phone: '',
      department: '',
      position: '',
    });
    const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const pageTitle = computed(() => {
      const map = {
        dashboard: '数据概览',
        houses: '房源管理',
        orders: '订单管理',
        tenants: '租客管理',
        landlords: '房东管理',
        feedbacks: '反馈管理',
      };
      return map[activePage.value] || '';
    });

    function doLogin() {
      if (!loginForm.username || !loginForm.password) {
        ElMessage.warning('请输入账号和密码');
        return;
      }
      loginLoading.value = true;

      setTimeout(() => {
        if (loginForm.username === ADMIN_CREDENTIALS.username && loginForm.password === ADMIN_CREDENTIALS.password) {
          isLogin.value = true;
          adminName.value = loginForm.username;
          localStorage.setItem('admin_logged', '1');
          localStorage.setItem('admin_name', loginForm.username);
          if (loginForm.rememberMe) {
            localStorage.setItem('admin_remember_username', loginForm.username);
          }
          ElMessage.success('登录成功');
          activePage.value = 'dashboard';
          loadDashboard();
        } else {
          ElMessage.error('账号或密码错误');
        }
        loginLoading.value = false;
      }, 300);
    }

    function logout() {
      ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' }).then(() => {
        isLogin.value = false;
        localStorage.removeItem('admin_logged');
        localStorage.removeItem('admin_name');
        localStorage.removeItem('admin_token');
        loginForm.username = '';
        loginForm.password = '';
        ElMessage.success('已退出登录');
      }).catch(() => {});
    }

    function changePage(key) {
      activePage.value = key;
      if (key === 'dashboard') loadDashboard();
      else if (key === 'houses') loadHouses();
      else if (key === 'orders') loadOrders();
      else if (key === 'tenants') loadTenants();
      else if (key === 'landlords') loadLandlords();
      else if (key === 'feedbacks') loadFeedbacks();
    }

    function loadDashboard() {
      if (window.MOCK_HOUSES) {
        dashboardCards.value[0].value = window.MOCK_HOUSES.length;
        dashboardCards.value[1].value = window.MOCK_ORDERS ? window.MOCK_ORDERS.length : 0;
        dashboardCards.value[2].value = window.MOCK_TENANTS ? window.MOCK_TENANTS.length : 0;
        dashboardCards.value[3].value = window.MOCK_LANDLORDS ? window.MOCK_LANDLORDS.length : 0;
        pendingHouses.value = window.MOCK_HOUSES.filter(h => h.status === 2);
        recentOrders.value = (window.MOCK_ORDERS || []).slice(0, 5).map(o => ({
          ...o,
          statusText: orderStatusText(o.status),
          statusType: orderStatusType(o.status)
        }));
      }
    }

    function loadHouses() {
      houseLoading.value = true;
      setTimeout(() => {
        let list = window.MOCK_HOUSES || [];
        if (houseKeyword.value) {
          list = list.filter(h => h.title.includes(houseKeyword.value));
        }
        if (houseStatusFilter.value !== '' && houseStatusFilter.value !== 'all') {
          list = list.filter(h => h.status === houseStatusFilter.value);
        }
        houseList.value = list;
        houseTotal.value = list.length;
        houseLoading.value = false;
      }, 200);
    }

    function approveHouse(id) {
      ElMessageBox.confirm('确定通过该房源审核？', '提示', { type: 'info' }).then(() => {
        const house = houseList.value.find(h => h.id === id);
        if (house) house.status = 1;
        ElMessage.success('已通过审核');
      }).catch(() => {});
    }

    function rejectHouseAdmin(id) {
      ElMessageBox.confirm('确定拒绝该房源？', '提示', { type: 'warning' }).then(() => {
        const house = houseList.value.find(h => h.id === id);
        if (house) house.status = 3;
        ElMessage.info('已拒绝该房源');
      }).catch(() => {});
    }

    function toggleHouseStatus(id, status) {
      const house = houseList.value.find(h => h.id === id);
      if (house) {
        house.status = status;
        ElMessage.success(status === 1 ? '已上架' : '已下架');
      }
    }

    function deleteHouseAdmin(id) {
      ElMessageBox.confirm('确定要删除该房源吗？', '提示', { type: 'warning' }).then(() => {
        houseList.value = houseList.value.filter(h => h.id !== id);
        ElMessage.success('已删除房源');
      }).catch(() => {});
    }

    function houseStatusText(status) {
      const map = { 0: '已下架', 1: '已上架', 2: '待审核', 3: '已拒绝' };
      return map[status] || '未知';
    }

    function houseStatusType(status) {
      const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' };
      return map[status] || 'info';
    }

    function loadOrders() {
      orderLoading.value = true;
      setTimeout(() => {
        let list = window.MOCK_ORDERS || [];
        if (orderStatusFilter.value !== '' && orderStatusFilter.value !== 'all') {
          list = list.filter(o => o.status === orderStatusFilter.value);
        }
        orderList.value = list;
        orderTotal.value = list.length;
        orderLoading.value = false;
      }, 200);
    }

    function orderStatusText(status) {
      const map = { 1: '待确认', 2: '已确认', 3: '已拒绝', 4: '已完成', 5: '已取消' };
      return map[status] || '未知';
    }

    function orderStatusType(status) {
      const map = { 1: 'warning', 2: 'primary', 3: 'danger', 4: 'success', 5: 'info' };
      return map[status] || 'info';
    }

    function loadTenants() {
      tenantLoading.value = true;
      setTimeout(() => {
        tenantList.value = window.MOCK_TENANTS || [];
        tenantTotal.value = tenantList.value.length;
        tenantLoading.value = false;
      }, 200);
    }

    function deleteTenant(id) {
      ElMessageBox.confirm('确定要删除该租客吗？', '提示', { type: 'warning' }).then(() => {
        tenantList.value = tenantList.value.filter(t => t.id !== id);
        ElMessage.success('删除租客成功');
      }).catch(() => {});
    }

    function loadLandlords() {
      landlordLoading.value = true;
      setTimeout(() => {
        landlordList.value = window.MOCK_LANDLORDS || [];
        landlordTotal.value = landlordList.value.length;
        landlordLoading.value = false;
      }, 200);
    }

    function approveLandlord(id) {
      ElMessageBox.confirm('确定通过该房东认证？', '提示', { type: 'info' }).then(() => {
        const landlord = landlordList.value.find(l => l.id === id);
        if (landlord) landlord.authStatus = 1;
        ElMessage.success('已通过房东申请');
      }).catch(() => {});
    }

    function rejectLandlord(id) {
      ElMessageBox.confirm('确定拒绝该房东申请？', '提示', { type: 'warning' }).then(() => {
        const landlord = landlordList.value.find(l => l.id === id);
        if (landlord) landlord.authStatus = 2;
        ElMessage.info('已拒绝房东申请');
      }).catch(() => {});
    }

    function deleteLandlord(id) {
      ElMessageBox.confirm('确定要删除该房东吗？', '提示', { type: 'warning' }).then(() => {
        landlordList.value = landlordList.value.filter(l => l.id !== id);
        ElMessage.success('已删除房东');
      }).catch(() => {});
    }

    function loadFeedbacks() {
      feedbackLoading.value = true;
      setTimeout(() => {
        feedbackList.value = window.MOCK_FEEDBACKS || [];
        feedbackTotal.value = feedbackList.value.length;
        feedbackLoading.value = false;
      }, 200);
    }

    function handleFeedback(id) {
      ElMessageBox.confirm('确定标记为已处理？', '提示', { type: 'info' }).then(() => {
        const feedback = feedbackList.value.find(f => f.id === id);
        if (feedback) feedback.status = 1;
        ElMessage.success('已处理反馈');
      }).catch(() => {});
    }

    function showProfile() {
      profileDialogVisible.value = true;
    }

    function changePassword() {
      passwordDialogVisible.value = true;
    }

    function saveProfile() {
      profileDialogVisible.value = false;
      ElMessage.success('保存成功');
    }

    function updatePassword() {
      if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        ElMessage.warning('请填写完整信息');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error('两次密码不一致');
        return;
      }
      passwordDialogVisible.value = false;
      ElMessage.success('密码已更新');
    }

    onMounted(() => {
      if (localStorage.getItem('admin_logged') === '1') {
        isLogin.value = true;
        const name = localStorage.getItem('admin_name');
        if (name) adminName.value = name;
        loadDashboard();
      } else {
        const remembered = localStorage.getItem('admin_remember_username');
        if (remembered) {
          loginForm.username = remembered;
          loginForm.rememberMe = true;
        }
      }
    });

    return {
      isLogin,
      loginLoading,
      loginForm,
      adminName,
      activePage,
      pageTitle,
      dashboardCards,
      pendingHouses,
      recentOrders,
      houseList,
      houseLoading,
      houseKeyword,
      houseStatusFilter,
      houseTotal,
      housePage,
      pageSize,
      orderList,
      orderLoading,
      orderStatusFilter,
      orderTotal,
      orderPage,
      tenantList,
      tenantLoading,
      tenantTotal,
      tenantPage,
      landlordList,
      landlordLoading,
      landlordTotal,
      landlordPage,
      feedbackList,
      feedbackLoading,
      feedbackTotal,
      feedbackPage,
      profileDialogVisible,
      passwordDialogVisible,
      adminProfile,
      passwordForm,
      doLogin,
      logout,
      changePage,
      showProfile,
      changePassword,
      loadDashboard,
      loadHouses,
      approveHouse,
      rejectHouseAdmin,
      toggleHouseStatus,
      deleteHouseAdmin,
      houseStatusText,
      houseStatusType,
      loadOrders,
      orderStatusText,
      orderStatusType,
      loadTenants,
      deleteTenant,
      loadLandlords,
      approveLandlord,
      rejectLandlord,
      deleteLandlord,
      loadFeedbacks,
      handleFeedback,
      saveProfile,
      updatePassword,
    };
  },
});

app.use(ElementPlus);

try {
  if (typeof ElementPlusIconsVue === 'object' && ElementPlusIconsVue !== null) {
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
  }
} catch (e) {
  console.warn('ElementPlusIconsVue register failed', e);
}

app.mount('#app');
