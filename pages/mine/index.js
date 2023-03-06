// pages/mine/index.js
const app = getApp();
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
  onLoad: function (options) {
    // this.getUserInfo();
  },
  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },
  toMyOrder(e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/mine/myOrder/myOrder?type=' + Number(index),
    })
  },
  getUserInfo() {
    db.collection('menu_users').where({
      _openid: app.globalData.openid,
    }).get().then(res => {
      this.setData({
        userInfo: res.data.length ? res.data[0] : null,
      });
      app.globalData.userInfo = res.data[0];
      wx.setStorageSync('userInfo', res.data[0]);
    })
  },
  // 登录
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
                  this.getUserInfo();
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
                  this.getUserInfo();
                })
              }
            })
          });
        }
      }
    })
  },
  // 登出
  do_loginout() {
    let _this = this;
    wx.showModal({
      title: '退出登录',
      content: '是否退出登录？',
      complete: (res) => {
        if (res.cancel) {

        }
        app.globalData.userInfo = null;
        this.setData({
          userInfo: null,
        });
        wx.setStorageSync('userInfo', null);
      }
    })
  },
  // 联系客服
  toContact() {
    wx.navigateTo({
      url: '/pages/mine/contact/contact',
    })
  },
  // 意见反馈
  toFeedback() {
    wx.navigateTo({
      url: '/pages/mine/feedback/feedback',
    })
  },
  // 我的收藏
  toCollect() {
    wx.navigateTo({
      url: '/pages/mine/collect/collect',
    });
  },
  // 后厨管理
  toManager() {
    wx.navigateTo({
      url: '/pages/mine/manager/manager',
    });
  },
})