class FormulaParser {
  static parse(expression, angleMode = 'deg') {
    try {
      expression = expression.replace(/\s+/g, '');
      expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
      expression = expression.replace(/\^/g, '**');
      expression = expression.replace(/π/g, Math.PI.toString());
      expression = expression.replace(/e/g, Math.E.toString());
      
      expression = this.replaceFunctions(expression, angleMode);
      
      const result = this.evaluateExpression(expression);
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('计算结果无效');
      }
      
      return result;
    } catch (error) {
      throw new Error('表达式错误: ' + error.message);
    }
  }
  
  static replaceFunctions(expression, angleMode) {
    const functionMap = {
      'sin': 'Math.sin',
      'cos': 'Math.cos',
      'tan': 'Math.tan',
      'asin': 'Math.asin',
      'acos': 'Math.acos',
      'atan': 'Math.atan',
      'sqrt': 'Math.sqrt',
      'log': 'Math.log10',
      'ln': 'Math.log',
      'abs': 'Math.abs',
      'ceil': 'Math.ceil',
      'floor': 'Math.floor',
      'round': 'Math.round'
    };
    
    for (const [func, mathFunc] of Object.entries(functionMap)) {
      const regex = new RegExp(`${func}\\(([^)]+)\\)`, 'g');
      expression = expression.replace(regex, (match, args) => {
        if (func === 'sin' || func === 'cos' || func === 'tan' || 
            func === 'asin' || func === 'acos' || func === 'atan') {
          if (angleMode === 'deg') {
            return `${mathFunc}((${args}) * Math.PI / 180)`;
          }
        }
        return `${mathFunc}(${args})`;
      });
    }
    
    expression = expression.replace(/\!/g, (match) => {
      const factorialMatch = expression.match(/(\d+(\.\d+)?)\s*\!/);
      if (factorialMatch) {
        const num = parseFloat(factorialMatch[1]);
        if (num < 0) throw new Error('阶乘不能为负数');
        if (!Number.isInteger(num)) throw new Error('阶乘必须为整数');
        return this.factorial(num);
      }
      return match;
    });
    
    return expression;
  }
  
  static evaluateExpression(expression) {
    const operators = [];
    const values = [];
    
    let i = 0;
    const n = expression.length;
    
    while (i < n) {
      if (expression[i] === ' ') {
        i++;
        continue;
      }
      
      if ((expression[i] >= '0' && expression[i] <= '9') || expression[i] === '.') {
        let numStr = '';
        while (i < n && ((expression[i] >= '0' && expression[i] <= '9') || expression[i] === '.')) {
          numStr += expression[i];
          i++;
        }
        values.push(parseFloat(numStr));
        i--;
      } else if (expression[i] === '(') {
        operators.push(expression[i]);
      } else if (expression[i] === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          values.push(this.applyOperator(operators.pop(), values.pop(), values.pop()));
        }
        operators.pop();
      } else if (this.isOperator(expression[i])) {
        while (operators.length > 0 && this.hasPrecedence(expression[i], operators[operators.length - 1])) {
          values.push(this.applyOperator(operators.pop(), values.pop(), values.pop()));
        }
        operators.push(expression[i]);
      }
      i++;
    }
    
    while (operators.length > 0) {
      values.push(this.applyOperator(operators.pop(), values.pop(), values.pop()));
    }
    
    return values.pop();
  }
  
  static isOperator(c) {
    return ['+', '-', '*', '/', '^'].includes(c);
  }
  
  static hasPrecedence(op1, op2) {
    if (op2 === '(' || op2 === ')') return false;
    if ((op1 === '^') && (op2 === '*' || op2 === '/' || op2 === '+' || op2 === '-')) return false;
    if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) return false;
    return true;
  }
  
  static applyOperator(operator, b, a) {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) throw new Error('除数不能为零');
        return a / b;
      case '^':
        return Math.pow(a, b);
      default:
        throw new Error('无效的运算符');
    }
  }
  
  static factorial(n) {
    if (n < 0) throw new Error('阶乘不能为负数');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  static combination(n, k) {
    if (k < 0 || k > n) return 0;
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  }
  
  static permutation(n, k) {
    if (k < 0 || k > n) return 0;
    return this.factorial(n) / this.factorial(n - k);
  }
  
  static calculateProbability(favorable, total) {
    if (total <= 0) return 0;
    return favorable / total;
  }
  
  static calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }
}

module.exports = FormulaParser;