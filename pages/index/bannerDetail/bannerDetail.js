// pages/index/bannerDetail/bannerDetail.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerDetail(options.bannerId);
  },
  getBannerDetail(id) {
    db.collection('menu_banners').doc(id).get().then(res => {
      this.setData({
        banner: res.data,
      });
    });
  },
})