// pages/mine/manager/manager.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow(options) {
    // this.setData({
    //   status: Number(options.type)
    // })
    this.getOrderList();
    this.orderNotice();
  },
  onUnload() {
    console.log('no');
    // 关闭监听
    this.data.watcher.close();
  },
  // 订单通知
  orderNotice() {
    let _this = this;
    let watcher = db.collection('menu_orders').where({
      status: 0
    }).watch({
      onChange: function (snapshot) {
        console.log(snapshot);
        // if (snapshot.docChanges.length > 0 && snapshot.docChanges[0].dataType === 'add') {
        if (snapshot.docChanges.length > 0 && snapshot.docChanges[0].queueType === 'enqueue') {
          console.log('yes');
          wx.playBackgroundAudio({
            dataUrl: 'https://636c-cloud1-3gzasuxh81483035-1305201314.tcb.qcloud.la/cloudbase-cms/upload/2023-03-03/%E6%82%A8%E6%9C%89%E6%96%B0%E7%9A%84%E8%AE%A2%E5%8D%95%EF%BC%8C%E8%AF%B7%E6%B3%A8%E6%84%8F%E6%9F%A5%E6%94%B6.mp3?sign=21ef2e51d3f72ec52b4de96ab4e5106d&t=1677982425',
          });
          wx.showModal({
            title: '新订单通知',
            content: '请及时制作',
            showCancel: false,
            complete: (res) => {

              if (res.confirm) {
                wx.stopBackgroundAudio({
                  success: () => {}
                })
                console.log('do');
                _this.getOrderList();
              }
            }
          })
        }
      },
      onError: function (err) {
        console.log(err);
      }
    })
    this.setData({
      watcher,
    });
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

  // 上菜
  do_serving(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let currentOrder = this.data.orderList[index];
    wx.showModal({
      title: '上菜',
      content: '是否完成此订单？',
      confirmText: '确定',
      complete: (res) => {
        if (res.confirm) {
          db.collection('menu_orders').doc(currentOrder._id).update({
            data: {
              status: 2,
            }
          }).then(res => {
            wx.showToast({
              title: '上菜成功',
            });
            this.getOrderList();
          });
        }
      }
    });
  },

})