/**
 * JavaScript 解析器
 */
class ParseJs {
  parse(content, options = {}) {
    // 简化实现
    console.log('解析 JavaScript:', content.substring(0, 100));
    return { type: 'javascript', content: content };
  }
}

module.exports = ParseJs;