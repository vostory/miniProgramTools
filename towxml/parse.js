// 导入子模块
const parseWxml = require('./parseWxml.js');
const parseJs = require('./parseJs.js');
const parseCss = require('./parseCss.js');
const parseJson = require('./parseJson.js');
const parseYaml = require('./parseYaml.js');
const parseXml = require('./parseXml.js');

/**
 * towxml 主类
 * 支持 Markdown、HTML 等格式的解析和渲染
 */
class Towxml {
  constructor(options = {}) {
    this.options = {
      theme: 'light',           // 主题：light, dark
      base: '',                 // 基础路径
      events: {},               // 事件监听
      supportCustomStyle: true, // 是否支持自定义样式
      ...options
    };
    
    // 初始化解析器
    this.initParsers();
  }

  // 初始化解析器
  initParsers() {
    this.parsers = {
      wxml: new parseWxml(),
      js: new parseJs(),
      css: new parseCss(),
      json: new parseJson(),
      yaml: new parseYaml(),
      xml: new parseXml()
    };
  }

  /**
   * 解析 Markdown
   * @param {string} data - Markdown 字符串
   * @param {Object} options - 解析选项
   * @returns {Object} 解析结果
   */
  toMarkdown(data, options = {}) {
    try {
      console.log('开始解析 Markdown');
      
      if (!data || typeof data !== 'string') {
        throw new Error('Markdown 数据不能为空');
      }
      
      const mergedOptions = { ...this.options, ...options };
      
      // 解析 Markdown
      const ast = this.parseMarkdownAst(data, mergedOptions);
      
      // 生成节点数据
      const nodes = this.generateMarkdownNodes(ast, mergedOptions);
      
      return {
        type: 'markdown',
        data: nodes,
        options: mergedOptions,
        error: null
      };
      
    } catch (error) {
      console.error('Markdown 解析错误:', error);
      return {
        type: 'markdown',
        data: [],
        options: options,
        error: error.message
      };
    }
  }

  /**
   * 解析 HTML
   * @param {string} data - HTML 字符串
   * @param {Object} options - 解析选项
   * @returns {Object} 解析结果
   */
  toHtml(data, options = {}) {
    try {
      console.log('开始解析 HTML');
      
      if (!data || typeof data !== 'string') {
        throw new Error('HTML 数据不能为空');
      }
      
      const mergedOptions = { ...this.options, ...options };
      
      // 解析 HTML
      const ast = this.parseHtmlAst(data, mergedOptions);
      
      // 生成节点数据
      const nodes = this.generateHtmlNodes(ast, mergedOptions);
      
      return {
        type: 'html',
        data: nodes,
        options: mergedOptions,
        error: null
      };
      
    } catch (error) {
      console.error('HTML 解析错误:', error);
      return {
        type: 'html',
        data: [],
        options: options,
        error: error.message
      };
    }
  }

  /**
   * 解析 JSON
   * @param {string} data - JSON 字符串
   * @param {Object} options - 解析选项
   * @returns {Object} 解析结果
   */
  toJson(data, options = {}) {
    try {
      console.log('开始解析 JSON');
      
      if (!data || typeof data !== 'string') {
        throw new Error('JSON 数据不能为空');
      }
      
      const mergedOptions = { ...this.options, ...options };
      const result = this.parsers.json.parse(data, mergedOptions);
      
      return {
        type: 'json',
        data: result,
        options: mergedOptions,
        error: null
      };
      
    } catch (error) {
      console.error('JSON 解析错误:', error);
      return {
        type: 'json',
        data: null,
        options: options,
        error: error.message
      };
    }
  }

  /**
   * 解析 XML
   * @param {string} data - XML 字符串
   * @param {Object} options - 解析选项
   * @returns {Object} 解析结果
   */
  toXml(data, options = {}) {
    try {
      console.log('开始解析 XML');
      
      if (!data || typeof data !== 'string') {
        throw new Error('XML 数据不能为空');
      }
      
      const mergedOptions = { ...this.options, ...options };
      const result = this.parsers.xml.parse(data, mergedOptions);
      
      return {
        type: 'xml',
        data: result,
        options: mergedOptions,
        error: null
      };
      
    } catch (error) {
      console.error('XML 解析错误:', error);
      return {
        type: 'xml',
        data: null,
        options: options,
        error: error.message
      };
    }
  }

  /**
   * 解析 Markdown AST
   * @private
   */
  parseMarkdownAst(markdown, options) {
    const lines = markdown.split('\n');
    const ast = [];
    let currentList = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimRight();
      
      if (line === '') {
        if (currentList) {
          ast.push(currentList);
          currentList = null;
        }
        ast.push({ type: 'blank' });
        continue;
      }
      
      // 解析标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentList) {
          ast.push(currentList);
          currentList = null;
        }
        
        const [, hashes, content] = headingMatch;
        const level = hashes.length;
        ast.push({
          type: 'heading',
          level: level,
          content: this.parseInlineMarkdown(content)
        });
        continue;
      }
      
      // 解析代码块
      if (line.startsWith('```')) {
        const language = line.substring(3).trim() || 'text';
        let code = '';
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        
        if (currentList) {
          ast.push(currentList);
          currentList = null;
        }
        
        ast.push({
          type: 'code',
          language: language,
          content: code.trim()
        });
        continue;
      }
      
      // 解析列表
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const [, indent, marker, content] = listMatch;
        const depth = Math.floor(indent.length / 2);
        
        if (!currentList) {
          currentList = {
            type: marker.match(/\d+\./) ? 'ordered_list' : 'unordered_list',
            items: []
          };
        }
        
        currentList.items.push({
          depth: depth,
          content: this.parseInlineMarkdown(content)
        });
        continue;
      }
      
      // 解析引用
      if (line.startsWith('> ')) {
        if (currentList) {
          ast.push(currentList);
          currentList = null;
        }
        
        ast.push({
          type: 'blockquote',
          content: this.parseInlineMarkdown(line.substring(2))
        });
        continue;
      }
      
      // 解析表格
      if (line.includes('|') && !line.startsWith('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 0) {
          if (currentList) {
            ast.push(currentList);
            currentList = null;
          }
          
          // 检查是否是表头分隔行
          if (cells.every(cell => /^:?-+:?$/.test(cell))) {
            // 跳过表头分隔行
            continue;
          }
          
          // 普通表格行
          ast.push({
            type: 'table_row',
            cells: cells.map(cell => this.parseInlineMarkdown(cell))
          });
          continue;
        }
      }
      
      // 解析水平线
      if (/^[-*_]{3,}$/.test(line)) {
        if (currentList) {
          ast.push(currentList);
          currentList = null;
        }
        
        ast.push({ type: 'hr' });
        continue;
      }
      
      // 解析段落
      if (currentList) {
        ast.push(currentList);
        currentList = null;
      }
      
      ast.push({
        type: 'paragraph',
        content: this.parseInlineMarkdown(line)
      });
    }
    
    if (currentList) {
      ast.push(currentList);
    }
    
    return ast;
  }

  /**
   * 解析行内 Markdown
   * @private
   */
  parseInlineMarkdown(text) {
    const parts = [];
    let i = 0;
    
    while (i < text.length) {
      // 解析粗体
      if (text.substring(i, i + 2) === '**') {
        i += 2;
        const end = text.indexOf('**', i);
        if (end !== -1) {
          parts.push({
            type: 'strong',
            content: text.substring(i, end)
          });
          i = end + 2;
          continue;
        }
      }
      
      // 解析斜体
      if (text[i] === '*' && (i === 0 || text[i-1] === ' ')) {
        i += 1;
        const end = text.indexOf('*', i);
        if (end !== -1) {
          parts.push({
            type: 'em',
            content: text.substring(i, end)
          });
          i = end + 1;
          continue;
        }
      }
      
      // 解析行内代码
      if (text[i] === '`') {
        i += 1;
        const end = text.indexOf('`', i);
        if (end !== -1) {
          parts.push({
            type: 'inline_code',
            content: text.substring(i, end)
          });
          i = end + 1;
          continue;
        }
      }
      
      // 解析链接
      if (text.substring(i, i + 1) === '[') {
        const linkEnd = text.indexOf(']', i);
        if (linkEnd !== -1) {
          const urlStart = text.indexOf('(', linkEnd);
          if (urlStart !== -1 && urlStart === linkEnd + 1) {
            const urlEnd = text.indexOf(')', urlStart);
            if (urlEnd !== -1) {
              const linkText = text.substring(i + 1, linkEnd);
              const linkUrl = text.substring(urlStart + 1, urlEnd);
              parts.push({
                type: 'link',
                content: linkText,
                href: linkUrl
              });
              i = urlEnd + 1;
              continue;
            }
          }
        }
      }
      
      // 解析图片
      if (text.substring(i, i + 2) === '![') {
        const altEnd = text.indexOf(']', i + 2);
        if (altEnd !== -1) {
          const srcStart = text.indexOf('(', altEnd);
          if (srcStart !== -1 && srcStart === altEnd + 1) {
            const srcEnd = text.indexOf(')', srcStart);
            if (srcEnd !== -1) {
              const altText = text.substring(i + 2, altEnd);
              const srcUrl = text.substring(srcStart + 1, srcEnd);
              parts.push({
                type: 'image',
                alt: altText,
                src: srcUrl
              });
              i = srcEnd + 1;
              continue;
            }
          }
        }
      }
      
      // 普通文本
      let j = i;
      while (j < text.length && !['*', '`', '[', '!'].includes(text[j])) {
        j++;
      }
      
      if (j > i) {
        parts.push({
          type: 'text',
          content: text.substring(i, j)
        });
        i = j;
      } else {
        // 未知字符，跳过
        parts.push({
          type: 'text',
          content: text[i]
        });
        i++;
      }
    }
    
    return parts;
  }

  /**
   * 解析 HTML AST
   * @private
   */
  parseHtmlAst(html, options) {
    const ast = [];
    const stack = [];
    let i = 0;
    
    while (i < html.length) {
      // 跳过空白
      if (html[i] <= ' ') {
        i++;
        continue;
      }
      
      // 解析开始标签
      if (html[i] === '<') {
        const tagEnd = html.indexOf('>', i);
        if (tagEnd === -1) break;
        
        const tagContent = html.substring(i + 1, tagEnd);
        
        // 检查是否是结束标签
        if (tagContent[0] === '/') {
          stack.pop();
          i = tagEnd + 1;
          continue;
        }
        
        // 检查是否是注释
        if (tagContent.startsWith('!--')) {
          i = html.indexOf('-->', i) + 3;
          continue;
        }
        
        // 检查是否是自闭合标签
        const isSelfClosing = tagContent.endsWith('/') || 
                              ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(
                                tagContent.split(' ')[0].toLowerCase()
                              );
        
        // 解析标签
        const tagMatch = tagContent.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
        if (tagMatch) {
          const tagName = tagMatch[1].toLowerCase();
          const attrs = this.parseHtmlAttributes(tagContent);
          
          const node = {
            type: tagName,
            attrs: attrs,
            children: []
          };
          
          if (stack.length === 0) {
            ast.push(node);
          } else {
            const parent = stack[stack.length - 1];
            parent.children.push(node);
          }
          
          if (!isSelfClosing) {
            stack.push(node);
          }
        }
        
        i = tagEnd + 1;
        continue;
      }
      
      // 解析文本内容
      const textStart = i;
      while (i < html.length && html[i] !== '<') {
        i++;
      }
      
      const text = html.substring(textStart, i).trim();
      if (text) {
        const textNode = {
          type: 'text',
          content: text
        };
        
        if (stack.length === 0) {
          ast.push(textNode);
        } else {
          const parent = stack[stack.length - 1];
          parent.children.push(textNode);
        }
      }
    }
    
    return ast;
  }

  /**
   * 解析 HTML 属性
   * @private
   */
  parseHtmlAttributes(tagContent) {
    const attrs = {};
    const attrRegex = /([a-zA-Z][a-zA-Z0-9:_-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^>\s]+)))?/g;
    let match;
    
    while ((match = attrRegex.exec(tagContent)) !== null) {
      const [, name, doubleQuote, singleQuote, unquoted] = match;
      const value = doubleQuote || singleQuote || unquoted || true;
      attrs[name.toLowerCase()] = value;
    }
    
    return attrs;
  }

  /**
   * 生成 Markdown 节点
   * @private
   */
  generateMarkdownNodes(ast, options) {
    return ast.map(node => {
      switch (node.type) {
        case 'heading':
          return this.generateHeadingNode(node, options);
        case 'paragraph':
          return this.generateParagraphNode(node, options);
        case 'code':
          return this.generateCodeNode(node, options);
        case 'blockquote':
          return this.generateBlockquoteNode(node, options);
        case 'unordered_list':
        case 'ordered_list':
          return this.generateListNode(node, options);
        case 'table_row':
          return this.generateTableRowNode(node, options);
        case 'hr':
          return this.generateHrNode(options);
        case 'blank':
          return this.generateBlankNode(options);
        default:
          return null;
      }
    }).filter(node => node !== null);
  }

  /**
   * 生成 HTML 节点
   * @private
   */
  generateHtmlNodes(ast, options) {
    return ast.map(node => this.generateHtmlNode(node, options));
  }

  /**
   * 生成 HTML 单个节点
   * @private
   */
  generateHtmlNode(node, options) {
    if (node.type === 'text') {
      return {
        name: 'text',
        attrs: { class: 'html-text' },
        children: [{
          type: 'text',
          text: node.content
        }]
      };
    }
    
    const tagMap = {
      'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'h4': 'h4', 'h5': 'h5', 'h6': 'h6',
      'p': 'p', 'div': 'div', 'span': 'span', 'a': 'a', 'img': 'img',
      'ul': 'ul', 'ol': 'ol', 'li': 'li', 'br': 'br', 'hr': 'hr',
      'strong': 'strong', 'b': 'b', 'em': 'em', 'i': 'i', 'u': 'u',
      'code': 'code', 'pre': 'pre', 'blockquote': 'blockquote',
      'table': 'table', 'thead': 'thead', 'tbody': 'tbody', 'tr': 'tr',
      'th': 'th', 'td': 'td'
    };
    
    const tagName = tagMap[node.type] || 'view';
    const attrs = { ...node.attrs };
    
    // 添加样式类
    if (!attrs.class) {
      attrs.class = `html-${node.type}`;
    }
    
    // 处理特殊属性
    if (node.type === 'img' && attrs.src) {
      attrs.mode = 'widthFix';
    }
    
    if (node.type === 'a' && attrs.href) {
      attrs['data-href'] = attrs.href;
      delete attrs.href;
    }
    
    return {
      name: tagName,
      attrs: attrs,
      children: node.children ? node.children.map(child => 
        this.generateHtmlNode(child, options)
      ) : []
    };
  }

  /**
   * 生成标题节点
   * @private
   */
  generateHeadingNode(node, options) {
    return {
      name: 'view',
      attrs: {
        class: `md-h${node.level}`
      },
      children: node.content.map(child => 
        this.generateInlineNode(child, options)
      )
    };
  }

  /**
   * 生成段落节点
   * @private
   */
  generateParagraphNode(node, options) {
    return {
      name: 'view',
      attrs: { class: 'md-p' },
      children: node.content.map(child => 
        this.generateInlineNode(child, options)
      )
    };
  }

  /**
   * 生成代码节点
   * @private
   */
  generateCodeNode(node, options) {
    return {
      name: 'view',
      attrs: { class: 'md-code-block' },
      children: [
        {
          name: 'view',
          attrs: { class: 'md-code-language' },
          children: [{
            type: 'text',
            text: node.language || 'code'
          }]
        },
        {
          name: 'view',
          attrs: { class: 'md-code-content' },
          children: [{
            type: 'text',
            text: node.content
          }]
        }
      ]
    };
  }

  /**
   * 生成引用节点
   * @private
   */
  generateBlockquoteNode(node, options) {
    return {
      name: 'view',
      attrs: { class: 'md-blockquote' },
      children: node.content.map(child => 
        this.generateInlineNode(child, options)
      )
    };
  }

  /**
   * 生成列表节点
   * @private
   */
  generateListNode(node, options) {
    return {
      name: 'view',
      attrs: { 
        class: node.type === 'ordered_list' ? 'md-ol' : 'md-ul'
      },
      children: node.items.map((item, index) => ({
        name: 'view',
        attrs: { 
          class: 'md-li',
          style: `padding-left: ${item.depth * 20}px`
        },
        children: [
          {
            name: 'text',
            attrs: { class: 'md-li-marker' },
            children: [{
              type: 'text',
              text: node.type === 'ordered_list' ? `${index + 1}. ` : '• '
            }]
          },
          ...item.content.map(child => 
            this.generateInlineNode(child, options)
          )
        ]
      }))
    };
  }

  /**
   * 生成表格行节点
   * @private
   */
  generateTableRowNode(node, options) {
    return {
      name: 'view',
      attrs: { class: 'md-tr' },
      children: node.cells.map(cell => ({
        name: 'view',
        attrs: { class: 'md-td' },
        children: cell.map(child => 
          this.generateInlineNode(child, options)
        )
      }))
    };
  }

  /**
   * 生成水平线节点
   * @private
   */
  generateHrNode(options) {
    return {
      name: 'view',
      attrs: { class: 'md-hr' },
      children: []
    };
  }

  /**
   * 生成空白节点
   * @private
   */
  generateBlankNode(options) {
    return {
      name: 'view',
      attrs: { class: 'md-blank' },
      children: []
    };
  }

  /**
   * 生成行内节点
   * @private
   */
  generateInlineNode(node, options) {
    switch (node.type) {
      case 'text':
        return {
          name: 'text',
          attrs: { class: 'md-text' },
          children: [{
            type: 'text',
            text: node.content
          }]
        };
      case 'strong':
        return {
          name: 'text',
          attrs: { class: 'md-strong' },
          children: [{
            type: 'text',
            text: node.content
          }]
        };
      case 'em':
        return {
          name: 'text',
          attrs: { class: 'md-em' },
          children: [{
            type: 'text',
            text: node.content
          }]
        };
      case 'inline_code':
        return {
          name: 'text',
          attrs: { class: 'md-inline-code' },
          children: [{
            type: 'text',
            text: node.content
          }]
        };
      case 'link':
        return {
          name: 'view',
          attrs: { 
            class: 'md-link',
            'data-href': node.href
          },
          children: [{
            type: 'text',
            text: node.content
          }]
        };
      case 'image':
        return {
          name: 'image',
          attrs: {
            class: 'md-image',
            src: node.src,
            alt: node.alt,
            mode: 'widthFix'
          }
        };
      default:
        return {
          name: 'text',
          attrs: { class: 'md-text' },
          children: [{
            type: 'text',
            text: node.content || ''
          }]
        };
    }
  }

  /**
   * 将解析结果转换为 WXML
   * @param {Object} data - 解析结果
   * @param {Object} options - 选项
   * @returns {Array} WXML 节点数组
   */
  toWxml(data, options = {}) {
    if (!data || data.error) {
      return [];
    }
    
    const mergedOptions = { ...this.options, ...options };
    
    if (data.type === 'markdown') {
      return this.generateMarkdownNodes(data.data, mergedOptions);
    } else if (data.type === 'html') {
      return this.generateHtmlNodes(data.data, mergedOptions);
    }
    
    return [];
  }
}

module.exports = Towxml;