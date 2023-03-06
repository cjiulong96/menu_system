// pages/order/order.js
const app = getApp();
const util = require('../../utils/util');
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let orderList = app.globalData.orderList;
    this.getTotalprice(orderList);
    this.setData({
      orderList,
    });
    this.setData({
      tableNumber: app.globalData.tableNumber,
    });
  },
  // 减
  minus(e) {
    let index = e.currentTarget.dataset.index;
    let orderList = this.data.orderList;
    if (orderList[index].count <= 1) {
      wx.showToast({
        title: '当前数量不能减少了',
        icon: 'none',
      });
      return;
    }
    orderList[index].count = orderList[index].count - 1;
    this.getTotalprice(orderList);
    this.setData({
      orderList: orderList,
    });
    app.globalData.orderList = orderList;
    wx.setStorageSync('orderList', orderList);
  },
  // 加
  plus(e) {
    let index = e.currentTarget.dataset.index;
    let orderList = this.data.orderList;
    // 库存判断
    if (orderList[index].count + 1 > orderList[index].stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'error'
      });
      return;
    }
    orderList[index].count = orderList[index].count + 1;
    this.getTotalprice(orderList);
    this.setData({
      orderList: orderList,
    });
    app.globalData.orderList = orderList;
    wx.setStorageSync('orderList', orderList);
  },
  // 跳转菜品详情
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
    });
  },
  // 计算总价
  getTotalprice(list) {
    let totalPrice = list.reduce((prev, next) => {
      return prev + next.count * next.price
    }, 0);
    let total = list.reduce((prev, next) => {
      return prev + next.count
    }, 0)
    this.setData({
      total,
      totalPrice: totalPrice.toFixed(2),
    })
  },
  // 添加地址
  addAddress() {
    console.log('add');
    // 暂无权限 todo
    // let _this = this;
    // wx.chooseAddress({
    //   success: (res) => {
    //     let {
    //       userName,
    //       provinceName,
    //       postalCode,
    //       provinceName,
    //       cityName,
    //       countyName,
    //       streetName,
    //       detailInfo,
    //       detailInfoNew,
    //       nationalCode,
    //       telNumber,
    //     } = res;
    //     console.log(res);
    //     _this.setData({
    //       userName,
    //       telNumber,
    //       address: provinceName + cityName + countyName + detailInfo,
    //     })
    //   }
    // })
  },
  // 获取备注
  getInpVal(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  // 提交订单
  addOrder() {
    let {
      // userName,
      // telNumber,
      // address,
      totalPrice,
      orderList,
      remark,
    } = this.data;
    db.collection('menu_orders').add({
      data: {
        // userName,
        // telNumber,
        // address,
        tableNumber: app.globalData.tableNumber,
        totalPrice,
        goodsList: orderList,
        addTime: util.formatTime(new Date()),
        remark,
        status: -1,
      }
    }).then(res => {
      this.xuniPay(res._id);
    })
  },
  // 虚拟支付
  xuniPay(id) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否支付' + this.data.totalPrice + '元',
      confirmText: '支付',
      complete: (res) => {
        if (res.cancel) {
          wx.navigateBack({
            delta: 0,
            success: () => {
              wx.showToast({
                icon: 'error',
                title: '支付失败',
              });
            }
          });
        }

        if (res.confirm) {
          db.collection('menu_orders').doc(id).update({
            data: {
              status: 0,
            }
          });
          wx.navigateBack({
            delta: 0,
            success: () => {
              wx.showToast({
                title: '支付成功',
              });
              // 计算销量库存
              _this.calcNumber();
            }
          });

        }

        // 从购物车清除订单内的列表
        this.clearCartList();
      }
    });
  },
  // 移出购物车
  clearCartList() {
    let {
      cartList,
      orderList
    } = app.globalData;
    let newCartList = cartList.filter(cItem => !orderList.some(oItem => cItem._id === oItem._id));
    app.globalData.cartList = newCartList;
    wx.setStorageSync('cartList', newCartList);
    wx.setStorageSync('orderList', []);
  },
  // 计算销量 库存
  calcNumber() {
    for (let item of app.globalData.orderList) {
      console.log(item._id, 'item._id');
      db.collection('menu_goods').doc(item._id).update({
        data: {
          sales: db.command.inc(item.count),
          stock: db.command.inc(-item.count),
        }
      }).then(res => {
        console.log(res, 'pp');
      })
    }
  },
})