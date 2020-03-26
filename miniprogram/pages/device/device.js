//index.js
//获取应用实例
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    add: false,
    deviceid: null,
    devicename: null,
    devicepassword:null,

    device_list: [],
    device_state: [],
    devicecheck:0,

    selectdeviceid: null,
    selectdevicename: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // 1
    var pagethis = this;
    //获取设备列表
    wx.getStorage({
      key: 'daviceinfo',
      success: function (res) {
        pagethis.setData({
          device_list: res.data
        })
      },
    })
    //获取选中设备信息
    wx.getStorage({
      key: 'selectdevice',
      success: function (res) {
        pagethis.setData({
          selectdevicename: res.data.name,
          selectdeviceid: res.data.id,
          selectdevicepassword:res.data.password,
          devicecheck: res.data.checknumber
        })
      },
    })
    // wx.switchTab({
    //   url: '../../pages/index/index'
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //3
    app.globalData.devicename = this.data.selectdevicename
    app.globalData.deviceid = this.data.selectdeviceid
    app.globalData.devicepassword = this.data.selectdevicepassword
    app.globalData.checknumber = this.data.checknumber

    setInterval(this.device_getstatus, 2000); 
    this.setData({
      userInfo:app.globalData.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //2
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
  getUserInfo: function (e) {
    // 获取用户信息失败
    if (e.detail.userInfo == null)
    {
      return 
    }
    //获取用户信息成功
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 1.显示或隐藏modal
  showModal(e) {
    // this.setData({
    //   add: true
    // })
    //1. 插入数据
    // db.collection('device_info').add({
    //   // data 字段表示需新增的 JSON 数据
    //   data: {
    //     _id: '46202894', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
    //     deviceid: "46202893",
    //     devicename: "QT_0003",
    //   },
    //   success: function(res) {
    //     // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
    //     console.log(res)
    //   }
    // })
    //2. 查询数据
    db.collection('device_info').doc('46202893').get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data)
      }
    }) 
    //3. 更新数据
    db.collection('device_info').doc('46202894').update({
      // data 传入需要局部更新的数据
      data: {
        // 表示将 deviceid 字段置为 46202894
        deviceid: "46202894"
      },
      success: function(res) {
        console.log(res.data)
      }
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
        inputvalue: null,
        devicename: null,
        deviceid:null,
        devicepassword:null
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
  
  input_devicepassword: function (e) {
    this.setData(
      {
        devicepassword: e.detail.value
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
      app.get_devicestatus(device_string, 0, this.devicestate_handler)
    }
  },
  //取消添加
  cancel: function () {
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
    //空白信息直接返回
    if (this.data.deviceid == null)
    {
      return 
    }
    //添加信息
    var newarray = [{
      devicename: this.data.devicename,
      deviceid: this.data.deviceid,
      devicepassword: this.data.devicepassword
    }]
    //保存信息
    this.setData({
      device_list: this.data.device_list.concat(newarray)
    })
    wx.setStorage({
      key: 'daviceinfo',
      data: this.data.device_list,
    })
    //处理添加的第一个设备选中问题
    if(this.data.device_list.length == 1)
    {
      app.globalData.devicename = this.data.devicename
      app.globalData.deviceid = this.data.deviceid
      app.globalData.devicepassword = this.data.devicepassword
      app.globalData.checknumber = 0
      var selectdevice = {
        name: this.data.devicename,
        id: this.data.deviceid,
        password:this.data.devicepassword,
        checknumber: 0
      }
      wx.setStorage({
        key: 'selectdevice',
        data: selectdevice,
      })
      this.setData({
        devicecheck: 0
      })
    }
    //调用清空输入框函数
    this.clearInputEvent();
  },
  //设备id状态处理函数
  devicestate_handler: function (res) {
    this.setData({
      device_state: res.data
    })
    app.globalData.devicestate = this.data.device_state.devices[this.data.devicecheck].online
  },
  //删除设备
  deletedevice: function (e) {
    this.data.device_list.splice(e.currentTarget.dataset.target,1)
    //保存设备信息
    this.setData({
      device_list:this.data.device_list
    })
    wx.setStorage({
      key: 'daviceinfo',
      data: this.data.device_list,
    })
    //更改选中设备 并保存
    console.log(this.data.device_list)
    if (this.data.device_list.length == 0)
    {
      try {
        wx.removeStorageSync('selectdevice')
      } catch (e) {
      }
      app.globalData.deviceid = null
      app.globalData.devicename = null
      app.globalData.devicepassword = null
      app.globalData.checknumber = null
    }else
    {
      var newchecknum = 0
      if (this.data.devicecheck > this.data.device_list.length - 1) 
      {
        newchecknum = this.data.device_list.length - 1
      }else
      {
        newchecknum = this.data.devicecheck
      }
      var selectdevice = {
        name: this.data.device_list[newchecknum].devicename,
        id: this.data.device_list[newchecknum].deviceid,
        password: this.data.device_list[newchecknum].devicepassword,
        checknumber: newchecknum
      }
      wx.setStorage({
        key: 'selectdevice',
        data: selectdevice,
      })
      this.setData({
        devicecheck: newchecknum
      })
      app.globalData.deviceid = this.data.device_list[newchecknum].deviceid
      app.globalData.devicename = this.data.device_list[newchecknum].devicename
      app.globalData.devicepassword = this.data.device_list[newchecknum].devicepassword
      app.globalData.checknumber = newchecknum
      console.log(app.globalData.deviceid )
    }

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
        password: this.data.device_list[e.currentTarget.dataset.target].devicepassword,
        checknumber: e.currentTarget.dataset.target
      }
      wx.setStorage({
        key: 'selectdevice',
        data: selectdevice,
      })
    }catch(err){
      console.log(err)
    }
    app.globalData.deviceid = this.data.device_list[e.currentTarget.dataset.target].deviceid
    app.globalData.devicename = this.data.device_list[e.currentTarget.dataset.target].devicename
    app.globalData.devicepassword = this.data.device_list[e.currentTarget.dataset.target].devicepassword
    app.globalData.checknumber = e.currentTarget.dataset.target
  },
  //测试函数
  test: function (e) {
    console.log('test')
  }

})