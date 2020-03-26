const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    view:true,
    //指令
    runstate_cmd: '0001',
    runmode_cmd: '0002',
    runprog_cmd: '0003',
    tempsv_cmd: '0004',
    humisv_cmd: '0005',
    //当前指令码
    functioncmd:null,
    //设备信息
    devicename: '',
    device_id: null,
    devicepassword:null,
    devicecheck:null,
    online: false,
    //设备值
    runmode: 0,
    run_state: 0,
    temp_sv: 0,
    temp_pv: 0,
    temp_pid: 0,
    humi_sv: 0,
    humi_pv: 0,
    humi_pid: 0,

    prog_name: '',
    prog_num: 0,

    now_segment: 0,
    all_segment: 0,

    now_circle: 0,
    all_circle: 0,

    nowseg_time: 0,
    time_curr: 0,

    warning_flag:false,
    warning_message:'',
    warning_modal:false,
    warning_curvlist: [],

    showmodal:false,
    showinputmodal:false,
    inputmodal:0,

    inputvalue:null,
    inputtempvalue:null,
    inputhumivalue: null,
    inputprogvalue: null,
    
    //查询指令用
    cmd_uuid:null,
    cmdfail:false,
    waitingcmd:false,
    //运行信息背景
    backinfolist: [{
      color: 'cyan',
      icon: 'fire'
    },
    {
      color: 'blue',
      icon: 'Raindrops'
    }
    ],
    run_info: [{
      name: '程式名称',
      value: ''
    }, {
        name: '运行状态',
        value: ''
    }, {
        name: '循环次数',
        value: ''
    }, {
        name: '当前段数',
        value: ''
    }, {
        name: '当前段时间',
        value: ''
    }, {
        name: '运行总时间',
        value: ''
    },]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pagethis = this
    pagethis.setData({
      devicename: app.globalData.devicename,
      device_id: app.globalData.deviceid,
      devicepassword:app.globalData.devicepassword,
      devicecheck: app.globalData.devicecheck,
      online: app.globalData.devicestate
    })
 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取设备value
     setInterval(this.device_getvalue, 2000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取选中设备信息
    this.setData({
      userInfo: app.globalData.userInfo
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

  //运行模式显示modal
  runmodeclick: function () {
    console.log('test')
    this.setData({
      showmodal:true
    })
  },
  //隐藏modal
  hideModal(e) {
    this.setData({
      showmodal: false,
      showinputmodal:false,
      warning_modal:false,
      cmdfail:false
    })
  },
  //运行模式选择
  runmodeselect(e) {
    this.post_cmd(this.data.device_id, 0, this.data.runmode_cmd, e.currentTarget.dataset.target)
  },

  //发送指令函数
  post_cmd: function (deviceid, apikey, functionnumber, value) {
    if (deviceid > 0 && this.data.online == true) {
      app.post_cmd(deviceid, apikey, functionnumber, value, this.postcmd_handler)
      this.setData({
        waitingcmd:true,
        functioncmd:functionnumber
      })
    }else{
      //弹出设备不在线指令
    }
  },
  //发送指令完成处理函数
  postcmd_handler: function (res) {
    this.setData({
      cmd_uuid: res.data.cmd_uuid
    })
    setTimeout(this.getcmdstate,3000)
  },
  //获取指令状态
  getcmdstate:function()
  {
    if (this.data.cmd_uuid != null) {
      app.getcmd_state(this.data.cmd_uuid, this.getcmdstate_handler)
    }
  },
  //获取指令状态处理函数
  getcmdstate_handler:function(res){
    this.setData({
      waitingcmd: false,
      functioncmd:null
    })
    if(res.data == null)
    {
      return 
    }
    if (res.data.status != 2)
    {
       //弹窗提醒指令失败
       this.setData({
         warning_modal:true,
         cmdfail:true
         
       }) 
    }
  },
  //获取设备数据流
  device_getvalue: function () {

    this.setData({
      devicename: app.globalData.devicename,
      device_id: app.globalData.deviceid,
      devicepassword: app.globalData.devicepassword,
      devicecheck: app.globalData.devicecheck,
      online: app.globalData.devicestate
    })
    if(this.data.device_id != null)
    {
      app.get_devicevalue(this.data.device_id, 0, this.devicevalue_handler)
    }
    
  },
  //设备数据处理函数
  devicevalue_handler: function (res) {
    var pagethis = this
    pagethis.setData({
      device_value: res.data
    })
      // console.log(pagethis.data.device_value.datastreams.length)
      for (var index in pagethis.data.device_value.datastreams) {
      //数据流名称
      var valuename = pagethis.data.device_value.datastreams[index].id
      //数据流时间
      // var time = pagethis.data.device_value.datastreams[index].datapoints[0].at
      // console.log(time)
      switch (valuename) {
        case 'Run_State':
          if (pagethis.data.device_value.datastreams[index].datapoints[0].value == 0) {
            pagethis.data.run_info[1].value = '停止'
            pagethis.data.warning_flag = false
          } else {
            pagethis.data.run_info[1].value = '正在运行'
            pagethis.data.warning_flag = true
          }
          pagethis.setData({
            run_state: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info,
            warning_flag: pagethis.data.warning_flag
          })
          break;
        case 'Humi_SV':
          pagethis.setData({
            humi_sv: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Warning_message':
          var warningreal = false 
          var warningnum = 0
          var datestr = ''
          var date = ''
          var time = ''
          //如果不在线或停机状态，停止报警
          if (pagethis.data.online == false || pagethis.data.warning_flag == false)
          {
            break
          }
          //有报警信息
          if (pagethis.data.device_value.datastreams[index].datapoints[0].value > 0)
          {
            warningreal = true
            warningnum = pagethis.data.device_value.datastreams[index].datapoints[0].value > 44 ? 44 : pagethis.data.device_value.datastreams[index].datapoints[0].value
            datestr = pagethis.data.device_value.datastreams[index].datapoints[0].at
            date = datestr.substr(5, 5)
            time = datestr.substr(11, 8)
            var newarray = [{
              warningmessage: app.globalData.warning_list[warningnum],
              date: date,
              time: time,
              devicename:pagethis.data.devicename
            }]

            pagethis.setData({
              warning_message: app.globalData.warning_list[warningnum],
              warning_modal: warningreal,
              warning_curvlist: pagethis.data.warning_curvlist.concat(newarray),
              warning_flag: false
            })
            app.globalData.warning_curvlist = pagethis.data.warning_curvlist
          }
          break;
        case 'Humi_PV':
          pagethis.setData({
            humi_pv: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Prog_Num':
          pagethis.setData({
            prog_num: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Temp_PV':
          pagethis.setData({
            temp_pv: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Now_Segment':
          pagethis.data.run_info[3].value = pagethis.data.device_value.datastreams[index].datapoints[0].value + '/' + pagethis.data.all_segment,
          pagethis.setData({
            now_segment: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'Prog_AllSeg':
          pagethis.data.run_info[3].value = pagethis.data.now_segment + '/' +  pagethis.data.device_value.datastreams[index].datapoints[0].value,
          pagethis.setData({
            all_segment: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'Segmen_circel_now':
          pagethis.data.run_info[2].value = pagethis.data.device_value.datastreams[index].datapoints[0].value + '/' + pagethis.data.all_circle,
          pagethis.setData({
            now_circle: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'NowSeg_time':
          var timeh = 0
          var timem = 0
          timem = pagethis.data.device_value.datastreams[index].datapoints[0].value % 60
          timeh = Math.floor(pagethis.data.device_value.datastreams[index].datapoints[0].value / 60)
          pagethis.data.run_info[4].value = timeh + 'H ' + timem + 'M'

          pagethis.setData({
            nowseg_time: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'Temp_PID':
          pagethis.setData({
            temp_pid: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Time_Curr':
          var timeh = 0
          var timem = 0
          timem = pagethis.data.device_value.datastreams[index].datapoints[0].value % 60
          timeh = Math.floor(pagethis.data.device_value.datastreams[index].datapoints[0].value / 60)
          pagethis.data.run_info[5].value = timeh + 'H ' + timem+'M'
          pagethis.setData({
            time_curr: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'Prog_Name':
          pagethis.data.run_info[0].value = pagethis.data.device_value.datastreams[index].datapoints[0].value,
          pagethis.setData({
            prog_name: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'COOL_PID':
          break;
        case 'Segmen_circel_Total':
          pagethis.data.run_info[2].value = pagethis.data.now_circle + '/' +  pagethis.data.device_value.datastreams[index].datapoints[0].value,
          pagethis.setData({
            all_circle: pagethis.data.device_value.datastreams[index].datapoints[0].value,
            run_info: pagethis.data.run_info
          })
          break;
        case 'Humi_PID':
          pagethis.setData({
            humi_pid: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Temp_SV':
          pagethis.setData({
            temp_sv: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Humi_PID':
          pagethis.setData({
            humi_pid: pagethis.data.device_value.datastreams[index].datapoints[0].value
          })
          break;
        case 'Run_Mode':
          pagethis.setData({
            runmode: pagethis.data.device_value.datastreams[index].datapoints[0].value,
          })
          break;
        case 'password':
          //验证密码
          if (app.globalData.devicepassword != pagethis.data.device_value.datastreams[index].datapoints[0].value)
          {
             this.setData({
               view:false
             })
          }else
          {
            this.setData({
              view: true
            }) 
          }
          break;
        default:
          break;
      }
    }
  },
  tempsetevent:function(){
    this.setData({
      showinputmodal:true,
      inputmodal:0
    })
  },
  humisetevent: function () {
    this.setData({
      showinputmodal: true,
      inputmodal: 1
    })
  },
  progsetevent: function () {
    this.setData({
      showinputmodal: true,
      inputmodal: 2
    })
  },
  //清空输入框
  clearInputEvent: function () {
    this.setData(
      {
        inputvalue: null,
        inputtempvalue: null,
        inputhumivalue: null,
        inputprogvalue: null

      }
    );
  },
  input_tempsv: function (e) {
    this.setData(
      {
        inputtempvalue: e.detail.value
      }
    );

  },
  input_humisv: function (e) {
    this.setData(
      {
        inputhumivalue: e.detail.value
      }
    );

  },
  input_progsv: function (e) {
    this.setData(
      {
        inputprogvalue: e.detail.value
      }
    );

  },
  //取消输入
  inputcancel: function () {
    console.log('test')
    //隐藏modal
    this.hideModal();
    //调用清空输入框函数
    this.clearInputEvent();
  },

  //确认输入  
  inputconfirm: function () {
    //隐藏modal
    this.hideModal();
    switch(this.data.inputmodal)
    {
     case 0:
        this.post_cmd(this.data.device_id, 0, this.data.tempsv_cmd, this.data.inputtempvalue)
     break;
     case 1:
        this.post_cmd(this.data.device_id, 0, this.data.humisv_cmd, this.data.inputhumivalue)
     break;
     case 2:
        this.post_cmd(this.data.device_id, 0, this.data.runprog_cmd, this.data.inputprogvalue)
     break;
     default:
     break;
    }
    //调用清空输入框函数
    this.clearInputEvent();
  },
  //运行状态选择
  runstateselect(e) {
    this.post_cmd(this.data.device_id, 0, this.data.runstate_cmd, e.currentTarget.dataset.target)
  },
  test:function(){
    console.log(this.data.iconList)
  }
})
