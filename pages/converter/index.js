const app = getApp();
const convertUtils = require('../../utils/convertUtils.js');

Page({
  data: {
    theme: 'light',
    categories: [
      { id: 'length', name: '长度', icon: '📏' },
      { id: 'weight', name: '重量', icon: '⚖️' },
      { id: 'temperature', name: '温度', icon: '🌡️' },
      { id: 'area', name: '面积', icon: '🗺️' },
      { id: 'volume', name: '体积', icon: '🧪' },
      { id: 'speed', name: '速度', icon: '🚀' },
      { id: 'time', name: '时间', icon: '⏱️' },
      { id: 'digital', name: '数据存储', icon: '💾' }
    ],
    currentCategory: 'length',
    fromValue: '',
    toValue: '',
    fromUnits: [],
    toUnits: [],
    fromUnitIndex: 0,
    toUnitIndex: 1,
    formula: '',
    quickUnits: [],
    commonConversions: [],
    history: []
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
    });

    this.initCategory('length');
    this.loadHistory();
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

  initCategory: function(category) {
    const units = convertUtils.getUnits(category);
    
    this.setData({
      currentCategory: category,
      fromUnits: units,
      toUnits: units,
      fromUnitIndex: 0,
      toUnitIndex: units.length > 1 ? 1 : 0,
      fromValue: '',
      toValue: '',
      formula: ''
    });

    this.loadQuickUnits(category);
    this.loadCommonConversions(category);
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.id;
    this.initCategory(category);
  },

  onFromValueChange: function(e) {
    const value = e.detail.value;
    this.setData({ fromValue: value });
    
    if (value !== '' && value !== null && value !== undefined) {
      this.convertValue();
    } else {
      this.setData({ toValue: '', formula: '' });
    }
  },

  onFromUnitChange: function(e) {
    this.setData({ fromUnitIndex: e.detail.value });
    
    if (this.data.fromValue !== '' && this.data.fromValue !== null && this.data.fromValue !== undefined) {
      this.convertValue();
    }
  },

  onToUnitChange: function(e) {
    this.setData({ toUnitIndex: e.detail.value });
    
    if (this.data.fromValue !== '' && this.data.fromValue !== null && this.data.fromValue !== undefined) {
      this.convertValue();
    }
  },

  convertValue: function() {
    const { fromValue, fromUnits, toUnits, fromUnitIndex, toUnitIndex, currentCategory } = this.data;
    
    if (fromValue === '' || fromValue === null || fromValue === undefined) {
      this.setData({ toValue: '', formula: '' });
      return;
    }
    
    try {
      const fromUnit = fromUnits[fromUnitIndex].id;
      const toUnit = toUnits[toUnitIndex].id;
      
      const result = convertUtils.convert(fromValue, fromUnit, toUnit, currentCategory);
      
      this.setData({
        toValue: this.formatNumber(result),
        formula: this.generateFormula(fromValue, fromUnit, toUnit, result, currentCategory)
      });
      
      this.saveToHistory(fromValue, fromUnit, toUnit, result, currentCategory);
    } catch (error) {
      wx.showToast({
        title: '换算失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  formatNumber: function(num) {
    if (num === 0 || num === '0') return '0';
    
    const number = Number(num);
    if (isNaN(number)) return '0';
    
    if (Math.abs(number) < 0.000001) {
      return number.toExponential(4);
    }
    
    if (Math.abs(number) > 1000000) {
      return number.toExponential(4);
    }
    
    const fixedNum = Number(number.toFixed(6));
    if (Number.isInteger(fixedNum)) {
      return fixedNum.toString();
    }
    
    return parseFloat(fixedNum.toFixed(6)).toString();
  },

  generateFormula: function(fromValue, fromUnit, toUnit, result, category) {
    const fromUnitName = this.getUnitName(fromUnit, category);
    const toUnitName = this.getUnitName(toUnit, category);
    
    return `${fromValue} ${fromUnitName} = ${this.formatNumber(result)} ${toUnitName}`;
  },

  getUnitName: function(unitId, category) {
    const units = convertUtils.getUnits(category);
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : unitId;
  },

  swapUnits: function() {
    const { fromUnits, toUnits, fromUnitIndex, toUnitIndex, toValue, fromValue } = this.data;
    
    this.setData({
      fromUnits: toUnits,
      toUnits: fromUnits,
      fromUnitIndex: toUnitIndex,
      toUnitIndex: fromUnitIndex,
      fromValue: toValue !== '' ? toValue : '',
      toValue: fromValue !== '' ? fromValue : ''
    });
    
    if (toValue !== '' && toValue !== null && toValue !== undefined) {
      this.convertValue();
    }
  },

  loadQuickUnits: function(category) {
    const quickUnitsMap = {
      'length': [
        { unit: 'm', type: 'from', name: '米' },
        { unit: 'cm', type: 'from', name: '厘米' },
        { unit: 'km', type: 'to', name: '千米' },
        { unit: 'inch', type: 'to', name: '英寸' }
      ],
      'weight': [
        { unit: 'kg', type: 'from', name: '千克' },
        { unit: 'g', type: 'from', name: '克' },
        { unit: 'lb', type: 'to', name: '磅' },
        { unit: 'oz', type: 'to', name: '盎司' }
      ],
      'temperature': [
        { unit: 'c', type: 'from', name: '℃' },
        { unit: 'f', type: 'from', name: '℉' },
        { unit: 'k', type: 'to', name: 'K' }
      ],
      'area': [
        { unit: 'm2', type: 'from', name: '平方米' },
        { unit: 'mu', type: 'from', name: '亩' },
        { unit: 'acre', type: 'to', name: '英亩' },
        { unit: 'sqft', type: 'to', name: '平方英尺' }
      ],
      'volume': [
        { unit: 'l', type: 'from', name: '升' },
        { unit: 'ml', type: 'from', name: '毫升' },
        { unit: 'gal', type: 'to', name: '加仑' },
        { unit: 'oz', type: 'to', name: '盎司(液)' }
      ],
      'speed': [
        { unit: 'mps', type: 'from', name: '米/秒' },
        { unit: 'kmh', type: 'from', name: '千米/时' },
        { unit: 'mph', type: 'to', name: '英里/时' }
      ],
      'time': [
        { unit: 's', type: 'from', name: '秒' },
        { unit: 'min', type: 'from', name: '分' },
        { unit: 'hour', type: 'to', name: '小时' },
        { unit: 'day', type: 'to', name: '天' }
      ],
      'digital': [
        { unit: 'kb', type: 'from', name: '千比特' },
        { unit: 'mb', type: 'from', name: '兆比特' },
        { unit: 'gb', type: 'to', name: '吉比特' },
        { unit: 'tb', type: 'to', name: '太比特' }
      ]
    };
    
    this.setData({
      quickUnits: quickUnitsMap[category] || []
    });
  },

  quickSelectUnit: function(e) {
    const unit = e.currentTarget.dataset.unit;
    const type = e.currentTarget.dataset.type;
    
    const units = convertUtils.getUnits(this.data.currentCategory);
    const unitIndex = units.findIndex(u => u.id === unit);
    
    if (unitIndex !== -1) {
      if (type === 'from') {
        this.setData({ fromUnitIndex: unitIndex });
      } else {
        this.setData({ toUnitIndex: unitIndex });
      }
      
      if (this.data.fromValue !== '' && this.data.fromValue !== null && this.data.fromValue !== undefined) {
        this.convertValue();
      }
    }
  },

  loadCommonConversions: function(category) {
    const commonMap = {
      'length': [
        { value: 1, fromUnit: '米', toUnit: '厘米', result: 100 },
        { value: 1, fromUnit: '千米', toUnit: '米', result: 1000 },
        { value: 1, fromUnit: '英寸', toUnit: '厘米', result: 2.54 },
        { value: 1, fromUnit: '英尺', toUnit: '米', result: 0.3048 }
      ],
      'weight': [
        { value: 1, fromUnit: '千克', toUnit: '克', result: 1000 },
        { value: 1, fromUnit: '磅', toUnit: '千克', result: 0.4536 },
        { value: 1, fromUnit: '盎司', toUnit: '克', result: 28.35 }
      ],
      'temperature': [
        { value: 0, fromUnit: '℃', toUnit: '℉', result: 32 },
        { value: 100, fromUnit: '℃', toUnit: '℉', result: 212 },
        { value: 0, fromUnit: '℃', toUnit: 'K', result: 273.15 }
      ],
      'area': [
        { value: 1, fromUnit: '平方米', toUnit: '平方英尺', result: 10.76 },
        { value: 1, fromUnit: '公顷', toUnit: '亩', result: 15 },
        { value: 1, fromUnit: '英亩', toUnit: '平方米', result: 4046.86 }
      ],
      'volume': [
        { value: 1, fromUnit: '升', toUnit: '毫升', result: 1000 },
        { value: 1, fromUnit: '加仑', toUnit: '升', result: 3.79 },
        { value: 1, fromUnit: '立方米', toUnit: '升', result: 1000 }
      ],
      'speed': [
        { value: 1, fromUnit: '米/秒', toUnit: '千米/时', result: 3.6 },
        { value: 60, fromUnit: '千米/时', toUnit: '米/秒', result: 16.67 },
        { value: 1, fromUnit: '节', toUnit: '千米/时', result: 1.85 }
      ],
      'time': [
        { value: 1, fromUnit: '分', toUnit: '秒', result: 60 },
        { value: 1, fromUnit: '小时', toUnit: '分', result: 60 },
        { value: 1, fromUnit: '天', toUnit: '小时', result: 24 }
      ],
      'digital': [
        { value: 1, fromUnit: '兆比特', toUnit: '千比特', result: 1024 },
        { value: 1, fromUnit: '吉比特', toUnit: '兆比特', result: 1024 },
        { value: 1, fromUnit: '太比特', toUnit: '吉比特', result: 1024 }
      ]
    };
    
    this.setData({
      commonConversions: commonMap[category] || []
    });
  },

  useCommonConversion: function(e) {
    const index = e.currentTarget.dataset.index;
    const conversion = this.data.commonConversions[index];
    
    if (!conversion) return;
    
    const units = convertUtils.getUnits(this.data.currentCategory);
    
    const fromUnitIndex = units.findIndex(u => u.name === conversion.fromUnit);
    const toUnitIndex = units.findIndex(u => u.name === conversion.toUnit);
    
    if (fromUnitIndex !== -1 && toUnitIndex !== -1) {
      this.setData({
        fromValue: conversion.value.toString(),
        fromUnitIndex: fromUnitIndex,
        toUnitIndex: toUnitIndex,
        toValue: conversion.result.toString()
      });
      
      this.saveToHistory(conversion.value, units[fromUnitIndex].id, units[toUnitIndex].id, conversion.result, this.data.currentCategory);
    }
  },

  saveToHistory: function(fromValue, fromUnit, toUnit, result, category) {
    const fromUnitName = this.getUnitName(fromUnit, category);
    const toUnitName = this.getUnitName(toUnit, category);
    
    const expression = `${fromValue} ${fromUnitName}`;
    const resultStr = `${this.formatNumber(result)} ${toUnitName}`;
    
    app.saveHistory('converter_history', {
      expression: expression,
      result: resultStr,
      category: category
    });
    
    this.loadHistory();
  },

  loadHistory: function() {
    const history = app.getHistory('converter_history') || [];
    this.setData({ history: history });
  },

  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('converter_history');
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