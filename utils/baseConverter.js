/**
 * 进制转换工具类
 * 支持二进制、八进制、十进制、十六进制之间的相互转换
 */
class BaseConverter {
  /**
   * 验证输入数值
   * @param {string} value - 输入数值
   * @param {number} base - 进制
   * @returns {string} 错误信息，空字符串表示验证通过
   */
  validateInput(value, base) {
    if (!value || value.trim() === '') {
      return '请输入数值';
    }
    
    const str = value.trim().toUpperCase();
    
    // 进制验证规则
    const basePatterns = {
      2: /^[01]+$/,           // 二进制：0-1
      8: /^[0-7]+$/,          // 八进制：0-7
      10: /^-?[0-9]+$/,       // 十进制：0-9，可包含负号
      16: /^[0-9A-F]+$/       // 十六进制：0-9, A-F
    };
    
    const pattern = basePatterns[base];
    if (!pattern) {
      return '不支持的进制';
    }
    
    if (!pattern.test(str)) {
      const baseNames = {
        2: '0 和 1',
        8: '0-7',
        10: '0-9',
        16: '0-9 和 A-F'
      };
      return `${this.getBaseName(base)}只能包含 ${baseNames[base]}`;
    }
    
    return '';
  }
  
  /**
   * 获取进制名称
   */
  getBaseName(base) {
    const baseNames = {
      2: '二进制',
      8: '八进制',
      10: '十进制',
      16: '十六进制'
    };
    return baseNames[base] || '未知进制';
  }
  
  /**
   * 进制转换
   * @param {string} value - 输入数值
   * @param {number} fromBase - 输入进制
   * @param {number} toBase - 目标进制
   * @returns {Object} 转换结果
   */
  convert(value, fromBase, toBase) {
    console.log('进制转换参数:', { value, fromBase, toBase });
    
    // 验证输入
    const error = this.validateInput(value, fromBase);
    if (error) {
      throw new Error(error);
    }
    
    const str = value.trim().toUpperCase();
    
    // 如果输入和目标进制相同，直接返回
    if (fromBase === toBase) {
      return {
        value: str,
        formula: `${str} (${this.getBaseName(fromBase)}) 直接输出`,
        process: '输入进制与目标进制相同，无需转换'
      };
    }
    
    let decimalValue = 0;
    let process = [];
    
    // 从输入进制转换到十进制
    if (fromBase !== 10) {
      decimalValue = this.otherToDecimal(str, fromBase);
      process.push(`${str} (${this.getBaseName(fromBase)}) → ${decimalValue} (十进制)`);
    } else {
      decimalValue = parseInt(str, 10);
    }
    
    // 从十进制转换到目标进制
    let result = '';
    if (toBase !== 10) {
      result = this.decimalToOther(decimalValue, toBase);
      process.push(`${decimalValue} (十进制) → ${result} (${this.getBaseName(toBase)})`);
    } else {
      result = decimalValue.toString();
    }
    
    // 生成公式
    const formula = this.generateFormula(str, fromBase, toBase, decimalValue, result);
    
    return {
      value: result,
      formula: formula,
      process: process.join('\n')
    };
  }
  
  /**
   * 其他进制转十进制
   */
  otherToDecimal(value, base) {
    let decimal = 0;
    const digits = value.toUpperCase().split('').reverse();
    
    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];
      const digitValue = this.getDigitValue(digit);
      decimal += digitValue * Math.pow(base, i);
    }
    
    return decimal;
  }
  
  /**
   * 十进制转其他进制
   */
  decimalToOther(decimal, base) {
    if (decimal === 0) return '0';
    
    let result = '';
    let num = Math.abs(decimal);
    const digits = '0123456789ABCDEF';
    
    while (num > 0) {
      const remainder = num % base;
      result = digits[remainder] + result;
      num = Math.floor(num / base);
    }
    
    // 如果是负数，添加负号
    if (decimal < 0) {
      result = '-' + result;
    }
    
    return result;
  }
  
  /**
   * 获取数字的值
   */
  getDigitValue(digit) {
    if (digit >= '0' && digit <= '9') {
      return parseInt(digit, 10);
    } else if (digit >= 'A' && digit <= 'F') {
      return digit.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    }
    return 0;
  }
  
  /**
   * 生成转换公式
   */
  generateFormula(input, fromBase, toBase, decimal, result) {
    const fromName = this.getBaseName(fromBase);
    const toName = this.getBaseName(toBase);
    
    if (fromBase === 10) {
      return `${input} (${fromName}) → ${result} (${toName})`;
    } else if (toBase === 10) {
      return `${input} (${fromName}) → ${result} (${toName})`;
    } else {
      return `${input} (${fromName}) → ${decimal} (十进制) → ${result} (${toName})`;
    }
  }
  
  /**
   * 格式化二进制显示
   */
  formatBinary(binary, groupSize = 4) {
    if (!binary || binary === '0') return '0';
    
    let str = binary;
    if (str[0] === '-') {
      str = str.substring(1);
    }
    
    // 补全到4的倍数
    const remainder = str.length % groupSize;
    if (remainder !== 0) {
      str = '0'.repeat(groupSize - remainder) + str;
    }
    
    // 分组
    const groups = [];
    for (let i = 0; i < str.length; i += groupSize) {
      groups.push(str.substring(i, i + groupSize));
    }
    
    const result = groups.join(' ');
    return binary[0] === '-' ? '-' + result : result;
  }
  
  /**
   * 格式化十六进制显示
   */
  formatHex(hex, prefix = '0x') {
    if (!hex || hex === '0') return '0x0';
    
    if (hex[0] === '-') {
      return '-' + prefix + hex.substring(1);
    }
    
    return prefix + hex;
  }
  
  /**
   * 二进制转十进制
   */
  binaryToDecimal(binary) {
    return this.convert(binary, 2, 10);
  }
  
  /**
   * 二进制转八进制
   */
  binaryToOctal(binary) {
    return this.convert(binary, 2, 8);
  }
  
  /**
   * 二进制转十六进制
   */
  binaryToHex(binary) {
    return this.convert(binary, 2, 16);
  }
  
  /**
   * 八进制转二进制
   */
  octalToBinary(octal) {
    return this.convert(octal, 8, 2);
  }
  
  /**
   * 八进制转十进制
   */
  octalToDecimal(octal) {
    return this.convert(octal, 8, 10);
  }
  
  /**
   * 八进制转十六进制
   */
  octalToHex(octal) {
    return this.convert(octal, 8, 16);
  }
  
  /**
   * 十进制转二进制
   */
  decimalToBinary(decimal) {
    return this.convert(decimal, 10, 2);
  }
  
  /**
   * 十进制转八进制
   */
  decimalToOctal(decimal) {
    return this.convert(decimal, 10, 8);
  }
  
  /**
   * 十进制转十六进制
   */
  decimalToHex(decimal) {
    return this.convert(decimal, 10, 16);
  }
  
  /**
   * 十六进制转二进制
   */
  hexToBinary(hex) {
    return this.convert(hex, 16, 2);
  }
  
  /**
   * 十六进制转八进制
   */
  hexToOctal(hex) {
    return this.convert(hex, 16, 8);
  }
  
  /**
   * 十六进制转十进制
   */
  hexToDecimal(hex) {
    return this.convert(hex, 16, 10);
  }
  
  /**
   * 生成进制对应表
   */
  generateBaseTable(start = 0, end = 15) {
    const table = [];
    
    for (let i = start; i <= end; i++) {
      table.push({
        decimal: i.toString(),
        binary: i.toString(2).padStart(4, '0'),
        octal: i.toString(8),
        hex: i.toString(16).toUpperCase()
      });
    }
    
    return table;
  }
  
  /**
   * 检查是否有效的十六进制字符串
   */
  isValidHex(hex) {
    return /^[0-9A-Fa-f]+$/.test(hex);
  }
  
  /**
   * 检查是否有效的二进制字符串
   */
  isValidBinary(binary) {
    return /^[01]+$/.test(binary);
  }
  
  /**
   * 检查是否有效的八进制字符串
   */
  isValidOctal(octal) {
    return /^[0-7]+$/.test(octal);
  }
  
  /**
   * 检查是否有效的十进制字符串
   */
  isValidDecimal(decimal) {
    return /^-?[0-9]+$/.test(decimal);
  }
  
  /**
   * 获取进制的有效字符集
   */
  getValidChars(base) {
    const charSets = {
      2: '0, 1',
      8: '0-7',
      10: '0-9',
      16: '0-9, A-F'
    };
    
    return charSets[base] || '';
  }
}

module.exports = new BaseConverter();