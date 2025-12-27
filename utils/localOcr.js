/**
 * 本地OCR识别工具
 * 基于图片处理和规则匹配的轻量级OCR
 */
class LocalOCR {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 识别证件
   * @param {string} cardType - 证件类型
   * @param {string} imagePath - 图片路径
   * @returns {Promise} 识别结果
   */
  recognize(cardType, imagePath) {
    return new Promise((resolve, reject) => {
      try {
        // 由于小程序中无法直接进行复杂的图片处理
        // 这里使用模拟识别结果
        // 实际项目中可以集成Tesseract.js或其他JS OCR库
        
        setTimeout(() => {
          let result = {};
          
          if (cardType === 'idcard_front') {
            result = this.simulateIDCardFront();
          } else if (cardType === 'idcard_back') {
            result = this.simulateIDCardBack();
          } else if (cardType === 'bankcard') {
            result = this.simulateBankCard();
          }
          
          resolve({
            success: true,
            data: result
          });
        }, 1000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 模拟身份证正面识别
   */
  simulateIDCardFront() {
    // 生成模拟的身份证信息
    const names = ['张三', '李四', '王五', '赵六', '刘七', '陈八'];
    const addresses = [
      '北京市朝阳区某某街道某某小区1号楼101室',
      '上海市浦东新区某某路某某号',
      '广州市天河区某某大道某某小区',
      '深圳市南山区某某科技园',
      '成都市武侯区某某街道某某小区'
    ];
    const nations = ['汉', '回', '蒙', '藏', '维', '苗'];
    const sexs = ['男', '女'];
    
    // 生成随机出生日期
    const year = 1980 + Math.floor(Math.random() * 30);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    // 生成身份证号
    const areaCode = '110101'; // 北京东城区
    const birthCode = `${year}${month}${day}`;
    const orderCode = String(Math.floor(Math.random() * 900) + 100);
    const checkCode = Math.floor(Math.random() * 10);
    
    const idNum = `${areaCode}${birthCode}${orderCode}${checkCode}`;
    
    return {
      name: names[Math.floor(Math.random() * names.length)],
      idNum: idNum,
      address: addresses[Math.floor(Math.random() * addresses.length)],
      nation: nations[Math.floor(Math.random() * nations.length)],
      sex: sexs[Math.floor(Math.random() * sexs.length)],
      birth: `${year}年${month}月${day}日`,
      validDate: '2010.01.01-2020.01.01'
    };
  }

  /**
   * 模拟身份证背面识别
   */
  simulateIDCardBack() {
    const authorities = [
      '北京市公安局朝阳分局',
      '上海市公安局浦东分局',
      '广州市公安局天河分局',
      '深圳市公安局南山分局',
      '成都市公安局武侯分局'
    ];
    
    return {
      authority: authorities[Math.floor(Math.random() * authorities.length)],
      validDate: '2010.01.01-2020.01.01'
    };
  }

  /**
   * 模拟银行卡识别
   */
  simulateBankCard() {
    const banks = [
      { name: '中国工商银行', prefix: '6222' },
      { name: '中国农业银行', prefix: '6228' },
      { name: '中国银行', prefix: '6216' },
      { name: '中国建设银行', prefix: '6217' },
      { name: '交通银行', prefix: '6222' },
      { name: '招商银行', prefix: '6225' },
      { name: '浦发银行', prefix: '6225' }
    ];
    
    const cardTypes = ['储蓄卡', '信用卡', '借记卡'];
    
    const bank = banks[Math.floor(Math.random() * banks.length)];
    
    // 生成银行卡号
    let cardNo = bank.prefix;
    for (let i = 0; i < 12; i++) {
      cardNo += Math.floor(Math.random() * 10);
    }
    
    // 添加空格
    cardNo = cardNo.replace(/(\d{4})/g, '$1 ').trim();
    
    // 生成有效期
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = 25 + Math.floor(Math.random() * 10);
    
    return {
      cardNo: cardNo,
      bankName: bank.name,
      cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      validDate: `${month}/${year}`
    };
  }

  /**
   * 获取图片信息
   * @param {string} imagePath - 图片路径
   * @returns {Promise} 图片信息
   */
  getImageInfo(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imagePath,
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 压缩图片
   * @param {string} imagePath - 原图路径
   * @param {number} quality - 质量
   * @returns {Promise} 压缩后图片路径
   */
  compressImage(imagePath, quality = 0.8) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: imagePath,
        quality: quality,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: reject
      });
    });
  }

  /**
   * 图片预处理
   * @param {string} imagePath - 图片路径
   * @returns {Promise} 预处理后的图片信息
   */
  preprocessImage(imagePath) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取图片信息
        const imageInfo = await this.getImageInfo(imagePath);
        
        // 如果图片太大，进行压缩
        let finalPath = imagePath;
        if (imageInfo.width > 2000 || imageInfo.height > 2000) {
          finalPath = await this.compressImage(imagePath, 0.6);
        }
        
        resolve({
          path: finalPath,
          width: imageInfo.width,
          height: imageInfo.height
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 验证图片
   * @param {string} imagePath - 图片路径
   * @returns {Promise} 验证结果
   */
  validateImage(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imagePath,
        success: (res) => {
          const { width, height } = res;
          
          // 检查图片尺寸
          if (width < 200 || height < 200) {
            reject(new Error('图片尺寸太小，请选择更清晰的图片'));
            return;
          }
          
          // 检查图片宽高比
          const aspectRatio = width / height;
          
          if (aspectRatio < 0.5 || aspectRatio > 2) {
            reject(new Error('图片比例异常，请确保证件完整显示'));
            return;
          }
          
          resolve(res);
        },
        fail: (err) => {
          reject(new Error('图片加载失败，请重试'));
        }
      });
    });
  }

  /**
   * 提取文本（模拟）
   * @param {string} imagePath - 图片路径
   * @returns {Promise} 提取的文本
   */
  extractText(imagePath) {
    return new Promise((resolve) => {
      // 这里模拟文本提取
      setTimeout(() => {
        resolve({
          text: '这是一段模拟的文本内容，实际OCR可以识别更多信息',
          confidence: 0.85
        });
      }, 500);
    });
  }

  /**
   * 格式化身份证号
   * @param {string} idNum - 身份证号
   * @returns {string} 格式化后的身份证号
   */
  formatIDCard(idNum) {
    if (!idNum) return '';
    
    // 移除空格
    let cleanId = idNum.replace(/\s+/g, '');
    
    // 添加空格
    if (cleanId.length === 18) {
      return `${cleanId.substring(0, 6)} ${cleanId.substring(6, 14)} ${cleanId.substring(14)}`;
    }
    
    return idNum;
  }

  /**
   * 格式化银行卡号
   * @param {string} cardNo - 银行卡号
   * @returns {string} 格式化后的银行卡号
   */
  formatBankCard(cardNo) {
    if (!cardNo) return '';
    
    // 移除所有非数字字符
    let cleanCard = cardNo.replace(/\D/g, '');
    
    // 每4位加一个空格
    return cleanCard.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * 格式化日期
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    // 尝试多种格式转换
    const patterns = [
      { regex: /^(\d{4})(\d{2})(\d{2})$/, format: '$1-$2-$3' }, // YYYYMMDD
      { regex: /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, format: '$1-$2-$3' }, // YYYY年MM月DD日
      { regex: /^(\d{4})[./](\d{1,2})[./](\d{1,2})$/, format: '$1-$2-$3' } // YYYY/MM/DD
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(dateStr)) {
        return dateStr.replace(pattern.regex, pattern.format);
      }
    }
    
    return dateStr;
  }
}

module.exports = new LocalOCR();