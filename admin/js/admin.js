const { createApp, ref, reactive, computed, onMounted } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

const API_BASE = 'http://localhost:8080';

async function apiGet(url) {
  try {
    const res = await fetch(API_BASE + url);
    return res.json();
  } catch (e) {
    console.error('API请求失败:', url, e);
    return { code: 500, message: '网络请求失败' };
  }
}

async function apiPost(url, data) {
  try {
    const res = await fetch(API_BASE + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  } catch (e) {
    console.error('API请求失败:', url, e);
    return { code: 500, message: '网络请求失败' };
  }
}

const app = createApp({
  setup() {
    const isLogin = ref(false);
    const loginLoading = ref(false);
    const adminName = ref('管理员');
    const activePage = ref('dashboard');
    const loginForm = reactive({ username: '', password: '' });

    const dashboardStats = ref({ userCount: 0, hostCount: 0, houseCount: 0, orderCount: 0, pendingHouseCount: 0, pendingOrderCount: 0 });

    const userList = ref([]);
    const hostList = ref([]);
    const houseList = ref([]);
    const orderList = ref([]);
    const feedbackList = ref([]);
    const bannerList = ref([]);

    const houseFilter = reactive({
      auditStatus: '',
      city: '',
      hostId: ''
    });

    const showAuditDialog = ref(false);
    const auditForm = reactive({
      houseId: '',
      auditStatus: 1,
      auditRemark: ''
    });

    const showHouseDetail = ref(false);
    const currentHouse = ref(null);

    const showPasswordDialog = ref(false);
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const passwordLoading = ref(false);

    const showAddBannerDialog = ref(false);
    const newBanner = reactive({
      picUrl: '',
      sort: 1
    });

    const pageTitle = computed(() => {
      const map = {
        dashboard: '数据概览',
        users: '用户管理',
        hosts: '房东管理',
        houses: '房源管理',
        orders: '订单管理',
        feedbacks: '反馈管理',
        banners: '轮播图管理'
      };
      return map[activePage.value] || '';
    });

    const filteredHouseList = computed(() => {
      let list = houseList.value;
      if (houseFilter.auditStatus !== '' && houseFilter.auditStatus !== null) {
        list = list.filter(h => h.auditStatus === houseFilter.auditStatus);
      }
      if (houseFilter.city) {
        list = list.filter(h => h.city && h.city.includes(houseFilter.city));
      }
      if (houseFilter.hostId) {
        list = list.filter(h => h.hostId && h.hostId.includes(houseFilter.hostId));
      }
      return list;
    });

    const pendingHouseCount = computed(() => houseList.value.filter(h => h.auditStatus === 0).length);
    const pendingOrderCount = computed(() => orderList.value.filter(o => o.orderStatus === 0).length);

    async function doLogin() {
      if (!loginForm.username || !loginForm.password) {
        ElMessage.warning('请输入账号和密码');
        return;
      }
      loginLoading.value = true;
      const res = await apiPost('/admin/login', loginForm);
      loginLoading.value = false;
      if (res.code === 200) {
        isLogin.value = true;
        adminName.value = res.data.username;
        localStorage.setItem('admin_logged', '1');
        ElMessage.success('登录成功');
        loadDashboard();
      } else {
        ElMessage.error(res.message || '登录失败');
      }
    }

    function logout() {
      ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' }).then(() => {
        isLogin.value = false;
        localStorage.removeItem('admin_logged');
        loginForm.username = '';
        loginForm.password = '';
        ElMessage.success('已退出登录');
      }).catch(() => {});
    }

    function openPasswordDialog() {
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      showPasswordDialog.value = true;
    }

    async function submitPassword() {
      if (!passwordForm.oldPassword) {
        ElMessage.warning('请输入原密码');
        return;
      }
      if (!passwordForm.newPassword) {
        ElMessage.warning('请输入新密码');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        ElMessage.warning('新密码长度不能少于6位');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.warning('两次输入的新密码不一致');
        return;
      }
      if (passwordForm.oldPassword === passwordForm.newPassword) {
        ElMessage.warning('新密码不能与原密码相同');
        return;
      }

      passwordLoading.value = true;
      const res = await apiPost('/admin/changePassword', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      passwordLoading.value = false;

      if (res.code === 200) {
        ElMessage.success('密码修改成功，请重新登录');
        showPasswordDialog.value = false;
        setTimeout(() => {
          isLogin.value = false;
          localStorage.removeItem('admin_logged');
        }, 1500);
      } else {
        ElMessage.error(res.message || '密码修改失败');
      }
    }

    function changePage(key) {
      activePage.value = key;
      if (key === 'dashboard') loadDashboard();
      else if (key === 'users') loadUsers();
      else if (key === 'hosts') loadHosts();
      else if (key === 'houses') loadHouses();
      else if (key === 'orders') loadOrders();
      else if (key === 'feedbacks') loadFeedbacks();
      else if (key === 'banners') loadBanners();
    }

    async function loadDashboard() {
      const [statRes, houseRes, orderRes] = await Promise.all([
        apiGet('/admin/stat'),
        apiGet('/house/all'),
        apiGet('/admin/order/list')
      ]);
      
      if (statRes.code === 200) {
        dashboardStats.value = statRes.data;
      }
      if (houseRes.code === 200) {
        houseList.value = houseRes.data;
        dashboardStats.value.pendingHouseCount = houseRes.data.filter(h => h.auditStatus === 0).length;
      }
      if (orderRes.code === 200) {
        orderList.value = orderRes.data;
        dashboardStats.value.pendingOrderCount = orderRes.data.filter(o => o.orderStatus === 0).length;
      }
    }

    async function loadUsers() {
      console.log('开始加载用户列表...');
      const res = await apiGet('/admin/user/list');
      console.log('用户列表返回:', res);
      if (res.code === 200) {
        userList.value = res.data || [];
        console.log('用户数据已设置:', userList.value);
      } else {
        console.error('加载用户列表失败:', res.message);
      }
    }

    async function loadHosts() {
      const res = await apiGet('/admin/host/list');
      if (res.code === 200) {
        hostList.value = res.data;
      }
    }

    async function auditHost(hostId, certStatus) {
      const action = certStatus === 2 ? '通过认证' : '取消认证';
      ElMessageBox.confirm(`确定${action}该房东？`, '提示', { type: 'warning' }).then(async () => {
        const res = await apiPost('/admin/host/audit', { hostId, certStatus });
        if (res.code === 200) {
          ElMessage.success('操作成功');
          loadHosts();
        } else {
          ElMessage.error(res.message || '操作失败');
        }
      }).catch(() => {});
    }

    async function deleteHost(hostId) {
      ElMessageBox.confirm('确定删除该房东？此操作不可恢复！', '警告', { type: 'warning' }).then(async () => {
        const res = await apiPost('/admin/host/delete', { hostId });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadHosts();
          loadDashboard();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function deleteUser(userId) {
      ElMessageBox.confirm('确定删除该用户？此操作不可恢复！', '警告', { type: 'warning' }).then(async () => {
        const res = await apiPost('/admin/user/delete', { userId });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadUsers();
          loadDashboard();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function loadHouses() {
      const res = await apiGet('/house/all');
      if (res.code === 200) {
        houseList.value = res.data;
      }
    }

    function openAuditDialog(house) {
      auditForm.houseId = house.houseId;
      auditForm.auditStatus = 1;
      auditForm.auditRemark = '';
      showAuditDialog.value = true;
    }

    async function submitAudit() {
      const res = await apiPost('/house/audit', {
        houseId: auditForm.houseId,
        auditStatus: auditForm.auditStatus,
        auditRemark: auditForm.auditRemark || (auditForm.auditStatus === 1 ? '审核通过' : '审核驳回')
      });
      if (res.code === 200) {
        ElMessage.success(auditForm.auditStatus === 1 ? '审核通过，房源已上架' : '已驳回');
        showAuditDialog.value = false;
        loadHouses();
        loadDashboard();
      } else {
        ElMessage.error(res.message || '审核失败');
      }
    }

    function viewHouseDetail(house) {
      currentHouse.value = house;
      showHouseDetail.value = true;
    }

    function resetHouseFilter() {
      houseFilter.auditStatus = '';
      houseFilter.city = '';
      houseFilter.hostId = '';
    }

    async function loadOrders() {
      const res = await apiGet('/admin/order/list');
      if (res.code === 200) {
        orderList.value = res.data;
      }
    }

    async function deleteOrder(orderNo, orderStatus) {
      if (orderStatus === 1 || orderStatus === 2) {
        ElMessage.warning('租住中的订单无法删除，请先完结订单');
        return;
      }
      ElMessageBox.confirm('确定删除该订单？此操作不可恢复！', '警告', { type: 'warning' }).then(async () => {
        const res = await apiPost('/order/delete/' + orderNo, {});
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadOrders();
          loadDashboard();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function loadFeedbacks() {
      const res = await apiGet('/admin/feedback/list');
      if (res.code === 200) {
        feedbackList.value = res.data;
      }
    }

    async function processFeedback(id) {
      const res = await apiPost('/feedback/process', { id, reply: '已处理' });
      if (res.code === 200) {
        ElMessage.success('已处理');
        loadFeedbacks();
      } else {
        ElMessage.error(res.message || '处理失败');
      }
    }

    async function deleteFeedback(id) {
      ElMessageBox.confirm('确定删除该反馈？此操作不可恢复！', '警告', { type: 'warning' }).then(async () => {
        const res = await apiPost('/feedback/delete', { id });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadFeedbacks();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function deleteHouse(houseId) {
      ElMessageBox.confirm('确定删除该房源？此操作不可恢复！', '警告', { type: 'warning' }).then(async () => {
        const res = await apiPost('/house/delete/' + houseId, {});
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadHouses();
          loadDashboard();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function loadBanners() {
      const res = await apiGet('/banner/all');
      if (res.code === 200) {
        bannerList.value = res.data;
      }
    }

    async function handleBannerUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(API_BASE + '/upload/banner', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.code === 200) {
          newBanner.picUrl = data.data;
          ElMessage.success('图片上传成功');
        } else {
          ElMessage.error(data.message || '上传失败');
        }
      } catch (e) {
        ElMessage.error('上传失败');
      }
      
      event.target.value = '';
    }

    async function submitNewBanner() {
      if (!newBanner.picUrl) {
        ElMessage.warning('请先上传图片');
        return;
      }
      
      const res = await apiPost('/banner/add', { 
        picUrl: newBanner.picUrl, 
        sort: newBanner.sort || bannerList.value.length + 1 
      });
      
      if (res.code === 200) {
        ElMessage.success('添加成功');
        showAddBannerDialog.value = false;
        newBanner.picUrl = '';
        newBanner.sort = 1;
        loadBanners();
      } else {
        ElMessage.error(res.message || '添加失败');
      }
    }

    async function deleteBanner(id) {
      ElMessageBox.confirm('确定删除该轮播图？', '提示', { type: 'warning' }).then(async () => {
        const res = await apiPost('/banner/delete/' + id, {});
        if (res.code === 200) {
          ElMessage.success('删除成功');
          loadBanners();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      }).catch(() => {});
    }

    async function toggleBannerStatus(id, status) {
      const res = await apiPost('/banner/update', { id, status });
      if (res.code === 200) {
        ElMessage.success('状态已更新');
        loadBanners();
      } else {
        ElMessage.error(res.message || '更新失败');
      }
    }

    function orderStatusText(status) {
      const map = { 0: '待确认', 1: '已确认', 2: '租住中', 3: '已完结', 4: '已取消', 5: '已拒绝' };
      return map[status] || '未知';
    }

    function orderStatusType(status) {
      const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'danger', 5: 'danger' };
      return map[status] || 'info';
    }

    function auditStatusText(status) {
      const map = { 0: '待审核', 1: '审核通过', 2: '审核驳回' };
      return map[status] || '未知';
    }

    function auditStatusType(status) {
      const map = { 0: 'warning', 1: 'success', 2: 'danger' };
      return map[status] || 'info';
    }

    function certStatusText(status) {
      const map = { 0: '未认证', 1: '审核中', 2: '已认证', 3: '已拒绝' };
      return map[status] || '未知';
    }

    function certStatusType(status) {
      const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
      return map[status] || 'info';
    }

    function houseStatusText(status) {
      const map = { 0: '未上架', 1: '已上架', 2: '已下架' };
      return map[status] || '未知';
    }

    function houseStatusType(status) {
      const map = { 0: 'info', 1: 'success', 2: 'warning' };
      return map[status] || 'info';
    }

    function formatDate(dateStr) {
      if (!dateStr) return '-';
      return dateStr.replace('T', ' ').substring(0, 19);
    }

    onMounted(() => {
      if (localStorage.getItem('admin_logged') === '1') {
        isLogin.value = true;
        loadDashboard();
      }
    });

    return {
      isLogin, loginLoading, loginForm, adminName, activePage, pageTitle,
      dashboardStats, userList, hostList, houseList, orderList, feedbackList, bannerList,
      houseFilter, filteredHouseList, showAuditDialog, auditForm, showHouseDetail, currentHouse,
      showPasswordDialog, passwordForm, passwordLoading,
      pendingHouseCount, pendingOrderCount,
      showAddBannerDialog, newBanner,
      doLogin, logout, openPasswordDialog, submitPassword, changePage,
      loadUsers, loadHosts, loadHouses, loadOrders, loadFeedbacks, loadBanners,
      auditHost, deleteUser, deleteHost,
      openAuditDialog, submitAudit, viewHouseDetail, resetHouseFilter,
      processFeedback, deleteFeedback, deleteHouse, deleteOrder,
      handleBannerUpload, submitNewBanner, deleteBanner, toggleBannerStatus,
      orderStatusText, orderStatusType, auditStatusText, auditStatusType, 
      certStatusText, certStatusType, houseStatusText, houseStatusType,
      formatDate
    };
  }
});

app.use(ElementPlus);
app.mount('#app');
