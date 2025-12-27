const app = getApp();
const currencyService = require('../../utils/currencyService.js');

Page({
  data: {
    theme: 'light',
    fromAmount: '',
    toAmount: '',
    fromCurrencyIndex: 0, // 默认人民币
    toCurrencyIndex: 2,   // 默认美元
    currencyList: [],
    quickCurrencies: [],
    exchangeRate: '',
    exchangeRates: [],
    isConverting: false,
    lastUpdate: '',
    history: []
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
    });

    this.loadCurrencyData();
    this.loadHistory();
    
    // 获取汇率数据
    this.loadExchangeRates();
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

  // 加载货币数据
  loadCurrencyData: function() {
    const currencies = currencyService.getCurrencyList();
    const quickCurrencies = this.getQuickCurrencies();
    
    this.setData({
      currencyList: currencies,
      quickCurrencies: quickCurrencies
    });
  },

  // 获取常用货币列表
  getQuickCurrencies: function() {
    return [
      { code: 'CNY', symbol: '¥', name: '人民币', type: 'from' },
      { code: 'USD', symbol: '$', name: '美元', type: 'to' },
      { code: 'EUR', symbol: '€', name: '欧元', type: 'to' },
      { code: 'JPY', symbol: '¥', name: '日元', type: 'to' },
      { code: 'GBP', symbol: '£', name: '英镑', type: 'to' },
      { code: 'HKD', symbol: 'HK$', name: '港币', type: 'to' },
      { code: 'KRW', symbol: '₩', name: '韩元', type: 'to' },
      { code: 'AUD', symbol: 'A$', name: '澳元', type: 'to' }
    ];
  },

  // 输入金额变化
  onFromAmountChange: function(e) {
    const value = e.detail.value;
    this.setData({ fromAmount: value });
    
    if (value && value !== '0') {
      this.convertCurrency(value);
    } else {
      this.setData({ toAmount: '', exchangeRate: '' });
    }
  },

  // 源货币变化
  onFromCurrencyChange: function(e) {
    this.setData({ fromCurrencyIndex: e.detail.value });
    
    if (this.data.fromAmount && this.data.fromAmount !== '0') {
      this.convertCurrency(this.data.fromAmount);
    } else {
      this.loadExchangeRates();
    }
  },

  // 目标货币变化
  onToCurrencyChange: function(e) {
    this.setData({ toCurrencyIndex: e.detail.value });
    
    if (this.data.fromAmount && this.data.fromAmount !== '0') {
      this.convertCurrency(this.data.fromAmount);
    } else {
      this.getExchangeRate();
    }
  },

  // 交换货币
  swapCurrencies: function() {
    const { fromCurrencyIndex, toCurrencyIndex, toAmount, fromAmount } = this.data;
    
    this.setData({
      fromCurrencyIndex: toCurrencyIndex,
      toCurrencyIndex: fromCurrencyIndex,
      fromAmount: toAmount,
      toAmount: fromAmount
    });
    
    if (toAmount && toAmount !== '0') {
      this.getExchangeRate();
      this.loadExchangeRates();
    }
  },

  // 快速选择货币
  quickSelectCurrency: function(e) {
    const code = e.currentTarget.dataset.code;
    const type = e.currentTarget.dataset.type;
    
    const currencies = this.data.currencyList;
    const index = currencies.findIndex(c => c.code === code);
    
    if (index !== -1) {
      if (type === 'from') {
        this.setData({ fromCurrencyIndex: index });
      } else {
        this.setData({ toCurrencyIndex: index });
      }
      
      if (this.data.fromAmount && this.data.fromAmount !== '0') {
        this.convertCurrency(this.data.fromAmount);
      } else {
        this.getExchangeRate();
        this.loadExchangeRates();
      }
    }
  },

  // 开始换算
  startConvert: function() {
    const { fromAmount } = this.data;
    
    if (!fromAmount || fromAmount === '0') {
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    this.convertCurrency(fromAmount);
  },

  // 换算货币
  convertCurrency: function(amount) {
    const { currencyList, fromCurrencyIndex, toCurrencyIndex } = this.data;
    
    if (!currencyList[fromCurrencyIndex] || !currencyList[toCurrencyIndex]) {
      return;
    }
    
    this.setData({ isConverting: true });
    
    const fromCurrency = currencyList[fromCurrencyIndex].code;
    const toCurrency = currencyList[toCurrencyIndex].code;
    
    // 显示加载提示
    wx.showLoading({
      title: '换算中...',
      mask: true
    });
    
    // 获取汇率并计算
    currencyService.getExchangeRate(fromCurrency, toCurrency)
      .then(rate => {
        wx.hideLoading();
        this.setData({ isConverting: false });
        
        if (rate) {
          const result = (parseFloat(amount) * rate).toFixed(2);
          
          this.setData({
            toAmount: result,
            exchangeRate: rate.toFixed(4)
          });
          
          // 保存到历史记录
          this.saveToHistory(amount, fromCurrency, result, toCurrency, rate);
          
          // 显示成功提示
          wx.showToast({
            title: '换算成功',
            icon: 'success',
            duration: 1000
          });
        } else {
          wx.showToast({
            title: '获取汇率失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        this.setData({ isConverting: false });
        
        console.error('汇率获取失败:', error);
        wx.showToast({
          title: '汇率获取失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 获取汇率
  getExchangeRate: function() {
    const { currencyList, fromCurrencyIndex, toCurrencyIndex } = this.data;
    
    if (!currencyList[fromCurrencyIndex] || !currencyList[toCurrencyIndex]) {
      return;
    }
    
    const fromCurrency = currencyList[fromCurrencyIndex].code;
    const toCurrency = currencyList[toCurrencyIndex].code;
    
    currencyService.getExchangeRate(fromCurrency, toCurrency)
      .then(rate => {
        if (rate) {
          this.setData({
            exchangeRate: rate.toFixed(4)
          });
        }
      })
      .catch(error => {
        console.error('获取汇率失败:', error);
      });
  },

  // 加载汇率数据
  loadExchangeRates: function() {
    const { currencyList, fromCurrencyIndex } = this.data;
    
    if (!currencyList[fromCurrencyIndex]) {
      return;
    }
    
    const baseCurrency = currencyList[fromCurrencyIndex].code;
    
    currencyService.getRatesForMainCurrencies(baseCurrency)
      .then(rates => {
        this.setData({
          exchangeRates: rates,
          lastUpdate: this.formatTime(new Date())
        });
      })
      .catch(error => {
        console.error('加载汇率失败:', error);
      });
  },

  // 格式化时间
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 保存到历史记录
  saveToHistory: function(amount, fromCurrency, result, toCurrency, rate) {
    const expression = `${amount} ${fromCurrency}`;
    const resultStr = `${result} ${toCurrency}`;
    
    app.saveHistory('currency_history', {
      fromAmount: amount,
      fromCurrency: fromCurrency,
      toAmount: result,
      toCurrency: toCurrency,
      rate: rate.toFixed(4),
      expression: expression,
      result: resultStr
    });
    
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory: function() {
    const history = app.getHistory('currency_history') || [];
    this.setData({ history: history });
  },

  // 清空历史记录
  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('currency_history');
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