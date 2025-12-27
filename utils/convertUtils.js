class ConvertUtils {
  constructor() {
    this.conversionTables = {
      length: {
        m: 1,
        km: 0.001,
        cm: 100,
        mm: 1000,
        inch: 39.3701,
        foot: 3.28084,
        yard: 1.09361,
        mile: 0.000621371
      },
      weight: {
        kg: 1,
        g: 1000,
        mg: 1000000,
        t: 0.001,
        lb: 2.20462,
        oz: 35.274
      },
      temperature: {
        c: { name: '摄氏度', convert: (val, to) => to === 'f' ? (val * 9/5) + 32 : to === 'k' ? val + 273.15 : val },
        f: { name: '华氏度', convert: (val, to) => to === 'c' ? (val - 32) * 5/9 : to === 'k' ? (val - 32) * 5/9 + 273.15 : val },
        k: { name: '开尔文', convert: (val, to) => to === 'c' ? val - 273.15 : to === 'f' ? (val - 273.15) * 9/5 + 32 : val }
      },
      area: {
        m2: 1,
        km2: 0.000001,
        ha: 0.0001,
        acre: 0.000247105,
        mu: 0.0015,
        sqft: 10.7639
      },
      volume: {
        l: 1,
        ml: 1000,
        m3: 0.001,
        gal: 0.264172,
        oz: 33.814
      },
      speed: {
        mps: 1,
        kmh: 3.6,
        mph: 2.23694,
        knot: 1.94384
      },
      time: {
        s: 1,
        ms: 1000,
        min: 1/60,
        hour: 1/3600,
        day: 1/86400,
        week: 1/604800
      },
      digital: {
        b: 1,
        kb: 1/1024,
        mb: 1/(1024 * 1024),
        gb: 1/(1024 * 1024 * 1024),
        tb: 1/(1024 * 1024 * 1024 * 1024)
      }
    };
  }
  
  convert(value, fromUnit, toUnit, category) {
    if (category === 'temperature') {
      const fromConverter = this.conversionTables[category][fromUnit];
      const toConverter = this.conversionTables[category][toUnit];
      if (fromConverter && toConverter) {
        return fromConverter.convert(Number(value), toUnit);
      }
      return value;
    }
    
    if (this.conversionTables[category] && 
        this.conversionTables[category][fromUnit] && 
        this.conversionTables[category][toUnit]) {
      const baseValue = Number(value) / this.conversionTables[category][fromUnit];
      return baseValue * this.conversionTables[category][toUnit];
    }
    
    return value;
  }
  
  getCategories() {
    return Object.keys(this.conversionTables).map(key => ({
      id: key,
      name: this.getCategoryName(key)
    }));
  }
  
  getCategoryName(category) {
    const names = {
      length: '长度',
      weight: '重量',
      temperature: '温度',
      area: '面积',
      volume: '体积',
      speed: '速度',
      time: '时间',
      digital: '数据存储'
    };
    return names[category] || category;
  }
  
  getUnits(category) {
    if (category === 'temperature') {
      return Object.entries(this.conversionTables[category]).map(([key, value]) => ({
        id: key,
        name: value.name
      }));
    }
    
    if (this.conversionTables[category]) {
      return Object.keys(this.conversionTables[category]).map(key => ({
        id: key,
        name: this.getUnitName(key, category)
      }));
    }
    
    return [];
  }
  
  getUnitName(unit, category) {
    const unitNames = {
      m: '米',
      km: '千米',
      cm: '厘米',
      mm: '毫米',
      inch: '英寸',
      foot: '英尺',
      yard: '码',
      mile: '英里',
      kg: '千克',
      g: '克',
      mg: '毫克',
      t: '吨',
      lb: '磅',
      oz: '盎司',
      c: '摄氏度',
      f: '华氏度',
      k: '开尔文',
      m2: '平方米',
      km2: '平方千米',
      ha: '公顷',
      acre: '英亩',
      mu: '亩',
      sqft: '平方英尺',
      l: '升',
      ml: '毫升',
      m3: '立方米',
      gal: '加仑',
      oz: '盎司(液)',
      mps: '米/秒',
      kmh: '千米/时',
      mph: '英里/时',
      knot: '节',
      s: '秒',
      ms: '毫秒',
      min: '分钟',
      hour: '小时',
      day: '天',
      week: '周',
      b: '比特',
      kb: '千比特',
      mb: '兆比特',
      gb: '吉比特',
      tb: '太比特'
    };
    return unitNames[unit] || unit;
  }
  
  formatResult(value, unit) {
    if (isNaN(value) || !isFinite(value)) {
      return '计算错误';
    }
    
    if (Math.abs(value) < 0.000001 && value !== 0) {
      return value.toExponential(6) + ' ' + unit;
    }
    
    if (Math.abs(value) > 1000000) {
      return value.toExponential(6) + ' ' + unit;
    }
    
    const fixedValue = Number(value.toFixed(6));
    if (Number.isInteger(fixedValue)) {
      return fixedValue + ' ' + unit;
    }
    
    return parseFloat(fixedValue.toFixed(6)) + ' ' + unit;
  }
  
  getConversionFormula(value, fromUnit, toUnit, category) {
    if (category === 'temperature') {
      if (fromUnit === 'c' && toUnit === 'f') {
        return `${value}°C × 9/5 + 32 = ${(value * 9/5 + 32).toFixed(2)}°F`;
      } else if (fromUnit === 'f' && toUnit === 'c') {
        return `(${value}°F - 32) × 5/9 = ${((value - 32) * 5/9).toFixed(2)}°C`;
      } else if (fromUnit === 'c' && toUnit === 'k') {
        return `${value}°C + 273.15 = ${(value + 273.15).toFixed(2)}K`;
      } else if (fromUnit === 'k' && toUnit === 'c') {
        return `${value}K - 273.15 = ${(value - 273.15).toFixed(2)}°C`;
      }
    }
    
    const fromFactor = this.conversionTables[category][fromUnit];
    const toFactor = this.conversionTables[category][toUnit];
    
    if (fromFactor && toFactor) {
      const result = (value / fromFactor) * toFactor;
      return `${value} ${fromUnit} × (${toFactor}/${fromFactor}) = ${result.toFixed(6)} ${toUnit}`;
    }
    
    return '';
  }
}

module.exports = new ConvertUtils();