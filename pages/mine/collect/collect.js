// pages/mine/collect/collect.js
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
  onLoad(options) {
    this.get_collectList();
  },
  get_collectList() {
    db.collection('menu_collects').where({
      _openid: app.globalData.openid
    }).orderBy('addTime', 'desc').get().then(res => {
      this.setData({
        collectList: res.data
      })
    })
  },
  cancel_collect(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      goodsId
    } = this.data.collectList[index];
    db.collection('menu_collects').where({
      _openid: app.globalData.openid,
      goodsId
    }).get().then(res => {
      db.collection('menu_collects').doc(res.data[0]._id).remove().then(() => {
        wx.showToast({
          title: '取消成功',
          icon: 'none'
        });
        this.get_collectList();
      });
    })
  },
  toGoodsDetail(event) {
    let id = event.currentTarget.dataset.id;

    db.collection('menu_goods').doc(id).get().then(res => {
      console.log(res);
      let {
        status,
        stock
      } = res.data;
      if (!status || stock <= 0) {
        wx.showToast({
          title: '库存不足或已下架',
          icon: 'none'
        })
      } else {
        wx.navigateTo({
          url: '/pages/goodsDetail/goodsDetail?goodsId=' + id,
        });
      }
    })
  },
})