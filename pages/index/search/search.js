// pages/index/search/search.js
const db = wx.cloud.database();
const {
  debounce
} = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.debounce_func = debounce();
  },
  getInpVal(e) {
    if (!e.detail.value) {
      this.setData({
        goodsList: [],
      });
    }
    this.setData({
      inpVal: e.detail.value,
    });
  },
  test() {
    if (!this.data.inpVal) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return;
    }
    db.collection('menu_goods').where({
      name: db.RegExp({
        regexp: this.data.inpVal,
        options: 'i',
      }),
      status: true,
      stock: db.command.gt(0),
    }).get().then(res => {
      this.setData({
        goodsList: res.data,
      });
    });
  },
  do_search() {
    this.debounce_func(this.test, 500, true);
  },
  // 跳转菜品详情
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
})