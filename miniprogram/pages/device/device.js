//index.js
//获取应用实例
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    add: false,
    deviceid: null,
    devicename: null,
    device_list: [],
    device_state: [],
    devicecheck:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   setInterval(this.device_getstatus, 2000); 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var pagethis = this;
    db.collection('device_info').get({
      success: function (res) {
        pagethis.setData({
          device_list: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 1.显示或隐藏modal
  showModal(e) {
    this.setData({
      add: true
    })
  },
  hideModal(e) {
    this.setData({
      add: false
    })
  },
  // 2.滑动列表框
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },
  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },
  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  //清空输入框
  clearInputEvent: function () {
    this.setData(
      {
        inputvalue: null
      }
    );
  },
  input_devicename: function (e) {
    this.setData(
      {
        devicename: e.detail.value
      }
    );

  },
  //获取输入框内容
  input_deviceid: function (e) {
    this.setData(
      {
        deviceid: e.detail.value
      }
    );

  },
  // 获取设备状态
  device_getstatus: function () {
    var pagethis = this
    var deviceid_list = []
    //先读取所有设备id
    for (var device_i in pagethis.data.device_list) {
      var id = pagethis.data.device_list[device_i].deviceid
      deviceid_list.push(id)
    }
    //判断是否有设备
    if (deviceid_list.length > 0) {
      //将设备id转换成xxxxxx,xxxxxx格式批量查询设备信息
      var device_string = deviceid_list.join(',')
      // app.get_devicestatus(device_string, 0, function (printdata) { console.log(printdata.data) })
      app.get_devicestatus(device_string, 0, this.devicestate_handler)
    }
  },
  //取消添加
  cancel: function () {
    console.log('test')
    //隐藏modal
    this.hideModal();
    //调用清空输入框函数
    this.clearInputEvent();
  },
  //确认添加  
  confirm: function () {
    //隐藏modal
    this.hideModal();
    //提交设备信息字段到数据库
    var pagesthis = this;
    db.collection('device_info').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: this.data.deviceid, // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        deviceid: this.data.deviceid,
        devicename: this.data.devicename
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      }
    })
    //刷新界面显示
    this.onShow();
    //调用清空输入框函数
    this.clearInputEvent();
  },
  //设备id状态处理函数
  devicestate_handler: function (res) {
    this.setData({
      device_state: res.data
    })
  },
  //删除设备
  deletedevice: function (e) {
    console.log(e.currentTarget.dataset.target)
    db.collection('device_info').doc(e.currentTarget.dataset.target).remove({
      success: function (res) {
        console.log(res.data)
      }
    })
    //刷新界面显示
    this.onShow();
  },
  //选中设备
  checkdevice:function(e){
    this.setData({
      devicecheck:e.currentTarget.dataset.target
    })
    try {
      var selectdevice = {
        name: this.data.device_list[e.currentTarget.dataset.target].devicename,
        id: this.data.device_list[e.currentTarget.dataset.target].deviceid,
        state: this.data.device_state.devices[e.currentTarget.dataset.target].online
      }
      wx.setStorage({
        key: 'selectdevice',
        data: selectdevice,
      })
    }catch(err){
      console.log(err)
    }
  },
  //测试函数
  test: function (e) {
    console.log('test')
    this.setData({
      checked:false
    })


  },

})

