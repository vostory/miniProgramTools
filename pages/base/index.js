const app = getApp();
const baseConverter = require('../../utils/baseConverter.js');

Page({
  data: {
    theme: 'light',
    // 进制选项
    baseOptions: [
      { value: 2, name: '二进制' },
      { value: 8, name: '八进制' },
      { value: 10, name: '十进制' },
      { value: 16, name: '十六进制' }
    ],
    // 输入数值
    inputValue: '',
    // 输入进制索引
    fromBaseIndex: 2,  // 默认十进制
    // 目标进制索引
    toBaseIndex: 0,    // 默认二进制
    // 当前进制值
    fromBase: 10,
    fromBaseName: '十进制',
    toBase: 2,
    toBaseName: '二进制',
    // 输入验证错误
    inputError: '',
    // 转换结果
    result: null,
    // 进制对应表
    baseTable: [],
    // 历史记录
    history: []
  },

  onLoad: function() {
    console.log('进制转换页面加载');
    this.setData({
      theme: app.globalData.theme
    });
    
    // 加载进制对应表
    this.loadBaseTable();
    
    // 加载历史记录
    this.loadHistory();
  },

  onShow: function() {
    console.log('进制转换页面显示');
    this.setData({
      theme: app.globalData.theme
    });
  },

  goBack: function() {
    wx.navigateBack();
  },

  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 输入变化
  onInputChange: function(e) {
    const value = e.detail.value;
    console.log('输入变化:', value);
    
    this.setData({
      inputValue: value,
      inputError: '',
      result: null
    });
  },

  // 验证输入
  validateInput: function() {
    const { inputValue, fromBase } = this.data;
    
    if (!inputValue.trim()) {
      this.setData({ inputError: '' });
      return;
    }
    
    const error = baseConverter.validateInput(inputValue, fromBase);
    this.setData({ inputError: error });
  },

  // 修改输入进制
  changeFromBase: function(e) {
    if (!e || !e.detail) {
      console.error('changeFromBase: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const baseOption = this.data.baseOptions[index];
    
    console.log('修改输入进制:', index, baseOption);
    
    this.setData({
      fromBaseIndex: index,
      fromBase: baseOption.value,
      fromBaseName: baseOption.name,
      inputError: '',
      result: null
    });
    
    // 重新验证输入
    this.validateInput();
  },

  // 修改目标进制
  changeToBase: function(e) {
    if (!e || !e.detail) {
      console.error('changeToBase: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const baseOption = this.data.baseOptions[index];
    
    console.log('修改目标进制:', index, baseOption);
    
    this.setData({
      toBaseIndex: index,
      toBase: baseOption.value,
      toBaseName: baseOption.name,
      result: null
    });
  },

  // 交换进制
  swapBases: function() {
    const { fromBaseIndex, toBaseIndex, baseOptions, inputValue, result } = this.data;
    
    console.log('交换进制:', { 
      fromIndex: fromBaseIndex, 
      toIndex: toBaseIndex,
      fromBase: baseOptions[fromBaseIndex].name,
      toBase: baseOptions[toBaseIndex].name
    });
    
    this.setData({
      fromBaseIndex: toBaseIndex,
      toBaseIndex: fromBaseIndex,
      fromBase: baseOptions[toBaseIndex].value,
      toBase: baseOptions[fromBaseIndex].value,
      fromBaseName: baseOptions[toBaseIndex].name,
      toBaseName: baseOptions[fromBaseIndex].name,
      inputValue: result ? result.value : inputValue,
      inputError: '',
      result: null
    });
    
    // 重新验证输入
    this.validateInput();
  },

  // 进制转换
  convertBase: function() {
    const { inputValue, fromBase, toBase } = this.data;
    
    console.log('开始进制转换:', { inputValue, fromBase, toBase });
    
    // 验证输入
    if (!inputValue.trim()) {
      wx.showToast({
        title: '请输入要转换的数值',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const error = baseConverter.validateInput(inputValue, fromBase);
    if (error) {
      this.setData({ inputError: error });
      wx.showToast({
        title: '输入格式不正确',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 显示加载
    wx.showLoading({
      title: '转换中...',
      mask: true
    });
    
    try {
      // 进行进制转换
      const result = baseConverter.convert(inputValue, fromBase, toBase);
      console.log('转换结果:', result);
      
      this.setData({
        result: result
      });
      
      // 保存到历史记录
      this.saveToHistory(inputValue, fromBase, toBase, result);
      
      wx.hideLoading();
      wx.showToast({
        title: '转换完成',
        icon: 'success',
        duration: 1000
      });
      
    } catch (error) {
      console.error('转换错误:', error);
      wx.hideLoading();
      wx.showToast({
        title: '转换失败，请检查输入',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 复制结果
  copyResult: function() {
    const { result } = this.data;
    
    if (!result || !result.value) {
      wx.showToast({
        title: '无结果可复制',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    
    wx.setClipboardData({
      data: result.value,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1000
        });
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1000
        });
      }
    });
  },

  // 加载进制对应表
  loadBaseTable: function() {
    const table = [];
    
    for (let i = 0; i <= 15; i++) {
      table.push({
        decimal: i.toString(),
        binary: i.toString(2).padStart(4, '0'),
        octal: i.toString(8),
        hex: i.toString(16).toUpperCase()
      });
    }
    
    this.setData({ baseTable: table });
  },

  // 保存到历史记录
  saveToHistory: function(inputValue, fromBase, toBase, result) {
    if (!result) return;
    
    const historyData = {
      inputValue: inputValue,
      fromBase: fromBase,
      toBase: toBase,
      result: result.value
    };
    
    app.saveHistory('base_history', historyData);
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory: function() {
    const history = app.getHistory('base_history') || [];
    console.log('加载的历史记录:', history);
    this.setData({ history: history });
  },

  // 加载历史记录项
  loadHistoryItem: function(e) {
    if (!e) return;
    
    const index = e.currentTarget ? e.currentTarget.dataset.index : e.target.dataset.index;
    if (index === undefined) return;
    
    const history = this.data.history;
    
    if (history && history[index]) {
      const item = history[index].data;
      
      console.log('加载历史记录项:', item);
      
      // 查找对应的索引
      const fromBaseIndex = this.data.baseOptions.findIndex(option => option.value === item.fromBase);
      const toBaseIndex = this.data.baseOptions.findIndex(option => option.value === item.toBase);
      
      if (fromBaseIndex === -1) fromBaseIndex = 2;  // 默认十进制
      if (toBaseIndex === -1) toBaseIndex = 0;      // 默认二进制
      
      // 设置参数
      this.setData({
        inputValue: item.inputValue,
        fromBaseIndex: fromBaseIndex,
        toBaseIndex: toBaseIndex,
        fromBase: item.fromBase,
        toBase: item.toBase,
        fromBaseName: this.data.baseOptions[fromBaseIndex].name,
        toBaseName: this.data.baseOptions[toBaseIndex].name,
        result: null
      });
      
      // 触发转换
      this.convertBase();
      
      wx.showToast({
        title: '已加载历史记录',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 清空历史记录
  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('base_history');
          this.setData({ history: [] });
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});