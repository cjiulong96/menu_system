// pages/index/cateDetail/cateDetail.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCateGoodsList(options.typeId);
  },
  getCateGoodsList(id) {
    db.collection('menu_goods').where({
      type: id,
    }).get().then(res => {
      this.setData({
        goodsList: res.data,
      });
    })
  },
  // 跳转菜品详情
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
})