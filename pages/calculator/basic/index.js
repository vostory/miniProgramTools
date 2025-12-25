const app = getApp();
const calculator = require('../../../utils/calculator.js');

Page({
  data: {
    theme: 'light',
    current: '0',
    history: '',
    operator: '',
    previous: '',
    waitingForOperand: true
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
    });
  },

  onShow: function() {
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

  inputNumber: function(e) {
    const num = e.currentTarget.dataset.num;
    let { current, waitingForOperand } = this.data;
    
    if (waitingForOperand) {
      this.setData({
        current: num,
        waitingForOperand: false
      });
    } else {
      this.setData({
        current: current === '0' ? num : current + num
      });
    }
  },

  inputDecimal: function() {
    let { current, waitingForOperand } = this.data;
    
    if (waitingForOperand) {
      this.setData({
        current: '0.',
        waitingForOperand: false
      });
    } else if (current.indexOf('.') === -1) {
      this.setData({
        current: current + '.'
      });
    }
  },

  toggleSign: function() {
    const { current } = this.data;
    if (current === '0') return;
    
    this.setData({
      current: current.charAt(0) === '-' ? current.substr(1) : '-' + current
    });
  },

  inputOperator: function(e) {
    const operator = e.currentTarget.dataset.op;
    const { current, previous, operator: prevOperator } = this.data;
    
    if (previous && !this.data.waitingForOperand) {
      this.calculate();
    }
    
    this.setData({
      operator: operator,
      previous: current,
      waitingForOperand: true
    });
  },

  calculate: function() {
    const { current, previous, operator } = this.data;
    
    if (!operator || !previous) return;
    
    let result = 0;
    const prev = parseFloat(previous);
    const curr = parseFloat(current);
    
    try {
      switch (operator) {
        case '+':
          result = calculator.add(prev, curr);
          break;
        case '-':
          result = calculator.subtract(prev, curr);
          break;
        case '×':
          result = calculator.multiply(prev, curr);
          break;
        case '÷':
          result = calculator.divide(prev, curr);
          break;
        default:
          result = curr;
      }
      
      const history = `${previous} ${operator} ${current} =`;
      this.setData({
        current: result.toString(),
        history: history,
        operator: '',
        previous: '',
        waitingForOperand: true
      });
      
      app.saveHistory('calc_history', {
        expression: history,
        result: result.toString()
      });
      
    } catch (error) {
      wx.showToast({
        title: '计算错误',
        icon: 'none'
      });
    }
  },

  calculatePercentage: function() {
    const { current } = this.data;
    try {
      const result = calculator.percent(parseFloat(current));
      this.setData({
        current: result.toString(),
        waitingForOperand: true
      });
    } catch (error) {
      wx.showToast({
        title: '计算错误',
        icon: 'none'
      });
    }
  },

  clearEntry: function() {
    this.setData({
      current: '0',
      waitingForOperand: true
    });
  },

  clearAll: function() {
    this.setData({
      current: '0',
      history: '',
      operator: '',
      previous: '',
      waitingForOperand: true
    });
  },

  deleteLast: function() {
    const { current, waitingForOperand } = this.data;
    
    if (waitingForOperand) return;
    
    if (current.length === 1 || (current.length === 2 && current.charAt(0) === '-')) {
      this.setData({
        current: '0',
        waitingForOperand: true
      });
    } else {
      this.setData({
        current: current.substring(0, current.length - 1)
      });
    }
  },

  toggleMode: function() {
    wx.navigateTo({
      url: '/pages/calculator/scientific/index'
    });
  },

  showHistory: function() {
    const history = app.getHistory('calc_history') || [];
    
    if (history.length === 0) {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      });
      return;
    }
    
    const historyText = history.map(item => 
      `${item.data.expression}\n${item.data.result}`
    ).join('\n\n');
    
    wx.showModal({
      title: '计算历史',
      content: historyText,
      showCancel: false,
      confirmText: '确定'
    });
  }
});