/**
 * 文本格式化工具类
 * 支持JSON、XML、YAML、Markdown、HTML等多种格式的格式化处理
 */
class TextFormatter {
  /**
   * 格式化JSON
   * @param {string} json - JSON字符串
   * @param {number} indent - 缩进空格数
   * @param {boolean} sortKeys - 是否按键排序
   * @returns {Object} 格式化结果
   */
  formatJson(json, indent = 2, sortKeys = false) {
    try {
      if (!json.trim()) {
        return { formatted: '', error: 'JSON字符串不能为空' };
      }
      
      // 解析JSON
      const parsed = JSON.parse(json);
      
      // 排序键
      let replacer = null;
      if (sortKeys) {
        replacer = (key, value) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // 对对象属性进行排序
            return Object.keys(value)
              .sort()
              .reduce((sorted, key) => {
                sorted[key] = value[key];
                return sorted;
              }, {});
          }
          return value;
        };
      }
      
      // 格式化JSON
      const formatted = JSON.stringify(parsed, replacer, indent);
      
      return { formatted: formatted, error: null };
      
    } catch (error) {
      console.error('JSON格式化错误:', error);
      return { 
        formatted: '', 
        error: `JSON解析失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 压缩JSON
   * @param {string} json - JSON字符串
   * @returns {Object} 压缩结果
   */
  minifyJson(json) {
    try {
      if (!json.trim()) {
        return { formatted: '', error: 'JSON字符串不能为空' };
      }
      
      // 解析并重新序列化，移除所有空白
      const parsed = JSON.parse(json);
      const minified = JSON.stringify(parsed);
      
      return { formatted: minified, error: null };
      
    } catch (error) {
      return { 
        formatted: '', 
        error: `JSON压缩失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 验证JSON
   * @param {string} json - JSON字符串
   * @returns {Object} 验证结果
   */
  validateJson(json) {
    try {
      if (!json.trim()) {
        return { valid: false, error: 'JSON字符串不能为空' };
      }
      
      JSON.parse(json);
      return { valid: true, error: null };
      
    } catch (error) {
      return { 
        valid: false, 
        error: `JSON验证失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 格式化XML
   * @param {string} xml - XML字符串
   * @param {number} indent - 缩进空格数
   * @returns {Object} 格式化结果
   */
  formatXml(xml, indent = 2) {
    try {
      if (!xml.trim()) {
        return { formatted: '', error: 'XML字符串不能为空' };
      }
      
      // 移除多余空白
      let formatted = xml.trim();
      
      // 添加换行符
      formatted = formatted
        .replace(/</g, '\n<')
        .replace(/>/g, '>\n')
        .replace(/\n\n/g, '\n');
      
      // 分割行
      const lines = formatted.split('\n');
      let result = [];
      let indentLevel = 0;
      const indentStr = ' '.repeat(indent);
      
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // 计算缩进
        if (line.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        result.push(indentStr.repeat(indentLevel) + line);
        
        // 更新缩进级别
        if (line.startsWith('<') && !line.startsWith('</') && 
            !line.includes('/>') && !line.includes('?>') && 
            !line.includes('<!--')) {
          indentLevel++;
        }
      }
      
      return { 
        formatted: result.join('\n'), 
        error: null 
      };
      
    } catch (error) {
      console.error('XML格式化错误:', error);
      return { 
        formatted: '', 
        error: `XML格式化失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 验证XML
   * @param {string} xml - XML字符串
   * @returns {Object} 验证结果
   */
  validateXml(xml) {
    try {
      if (!xml.trim()) {
        return { valid: false, error: 'XML字符串不能为空' };
      }
      
      // 简单验证：检查是否包含根标签
      const hasRootTag = /<[^/>]+>[\s\S]*<\/[^>]+>/.test(xml) || /<[^/>]+\/>/.test(xml);
      if (!hasRootTag) {
        return { valid: false, error: 'XML缺少有效的根标签' };
      }
      
      // 检查标签是否闭合
      const tagRegex = /<([^>]+)>/g;
      const stack = [];
      let match;
      
      while ((match = tagRegex.exec(xml)) !== null) {
        const tag = match[1];
        
        if (tag.startsWith('?')) continue; // 跳过处理指令
        if (tag.startsWith('!')) continue; // 跳过注释和CDATA
        
        if (tag.startsWith('/')) {
          // 结束标签
          const tagName = tag.substring(1).split(' ')[0];
          if (stack.length === 0 || stack.pop() !== tagName) {
            return { valid: false, error: `标签未正确闭合: ${tagName}` };
          }
        } else if (!tag.endsWith('/')) {
          // 开始标签
          const tagName = tag.split(' ')[0].split('>')[0];
          stack.push(tagName);
        }
      }
      
      if (stack.length > 0) {
        return { valid: false, error: `有未闭合的标签: ${stack.join(', ')}` };
      }
      
      return { valid: true, error: null };
      
    } catch (error) {
      return { 
        valid: false, 
        error: `XML验证失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 格式化YAML
   * @param {string} yaml - YAML字符串
   * @param {number} indent - 缩进空格数
   * @returns {Object} 格式化结果
   */
  formatYaml(yaml, indent = 2) {
    try {
      if (!yaml.trim()) {
        return { formatted: '', error: 'YAML字符串不能为空' };
      }
      
      // 分割行
      const lines = yaml.split('\n');
      const result = [];
      let indentLevel = 0;
      const indentStr = ' '.repeat(indent);
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 跳过空行
        if (line.trim() === '') {
          result.push('');
          continue;
        }
        
        // 计算当前行的缩进
        const currentIndent = line.search(/\S|$/);
        
        // 计算缩进级别
        if (i > 0) {
          const prevLine = lines[i - 1];
          if (prevLine.trim() === '') {
            // 空行后保持当前缩进
          } else if (line.includes(':') && !line.trim().endsWith(':')) {
            // 键值对
            indentLevel = Math.floor(currentIndent / indent);
          } else if (line.trim().startsWith('-')) {
            // 列表项
            indentLevel = Math.floor(currentIndent / indent);
          }
        }
        
        // 应用缩进
        const formattedLine = indentStr.repeat(indentLevel) + line.trim();
        result.push(formattedLine);
      }
      
      return { 
        formatted: result.join('\n'), 
        error: null 
      };
      
    } catch (error) {
      console.error('YAML格式化错误:', error);
      return { 
        formatted: '', 
        error: `YAML格式化失败: ${error.message}` 
      };
    }
  }
  
  /**
   * YAML转JSON
   * @param {string} yaml - YAML字符串
   * @returns {Object} 转换结果
   */
  yamlToJson(yaml) {
    try {
      if (!yaml.trim()) {
        return { formatted: '', error: 'YAML字符串不能为空' };
      }
      
      // 简单实现YAML到JSON的转换
      const lines = yaml.split('\n');
      const result = {};
      const stack = [{ obj: result, indent: -1 }];
      
      for (let line of lines) {
        if (line.trim() === '' || line.trim().startsWith('#')) {
          continue;
        }
        
        const indent = line.search(/\S|$/);
        const trimmed = line.trim();
        
        // 移除栈顶的缩进更大的对象
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop();
        }
        
        if (trimmed.startsWith('-')) {
          // 数组项
          const value = trimmed.substring(1).trim();
          const current = stack[stack.length - 1].obj;
          
          if (!Array.isArray(current)) {
            // 转换为数组
            const newArray = [value];
            const parent = stack[stack.length - 2].obj;
            const lastKey = Object.keys(parent).pop();
            parent[lastKey] = newArray;
            stack[stack.length - 1].obj = newArray;
          } else {
            current.push(value);
          }
        } else if (trimmed.includes(':')) {
          // 键值对
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          const current = stack[stack.length - 1].obj;
          
          if (value === '') {
            // 嵌套对象
            const newObj = {};
            current[key.trim()] = newObj;
            stack.push({ obj: newObj, indent: indent });
          } else {
            current[key.trim()] = value;
          }
        }
      }
      
      return { 
        formatted: JSON.stringify(result, null, 2), 
        error: null 
      };
      
    } catch (error) {
      return { 
        formatted: '', 
        error: `YAML转JSON失败: ${error.message}` 
      };
    }
  }
  
  /**
   * JSON转YAML
   * @param {string} json - JSON字符串
   * @param {number} indent - 缩进空格数
   * @returns {Object} 转换结果
   */
  jsonToYaml(json, indent = 2) {
    try {
      const result = this.formatJson(json, indent, false);
      if (result.error) {
        return result;
      }
      
      const parsed = JSON.parse(result.formatted);
      const yaml = this._objectToYaml(parsed, 0, indent);
      
      return { formatted: yaml.trim(), error: null };
      
    } catch (error) {
      return { 
        formatted: '', 
        error: `JSON转YAML失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 对象转YAML
   * @private
   */
  _objectToYaml(obj, level, indent) {
    const indentStr = ' '.repeat(indent * level);
    let result = '';
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          result += indentStr + '-\n' + this._objectToYaml(item, level + 1, indent);
        } else {
          result += indentStr + '- ' + this._valueToString(item) + '\n';
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          result += indentStr + key + ':\n' + this._objectToYaml(value, level + 1, indent);
        } else {
          result += indentStr + key + ': ' + this._valueToString(value) + '\n';
        }
      }
    }
    
    return result;
  }
  
  /**
   * 值转字符串
   * @private
   */
  _valueToString(value) {
    if (value === null) return 'null';
    if (value === undefined) return '';
    if (typeof value === 'string') {
      if (value.includes('\n') || value.includes(':') || value.includes('#')) {
        return '|-\n' + value.split('\n').map((line, i) => 
          i === 0 ? '  ' + line : '    ' + line
        ).join('\n');
      }
      return value;
    }
    return String(value);
  }
  
  /**
   * 格式化Markdown
   * @param {string} markdown - Markdown字符串
   * @returns {string} 格式化结果
   */
  formatMarkdown(markdown) {
    try {
      if (!markdown.trim()) {
        return '';
      }
      
      // 分割行
      const lines = markdown.split('\n');
      const result = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 格式化标题
        if (line.startsWith('# ')) {
          line = '# ' + line.substring(2).trim();
        } else if (line.startsWith('## ')) {
          line = '## ' + line.substring(3).trim();
        } else if (line.startsWith('### ')) {
          line = '### ' + line.substring(4).trim();
        } else if (line.startsWith('#### ')) {
          line = '#### ' + line.substring(5).trim();
        } else if (line.startsWith('##### ')) {
          line = '##### ' + line.substring(6).trim();
        } else if (line.startsWith('###### ')) {
          line = '###### ' + line.substring(7).trim();
        }
        
        // 格式化列表
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('+ ')) {
          const match = line.match(/^(\s*)([-*+]\s+)(.*)/);
          if (match) {
            const [, indent, bullet, content] = match;
            line = indent + bullet + content.trim();
          }
        }
        
        // 格式化代码块
        if (line.trim().startsWith('```')) {
          result.push(line);
          continue;
        }
        
        // 格式化表格
        if (line.includes('|') && !line.trim().startsWith('|')) {
          // 确保表格行以|开始和结束
          if (!line.startsWith('|')) {
            line = '|' + line;
          }
          if (!line.endsWith('|')) {
            line = line + '|';
          }
        }
        
        result.push(line);
      }
      
      return result.join('\n');
      
    } catch (error) {
      console.error('Markdown格式化错误:', error);
      return markdown;
    }
  }
  
  /**
   * 格式化HTML
   * @param {string} html - HTML字符串
   * @param {number} indent - 缩进空格数
   * @returns {Object} 格式化结果
   */
  formatHtml(html, indent = 2) {
    try {
      if (!html.trim()) {
        return { formatted: '', error: 'HTML字符串不能为空' };
      }
      
      // 使用XML格式化函数
      return this.formatXml(html, indent);
      
    } catch (error) {
      console.error('HTML格式化错误:', error);
      return { 
        formatted: '', 
        error: `HTML格式化失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 验证HTML
   * @param {string} html - HTML字符串
   * @returns {Object} 验证结果
   */
  validateHtml(html) {
    try {
      if (!html.trim()) {
        return { valid: false, error: 'HTML字符串不能为空' };
      }
      
      // 简单验证：检查是否有开始和结束标签
      const hasTags = /<[^>]+>/.test(html);
      if (!hasTags) {
        return { valid: false, error: 'HTML缺少标签' };
      }
      
      return { valid: true, error: null };
      
    } catch (error) {
      return { 
        valid: false, 
        error: `HTML验证失败: ${error.message}` 
      };
    }
  }
  
  /**
   * 统计文本信息
   * @param {string} text - 文本字符串
   * @returns {Object} 统计信息
   */
  getTextStats(text) {
    if (!text) {
      return {
        chars: 0,
        words: 0,
        lines: 0,
        bytes: 0
      };
    }
    
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const bytes = new Blob([text]).size;
    
    return {
      chars: chars,
      words: words,
      lines: lines,
      bytes: bytes
    };
  }
  
  /**
   * 转换大小写
   * @param {string} text - 文本字符串
   * @param {string} caseType - 转换类型：upper, lower, title, camel, snake, kebab
   * @returns {string} 转换结果
   */
  changeCase(text, caseType) {
    if (!text) return '';
    
    switch (caseType) {
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      case 'title':
        return text.replace(/\b\w/g, char => char.toUpperCase());
      case 'camel':
        return text.replace(/[_\s-]+(.)?/g, (match, char) => 
          char ? char.toUpperCase() : ''
        ).replace(/^./, char => char.toLowerCase());
      case 'snake':
        return text.replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();
      case 'kebab':
        return text.replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
      default:
        return text;
    }
  }
  
  /**
   * 移除空白
   * @param {string} text - 文本字符串
   * @param {string} type - 移除类型：all, extra, leading, trailing
   * @returns {string} 处理结果
   */
  removeWhitespace(text, type = 'all') {
    if (!text) return '';
    
    switch (type) {
      case 'all':
        return text.replace(/\s+/g, '');
      case 'extra':
        return text.replace(/\s+/g, ' ').trim();
      case 'leading':
        return text.replace(/^\s+/g, '');
      case 'trailing':
        return text.replace(/\s+$/g, '');
      default:
        return text.trim();
    }
  }
  
  /**
   * 文本编码/解码
   * @param {string} text - 文本字符串
   * @param {string} action - 操作：encode, decode
   * @param {string} type - 类型：base64, uri, html
   * @returns {string} 处理结果
   */
  encodeDecode(text, action, type) {
    if (!text) return '';
    
    try {
      switch (type) {
        case 'base64':
          if (action === 'encode') {
            return btoa(text);
          } else {
            return atob(text);
          }
        case 'uri':
          if (action === 'encode') {
            return encodeURIComponent(text);
          } else {
            return decodeURIComponent(text);
          }
        case 'html':
          if (action === 'encode') {
            return text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          } else {
            return text
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
          }
        default:
          return text;
      }
    } catch (error) {
      console.error('编码/解码错误:', error);
      return text;
    }
  }
}

module.exports = new TextFormatter();