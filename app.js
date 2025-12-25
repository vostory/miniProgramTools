// app.js
App({
  onLaunch: function() {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'dev-xxxxx',
        traceUser: true
      });
    }
    
    this.checkUpdate();
    this.loadTheme();
  },
  
  globalData: {
    theme: 'light',
    fontSize: 16
  },
  
  checkUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        console.log('检查更新：', res.hasUpdate);
      });
      
      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已就绪，立即重启使用？',
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
    }
  },
  
  loadTheme: function() {
    try {
      const theme = wx.getStorageSync('theme') || 'light';
      this.globalData.theme = theme;
    } catch (e) {}
  },
  
  toggleTheme: function() {
    const newTheme = this.globalData.theme === 'light' ? 'dark' : 'light';
    this.globalData.theme = newTheme;
    wx.setStorageSync('theme', newTheme);
    return newTheme;
  },
  
  getHistory: function(key) {
    try {
      return wx.getStorageSync(key) || [];
    } catch (e) {
      return [];
    }
  },
  
  saveHistory: function(key, data) {
    try {
      let history = this.getHistory(key);
      history.unshift({
        data: data,
        time: new Date().toLocaleString()
      });
      if (history.length > 50) history.pop();
      wx.setStorageSync(key, history);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  clearHistory: function(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      return false;
    }
  }
});