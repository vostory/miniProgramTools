/**
 * CSS 解析器
 */
class ParseCss {
  parse(content, options = {}) {
    // 简化实现
    console.log('解析 CSS:', content.substring(0, 100));
    return { type: 'css', content: content };
  }
}

module.exports = ParseCss;