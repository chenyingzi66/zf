// pages/tenant/house-list/house-list.js
const { getTenantHouseList } = require('../../../utils/api.js');

const REGION_DATA = {
  provinces: ['全部', '北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '湖南省', '河南省', '山东省'],
  cities: {
    '北京市': ['全部', '北京市'],
    '上海市': ['全部', '上海市'],
    '广东省': ['全部', '广州市', '深圳市', '东莞市', '佛山市', '珠海市'],
    '江苏省': ['全部', '南京市', '苏州市', '无锡市', '常州市', '南通市'],
    '浙江省': ['全部', '杭州市', '宁波市', '温州市', '嘉兴市', '绍兴市'],
    '四川省': ['全部', '成都市', '绵阳市', '德阳市', '宜宾市', '泸州市'],
    '湖北省': ['全部', '武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'],
    '湖南省': ['全部', '长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
    '河南省': ['全部', '郑州市', '洛阳市', '开封市', '新乡市', '安阳市'],
    '山东省': ['全部', '济南市', '青岛市', '烟台市', '潍坊市', '威海市']
  },
  districts: {
    '北京市': ['全部', '东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '大兴区'],
    '上海市': ['全部', '黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'],
    '广州市': ['全部', '天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区', '黄埔区'],
    '深圳市': ['全部', '福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '龙华区', '坪山区'],
    '东莞市': ['全部', '莞城区', '南城区', '东城区', '万江区', '石碣镇', '虎门镇'],
    '佛山市': ['全部', '禅城区', '南海区', '顺德区', '三水区', '高明区'],
    '珠海市': ['全部', '香洲区', '斗门区', '金湾区'],
    '南京市': ['全部', '玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区'],
    '苏州市': ['全部', '姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '工业园区'],
    '无锡市': ['全部', '锡山区', '惠山区', '滨湖区', '梁溪区', '新吴区'],
    '常州市': ['全部', '天宁区', '钟楼区', '新北区', '武进区', '金坛区'],
    '南通市': ['全部', '崇川区', '港闸区', '通州区', '海门区', '启东市'],
    '杭州市': ['全部', '上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区'],
    '宁波市': ['全部', '海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区'],
    '温州市': ['全部', '鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市'],
    '嘉兴市': ['全部', '南湖区', '秀洲区', '嘉善县', '海盐县', '海宁市'],
    '绍兴市': ['全部', '越城区', '柯桥区', '上虞区', '新昌县', '诸暨市'],
    '成都市': ['全部', '锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区'],
    '绵阳市': ['全部', '涪城区', '游仙区', '安州区', '江油市'],
    '德阳市': ['全部', '旌阳区', '罗江区', '广汉市', '什邡市', '绵竹市'],
    '宜宾市': ['全部', '翠屏区', '南溪区', '叙州区', '江安县'],
    '泸州市': ['全部', '江阳区', '纳溪区', '龙马潭区', '泸县'],
    '武汉市': ['全部', '江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '蔡甸区', '江夏区'],
    '宜昌市': ['全部', '西陵区', '伍家岗区', '点军区', '猇亭区', '夷陵区'],
    '襄阳市': ['全部', '襄城区', '樊城区', '襄州区', '南漳县', '谷城县'],
    '荆州市': ['全部', '沙市区', '荆州区', '公安县', '监利市', '江陵县'],
    '黄冈市': ['全部', '黄州区', '团风县', '红安县', '罗田县', '英山县'],
    '长沙市': ['全部', '芙蓉区', '天心区', '岳麓区', '开福区', '雨花区', '望城区', '长沙县', '浏阳市', '宁乡市'],
    '株洲市': ['全部', '天元区', '芦淞区', '荷塘区', '石峰区', '渌口区'],
    '湘潭市': ['全部', '雨湖区', '岳塘区', '湘潭县', '湘乡市', '韶山市'],
    '衡阳市': ['全部', '珠晖区', '雁峰区', '石鼓区', '蒸湘区', '南岳区'],
    '岳阳市': ['全部', '岳阳楼区', '云溪区', '君山区', '岳阳县', '华容县'],
    '郑州市': ['全部', '中原区', '二七区', '管城区', '金水区', '上街区', '惠济区', '中牟县', '巩义市', '荥阳市', '新密市'],
    '洛阳市': ['全部', '老城区', '西工区', '瀍河区', '涧西区', '吉利区', '洛龙区'],
    '开封市': ['全部', '龙亭区', '顺河区', '鼓楼区', '禹王台区', '祥符区'],
    '新乡市': ['全部', '红旗区', '卫滨区', '凤泉区', '牧野区', '卫辉市'],
    '安阳市': ['全部', '文峰区', '北关区', '殷都区', '龙安区', '安阳县'],
    '济南市': ['全部', '历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区', '章丘区', '济阳区'],
    '青岛市': ['全部', '市南区', '市北区', '黄岛区', '崂山区', '李沧区', '城阳区', '即墨区'],
    '烟台市': ['全部', '芝罘区', '福山区', '牟平区', '莱山区', '蓬莱区'],
    '潍坊市': ['全部', '潍城区', '寒亭区', '坊子区', '奎文区', '临朐县'],
    '威海市': ['全部', '环翠区', '文登区', '荣成市', '乳山市']
  }
};

const HOUSE_TYPES = ['全部', '一室', '一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '整租', '合租'];
const PRICES = ['全部', '1000以下', '1000-2000', '2000-3000', '3000-5000', '5000以上'];
const SORTS = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '最新发布', value: 'latest' }
];

Page({
  data: {
    houseList: [],
    allHouseList: [],
    loading: false,
    hasMore: true,
    page: 1,
    province: '全部',
    city: '全部',
    district: '全部',
    houseType: '全部',
    price: '全部',
    sortType: 'default',
    keyword: '',
    showProvincePanel: false,
    showCityPanel: false,
    showDistrictPanel: false,
    showTypePanel: false,
    showPricePanel: false,
    showSortPanel: false,
    provinces: REGION_DATA.provinces,
    cities: ['全部'],
    districts: ['全部'],
    types: HOUSE_TYPES,
    prices: PRICES,
    sorts: SORTS
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) });
    }
    if (options.focus) {
      const focus = options.focus;
      if (focus === 'region') {
        this.setData({ showProvincePanel: true });
      } else if (focus === 'houseType') {
        this.setData({ showTypePanel: true });
      } else if (focus === 'price') {
        this.setData({ showPricePanel: true });
      }
    }
    this.loadList();
  },

  onPullDownRefresh() {
    this.resetAndLoad();
    wx.stopPullDownRefresh();
  },

  resetAndLoad() {
    this.setData({ page: 1, houseList: [], hasMore: true });
    this.loadList();
  },

  loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    getTenantHouseList().then(res => {
      if (res.code === 200 && res.data) {
        let list = res.data.map(item => {
          let picsArr = [];
          try {
            picsArr = JSON.parse(item.pics || '[]');
          } catch (e) {
            picsArr = [];
          }
          return { ...item, images: picsArr };
        });

        this.setData({
          allHouseList: list,
          loading: false,
          hasMore: false
        });
        this.applyFilters();
      } else {
        this.setData({ houseList: [], loading: false });
      }
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  filterList(list) {
    let result = list;

    if (this.data.keyword && this.data.keyword.trim()) {
      const kw = this.data.keyword.trim().toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(kw)) ||
        (item.city && item.city.toLowerCase().includes(kw)) ||
        (item.district && item.district.toLowerCase().includes(kw)) ||
        (item.address && item.address.toLowerCase().includes(kw))
      );
    }

    if (this.data.province !== '全部') {
      result = result.filter(item => item.province === this.data.province);
    }

    if (this.data.city !== '全部') {
      result = result.filter(item => item.city === this.data.city);
    }

    if (this.data.district !== '全部') {
      result = result.filter(item => item.district === this.data.district);
    }

    if (this.data.houseType !== '全部') {
      result = result.filter(item => item.houseType === this.data.houseType);
    }

    if (this.data.price !== '全部') {
      const priceRange = this.getPriceRange(this.data.price);
      result = result.filter(item => {
        const price = parseFloat(item.price) || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    return result;
  },

  sortList(list) {
    let result = [...list];
    switch (this.data.sortType) {
      case 'price_asc':
        result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        break;
      default:
        break;
    }
    return result;
  },

  getPriceRange(str) {
    const map = {
      '1000以下': { min: 0, max: 1000 },
      '1000-2000': { min: 1000, max: 2000 },
      '2000-3000': { min: 2000, max: 3000 },
      '3000-5000': { min: 3000, max: 5000 },
      '5000以上': { min: 5000, max: 999999 }
    };
    return map[str] || { min: 0, max: 999999 };
  },

  togglePanel(e) {
    const { type } = e.currentTarget.dataset;
    const panelKey = `show${type}Panel`;
    const current = this.data[panelKey];
    
    const panels = ['Province', 'City', 'District', 'Type', 'Price', 'Sort'];
    const data = {};
    panels.forEach(p => {
      data[`show${p}Panel`] = (p === type && !current);
    });
    this.setData(data);
  },

  closePanels() {
    this.setData({
      showProvincePanel: false,
      showCityPanel: false,
      showDistrictPanel: false,
      showTypePanel: false,
      showPricePanel: false,
      showSortPanel: false
    });
  },

  selectProvince(e) {
    const { value } = e.currentTarget.dataset;
    if (value === '全部') {
      this.setData({ 
        province: value, 
        city: '全部',
        district: '全部',
        cities: ['全部'],
        districts: ['全部'],
        showProvincePanel: false 
      });
      this.applyFilters();
    } else {
      const cities = REGION_DATA.cities[value] || ['全部'];
      this.setData({ 
        province: value, 
        city: '全部',
        district: '全部',
        cities: cities,
        districts: ['全部'],
        showProvincePanel: false,
        showCityPanel: true
      });
    }
  },

  selectCity(e) {
    const { value } = e.currentTarget.dataset;
    if (value === '全部') {
      this.setData({ 
        city: value, 
        district: '全部',
        districts: ['全部'],
        showCityPanel: false 
      });
      this.applyFilters();
    } else {
      const districts = REGION_DATA.districts[value] || ['全部'];
      this.setData({ 
        city: value, 
        district: '全部',
        districts: districts,
        showCityPanel: false,
        showDistrictPanel: true
      });
    }
  },

  selectDistrict(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ district: value, showDistrictPanel: false });
    this.applyFilters();
  },

  selectType(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ houseType: value, showTypePanel: false });
    this.applyFilters();
  },

  selectPrice(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ price: value, showPricePanel: false });
    this.applyFilters();
  },

  selectSort(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ sortType: value, showSortPanel: false });
    this.applyFilters();
  },

  applyFilters() {
    let list = this.filterList(this.data.allHouseList);
    list = this.sortList(list);
    this.setData({ houseList: list });
  },

  clearFilter() {
    this.setData({
      province: '全部',
      city: '全部',
      district: '全部',
      cities: ['全部'],
      districts: ['全部'],
      houseType: '全部',
      price: '全部',
      sortType: 'default',
      keyword: ''
    });
    this.applyFilters();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    this.applyFilters();
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/tenant/house-detail/house-detail?id=${id}`
    });
  }
});
