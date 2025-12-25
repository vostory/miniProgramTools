class BasicCalculator {
  add(a, b) { 
    return Number(a) + Number(b); 
  }
  
  subtract(a, b) { 
    return Number(a) - Number(b); 
  }
  
  multiply(a, b) { 
    return Number(a) * Number(b); 
  }
  
  divide(a, b) { 
    if (Number(b) === 0) {
      throw new Error('除数不能为零');
    }
    return Number(a) / Number(b); 
  }
  
  percent(value) { 
    return Number(value) / 100; 
  }
  
  calculateExpression(expression) {
    const tokens = this.parseExpression(expression);
    return this.evaluateTokens(tokens);
  }
  
  parseExpression(expression) {
    const tokens = [];
    let currentNumber = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      if (this.isDigit(char) || char === '.') {
        currentNumber += char;
      } else if (this.isOperator(char)) {
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber));
          currentNumber = '';
        }
        tokens.push(char);
      }
    }
    
    if (currentNumber) {
      tokens.push(parseFloat(currentNumber));
    }
    
    return tokens;
  }
  
  evaluateTokens(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '*' || tokens[i] === '/' || tokens[i] === '×' || tokens[i] === '÷') {
        const left = tokens[i - 1];
        const right = tokens[i + 1];
        let result;
        
        if (tokens[i] === '*' || tokens[i] === '×') {
          result = this.multiply(left, right);
        } else {
          result = this.divide(left, right);
        }
        
        tokens.splice(i - 1, 3, result);
        i = i - 2;
      }
    }
    
    let result = tokens[0];
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const right = tokens[i + 1];
      
      if (operator === '+') {
        result = this.add(result, right);
      } else if (operator === '-') {
        result = this.subtract(result, right);
      }
    }
    
    return result;
  }
  
  isDigit(char) { 
    return /[0-9]/.test(char); 
  }
  
  isOperator(char) { 
    return /[+\-*/×÷]/.test(char); 
  }
}

module.exports = new BasicCalculator();