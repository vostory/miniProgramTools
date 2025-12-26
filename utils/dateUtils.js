class DateUtils {
  /**
   * 计算两个日期之间的天数差
   * @param {string|Date} date1 - 第一个日期
   * @param {string|Date} date2 - 第二个日期
   * @returns {number} 天数差
   */
  getDaysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    const diff = Math.abs(d2 - d1);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 日期加减天数
   * @param {string|Date} date - 基准日期
   * @param {number} days - 要加减的天数
   * @returns {Date} 计算后的日期
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 日期加减月数
   * @param {string|Date} date - 基准日期
   * @param {number} months - 要加减的月数
   * @returns {Date} 计算后的日期
   */
  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * 日期加减年数
   * @param {string|Date} date - 基准日期
   * @param {number} years - 要加减的年数
   * @returns {Date} 计算后的日期
   */
  addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * 计算工作日数量
   * @param {string|Date} startDate - 开始日期
   * @param {string|Date} endDate - 结束日期
   * @param {Array<string>} holidays - 节假日列表，格式：['2024-01-01', '2024-01-02']
   * @returns {number} 工作日数量
   */
  getWorkdays(startDate, endDate, holidays = []) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    if (start > end) {
      [start, end] = [end, start];
    }
    
    let workdays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        const dateStr = this.formatDate(current, 'yyyy-MM-dd');
        if (!holidays.includes(dateStr)) {
          workdays++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workdays;
  }

  /**
   * 格式化日期
   * @param {string|Date} date - 日期
   * @param {string} format - 格式，支持：'yyyy-MM-dd', 'yyyy年MM月dd日'
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, format = 'yyyy-MM-dd') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (format === 'yyyy-MM-dd') {
      return `${year}-${month}-${day}`;
    } else if (format === 'yyyy年MM月dd日') {
      return `${year}年${month}月${day}日`;
    }
    
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取星期几
   * @param {string|Date} date - 日期
   * @returns {string} 星期几
   */
  getDayOfWeek(date) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const d = new Date(date);
    return days[d.getDay()];
  }

  /**
   * 判断是否为闰年
   * @param {number} year - 年份
   * @returns {boolean} 是否为闰年
   */
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * 计算年龄
   * @param {string|Date} birthDate - 出生日期
   * @param {string|Date} targetDate - 目标日期，默认当前日期
   * @returns {number} 年龄
   */
  getAge(birthDate, targetDate = new Date()) {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    
    let age = target.getFullYear() - birth.getFullYear();
    const monthDiff = target.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * 获取月份天数
   * @param {number} year - 年份
   * @param {number} month - 月份（1-12）
   * @returns {number} 天数
   */
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * 获取季度
   * @param {number} month - 月份（1-12）
   * @returns {number} 季度（1-4）
   */
  getQuarter(month) {
    return Math.floor((month - 1) / 3) + 1;
  }

  /**
   * 判断是否为工作日
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为工作日
   */
  isWorkday(date) {
    const d = new Date(date);
    const day = d.getDay();
    return day !== 0 && day !== 6;
  }

  /**
   * 判断是否为周末
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为周末
   */
  isWeekend(date) {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6;
  }

  /**
   * 获取当月第一天
   * @param {string|Date} date - 日期
   * @returns {Date} 当月第一天
   */
  getFirstDayOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取当月最后一天
   * @param {string|Date} date - 日期
   * @returns {Date} 当月最后一天
   */
  getLastDayOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取日期之间的所有日期
   * @param {string|Date} startDate - 开始日期
   * @param {string|Date} endDate - 结束日期
   * @returns {Array<Date>} 日期数组
   */
  getDatesBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const dates = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * 比较两个日期
   * @param {string|Date} date1 - 第一个日期
   * @param {string|Date} date2 - 第二个日期
   * @returns {number} 比较结果：-1, 0, 1
   */
  compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * 判断两个日期是否相等
   * @param {string|Date} date1 - 第一个日期
   * @param {string|Date} date2 - 第二个日期
   * @returns {boolean} 是否相等
   */
  isSameDate(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    return d1.getTime() === d2.getTime();
  }

  /**
   * 判断是否为今天
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为今天
   */
  isToday(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    return d.getTime() === today.getTime();
  }

  /**
   * 判断是否为未来日期
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为未来日期
   */
  isFutureDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    return d > today;
  }

  /**
   * 判断是否为过去日期
   * @param {string|Date} date - 日期
   * @returns {boolean} 是否为过去日期
   */
  isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    return d < today;
  }

  /**
   * 获取时间戳
   * @param {string|Date} date - 日期
   * @returns {number} 时间戳
   */
  getTimestamp(date) {
    return new Date(date).getTime();
  }

  /**
   * 从时间戳创建日期
   * @param {number} timestamp - 时间戳
   * @returns {Date} 日期
   */
  fromTimestamp(timestamp) {
    return new Date(timestamp);
  }

  /**
   * 获取当前日期时间
   * @returns {Date} 当前日期时间
   */
  getNow() {
    return new Date();
  }

  /**
   * 获取当前日期字符串
   * @returns {string} 当前日期字符串
   */
  getTodayString() {
    return this.formatDate(new Date());
  }
}

module.exports = new DateUtils();