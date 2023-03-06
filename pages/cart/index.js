// pages/cart/index.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!wx.getStorageSync('userInfo')) {
      this.do_login();
      return;
    }
    this.initData();
  },
  initData() {
    let cartList = app.globalData.cartList;
    this.setData({
      cartList: app.globalData.cartList,
      allChecked: cartList.length && cartList.every(item => item.checked),
      totalPrice: this.getTotalprice(cartList),
    });
  },
  // 勾选
  checkboxChange(event) {
    let {
      checked,
      index
    } = event.currentTarget.dataset;
    let cartList = this.data.cartList;
    cartList[index].checked = !checked;
    this.setData({
      cartList: cartList,
      allChecked: cartList.every(item => item.checked),
      totalPrice: this.getTotalprice(cartList),
    });
    app.globalData.cartList = cartList;
    wx.setStorageSync('cartList', cartList);
  },
  // 减
  minus(e) {
    let index = e.currentTarget.dataset.index;
    let cartList = this.data.cartList;
    cartList[index].count = cartList[index].count - 1;
    if (cartList[index].count < 1) {
      cartList.splice(index, 1);
      // wx.showToast({
      //   title: '当前数量不能减少了',
      //   icon: 'none',
      // });
      // return;
    }
    this.setData({
      cartList: cartList,
      totalPrice: this.getTotalprice(cartList),
    });
    app.globalData.cartList = cartList;
    wx.setStorageSync('cartList', cartList);
  },
  // 加
  plus(e) {
    let index = e.currentTarget.dataset.index;
    let cartList = this.data.cartList;
    // // 库存判断
    // if (cartList[index].count + 1 > cartList[index].stock) {
    //   wx.showToast({
    //     title: '库存不足',
    //     icon: 'error'
    //   });
    //   return;
    // }
    cartList[index].count = cartList[index].count + 1;
    this.setData({
      cartList: cartList,
      totalPrice: this.getTotalprice(cartList),
    });
    app.globalData.cartList = cartList;
    wx.setStorageSync('cartList', cartList);
  },
  // 跳转菜品详情
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
  // 全选
  allChecked() {
    if (!this.data.cartList?.length) return;
    let {
      cartList,
      allChecked
    } = this.data;
    cartList = cartList.map(item => {
      item.checked = !allChecked
      return item;
    });
    this.setData({
      cartList,
      allChecked: !allChecked,
      totalPrice: this.getTotalprice(cartList),
    });
    app.globalData.cartList = cartList;
    wx.setStorageSync('cartList', cartList);
  },
  // 计算总价
  getTotalprice(list) {
    let checkedList = list.filter(item => item.checked);
    let totalPrice = checkedList.reduce((prev, next) => {
      return prev + next.count * next.price
    }, 0);
    return totalPrice.toFixed(2);
  },
  // 跳转订单
  toOrder() {
    // 判断是否扫码
    if(!app.globalData.tableNumber) {
      wx.showToast({
        title: '请扫描二维码',
        icon: 'error',
      });
      return;
    }
    let orderList = this.data.cartList.filter(item => item.checked);
    if (!orderList.length) {
      wx.showToast({
        title: '请选择',
        icon: 'none',
      });
      return;
    }
    for (let item of orderList) {
      // 库存判断
      if (item.count > item.stock) {
        wx.showToast({
          title: item.name + '库存不足',
          icon: 'error'
        });
        return;
      }
    }

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
        console.log(res);
        if (res.cancel) {}
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
              this.initData();
            })
          });
        }
      }
    })
  },


})