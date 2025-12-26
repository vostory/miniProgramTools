const app = getApp();
const dateUtils = require('../../utils/dateUtils.js');

Page({
  data: {
    theme: 'light',
    mode: 'diff',
    startDate: '',
    endDate: '',
    baseDate: '',
    addDays: '',
    addMonths: '',
    addYears: '',
    workStartDate: '',
    workEndDate: '',
    diffResult: null,
    addResult: '',
    workdayResult: null,
    history: []
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
    });

    const today = new Date();
    const todayStr = this.formatDate(today);
    
    this.setData({
      startDate: todayStr,
      endDate: todayStr,
      baseDate: todayStr,
      workStartDate: todayStr,
      workEndDate: todayStr
    });

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

  setMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode: mode });
  },

  onStartDateChange: function(e) {
    this.setData({ startDate: e.detail.value });
  },

  onEndDateChange: function(e) {
    this.setData({ endDate: e.detail.value });
  },

  onBaseDateChange: function(e) {
    this.setData({ baseDate: e.detail.value });
  },

  onAddDaysChange: function(e) {
    this.setData({ addDays: e.detail.value });
  },

  onAddMonthsChange: function(e) {
    this.setData({ addMonths: e.detail.value });
  },

  onAddYearsChange: function(e) {
    this.setData({ addYears: e.detail.value });
  },

  onWorkStartDateChange: function(e) {
    this.setData({ workStartDate: e.detail.value });
  },

  onWorkEndDateChange: function(e) {
    this.setData({ workEndDate: e.detail.value });
  },

  calculateDiff: function() {
    const { startDate, endDate } = this.data;
    
    if (!startDate || !endDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    try {
      const days = dateUtils.getDaysBetween(startDate, endDate);
      const weeks = Math.floor(days / 7);
      const extraDays = days % 7;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      let months = 0;
      let years = 0;
      
      if (end >= start) {
        years = end.getFullYear() - start.getFullYear();
        months = end.getMonth() - start.getMonth();
        if (months < 0) {
          years--;
          months += 12;
        }
      } else {
        years = start.getFullYear() - end.getFullYear();
        months = start.getMonth() - end.getMonth();
        if (months < 0) {
          years--;
          months += 12;
        }
      }
      
      const result = {
        days: days,
        weeks: weeks,
        extraDays: extraDays,
        months: months,
        years: years
      };
      
      this.setData({ diffResult: result });
      
      const expression = `${startDate} 到 ${endDate}`;
      const resultStr = `${days}天 (${weeks}周${extraDays > 0 ? extraDays + '天' : ''})`;
      
      app.saveHistory('datecalc_history', {
        expression: expression,
        result: resultStr
      });
      
      this.loadHistory();
      
    } catch (error) {
      wx.showToast({
        title: '计算失败',
        icon: 'none'
      });
    }
  },

  addDaysCalc: function(e) {
    const days = parseInt(e.currentTarget.dataset.days);
    this.setData({ addDays: (parseInt(this.data.addDays) || 0) + days });
  },

  calculateAdd: function() {
    const { baseDate, addDays, addMonths, addYears } = this.data;
    
    if (!baseDate) {
      wx.showToast({
        title: '请选择基准日期',
        icon: 'none'
      });
      return;
    }
    
    try {
      let resultDate = new Date(baseDate);
      let expression = baseDate;
      
      if (addDays) {
        const days = parseInt(addDays) || 0;
        resultDate.setDate(resultDate.getDate() + days);
        if (days !== 0) {
          expression += `${days > 0 ? '+' : ''}${days}天`;
        }
      }
      
      if (addMonths) {
        const months = parseInt(addMonths) || 0;
        resultDate.setMonth(resultDate.getMonth() + months);
        if (months !== 0) {
          expression += `${months > 0 ? '+' : ''}${months}个月`;
        }
      }
      
      if (addYears) {
        const years = parseInt(addYears) || 0;
        resultDate.setFullYear(resultDate.getFullYear() + years);
        if (years !== 0) {
          expression += `${years > 0 ? '+' : ''}${years}年`;
        }
      }
      
      const resultStr = this.formatDate(resultDate);
      this.setData({ addResult: resultStr });
      
      app.saveHistory('datecalc_history', {
        expression: expression,
        result: resultStr
      });
      
      this.loadHistory();
      
    } catch (error) {
      wx.showToast({
        title: '计算失败',
        icon: 'none'
      });
    }
  },

  calculateWorkdays: function() {
    const { workStartDate, workEndDate } = this.data;
    
    if (!workStartDate || !workEndDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    try {
      const start = new Date(workStartDate);
      const end = new Date(workEndDate);
      
      if (start > end) {
        wx.showToast({
          title: '开始日期不能晚于结束日期',
          icon: 'none'
        });
        return;
      }
      
      const totalDays = dateUtils.getDaysBetween(workStartDate, workEndDate) + 1;
      let weekendDays = 0;
      let workdays = 0;
      
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (day === 0 || day === 6) {
          weekendDays++;
        } else {
          workdays++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      const result = {
        totalDays: totalDays,
        weekendDays: weekendDays,
        workdays: workdays
      };
      
      this.setData({ workdayResult: result });
      
      const expression = `${workStartDate} 到 ${workEndDate} 工作日计算`;
      const resultStr = `工作日: ${workdays}天, 周末: ${weekendDays}天, 总计: ${totalDays}天`;
      
      app.saveHistory('datecalc_history', {
        expression: expression,
        result: resultStr
      });
      
      this.loadHistory();
      
    } catch (error) {
      wx.showToast({
        title: '计算失败',
        icon: 'none'
      });
    }
  },

  formatDate: function(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  loadHistory: function() {
    const history = app.getHistory('datecalc_history') || [];
    this.setData({ history: history });
  },

  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('datecalc_history');
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