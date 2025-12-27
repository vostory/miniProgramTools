/**
 * 货币换算服务
 * 使用公开的汇率API
 */
class CurrencyService {
  constructor() {
    // 主要货币列表
    this.currencies = [
      { code: 'CNY', symbol: '¥', name: '人民币' },
      { code: 'USD', symbol: '$', name: '美元' },
      { code: 'EUR', symbol: '€', name: '欧元' },
      { code: 'JPY', symbol: '¥', name: '日元' },
      { code: 'GBP', symbol: '£', name: '英镑' },
      { code: 'HKD', symbol: 'HK$', name: '港币' },
      { code: 'KRW', symbol: '₩', name: '韩元' },
      { code: 'AUD', symbol: 'A$', name: '澳元' },
      { code: 'CAD', symbol: 'C$', name: '加元' },
      { code: 'CHF', symbol: 'Fr', name: '瑞士法郎' },
      { code: 'SGD', symbol: 'S$', name: '新加坡元' },
      { code: 'NZD', symbol: 'NZ$', name: '新西兰元' },
      { code: 'INR', symbol: '₹', name: '印度卢比' },
      { code: 'RUB', symbol: '₽', name: '俄罗斯卢布' },
      { code: 'BRL', symbol: 'R$', name: '巴西雷亚尔' },
      { code: 'ZAR', symbol: 'R', name: '南非兰特' },
      { code: 'MXN', symbol: '$', name: '墨西哥比索' },
      { code: 'IDR', symbol: 'Rp', name: '印尼盾' },
      { code: 'MYR', symbol: 'RM', name: '马来西亚林吉特' },
      { code: 'THB', symbol: '฿', name: '泰铢' },
      { code: 'PHP', symbol: '₱', name: '菲律宾比索' },
      { code: 'VND', symbol: '₫', name: '越南盾' },
      { code: 'TWD', symbol: 'NT$', name: '新台币' }
    ];
    
    // 汇率缓存
    this.ratesCache = {};
    this.cacheTime = 30 * 60 * 1000; // 30分钟缓存
    
    // 使用免费的汇率API
    this.apiUrls = {
      'exchangerate-api': 'https://api.exchangerate-api.com/v4/latest/',
      'exchangerate-host': 'https://api.exchangerate.host/latest',
      'frankfurter': 'https://api.frankfurter.app/latest'
    };
    
    // 当前使用的API
    this.currentApi = 'exchangerate-host';
  }
  
  /**
   * 获取货币列表
   */
  getCurrencyList() {
    return this.currencies.map(currency => ({
      ...currency,
      nameWithSymbol: `${currency.symbol} ${currency.code} - ${currency.name}`
    }));
  }
  
  /**
   * 获取汇率
   * @param {string} fromCurrency - 源货币代码
   * @param {string} toCurrency - 目标货币代码
   * @returns {Promise<number>} 汇率
   */
  getExchangeRate(fromCurrency, toCurrency) {
    return new Promise(async (resolve, reject) => {
      try {
        if (fromCurrency === toCurrency) {
          resolve(1);
          return;
        }
        
        // 尝试从缓存获取
        const cacheKey = `${fromCurrency}_${toCurrency}`;
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
          resolve(cachedData.rate);
          return;
        }
        
        // 从API获取
        let rate = null;
        
        // 尝试多个API
        for (const api of ['exchangerate-host', 'frankfurter', 'exchangerate-api']) {
          try {
            rate = await this.fetchFromApi(api, fromCurrency, toCurrency);
            if (rate) {
              // 缓存结果
              this.saveToCache(cacheKey, rate);
              break;
            }
          } catch (error) {
            console.warn(`API ${api} 失败:`, error.message);
          }
        }
        
        if (rate) {
          resolve(rate);
        } else {
          // 如果所有API都失败，使用模拟数据
          rate = this.getMockRate(fromCurrency, toCurrency);
          resolve(rate);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 从API获取汇率
   */
  fetchFromApi(apiName, fromCurrency, toCurrency) {
    return new Promise((resolve, reject) => {
      let url = '';
      
      switch (apiName) {
        case 'exchangerate-host':
          url = `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`;
          break;
        case 'frankfurter':
          url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`;
          break;
        case 'exchangerate-api':
          url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
          break;
        default:
          reject(new Error('未知的API'));
          return;
      }
      
      wx.request({
        url: url,
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200) {
            const data = res.data;
            let rate = null;
            
            switch (apiName) {
              case 'exchangerate-host':
                if (data.success && data.rates && data.rates[toCurrency]) {
                  rate = data.rates[toCurrency];
                }
                break;
              case 'frankfurter':
                if (data.rates && data.rates[toCurrency]) {
                  rate = data.rates[toCurrency];
                }
                break;
              case 'exchangerate-api':
                if (data.rates && data.rates[toCurrency]) {
                  rate = data.rates[toCurrency];
                }
                break;
            }
            
            if (rate) {
              resolve(rate);
            } else {
              reject(new Error('未找到汇率数据'));
            }
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg}`));
        }
      });
    });
  }
  
  /**
   * 获取主要货币的汇率
   */
  getRatesForMainCurrencies(baseCurrency) {
    return new Promise((resolve, reject) => {
      const mainCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'HKD', 'KRW', 'AUD'];
      
      // 过滤掉基准货币
      const targetCurrencies = mainCurrencies.filter(c => c !== baseCurrency);
      
      this.getExchangeRatesBatch(baseCurrency, targetCurrencies)
        .then(rates => {
          const result = rates.map((rate, index) => ({
            code: targetCurrencies[index],
            symbol: this.getCurrencySymbol(targetCurrencies[index]),
            rate: rate,
            timestamp: this.formatTime(new Date())
          }));
          
          resolve(result);
        })
        .catch(error => {
          // 如果API失败，使用模拟数据
          const mockRates = this.getMockRates(baseCurrency, targetCurrencies);
          resolve(mockRates);
        });
    });
  }
  
  /**
   * 批量获取汇率
   */
  getExchangeRatesBatch(baseCurrency, targetCurrencies) {
    return new Promise((resolve, reject) => {
      if (targetCurrencies.length === 0) {
        resolve([]);
        return;
      }
      
      const symbols = targetCurrencies.join(',');
      const url = `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${symbols}`;
      
      wx.request({
        url: url,
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200 && res.data.success && res.data.rates) {
            const rates = targetCurrencies.map(currency => res.data.rates[currency] || 0);
            resolve(rates);
          } else {
            reject(new Error('获取汇率数据失败'));
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg}`));
        }
      });
    });
  }
  
  /**
   * 获取货币符号
   */
  getCurrencySymbol(currencyCode) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }
  
  /**
   * 从缓存获取
   */
  getFromCache(key) {
    const cached = this.ratesCache[key];
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTime) {
      return cached;
    }
    
    return null;
  }
  
  /**
   * 保存到缓存
   */
  saveToCache(key, rate) {
    this.ratesCache[key] = {
      rate: rate,
      timestamp: Date.now()
    };
  }
  
  /**
   * 获取模拟汇率（用于离线或API失败时）
   */
  getMockRate(fromCurrency, toCurrency) {
    // 模拟汇率数据
    const mockRates = {
      'CNY_USD': 0.138,
      'CNY_EUR': 0.127,
      'CNY_JPY': 20.5,
      'CNY_GBP': 0.112,
      'CNY_HKD': 1.08,
      'CNY_KRW': 184.5,
      'USD_CNY': 7.25,
      'USD_EUR': 0.92,
      'USD_JPY': 148.5,
      'USD_GBP': 0.81,
      'EUR_CNY': 7.87,
      'EUR_USD': 1.09,
      'EUR_JPY': 161.5,
      'EUR_GBP': 0.88,
      'JPY_CNY': 0.049,
      'JPY_USD': 0.0067,
      'JPY_EUR': 0.0062,
      'JPY_GBP': 0.0054,
      'GBP_CNY': 8.93,
      'GBP_USD': 1.23,
      'GBP_EUR': 1.14,
      'GBP_JPY': 185.5
    };
    
    const key = `${fromCurrency}_${toCurrency}`;
    
    if (mockRates[key]) {
      return mockRates[key];
    }
    
    // 如果没有直接汇率，尝试通过USD中转
    if (mockRates[`${fromCurrency}_USD`] && mockRates[`USD_${toCurrency}`]) {
      return mockRates[`${fromCurrency}_USD`] * mockRates[`USD_${toCurrency}`];
    }
    
    // 默认返回1
    return 1;
  }
  
  /**
   * 获取模拟汇率列表
   */
  getMockRates(baseCurrency, targetCurrencies) {
    const timestamp = this.formatTime(new Date());
    
    return targetCurrencies.map(currency => {
      const rate = this.getMockRate(baseCurrency, currency);
      
      return {
        code: currency,
        symbol: this.getCurrencySymbol(currency),
        rate: rate,
        timestamp: timestamp
      };
    });
  }
  
  /**
   * 格式化时间
   */
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  /**
   * 清空缓存
   */
  clearCache() {
    this.ratesCache = {};
  }
  
  /**
   * 根据金额和汇率计算
   */
  calculate(amount, rate) {
    return (parseFloat(amount) * rate).toFixed(2);
  }
  
  /**
   * 验证货币代码
   */
  isValidCurrency(currencyCode) {
    return this.currencies.some(c => c.code === currencyCode);
  }
  
  /**
   * 获取货币名称
   */
  getCurrencyName(currencyCode) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  }
  
  /**
   * 获取完整的货币信息
   */
  getCurrencyInfo(currencyCode) {
    return this.currencies.find(c => c.code === currencyCode) || {
      code: currencyCode,
      symbol: currencyCode,
      name: currencyCode
    };
  }
}

module.exports = new CurrencyService();