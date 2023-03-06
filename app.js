// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-3gzasuxh81483035'
    });
    if (wx.getStorageSync('cartList').length) {
      this.globalData.cartList = wx.getStorageSync('cartList');
    }
    if (wx.getStorageSync('userInfo')) {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
    }
    wx.cloud.callFunction({
      name: 'menu_get_openid',
    }).then(res => {
      this.globalData.openid = res.result.openid;
    });
  },
  getUserInfo() {
    wx.cloud.database().collection('menu_users').where({
      _openid: this.globalData.openid,
    }).get().then(res => {
      this.globalData.userInfo = res.data[0];
      wx.setStorageSync('userInfo', this.globalData.userInfo);
    });
  },
  globalData: {
    userInfo: null,
    openid: null,
    cartList: [], //购物车列表
    orderList: [], //订单内的商品列表
    tableNumber: null, //桌号
  }
})