// pages/category/index.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryList: [],
    currentIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getCategoryList();
  },
  // 获取分类
  getCategoryList() {
    db.collection('menu_category').get().then(res => {
      this.setData({
        categoryList: res.data,
      });
      this.getCateGoodsList_first(res.data[this.data.currentIndex]._id);
    });
  },
  // 获取列表
  getCateGoodsList(event) {
    let {
      id,
      index
    } = event.currentTarget.dataset;
    this.setData({
      currentIndex: index,
    });
    db.collection('menu_goods').where({
      type: id,
      status: true,
    }).get().then(res => {
      this.do_contact(res.data);
    })
  },
  // 联系购物车
  do_contact(data) {
    let cartList = app.globalData.cartList;
    let newData = data.map(mItem => {
      let current = cartList.find(fItem => fItem._id === mItem._id);
      mItem.count = current ? current.count : 0;
      return mItem;
    })
    this.setData({
      goodsList: newData,
    });
  },
  // 首次加载
  getCateGoodsList_first(id) {
    db.collection('menu_goods').where({
      type: id,
      status: true,
    }).get().then(res => {
      this.do_contact(res.data);
    })
  },
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
  // 加
  do_plus(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      goodsList
    } = this.data;
    let newGoodsList = goodsList.map((gItem, gIndex) => {
      if (gIndex === Number(index)) {
        gItem.count = gItem.count ? gItem.count + 1 : 1;
      }
      return gItem;
    });
    this.setData({
      goodsList: newGoodsList,
    });
    this.do_cart(newGoodsList[index]);
  },
  // 减
  do_minus(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      goodsList
    } = this.data;
    let newGoodsList = goodsList.map((gItem, gIndex) => {
      if (gIndex === Number(index)) {
        gItem.count = gItem.count - 1 < 0 ? 0 : gItem.count - 1;
      }
      return gItem;
    });
    this.setData({
      goodsList: newGoodsList,
    });
    this.do_cart(newGoodsList[index]);
  },

  // 增减购物车
  do_cart(item) {
    let cartList = app.globalData.cartList;
    let index = cartList.findIndex(f => f._id === item._id);
    if (index < 0) {
      item.checked = true;
      cartList.push(item);
    } else {
      cartList[index].count = item.count;
    }
    if (item.count === 0) {
      cartList.splice(index, 1);
    } else {
      app.globalData.cartList = cartList;
      wx.setStorageSync('cartList', cartList);
    }
  },
})