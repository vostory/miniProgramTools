const app = getApp();

Page({
  data: {
    theme: 'light',
    showStats: false,
    showWelcome: true,
    toolStats: {
      calculator: 0,
      converter: 0,
      ocr: 0
    }
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
    });
    
    // 设置导航栏颜色
    this.setNavBarColor();
    
    // 加载使用统计
    this.loadUsageStats();
    
    // 隐藏欢迎提示
    setTimeout(() => {
      this.setData({ showWelcome: false });
    }, 3000);
  },

  onShow: function() {
    this.setData({
      theme: app.globalData.theme
    });
    
    // 刷新统计
    this.loadUsageStats();
  },

  onPullDownRefresh: function() {
    this.loadUsageStats();
    wx.stopPullDownRefresh();
  },

  // 切换主题
  toggleTheme: function() {
    const newTheme = app.toggleTheme();
    this.setData({ theme: newTheme });
    this.setNavBarColor();
    
    wx.showToast({
      title: newTheme === 'dark' ? '切换为暗色主题' : '切换为亮色主题',
      icon: 'success',
      duration: 1500
    });
  },

  // 设置导航栏颜色
  setNavBarColor: function() {
    const theme = this.data.theme;
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      animation: {
        duration: 300,
        timingFunc: 'easeInOut'
      }
    });
  },

  // 加载使用统计
  loadUsageStats: function() {
    try {
      const calcHistory = app.getHistory('calc_history') || [];
      const sciHistory = app.getHistory('calc_scientific_history') || [];
      const converterHistory = app.getHistory('converter_history') || [];
      const ocrHistory = app.getHistory('ocr_history') || [];
      
      this.setData({
        toolStats: {
          calculator: calcHistory.length + sciHistory.length,
          converter: converterHistory.length,
          ocr: ocrHistory.length
        }
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  },

  // 清空所有历史
  clearAllHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('calc_history');
          app.clearHistory('calc_scientific_history');
          app.clearHistory('converter_history');
          app.clearHistory('ocr_history');
          app.clearHistory('datecalc_history');
          
          this.setData({
            toolStats: { calculator: 0, converter: 0, ocr: 0 }
          });
          
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 显示应用信息
  showAppInfo: function() {
    wx.showModal({
      title: '关于本地工具集',
      content: '版本: 1.0.0\n\n' +
              '功能特色：\n' +
              '✅ 轻量实用，不占空间\n' +
              '✅ 本地优先，保护隐私\n' +
              '✅ 离线可用，无需网络\n' +
              '✅ 开源透明，安全可靠\n\n' +
              '所有计算均在本地完成，不会上传任何数据。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#07c160'
    });
  },

  // 分享应用
  shareApp: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    wx.showToast({
      title: '请点击右上角分享',
      icon: 'none',
      duration: 2000
    });
  },

  // 反馈建议
  feedback: function() {
    wx.showModal({
      title: '反馈建议',
      content: '您可以通过以下方式提供反馈：\n\n' +
              '1. GitHub Issues\n' +
              '2. 邮件联系\n' +
              '3. 微信反馈群\n\n' +
              '目前功能持续开发中，欢迎提出宝贵建议！',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#07c160'
    });
  },

  // 打开GitHub
  openGitHub: function() {
    wx.showModal({
      title: 'GitHub 仓库',
      content: '项目已开源，欢迎Star和贡献代码！\n\n' +
              'GitHub: github.com/local-toolkit\n\n' +
              '由于小程序限制，请在浏览器中访问。',
      confirmText: '复制链接',
      cancelText: '取消',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'https://github.com/local-toolkit',
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 隐私政策
  openPrivacy: function() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私：\n\n' +
              '✅ 所有计算在本地完成\n' +
              '✅ 不会收集任何个人信息\n' +
              '✅ 不会上传任何计算数据\n' +
              '✅ 历史记录仅保存在本地\n' +
              '✅ OCR功能通过微信官方接口\n\n' +
              '我们承诺保护您的隐私安全。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#07c160'
    });
  },

  // 使用帮助
  openHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '常见问题：\n\n' +
              'Q: 需要网络吗？\n' +
              'A: 除证件识别外，全部功能可离线使用。\n\n' +
              'Q: 数据安全吗？\n' +
              'A: 所有数据仅保存在您的设备上。\n\n' +
              'Q: 如何备份数据？\n' +
              'A: 历史记录支持导出功能。\n\n' +
              '如有其他问题，欢迎反馈。',
      confirmText: '开始使用',
      cancelText: '了解更多',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.cancel) {
          this.openGitHub();
        }
      }
    });
  },

  // 显示即将上线提示
  showComingSoon: function() {
    wx.showToast({
      title: '功能开发中，敬请期待！',
      icon: 'none',
      duration: 2000
    });
  },

  // 切换统计显示
  toggleStats: function() {
    this.setData({
      showStats: !this.data.showStats
    });
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '青小主工具集 - 轻量实用的离线工具',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  onShareTimeline: function() {
    return {
      title: '青小主工具集 - 轻量实用的离线工具',
      query: 'from=timeline'
    };
  }
});