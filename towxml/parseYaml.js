/**
 * YAML 解析器
 */
class ParseYaml {
  parse(content, options = {}) {
    // 简化实现
    console.log('解析 YAML:', content.substring(0, 100));
    
    // 简单的 YAML 解析
    const lines = content.split('\n');
    const result = {};
    let currentKey = null;
    let currentIndent = 0;
    
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) {
        continue;
      }
      
      const indent = line.search(/\S|$/);
      const [key, ...valueParts] = line.trim().split(':');
      const value = valueParts.join(':').trim();
      
      if (value === '') {
        currentKey = key;
        currentIndent = indent;
      } else if (key && value) {
        result[key] = value;
      }
    }
    
    return { type: 'yaml', data: result };
  }
}

module.exports = ParseYaml;