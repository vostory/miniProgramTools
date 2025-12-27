/**
 * JSON 解析器
 */
class ParseJson {
  parse(content, options = {}) {
    try {
      const parsed = JSON.parse(content);
      console.log('解析 JSON 成功');
      return { type: 'json', data: parsed };
    } catch (error) {
      console.error('JSON 解析失败:', error);
      throw error;
    }
  }
}

module.exports = ParseJson;