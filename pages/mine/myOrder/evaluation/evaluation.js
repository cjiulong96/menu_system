// pages/mine/myOrder/evaluation/evaluation.js
const util = require('../../../../utils/util');
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
    console.log(options);
    this.setData({
      orderId: options.orderId,
    });
  },
  getValue(e) {
    this.setData({
      content: e.detail.value,
    });
  },
  submit() {
    let {
      nickName,
      avatarUrl
    } = app.globalData.userinfo;
    let {
      content,
      orderId
    } = this.data;
    db.collection('menu_evaluation').add({
      data: {
        nickName,
        avatarUrl,
        content,
        addTime: util.formatTime(new Date()),
        orderId,
      }
    }).then(res => {
      wx.navigateBack({
        delta: 0,
        success: () => {
          wx.showToast({
            title: '提交成功',
          });
        }
      })
    })
  },
})