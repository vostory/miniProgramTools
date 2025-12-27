const app = getApp();
const loanCalculator = require('../../utils/loanCalculator.js');

Page({
  data: {
    theme: 'light',
    // 计算类型
    calcType: 'commercial',
    
    // 下拉列表选项
    amountOptions: ['30', '50', '80', '100', '150', '200', '300', '500', '自定义'],
    yearsOptions: ['1', '2', '3', '5', '10', '15', '20', '25', '30'],
    
    // 默认选择索引
    amountIndex: 3,  // 100万
    yearsIndex: 6,   // 20年
    
    // 当前选中的值
    loanAmount: '100',  // 万元
    loanYears: '20',    // 年
    
    // 自定义金额相关
    showCustomAmount: false,
    customAmount: '',
    
    // 还款方式
    repaymentType: 'equal',
    
    // 利率相关
    rateOptions: [],
    rateIndex: 0,
    
    // 计算结果
    result: null,
    repaymentPlan: [],
    
    // 历史记录
    history: []
  },

  onLoad: function() {
    console.log('房贷计算页面加载');
    this.setData({
      theme: app.globalData.theme
    });
    
    // 加载利率选项
    this.loadRateOptions();
    
    // 加载历史记录
    this.loadHistory();
  },

  onShow: function() {
    console.log('房贷计算页面显示');
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

  // 加载利率选项
  loadRateOptions: function() {
    let rateOptions = [];
    let defaultIndex = 0;
    
    if (this.data.calcType === 'commercial') {
      // 商业贷款利率
      rateOptions = ['3.6', '3.8', '4.0', '4.2', '4.3', '4.5', '4.8', '5.0', '5.2'];
      defaultIndex = 4;  // 4.3%
    } else if (this.data.calcType === 'fund') {
      // 公积金贷款利率
      rateOptions = ['2.6', '2.8', '3.0', '3.1', '3.2', '3.3', '3.5', '3.8'];
      defaultIndex = 3;  // 3.1%
    } else {
      // 组合贷款（商业部分）
      rateOptions = ['3.6', '3.8', '4.0', '4.2', '4.3', '4.5', '4.8', '5.0', '5.2'];
      defaultIndex = 4;
    }
    
    this.setData({
      rateOptions: rateOptions,
      rateIndex: defaultIndex
    });
  },

  // 计算类型切换
  changeCalcType: function(e) {
    console.log('切换计算类型事件:', e);
    
    if (!e) {
      console.error('changeCalcType: 事件对象为空');
      return;
    }
    
    const type = e.currentTarget ? e.currentTarget.dataset.type : e.target.dataset.type;
    if (!type) {
      console.error('changeCalcType: 未找到type参数');
      return;
    }
    
    console.log('切换计算类型:', type);
    
    this.setData({ 
      calcType: type,
      result: null,
      repaymentPlan: []
    });
    
    // 重新加载利率选项
    this.loadRateOptions();
  },

  // 贷款金额选择变化
  onAmountChange: function(e) {
    console.log('贷款金额变化事件:', e);
    
    if (!e || !e.detail) {
      console.error('onAmountChange: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const selectedValue = this.data.amountOptions[index];
    
    console.log('选择贷款金额:', selectedValue, '索引:', index);
    
    this.setData({
      amountIndex: index
    });
    
    if (selectedValue === '自定义') {
      // 显示自定义输入框
      this.setData({
        showCustomAmount: true,
        loanAmount: this.data.customAmount || ''
      });
    } else {
      // 隐藏自定义输入框，使用选择的值
      this.setData({
        showCustomAmount: false,
        loanAmount: selectedValue
      });
    }
  },

  // 自定义金额输入
  onCustomAmountChange: function(e) {
    console.log('自定义金额输入事件:', e);
    
    if (!e || !e.detail) {
      console.error('onCustomAmountChange: 事件对象或detail为空');
      return;
    }
    
    const value = e.detail.value;
    console.log('自定义金额:', value);
    
    this.setData({
      customAmount: value,
      loanAmount: value
    });
  },

  // 贷款年限选择变化
  onYearsChange: function(e) {
    console.log('贷款年限变化事件:', e);
    
    if (!e || !e.detail) {
      console.error('onYearsChange: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const selectedValue = this.data.yearsOptions[index];
    
    console.log('选择贷款年限:', selectedValue, '索引:', index);
    
    this.setData({
      yearsIndex: index,
      loanYears: selectedValue
    });
  },

  // 贷款利率选择变化
  onRateChange: function(e) {
    console.log('贷款利率变化事件:', e);
    
    if (!e || !e.detail) {
      console.error('onRateChange: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const selectedValue = this.data.rateOptions[index];
    
    console.log('选择贷款利率:', selectedValue, '索引:', index);
    
    this.setData({
      rateIndex: index
    });
  },

  // 还款方式切换
  changeRepaymentType: function(e) {
    console.log('还款方式切换事件:', e);
    
    if (!e) {
      console.error('changeRepaymentType: 事件对象为空');
      return;
    }
    
    const type = e.currentTarget ? e.currentTarget.dataset.type : e.target.dataset.type;
    if (!type) {
      console.error('changeRepaymentType: 未找到type参数');
      return;
    }
    
    console.log('切换还款方式:', type);
    this.setData({ repaymentType: type });
  },

  // 计算房贷
  calculateLoan: function() {
    console.log('开始计算房贷');
    
    const { loanAmount, loanYears, rateOptions, rateIndex, repaymentType } = this.data;
    const interestRate = rateOptions[rateIndex];
    
    console.log('计算参数:', { loanAmount, loanYears, interestRate, repaymentType });
    
    // 验证输入
    if (!loanAmount || loanAmount.trim() === '' || isNaN(parseFloat(loanAmount)) || parseFloat(loanAmount) <= 0) {
      wx.showToast({
        title: '请输入有效的贷款金额',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!loanYears || isNaN(parseInt(loanYears)) || parseInt(loanYears) <= 0 || parseInt(loanYears) > 30) {
      wx.showToast({
        title: '贷款年限需在1-30年之间',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!interestRate || isNaN(parseFloat(interestRate)) || parseFloat(interestRate) <= 0) {
      wx.showToast({
        title: '请输入有效的贷款利率',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const amount = parseFloat(loanAmount) * 10000; // 万元转为元
    const years = parseInt(loanYears);
    const rate = parseFloat(interestRate) / 100; // 百分比转为小数
    
    console.log('计算参数（转换后）:', { amount, years, rate, type: repaymentType });
    
    // 显示加载
    wx.showLoading({
      title: '计算中...',
      mask: true
    });
    
    try {
      let result, plan;
      
      if (repaymentType === 'equal') {
        // 等额本息
        console.log('计算等额本息');
        result = loanCalculator.calculateEqualInstallment(amount, years, rate);
        console.log('等额本息计算结果:', result);
        plan = loanCalculator.generateEqualPlan(amount, years, rate);
      } else {
        // 等额本金
        console.log('计算等额本金');
        result = loanCalculator.calculateEqualPrincipal(amount, years, rate);
        console.log('等额本金计算结果:', result);
        plan = loanCalculator.generatePrincipalPlan(amount, years, rate);
      }
      
      console.log('还款计划:', plan ? plan.slice(0, 5) : '无');
      
      // 格式化结果
      const formattedResult = this.formatResult(result, years, rate, repaymentType);
      const formattedPlan = this.formatPlan(plan);
      
      console.log('格式化结果:', formattedResult);
      
      this.setData({
        result: formattedResult,
        repaymentPlan: formattedPlan
      });
      
      // 保存到历史记录
      this.saveToHistory(formattedResult, repaymentType, loanAmount, loanYears, interestRate);
      
      wx.hideLoading();
      wx.showToast({
        title: '计算完成',
        icon: 'success',
        duration: 1000
      });
      
    } catch (error) {
      console.error('计算错误:', error);
      wx.hideLoading();
      
      // 显示详细的错误信息
      let errorMsg = '计算出错，请重试';
      if (error.message) {
        errorMsg = error.message;
      }
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 格式化结果
  formatResult: function(result, years, rate, type) {
    console.log('格式化结果，原始数据:', result);
    
    if (!result) {
      console.error('计算结果为空');
      return null;
    }
    
    let monthlyPayment = 0;
    let monthlyChange = null;
    
    if (type === 'equal') {
      // 等额本息
      monthlyPayment = result.monthlyPayment || 0;
    } else {
      // 等额本金
      monthlyPayment = result.firstMonthPayment || 0;
      monthlyChange = result.monthlyChange || 0;
    }
    
    const formattedResult = {
      totalLoan: (result.totalLoan / 10000).toFixed(2), // 转为万元
      years: years,
      months: years * 12,
      rate: (rate * 100).toFixed(2),
      monthlyPayment: this.formatNumber(monthlyPayment, 2),
      monthlyChange: monthlyChange ? this.formatNumber(monthlyChange, 2) : null,
      totalInterest: this.formatNumber(result.totalInterest || 0, 2),
      totalPayment: this.formatNumber(result.totalPayment || 0, 2)
    };
    
    console.log('格式化后的结果:', formattedResult);
    return formattedResult;
  },

  // 格式化数字
  formatNumber: function(num, decimals = 2) {
    if (isNaN(num) || num === null || num === undefined) {
      return '0.00';
    }
    
    return parseFloat(num).toFixed(decimals);
  },

  // 格式化还款计划
  formatPlan: function(plan) {
    if (!plan || !Array.isArray(plan)) {
      console.log('无还款计划数据');
      return [];
    }
    
    const formattedPlan = plan.slice(0, 12).map((item, index) => {
      if (!item) return null;
      
      return {
        period: index + 1,
        payment: this.formatNumber(item.payment, 2),
        principal: this.formatNumber(item.principal, 2),
        interest: this.formatNumber(item.interest, 2),
        balance: this.formatNumber(item.balance, 2)
      };
    }).filter(item => item !== null);
    
    console.log('格式化后的还款计划:', formattedPlan.slice(0, 5));
    return formattedPlan;
  },

  // 显示详细信息
  showDetail: function(e) {
    console.log('显示详情事件:', e);
    
    if (!e) {
      console.error('showDetail: 事件对象为空');
      return;
    }
    
    const index = e.currentTarget ? e.currentTarget.dataset.index : e.target.dataset.index;
    if (index === undefined) {
      console.error('showDetail: 未找到index参数');
      return;
    }
    
    const plan = this.data.repaymentPlan[index];
    
    if (plan) {
      wx.showModal({
        title: `第${plan.period}期还款详情`,
        content: `月供: ${plan.payment}元\n本金: ${plan.principal}元\n利息: ${plan.interest}元\n剩余本金: ${plan.balance}元`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 查看完整还款计划
  viewFullPlan: function() {
    wx.showModal({
      title: '完整还款计划',
      content: '完整还款计划较长，建议在历史记录中查看',
      confirmText: '去历史记录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 滚动到历史记录区域
          wx.pageScrollTo({
            selector: '.history-section',
            duration: 300
          });
        }
      }
    });
  },

  // 保存到历史记录
  saveToHistory: function(result, type, amount, years, rate) {
    if (!result) return;
    
    const historyData = {
      amount: amount,
      years: years,
      rate: rate,
      type: type,
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.totalInterest,
      totalPayment: result.totalPayment
    };
    
    app.saveHistory('loan_history', historyData);
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory: function() {
    const history = app.getHistory('loan_history') || [];
    console.log('加载的历史记录:', history);
    this.setData({ history: history });
  },

  // 加载历史记录项
  loadHistoryItem: function(e) {
    console.log('加载历史记录项事件:', e);
    
    if (!e) {
      console.error('loadHistoryItem: 事件对象为空');
      return;
    }
    
    const index = e.currentTarget ? e.currentTarget.dataset.index : e.target.dataset.index;
    if (index === undefined) {
      console.error('loadHistoryItem: 未找到index参数');
      return;
    }
    
    const history = this.data.history;
    
    if (history && history[index]) {
      const item = history[index].data;
      
      console.log('加载历史记录项:', item);
      
      // 设置参数
      this.setData({
        loanAmount: item.amount,
        loanYears: item.years.toString(),
        repaymentType: item.type || 'equal',
        result: null,
        repaymentPlan: []
      });
      
      // 设置利率选项和索引
      const rateIndex = this.data.rateOptions.indexOf(item.rate);
      if (rateIndex !== -1) {
        this.setData({ rateIndex: rateIndex });
      }
      
      // 触发计算
      this.calculateLoan();
      
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
          app.clearHistory('loan_history');
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