Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    userInput:"",
    menuList:['清空对话', '我的预约', '我的档案'],
    content:"",
    status:0, //0表示用户可以操作，1表示机器人正发消息，用户不可以发
    status_test:1
  },

  //获取用户输入的内容
  getUserInput(e){
    let userInput=e.detail.value;
    if (userInput[userInput.length-1] == "\n") {
      this.pressSendButton()
    } else {
      this.setData({
      userInput
      })
    }
  },

  //用户点击发送
  pressSendButton(){
    //判断机器人是否正发送消息，如是，则无视该点击
    if(this.data.status==1){
      return;
    }

    let content=this.data.userInput
    let messages=this.data.messages
    if(!content){
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return;
    }

    messages.push({
      role: "user",
      // 女性头像"https://img.zcool.cn/community/0143395f110b9fa801215aa060a140.png@1280w_1l_2o_100sh.png"
      image: "https://img.zcool.cn/community/01a6095f110b9fa8012066219b67d4.png@1280w_1l_2o_100sh.png",
      content
    })

    wx.setStorageSync('messages', messages)//更新缓存中的历史消息

    this.autoScroll()
    this.sendRequest(content, messages)//发送网络请求
    this.setData({
      userInput: "",//清空输入框内容
      content: ""
    })
  },
  
  /**
   * 发送网络请求
   * @param {*} contentUser 用户输入的内容
   * @param {*} messages 历史对话
   */
  sendRequest(contentUser, messages){
    wx.showLoading({
      title: '',
    })

    this.setData({
      status:1//设为1表示机器人正在发消息
    })
    
    const urlPost = 'http://101.37.70.57:8080/openai/invoke';
    const dataPost = {
      input: contentUser,
      config: {},
      kwargs: {}
    };
    wx.request({
      url: urlPost,
      method: 'POST',
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(dataPost),
      
      // 发送请求成功
      success: (res => { 
        console.log('请求成功', res);
        wx.hideLoading();
        let content = res.data.output.content;
        messages.push({
          role: "assistant",
          image: "https://img.zcool.cn/community/01dcd75af39d3ba8012160456172c4.jpg@1280w_1l_2o_100sh.jpg",
          content
        })
        this.setData({
          messages,
        })
        wx.setStorageSync('messages', messages)
        this.autoScroll()
        //消息回复完成
        this.setData({
          status:0
        })
      }),
      // 发送请求失败
      fail: function(error) { 
        console.error('请求失败', error);
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败',
          icon: 'error'
        })
        this.setData({
          status:0
        })
      }
    })
  },

  //按下功能按钮
  chooseMenuItem(e){
    //判断机器人是否正发送消息
    if(this.data.status==1){
      return;
    }

    let choise=e.currentTarget.dataset.type
    switch(choise){
      case '清空对话':{
        wx.showModal({
          title: '确认清空对话',
          complete: (res) => {
            if (res.confirm) {
              wx.removeStorageSync('messages')
              this.onLoad()
            }
          }
        })
        break;
      }
      case '我的预约':{
        this.setData({
          userInput:choise
        })
        this.pressSendButton()
        break;
      }
      case '我的档案':{
        this.setData({
          userInput:choise
        })
        this.pressSendButton()
        break;
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let messages=wx.getStorageSync('messages')//从缓存获取历史记录
    if(messages){
      this.setData({
        messages
      })
    } else{
      this.setData({
        messages: []
      })
    }
    this.autoScroll()

  },

  // 函数，滚动到底部
  autoScroll(){
    let that = this;
    wx.createSelectorQuery().select('#communication').boundingClientRect(function (rect) {
      wx.pageScrollTo({
        scrollTop: rect.height,
        duration: 300 //滑动速度
      })
      that.setData({
        scrollTop: rect.height - that.data.scrollTop
      });
    }).exec();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
    
  }
})
