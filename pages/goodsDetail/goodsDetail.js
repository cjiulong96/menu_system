// pages/goodsDetail/goodsDetail.js
const {
  formatTime
} = require('../../utils/util');
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cartList: app.globalData.cartList,
      goodsId: options.goodsId,
    });
  },
  onShow() {
    this.getGoodsDetail();
    this.isCollect();
  },
  // 获取详情
  getGoodsDetail() {
    db.collection('menu_goods').doc(this.data.goodsId).get().then(res => {
      this.setData({
        detail: res.data,
      });
    });
  },
  // 分享好友
  onShareAppMessage() {
    let detail = this.data.detail;
    return {
      title: detail.name,
      path: 'pages/goodsDetail/goodsDetail?goodsId' + detail._id,
      imageUrl: detail.cover,
    }
  },
  // 分享朋友圈
  onShareTimeline() {
    let detail = this.data.detail;
    return {
      title: detail.name,
      query: {
        id: detail._id,
      },
      imageUrl: detail.cover
    }
  },
  //添加购物车
  addCart() {
    // 先登录
    if (!wx.getStorageSync('userInfo')) {
      this.do_login();
      return;
    }
    let cartList = app.globalData.cartList;
    let detail = this.data.detail;
    let index = -1;
    if (!cartList.length) {
      detail.count = 1;
      detail.checked = true;
      app.globalData.cartList.push(detail);
      wx.setStorageSync('cartList', app.globalData.cartList);
    } else {
      for (let idx in cartList) {
        if (cartList[idx]._id === detail._id) {
          index = idx;
        }
      }
      if (index < 0) {
        detail.count = 1;
        detail.checked = true;
        app.globalData.cartList.push(detail);
        wx.setStorageSync('cartList', app.globalData.cartList);
      } else {
        cartList[index].count = cartList[index].count + 1;
        app.globalData.cartList = cartList;
        wx.setStorageSync('cartList', app.globalData.cartList);
      }
    }
    wx.showToast({
      title: '添加成功',
    });
    this.setData({
      cartList: app.globalData.cartList,
    });
  },
  // 跳转订单
  toOrder() {
    // 判断是否扫码
    if (!app.globalData.tableNumber) {
      wx.showToast({
        title: '请扫描二维码',
        icon: 'error',
      });
      return;
    }
    // 先登录
    if (!wx.getStorageSync('userInfo')) {
      this.do_login();
      return;
    }

    // 库存判断
    if (1 > this.data.detail.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'error'
      });
      return;
    }
    let orderList = [];
    orderList.push({
      ...this.data.detail,
      count: 1,
    });

    app.globalData.orderList = orderList;
    wx.navigateTo({
      url: '/pages/order/order',
    })
  },
  do_login() {
    let _this = this;
    wx.showModal({
      title: '登录',
      content: '获取你的昵称、头像',
      confirmText: '允许',
      complete: (res) => {
        if (res.confirm) {
          wx.getUserProfile({
            desc: '用于完善用户信息',
          }).then(result => {
            db.collection('menu_users').where({
              _openid: app.globalData.openid,
            }).get().then(res => {
              if (!res.data.length) {
                db.collection('menu_users').add({
                  data: {
                    nickName: result.userInfo.nickName,
                    avatarUrl: result.userInfo.avatarUrl,
                  }
                }).then(r => {
                  wx.showToast({
                    title: '登陆成功',
                  });
                  app.getUserInfo();
                })
              } else {
                db.collection('menu_users').doc(
                  res.data[0]._id
                ).update({
                  data: {
                    nickName: result.userInfo.nickName,
                    avatarUrl: result.userInfo.avatarUrl,
                  }
                }).then(r => {
                  wx.showToast({
                    title: '登录成功',
                  });
                  app.getUserInfo();
                })
              }
            })
          });
        }
      }
    })

  },
  // 跳购物车
  to_cart() {
    wx.switchTab({
      url: '/pages/cart/index',
    });
  },
  // 收藏
  do_collect() {
    let {
      cover,
      name,
      price,
      _id
    } = this.data.detail;
    db.collection('menu_collects').where({
      _openid: app.globalData.openid,
      goodsId: _id
    }).get().then(res => {
      if (res.data.length) {
        db.collection('menu_collects').doc(res.data[0]._id).remove().then(() => {
          wx.showToast({
            title: '取消成功',
            icon: 'none'
          })
          this.setData({
            isCollect: false
          })
        });
      } else {
        db.collection('menu_collects').add({
          data: {
            cover,
            name,
            price,
            goodsId: _id,
            addTime: formatTime(new Date())
          }
        }).then(() => {
          wx.showToast({
            title: '收藏成功',
            icon: 'none'
          });
          this.setData({
            isCollect: true
          })
        })
      }
    })
  },
  // 判断是否收藏
  isCollect() {
    db.collection('menu_collects').where({
      goodsId: this.data.goodsId,
      _openid: app.globalData.openid
    }).get().then(res => {
      this.setData({
        isCollect: !!res.data.length
      })
    })
  },
})