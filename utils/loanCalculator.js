/**
 * 房贷计算器
 * 支持等额本息和等额本金两种还款方式
 */
class LoanCalculator {
  /**
   * 计算等额本息
   * @param {number} loanAmount - 贷款总额（元）
   * @param {number} years - 贷款年限
   * @param {number} annualRate - 年利率（小数，如0.043）
   * @returns {Object} 计算结果
   */
  calculateEqualInstallment(loanAmount, years, annualRate) {
    console.log('等额本息计算参数:', { loanAmount, years, annualRate });
    
    // 参数验证
    if (!loanAmount || loanAmount <= 0) {
      console.error('贷款金额必须大于0');
      throw new Error('贷款金额必须大于0');
    }
    
    if (!years || years <= 0) {
      console.error('贷款年限必须大于0');
      throw new Error('贷款年限必须大于0');
    }
    
    if (!annualRate || annualRate <= 0) {
      console.error('贷款利率必须大于0');
      throw new Error('贷款利率必须大于0');
    }
    
    // 月利率
    const monthlyRate = annualRate / 12;
    // 总月数
    const totalMonths = years * 12;
    
    console.log('计算参数:', { monthlyRate, totalMonths });
    
    // 处理边界情况
    if (monthlyRate <= 0) {
      // 如果利率为0，每月还款额 = 贷款总额 / 总月数
      const monthlyPayment = loanAmount / totalMonths;
      const totalPayment = loanAmount;
      const totalInterest = 0;
      
      return {
        totalLoan: loanAmount,
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        totalInterest: totalInterest
      };
    }
    
    // 等额本息月供公式：每月还款额 = [贷款本金 × 月利率 × (1+月利率)^还款月数] ÷ [(1+月利率)^还款月数－1]
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
    const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
    
    console.log('计算公式参数:', { numerator, denominator });
    
    if (denominator === 0) {
      console.error('分母为0，计算失败');
      throw new Error('计算失败，请检查输入参数');
    }
    
    const monthlyPayment = numerator / denominator;
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    const result = {
      totalLoan: loanAmount,
      monthlyPayment: monthlyPayment,
      totalPayment: totalPayment,
      totalInterest: totalInterest
    };
    
    console.log('等额本息计算结果:', result);
    return result;
  }
  
  /**
   * 计算等额本金
   * @param {number} loanAmount - 贷款总额（元）
   * @param {number} years - 贷款年限
   * @param {number} annualRate - 年利率（小数）
   * @returns {Object} 计算结果
   */
  calculateEqualPrincipal(loanAmount, years, annualRate) {
    console.log('等额本金计算参数:', { loanAmount, years, annualRate });
    
    // 参数验证
    if (!loanAmount || loanAmount <= 0) {
      console.error('贷款金额必须大于0');
      throw new Error('贷款金额必须大于0');
    }
    
    if (!years || years <= 0) {
      console.error('贷款年限必须大于0');
      throw new Error('贷款年限必须大于0');
    }
    
    if (!annualRate || annualRate <= 0) {
      console.error('贷款利率必须大于0');
      throw new Error('贷款利率必须大于0');
    }
    
    // 月利率
    const monthlyRate = annualRate / 12;
    // 总月数
    const totalMonths = years * 12;
    // 每月应还本金
    const monthlyPrincipal = loanAmount / totalMonths;
    
    console.log('计算参数:', { monthlyRate, totalMonths, monthlyPrincipal });
    
    // 首月月供
    const firstMonthPayment = monthlyPrincipal + (loanAmount * monthlyRate);
    // 每月递减金额
    const monthlyDecrease = monthlyPrincipal * monthlyRate;
    
    // 计算总利息
    let totalInterest = 0;
    for (let i = 0; i < totalMonths; i++) {
      const interest = (loanAmount - i * monthlyPrincipal) * monthlyRate;
      totalInterest += interest;
    }
    
    // 总还款额
    const totalPayment = loanAmount + totalInterest;
    
    const result = {
      totalLoan: loanAmount,
      firstMonthPayment: firstMonthPayment,
      monthlyChange: monthlyDecrease,
      totalPayment: totalPayment,
      totalInterest: totalInterest
    };
    
    console.log('等额本金计算结果:', result);
    return result;
  }
  
  /**
   * 生成等额本息还款计划
   * @param {number} loanAmount - 贷款总额
   * @param {number} years - 贷款年限
   * @param {number} annualRate - 年利率
   * @returns {Array} 还款计划
   */
  generateEqualPlan(loanAmount, years, annualRate) {
    try {
      const result = this.calculateEqualInstallment(loanAmount, years, annualRate);
      const monthlyPayment = result.monthlyPayment;
      const monthlyRate = annualRate / 12;
      const totalMonths = years * 12;
      
      const plan = [];
      let remainingLoan = loanAmount;
      
      for (let i = 1; i <= totalMonths; i++) {
        // 每月利息
        const monthlyInterest = remainingLoan * monthlyRate;
        // 每月本金
        const monthlyPrincipal = monthlyPayment - monthlyInterest;
        
        // 更新剩余贷款
        remainingLoan -= monthlyPrincipal;
        
        // 防止剩余贷款变为负数
        if (remainingLoan < 0) {
          remainingLoan = 0;
        }
        
        plan.push({
          period: i,
          payment: monthlyPayment,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          balance: remainingLoan
        });
      }
      
      console.log('等额本息还款计划生成完成，共', plan.length, '期');
      return plan;
    } catch (error) {
      console.error('生成等额本息还款计划错误:', error);
      return [];
    }
  }
  
  /**
   * 生成等额本金还款计划
   * @param {number} loanAmount - 贷款总额
   * @param {number} years - 贷款年限
   * @param {number} annualRate - 年利率
   * @returns {Array} 还款计划
   */
  generatePrincipalPlan(loanAmount, years, annualRate) {
    try {
      const monthlyRate = annualRate / 12;
      const totalMonths = years * 12;
      const monthlyPrincipal = loanAmount / totalMonths;
      
      const plan = [];
      let remainingLoan = loanAmount;
      
      for (let i = 1; i <= totalMonths; i++) {
        // 每月利息
        const monthlyInterest = remainingLoan * monthlyRate;
        // 每月还款总额
        const monthlyPayment = monthlyPrincipal + monthlyInterest;
        
        // 更新剩余贷款
        remainingLoan -= monthlyPrincipal;
        
        // 防止剩余贷款变为负数
        if (remainingLoan < 0) {
          remainingLoan = 0;
        }
        
        plan.push({
          period: i,
          payment: monthlyPayment,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          balance: remainingLoan
        });
      }
      
      console.log('等额本金还款计划生成完成，共', plan.length, '期');
      return plan;
    } catch (error) {
      console.error('生成等额本金还款计划错误:', error);
      return [];
    }
  }
  
  /**
   * 组合贷款计算
   * @param {number} commercialAmount - 商业贷款金额
   * @param {number} commercialRate - 商业贷款利率
   * @param {number} fundAmount - 公积金贷款金额
   * @param {number} fundRate - 公积金贷款利率
   * @param {number} years - 贷款年限
   * @param {string} type - 还款方式：equal/principal
   * @returns {Object} 计算结果
   */
  calculateCombined(commercialAmount, commercialRate, fundAmount, fundRate, years, type) {
    let commercialResult, fundResult;
    
    if (type === 'equal') {
      commercialResult = this.calculateEqualInstallment(commercialAmount, years, commercialRate);
      fundResult = this.calculateEqualInstallment(fundAmount, years, fundRate);
    } else {
      commercialResult = this.calculateEqualPrincipal(commercialAmount, years, commercialRate);
      fundResult = this.calculateEqualPrincipal(fundAmount, years, fundRate);
    }
    
    const totalLoan = commercialAmount + fundAmount;
    const totalPayment = commercialResult.totalPayment + fundResult.totalPayment;
    const totalInterest = commercialResult.totalInterest + fundResult.totalInterest;
    
    let monthlyPayment = 0;
    if (type === 'equal') {
      monthlyPayment = commercialResult.monthlyPayment + fundResult.monthlyPayment;
    } else {
      monthlyPayment = commercialResult.firstMonthPayment + fundResult.firstMonthPayment;
    }
    
    return {
      totalLoan: totalLoan,
      commercialPart: commercialResult,
      fundPart: fundResult,
      monthlyPayment: monthlyPayment,
      totalPayment: totalPayment,
      totalInterest: totalInterest
    };
  }
  
  /**
   * 计算提前还款
   * @param {number} originalAmount - 原贷款金额
   * @param {number} remainingMonths - 剩余月数
   * @param {number} annualRate - 年利率
   * @param {number} prepayAmount - 提前还款金额
   * @param {string} prepayType - 提前还款类型：reducePayment/reduceTerm
   * @returns {Object} 提前还款结果
   */
  calculatePrepayment(originalAmount, remainingMonths, annualRate, prepayAmount, prepayType) {
    const monthlyRate = annualRate / 12;
    
    if (prepayType === 'reducePayment') {
      // 减少月供
      const remainingLoan = originalAmount - prepayAmount;
      const monthlyPayment = remainingLoan * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / 
                             (Math.pow(1 + monthlyRate, remainingMonths) - 1);
      
      return {
        newMonthlyPayment: monthlyPayment,
        reducedAmount: originalAmount - prepayAmount,
        remainingMonths: remainingMonths
      };
    } else {
      // 缩短期限
      const remainingLoan = originalAmount - prepayAmount;
      const originalMonthlyPayment = originalAmount * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / 
                                   (Math.pow(1 + monthlyRate, remainingMonths) - 1);
      
      // 计算新的还款期限
      let newMonths = Math.ceil(Math.log(originalMonthlyPayment / (originalMonthlyPayment - remainingLoan * monthlyRate)) / 
                               Math.log(1 + monthlyRate));
      
      if (newMonths <= 0) newMonths = 1;
      
      return {
        newMonthlyPayment: originalMonthlyPayment,
        reducedAmount: remainingLoan,
        remainingMonths: newMonths
      };
    }
  }
  
  /**
   * 计算贷款承受能力
   * @param {number} monthlyIncome - 月收入
   * @param {number} monthlyExpense - 月支出
   * @param {number} years - 贷款年限
   * @param {number} annualRate - 年利率
   * @param {number} downPaymentRate - 首付比例
   * @returns {Object} 可承受的贷款金额
   */
  calculateAffordability(monthlyIncome, monthlyExpense, years, annualRate, downPaymentRate) {
    // 可支配收入（建议月供不超过可支配收入的50%）
    const disposableIncome = monthlyIncome - monthlyExpense;
    const maxMonthlyPayment = disposableIncome * 0.5;
    
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;
    
    // 计算可贷款总额
    const loanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, totalMonths) - 1) / 
                      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
    
    // 房屋总价
    const totalPrice = loanAmount / (1 - downPaymentRate);
    
    return {
      maxMonthlyPayment: maxMonthlyPayment,
      loanAmount: loanAmount,
      totalPrice: totalPrice,
      downPayment: totalPrice - loanAmount
    };
  }
  
  /**
   * 格式化金额
   * @param {number} amount - 金额
   * @returns {string} 格式化后的金额
   */
  formatAmount(amount) {
    if (amount >= 10000) {
      return (amount / 10000).toFixed(2) + '万元';
    } else {
      return amount.toFixed(2) + '元';
    }
  }
  
  /**
   * 验证输入参数
   * @param {Object} params - 输入参数
   * @returns {Object} 验证结果
   */
  validateParams(params) {
    const { loanAmount, years, annualRate } = params;
    const errors = [];
    
    if (!loanAmount || loanAmount <= 0) {
      errors.push('贷款金额必须大于0');
    }
    
    if (!years || years < 1 || years > 30) {
      errors.push('贷款年限必须在1-30年之间');
    }
    
    if (!annualRate || annualRate <= 0) {
      errors.push('贷款利率必须大于0');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * 获取默认利率
   * @param {string} loanType - 贷款类型：commercial, fund, combined
   * @returns {number} 默认利率
   */
  getDefaultRate(loanType) {
    const defaultRates = {
      'commercial': 0.043,  // 商业贷款基准利率4.3%
      'fund': 0.031,        // 公积金贷款利率3.1%
      'combined_commercial': 0.043,
      'combined_fund': 0.031
    };
    
    return defaultRates[loanType] || 0.043;
  }
  
  /**
   * 计算实际年化利率（考虑利率上浮）
   * @param {number} baseRate - 基准利率
   * @param {number} floatRate - 上浮比例
   * @returns {number} 实际利率
   */
  calculateActualRate(baseRate, floatRate) {
    return baseRate * (1 + floatRate);
  }
}

module.exports = new LoanCalculator();