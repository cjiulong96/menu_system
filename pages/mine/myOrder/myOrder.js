// pages/mine/myOrder/myOrder.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      status: Number(options.type)
    })
    this.getOrderList();
  },

  // 切换导航
  handleMenu(e) {
    let type = e.currentTarget.dataset.type;
    this.setData({
      status: Number(type),
      orderList: [],
    });
    this.getOrderList();
  },
  // 获取订单列表
  getOrderList() {
    this.setData({
      orderList: [],
    });
    db.collection('menu_orders').where({
      status: this.data.status,
      _openid: app.globalData.openid,
    }).orderBy('addTime', 'desc').get().then(res => {
      this.setData({
        orderList: res.data,
      });
    });
  },

  // 支付
  do_pay(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let currentOrder = this.data.orderList[index];
    wx.showModal({
      title: '提示',
      content: '是否支付' + currentOrder.totalPrice + '元？',
      confirmText: '支付',
      complete: (res) => {
        if (res.confirm) {
          db.collection('menu_orders').doc(currentOrder._id).update({
            data: {
              status: 0,
            }
          }).then(res => {
            wx.showToast({
              title: '支付成功',
            });
            this.getOrderList();
            // 计算销量库存
            this.calcNumber();
          });

        }
      }
    });
  },
  // 计算销量 库存
  calcNumber() {
    for (let item of this.data.orderList) {
      db.collection('menu_goods').doc(item._id).update({
        data: {
          sales: db.command.inc(item.count),
          stock: db.command.inc(-item.count),
        }
      }).then(res => {
        console.log(res, '==');
      })
    }
  },
  // 取消订单
  do_cancel(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let currentOrder = this.data.orderList[index];
    wx.showModal({
      title: '提示',
      content: '是否取消此订单？',
      confirmText: '确定',
      complete: (res) => {
        if (res.confirm) {
          db.collection('menu_orders').doc(currentOrder._id).update({
            data: {
              status: -2,
            }
          }).then(res => {
            wx.showToast({
              title: '取消成功',
            });
            this.getOrderList();
            this.refund();
          });
        }
      }
    });
  },
  // 退款 to
  refund() {

  },
  // 确认收货
  do_confirm(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let currentOrder = this.data.orderList[index];
    wx.showModal({
      title: '提示',
      content: '是否确认收货？',
      confirmText: '确定',
      complete: (res) => {
        if (res.confirm) {
          db.collection('menu_orders').doc(currentOrder._id).update({
            data: {
              status: 2,
            }
          }).then(res => {
            wx.showToast({
              title: '收货成功',
            });
            this.getOrderList();
          });
        }
      }
    });
  },

  // 评价
  do_evaluation(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let currentOrder = this.data.orderList[index];
    wx.navigateTo({
      url: '/pages/mine/myOrder/evaluation/evaluation?orderId=' + currentOrder._id,
    });
  },
})