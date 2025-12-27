const app = getApp();
const localOcr = require('../../utils/localOcr.js');

Page({
  data: {
    theme: 'light',
    cardType: 'idcard_front',
    imagePath: '',
    imageInfo: null,
    isProcessing: false,
    result: null,
    resultItems: [],
    validationErrors: [],
    history: [],
    hasCameraPermission: false
  },

  onLoad: function() {
    this.setData({
      theme: app.globalData.theme
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

  // 图片加载完成
  onImageLoad: function(e) {
    this.setData({
      imageInfo: {
        width: e.detail.width,
        height: e.detail.height
      }
    });
  },

  // 选择证件类型
  selectCardType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      cardType: type,
      result: null,
      resultItems: [],
      imagePath: '',
      validationErrors: []
    });
  },

  // 检查并申请摄像头权限
  checkCameraPermission: function() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.camera']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.camera',
              success: () => {
                this.setData({ hasCameraPermission: true });
                resolve(true);
              },
              fail: (err) => {
                this.setData({ hasCameraPermission: false });
                
                if (err.errMsg.includes('auth deny')) {
                  wx.showModal({
                    title: '需要相机权限',
                    content: '请在设置中打开相机权限，才能使用拍照功能',
                    confirmText: '去设置',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        wx.openSetting({
                          success: (settingRes) => {
                            if (settingRes.authSetting['scope.camera']) {
                              this.setData({ hasCameraPermission: true });
                              resolve(true);
                            } else {
                              reject(new Error('用户拒绝授权'));
                            }
                          }
                        });
                      } else {
                        reject(new Error('用户取消授权'));
                      }
                    }
                  });
                } else {
                  reject(err);
                }
              }
            });
          }
        },
        fail: reject
      });
    });
  },

  // 拍照
  takePhoto: function() {
    this.checkCameraPermission()
      .then(() => {
        this.chooseImage(true);
      })
      .catch((err) => {
        wx.showToast({
          title: '需要相机权限',
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 从相册选择
  chooseImage: function() {
    this.chooseImage(false);
  },

  // 统一选择图片方法
  chooseImage: function(isCamera) {
    const that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [isCamera ? 'camera' : 'album'],
      success: function(res) {
        const tempFilePath = res.tempFilePaths[0];
        that.setData({ 
          imagePath: tempFilePath,
          result: null,
          resultItems: [],
          validationErrors: []
        });
      },
      fail: function(err) {
        if (err.errMsg.includes('cancel')) {
          return;
        }
        
        if (err.errMsg.includes('permission')) {
          wx.showToast({
            title: '需要相册/相机权限',
            icon: 'none',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 清空图片
  clearImage: function() {
    this.setData({ 
      imagePath: '',
      imageInfo: null,
      result: null,
      resultItems: [],
      validationErrors: []
    });
  },

  // 开始识别
  startRecognize: function() {
    const that = this;
    const { cardType, imagePath } = this.data;
    
    if (!imagePath) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ 
      isProcessing: true,
      result: null,
      resultItems: [],
      validationErrors: []
    });
    
    // 显示加载提示
    wx.showLoading({
      title: '识别中...',
      mask: true
    });
    
    // 使用本地OCR识别
    localOcr.recognize(cardType, imagePath)
      .then(result => {
        wx.hideLoading();
        this.setData({ isProcessing: false });
        this.handleRecognizeResult(result);
      })
      .catch(error => {
        wx.hideLoading();
        this.setData({ isProcessing: false });
        this.handleRecognizeError(error);
      });
  },

  // 处理识别结果
  handleRecognizeResult: function(result) {
    const { cardType } = this.data;
    
    if (result.success) {
      const data = result.data || {};
      
      // 格式化结果显示
      const resultItems = this.formatResultItems(cardType, data);
      
      // 验证识别结果
      const validationErrors = this.validateResult(cardType, data);
      
      this.setData({
        result: data,
        resultItems: resultItems,
        validationErrors: validationErrors
      });
      
      // 保存到历史记录
      this.saveToHistory(cardType, data, resultItems);
      
      wx.showToast({
        title: '识别完成',
        icon: 'success',
        duration: 1500
      });
    } else {
      this.handleRecognizeError(new Error(result.error || '识别失败'));
    }
  },

  // 格式化结果项
  formatResultItems: function(cardType, data) {
    if (cardType === 'idcard_front') {
      return [
        { field: 'name', label: '姓名', value: data.name || '', error: false },
        { field: 'idNum', label: '身份证号', value: data.idNum || '', error: false },
        { field: 'address', label: '地址', value: data.address || '', error: false },
        { field: 'nation', label: '民族', value: data.nation || '', error: false },
        { field: 'sex', label: '性别', value: data.sex || '', error: false },
        { field: 'birth', label: '出生日期', value: data.birth || '', error: false },
        { field: 'validDate', label: '有效期', value: data.validDate || '', error: false }
      ];
    } else if (cardType === 'idcard_back') {
      return [
        { field: 'authority', label: '签发机关', value: data.authority || '', error: false },
        { field: 'validDate', label: '有效期限', value: data.validDate || '', error: false }
      ];
    } else if (cardType === 'bankcard') {
      return [
        { field: 'cardNo', label: '卡号', value: data.cardNo || '', error: false },
        { field: 'bankName', label: '银行名称', value: data.bankName || '', error: false },
        { field: 'cardType', label: '卡类型', value: data.cardType || '', error: false },
        { field: 'validDate', label: '有效期', value: data.validDate || '', error: false }
      ];
    }
    return [];
  },

  // 验证识别结果
  validateResult: function(cardType, data) {
    const errors = [];
    
    if (cardType === 'idcard_front') {
      // 验证姓名
      if (!data.name || data.name.trim().length < 2) {
        errors.push({ field: 'name', message: '姓名至少2个字符' });
      }
      
      // 验证身份证号
      if (data.idNum && !this.validateIDCard(data.idNum)) {
        errors.push({ field: 'idNum', message: '身份证号格式不正确' });
      }
      
      // 验证出生日期
      if (data.birth && !this.validateDate(data.birth)) {
        errors.push({ field: 'birth', message: '出生日期格式不正确' });
      }
      
    } else if (cardType === 'bankcard') {
      // 验证银行卡号
      if (data.cardNo && !this.validateBankCard(data.cardNo)) {
        errors.push({ field: 'cardNo', message: '银行卡号格式不正确' });
      }
    }
    
    return errors;
  },

  // 验证身份证号
  validateIDCard: function(idNum) {
    if (!idNum) return true;
    
    // 简单的身份证号验证
    const idReg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idReg.test(idNum)) {
      return false;
    }
    
    // 验证校验码
    const idStr = idNum.toUpperCase();
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idStr.charAt(i)) * factor[i];
    }
    
    return parity[sum % 11] === idStr.charAt(17);
  },

  // 验证银行卡号
  validateBankCard: function(cardNo) {
    if (!cardNo) return true;
    
    // 移除空格
    const cleanCardNo = cardNo.replace(/\s+/g, '');
    
    // 银行卡号长度通常是13-19位
    if (cleanCardNo.length < 13 || cleanCardNo.length > 19) {
      return false;
    }
    
    // 使用Luhn算法验证
    let sum = 0;
    let doubleUp = false;
    
    for (let i = cleanCardNo.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCardNo.charAt(i));
      
      if (doubleUp) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      doubleUp = !doubleUp;
    }
    
    return (sum % 10) === 0;
  },

  // 验证日期
  validateDate: function(dateStr) {
    if (!dateStr) return true;
    
    // 多种日期格式
    const datePatterns = [
      /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/,  // YYYY-MM-DD
      /^\d{4}年\d{1,2}月\d{1,2}日$/,      // YYYY年MM月DD日
      /^\d{8}$/                           // YYYYMMDD
    ];
    
    for (const pattern of datePatterns) {
      if (pattern.test(dateStr)) {
        return true;
      }
    }
    
    return false;
  },

  // 处理识别错误
  handleRecognizeError: function(error) {
    console.error('OCR识别错误:', error);
    
    let errorMsg = '识别失败，请重试';
    if (error.message) {
      if (error.message.includes('图片')) {
        errorMsg = '图片格式不支持';
      } else if (error.message.includes('网络')) {
        errorMsg = '网络错误';
      } else if (error.message.includes('授权')) {
        errorMsg = '权限不足';
      }
    }
    
    wx.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    });
  },

  // 结果修改
  onResultChange: function(e) {
    const { field, index } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    const resultItems = this.data.resultItems;
    if (resultItems[index]) {
      resultItems[index].value = value;
      
      this.setData({
        resultItems: resultItems
      });
    }
  },

  // 验证字段
  validateField: function(e) {
    const { field, index } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    const resultItems = this.data.resultItems;
    if (resultItems[index]) {
      let error = false;
      
      // 根据字段类型验证
      if (field === 'idNum' && value && !this.validateIDCard(value)) {
        error = true;
      } else if (field === 'cardNo' && value && !this.validateBankCard(value)) {
        error = true;
      } else if (field === 'birth' && value && !this.validateDate(value)) {
        error = true;
      } else if (field === 'name' && value && value.trim().length < 2) {
        error = true;
      }
      
      resultItems[index].error = error;
      
      this.setData({
        resultItems: resultItems
      });
    }
  },

  // 复制单项结果
  copySingleResult: function(e) {
    const value = e.currentTarget.dataset.value;
    if (value) {
      wx.setClipboardData({
        data: value,
        success: function() {
          wx.showToast({
            title: '已复制',
            icon: 'success',
            duration: 1000
          });
        }
      });
    }
  },

  // 复制全部结果
  copyAllResult: function() {
    const { resultItems } = this.data;
    if (!resultItems || resultItems.length === 0) return;
    
    let copyText = '';
    resultItems.forEach(item => {
      copyText += `${item.label}：${item.value}\n`;
    });
    
    wx.setClipboardData({
      data: copyText,
      success: function() {
        wx.showToast({
          title: '已复制全部结果',
          icon: 'success',
          duration: 1000
        });
      }
    });
  },

  // 保存到历史记录
  saveToHistory: function(cardType, data, resultItems) {
    const cardTypeMap = {
      'idcard_front': '身份证正面',
      'idcard_back': '身份证反面',
      'bankcard': '银行卡'
    };
    
    const resultText = this.getResultSummary(cardType, data, resultItems);
    
    app.saveHistory('ocr_history', {
      cardType: cardType,
      cardTypeName: cardTypeMap[cardType] || cardType,
      data: data,
      resultItems: resultItems,
      summary: resultText
    });
    
    this.loadHistory();
  },

  // 获取结果摘要
  getResultSummary: function(cardType, data, resultItems) {
    if (cardType === 'idcard_front') {
      return `${data.name || ''} ${data.idNum ? data.idNum.substring(0, 4) + '****' : ''}`;
    } else if (cardType === 'idcard_back') {
      return `${data.authority || ''} ${data.validDate || ''}`;
    } else if (cardType === 'bankcard') {
      return `${data.bankName || ''} ${data.cardNo ? data.cardNo.substring(0, 6) + '****' : ''}`;
    }
    return '';
  },

  // 加载历史记录
  loadHistory: function() {
    const history = app.getHistory('ocr_history') || [];
    this.setData({ history: history });
  },

  // 显示历史详情
  showHistoryDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const history = this.data.history;
    
    if (history && history[index]) {
      const item = history[index].data;
      const cardType = item.cardType;
      const data = item.data;
      const resultItems = item.resultItems || [];
      
      this.setData({
        cardType: cardType,
        result: data,
        resultItems: resultItems
      });
      
      // 滚动到结果区域
      wx.pageScrollTo({
        selector: '.result-section',
        duration: 300
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
          app.clearHistory('ocr_history');
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