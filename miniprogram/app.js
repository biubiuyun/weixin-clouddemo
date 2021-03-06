//app.js
App({
  globalData: {
    userInfo: null,
    api_key: '1WnxTijFsEp7dWexCtkzaNPqUgc=',
    deviceid:null,
    devicename:'',
    devicepassword:null,
    devicecheck:null,
    devicestate:false,

    warning_list: ["", "Error:IN0", "Error:IN1", "Error:IN2", "Error:IN3", "Error:IN4", "Error:IN5", "Error:IN6", "Error:IN7",
      "Error:IN10", "Error:IN11", "Error:IN12", "Error:IN13", "Error:IN14", "Error:IN15","","",
      "ALM5 干球低温", "ALM5 干球高温", "ALM5 湿球低温", "ALM5 湿球高温", "ALM6 干球低温", "ALM6 干球高温", "ALM6 湿球低温", "ALM6 湿球高温", "",
      "ALM1", "ALM1", "ALM1", "ALM1", "ALM2", "ALM2", "ALM2", "ALM2", "ALM3", "ALM3", "ALM3", "ALM3", "ALM4", "ALM4", "ALM4", "ALM4",
      "干球断线", "湿球断线", "485通信异常"
    ],
    warning_curvlist:[]
  },
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    // this.globalData = {}
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        if (!custom.top || !custom.bottom) {
          custom.bottom = 56
          custom.top = 24
        }
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

  },
  get_datastreams: function (datastreams, cb) {
    wx.request({
      url: 'https://api.heclouds.com/devices/' + this.globalData.devices + '/datastreams/' + datastreams, // 仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'api-key': this.globalData.api_key //
      },
      success(res) {
        cb(res.data);
      }
    })
  },
  //获取设备状态
  //设备id，产品密匙，回调函数
  get_devicestatus: function (deviceid, apikey, cb) {
    wx.request({
      url: 'https://api.heclouds.com/devices/status?devIds=' + deviceid,
      header: {
        'api-key': this.globalData.api_key
      },
      success(res) {
        cb(res.data);
      }
    })
  },
  //获取所有数据流当前数据
  get_devicevalue: function (deviceid, apikey, cb) {
    wx.request({
      url: 'https://api.heclouds.com/devices/' + deviceid + '/datapoints?newadd=true',
      header: {
        'api-key': this.globalData.api_key
      },
      success(res) {
        cb(res.data);
      }
    })
  },
  //发送指令
  post_cmd: function (deviceid, apikey, functionnumber, value, cb) {
    wx.request({
      url: 'https://api.heclouds.com/cmds?device_id=' + deviceid, // 仅为示例，并非真实的接口地址
      data: 'fa:' + functionnumber + ':' + value + ':af',
      header: {
        'api-key': this.globalData.api_key //
      },
      method: "POST",
      success(res) {
        cb(res.data);
      }
    })
  },
  getcmd_state:function(cmd_uuid, cb)
  {
    wx.request({
      url: 'https://api.heclouds.com/cmds/' + cmd_uuid,
      header: {
        'api-key': this.globalData.api_key
      },
      success(res) {
        cb(res.data);
      }
    })
  }
})
