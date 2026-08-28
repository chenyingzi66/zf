// pages/landlord/publishHouse/publishHouse.js
const app = getApp();
const { publishHouse, updateHouse, getHouseDetail } = require('../../../utils/api.js');
const { uploadFile } = require('../../../utils/request.js');

const REGION_DATA = {
  provinces: ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '湖南省', '河南省', '山东省'],
  cities: {
    '北京市': ['北京市'],
    '上海市': ['上海市'],
    '广东省': ['广州市', '深圳市', '东莞市', '佛山市', '珠海市'],
    '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '绍兴市'],
    '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市', '泸州市'],
    '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'],
    '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
    '河南省': ['郑州市', '洛阳市', '开封市', '新乡市', '安阳市'],
    '山东省': ['济南市', '青岛市', '烟台市', '潍坊市', '威海市']
  },
  districts: {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '大兴区'],
    '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'],
    '广州市': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区', '黄埔区'],
    '深圳市': ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '龙华区', '坪山区'],
    '东莞市': ['莞城区', '南城区', '东城区', '万江区', '石碣镇', '虎门镇'],
    '佛山市': ['禅城区', '南海区', '顺德区', '三水区', '高明区'],
    '珠海市': ['香洲区', '斗门区', '金湾区'],
    '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区'],
    '苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '工业园区'],
    '无锡市': ['锡山区', '惠山区', '滨湖区', '梁溪区', '新吴区'],
    '常州市': ['天宁区', '钟楼区', '新北区', '武进区', '金坛区'],
    '南通市': ['崇川区', '港闸区', '通州区', '海门区', '启东市'],
    '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区'],
    '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区'],
    '温州市': ['鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市'],
    '嘉兴市': ['南湖区', '秀洲区', '嘉善县', '海盐县', '海宁市'],
    '绍兴市': ['越城区', '柯桥区', '上虞区', '新昌县', '诸暨市'],
    '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区'],
    '绵阳市': ['涪城区', '游仙区', '安州区', '江油市'],
    '德阳市': ['旌阳区', '罗江区', '广汉市', '什邡市', '绵竹市'],
    '宜宾市': ['翠屏区', '南溪区', '叙州区', '江安县'],
    '泸州市': ['江阳区', '纳溪区', '龙马潭区', '泸县'],
    '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '蔡甸区', '江夏区'],
    '宜昌市': ['西陵区', '伍家岗区', '点军区', '猇亭区', '夷陵区'],
    '襄阳市': ['襄城区', '樊城区', '襄州区', '南漳县', '谷城县'],
    '荆州市': ['沙市区', '荆州区', '公安县', '监利市', '江陵县'],
    '黄冈市': ['黄州区', '团风县', '红安县', '罗田县', '英山县'],
    '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区', '望城区', '长沙县', '浏阳市', '宁乡市'],
    '株洲市': ['天元区', '芦淞区', '荷塘区', '石峰区', '渌口区'],
    '湘潭市': ['雨湖区', '岳塘区', '湘潭县', '湘乡市', '韶山市'],
    '衡阳市': ['珠晖区', '雁峰区', '石鼓区', '蒸湘区', '南岳区'],
    '岳阳市': ['岳阳楼区', '云溪区', '君山区', '岳阳县', '华容县'],
    '郑州市': ['中原区', '二七区', '管城区', '金水区', '上街区', '惠济区', '中牟县', '巩义市', '荥阳市', '新密市'],
    '洛阳市': ['老城区', '西工区', '瀍河区', '涧西区', '吉利区', '洛龙区'],
    '开封市': ['龙亭区', '顺河区', '鼓楼区', '禹王台区', '祥符区'],
    '新乡市': ['红旗区', '卫滨区', '凤泉区', '牧野区', '卫辉市'],
    '安阳市': ['文峰区', '北关区', '殷都区', '龙安区', '安阳县'],
    '济南市': ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区', '章丘区', '济阳区'],
    '青岛市': ['市南区', '市北区', '黄岛区', '崂山区', '李沧区', '城阳区', '即墨区'],
    '烟台市': ['芝罘区', '福山区', '牟平区', '莱山区', '蓬莱区'],
    '潍坊市': ['潍城区', '寒亭区', '坊子区', '奎文区', '临朐县'],
    '威海市': ['环翠区', '文登区', '荣成市', '乳山市']
  }
};

Page({
  data: {
    isEdit: false,
    houseId: '',
    provinces: REGION_DATA.provinces,
    cities: [],
    districts: [],
    provinceIndex: -1,
    cityIndex: -1,
    districtIndex: -1,
    selectedProvince: '',
    selectedCity: '',
    selectedDistrict: '',
    title: '',
    address: '',
    area: '',
    houseType: '',
    houseTypes: ['一室', '一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '整租', '合租'],
    houseTypeIndex: 0,
    floor: '',
    rentType: '月租',
    rentTypes: ['日租', '月租', '季租', '年租'],
    rentTypeIndex: 1,
    price: '',
    facilities: [],
    facilityList: ['WiFi', '空调', '洗衣机', '热水器', '冰箱', '电视', '停车位', '电梯', '暖气', '天然气'],
    facilitySelected: {},
    description: '',
    images: [],
    uploading: false,
    submitting: false,
    loading: false
  },

  onLoad(options) {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (!token || !userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => wx.redirectTo({ url: '/pages/landlord/login/login' }), 1500);
      return;
    }
    
    const facilitySelected = {};
    this.data.facilityList.forEach(f => { facilitySelected[f] = false; });
    this.setData({ facilitySelected });

    if (options.id) {
      this.setData({ isEdit: true, houseId: options.id, loading: true });
      this.loadHouseData(options.id);
    }
  },

  loadHouseData(houseId) {
    getHouseDetail(houseId).then(res => {
      if (res.code === 200 && res.data) {
        const house = res.data;
        let images = [];
        if (house.pics) {
          try {
            images = typeof house.pics === 'string' ? JSON.parse(house.pics) : house.pics;
          } catch(e) {
            images = house.pics.split(',').filter(Boolean);
          }
        }

        const facilities = house.facilities ? house.facilities.split(',').filter(Boolean) : [];
        const facilitySelected = {};
        this.data.facilityList.forEach(f => { facilitySelected[f] = facilities.includes(f); });

        let provinceIndex = -1, cityIndex = -1, districtIndex = -1;
        let cities = [], districts = [];
        
        if (house.province) {
          provinceIndex = this.data.provinces.indexOf(house.province);
          if (provinceIndex >= 0) {
            cities = REGION_DATA.cities[house.province] || [];
            if (house.city) {
              cityIndex = cities.indexOf(house.city);
              if (cityIndex >= 0) {
                districts = REGION_DATA.districts[house.city] || [];
                if (house.district) {
                  districtIndex = districts.indexOf(house.district);
                }
              }
            }
          }
        }

        let houseTypeIndex = this.data.houseTypes.indexOf(house.houseType);
        if (houseTypeIndex < 0) houseTypeIndex = 0;
        
        let rentTypeIndex = this.data.rentTypes.indexOf(house.rentType);
        if (rentTypeIndex < 0) rentTypeIndex = 1;

        this.setData({
          title: house.title || '',
          address: house.address || '',
          area: house.area ? String(house.area) : '',
          houseType: house.houseType || this.data.houseTypes[houseTypeIndex],
          houseTypeIndex: houseTypeIndex,
          floor: house.floor || '',
          rentType: house.rentType || this.data.rentTypes[rentTypeIndex],
          rentTypeIndex: rentTypeIndex,
          price: house.price ? String(house.price) : '',
          description: house.description || '',
          images,
          facilities,
          facilitySelected,
          selectedProvince: house.province || '',
          selectedCity: house.city || '',
          selectedDistrict: house.district || '',
          provinceIndex,
          cityIndex,
          districtIndex,
          cities,
          districts,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onProvinceChange(e) {
    const index = e.detail.value;
    const province = this.data.provinces[index];
    const cities = REGION_DATA.cities[province] || [];
    this.setData({
      provinceIndex: index,
      selectedProvince: province,
      cities: cities,
      cityIndex: -1,
      districtIndex: -1,
      selectedCity: '',
      selectedDistrict: '',
      districts: []
    });
  },

  onCityChange(e) {
    const index = e.detail.value;
    const city = this.data.cities[index];
    const districts = REGION_DATA.districts[city] || [];
    this.setData({
      cityIndex: index,
      selectedCity: city,
      districts: districts,
      districtIndex: -1,
      selectedDistrict: ''
    });
  },

  onDistrictChange(e) {
    const index = e.detail.value;
    const district = this.data.districts[index];
    this.setData({ districtIndex: index, selectedDistrict: district });
  },

  onHouseTypeChange(e) {
    this.setData({ houseTypeIndex: e.detail.value, houseType: this.data.houseTypes[e.detail.value] });
  },

  onRentTypeChange(e) {
    this.setData({ rentTypeIndex: e.detail.value, rentType: this.data.rentTypes[e.detail.value] });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  toggleFacility(e) {
    const f = e.currentTarget.dataset.name;
    const facilitySelected = { ...this.data.facilitySelected };
    facilitySelected[f] = !facilitySelected[f];
    const facilities = Object.keys(facilitySelected).filter(k => facilitySelected[k]);
    this.setData({ facilitySelected, facilities });
  },

  chooseImage() {
    const remaining = 9 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      success: res => {
        const tempFiles = res.tempFiles.map(f => f.tempFilePath);
        this.uploadImages(tempFiles);
      }
    });
  },

  uploadImages(tempFiles) {
    if (tempFiles.length === 0) return;
    
    this.setData({ uploading: true });
    
    const uploadPromises = tempFiles.map(filePath => {
      return uploadFile('/upload/house', filePath, { name: 'file', showLoad: false });
    });
    
    Promise.all(uploadPromises)
      .then(results => {
        const newUrls = results.filter(r => r && r.data).map(r => r.data);
        const images = [...this.data.images, ...newUrls];
        this.setData({ images, uploading: false });
        wx.showToast({ title: '上传成功', icon: 'success' });
      })
      .catch(err => {
        this.setData({ uploading: false });
        wx.showToast({ title: err.message || '上传失败', icon: 'none' });
      });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  validateForm() {
    if (!this.data.selectedProvince || !this.data.selectedCity || !this.data.selectedDistrict) {
      wx.showToast({ title: '请选择完整地址', icon: 'none' });
      return false;
    }
    if (!this.data.title || this.data.title.trim().length < 5) {
      wx.showToast({ title: '标题至少5个字符', icon: 'none' });
      return false;
    }
    if (!this.data.address || this.data.address.trim().length < 5) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return false;
    }
    if (!this.data.area || parseFloat(this.data.area) <= 0) {
      wx.showToast({ title: '请输入有效面积', icon: 'none' });
      return false;
    }
    if (!this.data.houseType) {
      wx.showToast({ title: '请选择户型', icon: 'none' });
      return false;
    }
    if (!this.data.price || parseFloat(this.data.price) <= 0) {
      wx.showToast({ title: '请输入有效租金', icon: 'none' });
      return false;
    }
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请至少上传1张图片', icon: 'none' });
      return false;
    }
    return true;
  },

  submit() {
    if (this.data.submitting || this.data.uploading) return;
    if (!this.validateForm()) return;
    
    this.setData({ submitting: true });
    
    const data = {
      title: this.data.title.trim(),
      province: this.data.selectedProvince,
      city: this.data.selectedCity,
      district: this.data.selectedDistrict,
      address: this.data.address.trim(),
      area: parseFloat(this.data.area),
      houseType: this.data.houseType,
      floor: this.data.floor || '',
      rentType: this.data.rentType,
      price: parseFloat(this.data.price),
      facilities: this.data.facilities.join(','),
      description: this.data.description || '',
      pics: JSON.stringify(this.data.images)
    };

    const apiCall = this.data.isEdit 
      ? updateHouse({ houseId: this.data.houseId, ...data })
      : publishHouse(data);

    apiCall.then(res => {
      this.setData({ submitting: false });
      if (res.code === 200) {
        wx.showModal({
          title: this.data.isEdit ? '修改成功' : '发布成功',
          content: this.data.isEdit ? '房源信息已更新' : '房源已提交，等待管理员审核',
          showCancel: false,
          success: () => wx.navigateBack()
        });
      } else {
        wx.showToast({ title: res.message || (this.data.isEdit ? '修改失败' : '发布失败'), icon: 'none' });
      }
    }).catch(err => {
      this.setData({ submitting: false });
      wx.showToast({ title: err.message || (this.data.isEdit ? '修改失败' : '发布失败'), icon: 'none' });
    });
  }
});
