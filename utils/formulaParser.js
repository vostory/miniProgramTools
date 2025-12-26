class FormulaParser {
  // 使用静态getter方法定义常量
  static get constants() {
    return {
      'π': Math.PI,
      'e': Math.E
    };
  }

  // 使用静态getter方法定义函数映射
  static get functions() {
    return {
      'sin': Math.sin,
      'cos': Math.cos,
      'tan': Math.tan,
      'asin': Math.asin,
      'acos': Math.acos,
      'atan': Math.atan,
      'sqrt': Math.sqrt,
      'log': Math.log10,
      'ln': Math.log,
      'abs': Math.abs,
      'ceil': Math.ceil,
      'floor': Math.floor,
      'round': Math.round,
      'exp': Math.exp
    };
  }

  /**
   * 解析表达式并计算结果
   */
  static parse(expression, angleMode = 'deg') {
    try {
      if (!expression || typeof expression !== 'string') {
        throw new Error('表达式不能为空');
      }

      // 预处理表达式
      let processed = this.preprocessExpression(expression, angleMode);
      
      // 计算表达式
      const result = this.evaluate(processed);
      
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * 预处理表达式
   */
  static preprocessExpression(expression, angleMode) {
    // 移除空格
    let processed = expression.replace(/\s+/g, '');
    
    // 替换运算符
    processed = processed.replace(/×/g, '*').replace(/÷/g, '/');
    processed = processed.replace(/\^/g, '**');
    
    // 替换常量
    for (const [constName, constValue] of Object.entries(this.constants)) {
      const regex = new RegExp(constName, 'g');
      processed = processed.replace(regex, constValue.toString());
    }
    
    // 处理函数调用
    processed = this.processFunctions(processed, angleMode);
    
    // 处理阶乘
    processed = this.processFactorial(processed);
    
    // 处理隐式乘法，如 2π, 3sin, (2)(3) 等
    processed = this.processImplicitMultiplication(processed);
    
    return processed;
  }

  /**
   * 处理函数调用
   */
  static processFunctions(expression, angleMode) {
    let processed = expression;
    
    // 处理函数调用
    for (const [funcName, func] of Object.entries(this.functions)) {
      const regex = new RegExp(`${funcName}\\(([^)]*)\\)`, 'g');
      
      processed = processed.replace(regex, (match, args) => {
        try {
          // 计算参数
          const argValue = this.evaluate(args);
          
          // 如果是三角函数且角度模式为度，转换为弧度
          let result;
          if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(funcName)) {
            if (angleMode === 'deg') {
              if (['asin', 'acos', 'atan'].includes(funcName)) {
                // 反三角函数结果转换为度
                result = func(argValue) * 180 / Math.PI;
              } else {
                // 三角函数参数转换为弧度
                result = func(argValue * Math.PI / 180);
              }
            } else {
              result = func(argValue);
            }
          } else {
            result = func(argValue);
          }
          
          return result.toString();
        } catch (error) {
          throw new Error(`函数 ${funcName} 计算错误: ${error.message}`);
        }
      });
    }
    
    return processed;
  }

  /**
   * 处理阶乘
   */
  static processFactorial(expression) {
    let processed = expression;
    const factorialRegex = /(\d+(?:\.\d+)?)!/g;
    
    processed = processed.replace(factorialRegex, (match, numStr) => {
      const num = parseFloat(numStr);
      
      if (!Number.isInteger(num)) {
        throw new Error('阶乘必须为整数');
      }
      
      if (num < 0) {
        throw new Error('阶乘不能为负数');
      }
      
      if (num > 170) {
        throw new Error('阶乘数值过大');
      }
      
      return this.factorial(num).toString();
    });
    
    return processed;
  }

  /**
   * 处理隐式乘法
   */
  static processImplicitMultiplication(expression) {
    let processed = expression;
    
    // 处理数字后面跟括号的情况，如 2(3+4) -> 2*(3+4)
    processed = processed.replace(/(\d)(\()/g, '$1*$2');
    
    // 处理括号后面跟括号的情况，如 (2+3)(4+5) -> (2+3)*(4+5)
    processed = processed.replace(/(\))(\()/g, '$1*$2');
    
    // 处理括号后面跟数字的情况，如 (2+3)4 -> (2+3)*4
    processed = processed.replace(/(\))(\d)/g, '$1*$2');
    
    // 处理数字后面跟函数的情况，如 2sin(30) -> 2*sin(30)
    const funcNames = Object.keys(this.functions).join('|');
    processed = processed.replace(new RegExp(`(\\d)(${funcNames})`, 'g'), '$1*$2');
    
    return processed;
  }

  /**
   * 计算表达式
   */
  static evaluate(expression) {
    try {
      // 使用安全的计算方式
      const tokens = this.tokenize(expression);
      const rpn = this.shuntingYard(tokens);
      const result = this.evaluateRPN(rpn);
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('计算结果无效');
      }
      
      return result;
    } catch (error) {
      throw new Error(`计算错误: ${error.message}`);
    }
  }

  /**
   * 将表达式分词
   */
  static tokenize(expression) {
    const tokens = [];
    let currentNumber = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      if (this.isDigit(char) || char === '.') {
        currentNumber += char;
      } else {
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber));
          currentNumber = '';
        }
        
        if (char !== ' ') {
          tokens.push(char);
        }
      }
    }
    
    if (currentNumber) {
      tokens.push(parseFloat(currentNumber));
    }
    
    return tokens;
  }

  /**
   * 调度场算法将中缀表达式转换为后缀表达式
   */
  static shuntingYard(tokens) {
    const output = [];
    const operators = [];
    
    for (const token of tokens) {
      if (typeof token === 'number') {
        output.push(token);
      } else if (this.isOperator(token)) {
        while (operators.length > 0) {
          const top = operators[operators.length - 1];
          if (top !== '(' && this.getPrecedence(token) <= this.getPrecedence(top)) {
            output.push(operators.pop());
          } else {
            break;
          }
        }
        operators.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          output.push(operators.pop());
        }
        if (operators.length === 0) {
          throw new Error('括号不匹配');
        }
        operators.pop(); // 弹出左括号
      }
    }
    
    while (operators.length > 0) {
      const op = operators.pop();
      if (op === '(') {
        throw new Error('括号不匹配');
      }
      output.push(op);
    }
    
    return output;
  }

  /**
   * 计算后缀表达式
   */
  static evaluateRPN(rpn) {
    const stack = [];
    
    for (const token of rpn) {
      if (typeof token === 'number') {
        stack.push(token);
      } else if (this.isOperator(token)) {
        if (stack.length < 2) {
          throw new Error('表达式格式错误');
        }
        
        const b = stack.pop();
        const a = stack.pop();
        let result;
        
        switch (token) {
          case '+':
            result = a + b;
            break;
          case '-':
            result = a - b;
            break;
          case '*':
            result = a * b;
            break;
          case '/':
            if (b === 0) {
              throw new Error('除数不能为零');
            }
            result = a / b;
            break;
          case '**':
            result = Math.pow(a, b);
            break;
          default:
            throw new Error(`未知运算符: ${token}`);
        }
        
        stack.push(result);
      }
    }
    
    if (stack.length !== 1) {
      throw new Error('表达式格式错误');
    }
    
    return stack[0];
  }

  /**
   * 检查是否为数字
   */
  static isDigit(char) {
    return /[0-9]/.test(char);
  }

  /**
   * 检查是否为运算符
   */
  static isOperator(char) {
    return ['+', '-', '*', '/', '**'].includes(char);
  }

  /**
   * 获取运算符优先级
   */
  static getPrecedence(operator) {
    switch (operator) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      case '**':
        return 3;
      default:
        return 0;
    }
  }

  /**
   * 计算阶乘
   */
  static factorial(n) {
    if (n < 0) throw new Error('阶乘不能为负数');
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    
    return result;
  }

  /**
   * 角度转弧度
   */
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 弧度转角度
   */
  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * 组合数
   */
  static combination(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    k = Math.min(k, n - k);
    let result = 1;
    
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return result;
  }

  /**
   * 排列数
   */
  static permutation(n, k) {
    if (k < 0 || k > n) return 0;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i);
    }
    
    return result;
  }

  /**
   * 计算百分比
   */
  static calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * 计算概率
   */
  static calculateProbability(favorable, total) {
    if (total <= 0) return 0;
    if (favorable < 0) return 0;
    if (favorable > total) return 1;
    
    return favorable / total;
  }

  /**
   * 计算平均值
   */
  static mean(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * 计算中位数
   */
  static median(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * 计算众数
   */
  static mode(numbers) {
    if (!numbers || numbers.length === 0) return [];
    
    const frequency = {};
    let maxFreq = 0;
    
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });
    
    return Object.keys(frequency)
      .filter(num => frequency[num] === maxFreq)
      .map(Number);
  }

  /**
   * 计算标准差
   */
  static standardDeviation(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    
    const mean = this.mean(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
    
    return Math.sqrt(variance);
  }
}

module.exports = FormulaParser;