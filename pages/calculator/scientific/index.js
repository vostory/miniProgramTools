const app = getApp();
const formulaParser = require('../../../utils/formulaParser.js');

Page({
  data: {
    theme: 'light',
    expression: '',
    history: '',
    result: '0',
    mode: 'basic',
    angleMode: 'deg',
    numberSystem: 'dec',
    bits: 32
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
    this.setData({
      expression: this.data.expression + num
    });
  },

  inputHex: function(e) {
    const hex = e.currentTarget.dataset.hex;
    this.setData({
      expression: this.data.expression + hex
    });
  },

  inputDecimal: function() {
    const { expression, numberSystem } = this.data;
    
    if (numberSystem !== 'dec') {
      wx.showToast({
        title: '非十进制不支持小数',
        icon: 'none'
      });
      return;
    }
    
    if (!expression || /[+\-×÷^!]$/.test(expression)) {
      this.setData({ expression: expression + '0.' });
    } else if (!expression.includes('.')) {
      this.setData({ expression: expression + '.' });
    }
  },

  inputOperator: function(e) {
    const op = e.currentTarget.dataset.op;
    const { expression } = this.data;
    
    if (expression && !/[+\-×÷^!]$/.test(expression)) {
      this.setData({ expression: expression + op });
    }
  },

  inputFunction: function(e) {
    const func = e.currentTarget.dataset.func;
    const { expression, angleMode } = this.data;
    
    let funcToAdd = func;
    if (func === 'sin' || func === 'cos' || func === 'tan' || 
        func === 'asin' || func === 'acos' || func === 'atan') {
      if (angleMode === 'deg') {
        funcToAdd = 'deg(';
      } else {
        funcToAdd = func + '(';
      }
    } else {
      funcToAdd = func;
    }
    
    this.setData({ expression: expression + funcToAdd });
  },

  inputConstant: function(e) {
    const constant = e.currentTarget.dataset.const;
    const { expression } = this.data;
    
    if (constant === 'π') {
      this.setData({ expression: expression + '3.141592653589793' });
    } else if (constant === 'e') {
      this.setData({ expression: expression + '2.718281828459045' });
    }
  },

  toggleSign: function() {
    const { expression, numberSystem } = this.data;
    
    if (numberSystem === 'bin') {
      wx.showToast({
        title: '二进制不支持负数',
        icon: 'none'
      });
      return;
    }
    
    if (!expression) {
      this.setData({ expression: '-' });
    } else {
      this.setData({ expression: '-' + expression });
    }
  },

  calculate: function() {
    const { expression, mode, numberSystem, bits } = this.data;
    
    if (!expression) {
      wx.showToast({
        title: '请输入表达式',
        icon: 'none'
      });
      return;
    }
    
    try {
      let result;
      
      if (mode === 'programmer') {
        result = this.calculateProgrammer(expression, numberSystem, bits);
      } else {
        result = formulaParser.parse(expression, this.data.angleMode);
      }
      
      const formattedResult = this.formatResult(result, mode, numberSystem, bits);
      
      this.setData({
        result: formattedResult,
        history: expression + ' ='
      });
      
      app.saveHistory('calc_scientific_history', {
        expression: expression,
        result: formattedResult,
        mode: mode
      });
      
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000
      });
    }
  },

  calculateProgrammer: function(expression, numberSystem, bits) {
    try {
      let decimalValue = 0;
      
      if (numberSystem === 'dec') {
        decimalValue = parseInt(expression, 10);
      } else if (numberSystem === 'hex') {
        decimalValue = parseInt(expression, 16);
      } else if (numberSystem === 'oct') {
        decimalValue = parseInt(expression, 8);
      } else if (numberSystem === 'bin') {
        decimalValue = parseInt(expression, 2);
      }
      
      if (isNaN(decimalValue)) {
        throw new Error('无效的数字格式');
      }
      
      return decimalValue;
      
    } catch (error) {
      throw new Error('计算错误: ' + error.message);
    }
  },

  formatResult: function(result, mode, numberSystem, bits) {
    if (isNaN(result) || !isFinite(result)) {
      return '计算错误';
    }
    
    if (mode === 'programmer') {
      return this.formatProgrammerResult(result, numberSystem, bits);
    }
    
    if (Math.abs(result) < 0.000001 && result !== 0) {
      return result.toExponential(6);
    }
    
    if (Math.abs(result) > 1000000) {
      return result.toExponential(6);
    }
    
    const fixedResult = Number(result.toFixed(8));
    if (Number.isInteger(fixedResult)) {
      return fixedResult.toString();
    }
    
    return parseFloat(fixedResult.toFixed(8)).toString();
  },

  formatProgrammerResult: function(value, numberSystem, bits) {
    let intValue = Math.floor(value);
    
    if (numberSystem === 'dec') {
      return intValue.toString(10);
    } else if (numberSystem === 'hex') {
      return intValue.toString(16).toUpperCase();
    } else if (numberSystem === 'oct') {
      return intValue.toString(8);
    } else if (numberSystem === 'bin') {
      let binary = intValue.toString(2);
      if (bits > 0) {
        binary = binary.padStart(bits, '0');
      }
      return binary;
    }
    
    return value.toString();
  },

  clearAll: function() {
    this.setData({
      expression: '',
      result: '0',
      history: ''
    });
  },

  deleteLast: function() {
    const { expression } = this.data;
    if (expression) {
      this.setData({
        expression: expression.substring(0, expression.length - 1)
      });
    }
  },

  setMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ 
      mode: mode,
      expression: '',
      result: '0'
    });
  },

  toggleAngleMode: function() {
    const newMode = this.data.angleMode === 'deg' ? 'rad' : 'deg';
    this.setData({ angleMode: newMode });
    
    wx.showToast({
      title: `角度模式: ${newMode === 'deg' ? '度' : '弧度'}`,
      icon: 'none',
      duration: 1000
    });
  },

  setNumberSystem: function(e) {
    const system = e.currentTarget.dataset.system;
    this.setData({ 
      numberSystem: system,
      expression: '',
      result: '0'
    });
    
    const systemNames = {
      'dec': '十进制',
      'hex': '十六进制',
      'oct': '八进制',
      'bin': '二进制'
    };
    
    wx.showToast({
      title: systemNames[system],
      icon: 'none',
      duration: 1000
    });
  },

  toggleBits: function(e) {
    const newBits = parseInt(e.currentTarget.dataset.bits);
    this.setData({ bits: newBits });
    
    wx.showToast({
      title: `${newBits}位`,
      icon: 'none',
      duration: 1000
    });
  },

  showHistory: function() {
    const history = app.getHistory('calc_scientific_history') || [];
    
    if (history.length === 0) {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      });
      return;
    }
    
    const historyItems = history.map(item => 
      `${item.data.expression} = ${item.data.result}`
    );
    
    wx.showActionSheet({
      itemList: historyItems,
      success: (res) => {
        const selected = history[res.tapIndex];
        this.setData({
          expression: selected.data.expression,
          result: selected.data.result
        });
      }
    });
  }
});