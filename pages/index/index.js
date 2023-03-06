// index.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    categoryList: [],
    goodsList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取轮播图
    this.getBanners();
    // 获取分类
    this.getCategoryList();

  },
  onShow() {
    // 获取菜品
    this.getGoodsList();
  },
  // 获取轮播图
  getBanners() {
    db.collection('menu_banners').get().then(res => {
      this.setData({
        bannerList: res.data,
      });
    });
  },
  // banner跳转详情
  toBannerDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/index/bannerDetail/bannerDetail?bannerId=' + id,
    });
  },
  // 分类
  getCategoryList() {
    db.collection('menu_category').where({
      isShowOnHome: true,
    }).get().then(res => {
      this.setData({
        categoryList: res.data,
      });
    });
  },
  // 菜品
  getGoodsList() {
    db.collection('menu_goods').where({
      status: true,
      isHome: true,
    }).get().then(res => {
      this.setData({
        goodsList: res.data,
      });
    });
  },
  // 跳转菜品详情
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
  toCateDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/index/cateDetail/cateDetail?typeId=' + id,
    });
  },
  // 搜索
  toSearch() {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },
  // 扫码
  do_scanCode() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        console.log(res, '=-------');
        app.globalData.tableNumber = res.result;
        this.setData({
          tableNumber: res.result,
        });
      },
      fail: (res) => {},
      complete: (res) => {},
    })
  },
})