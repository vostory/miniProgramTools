const app = getApp();
const textFormatter = require('../../utils/textFormatter.js');
const Towxml = require('../../towxml/parse.js');

Page({
  data: {
    theme: 'light',
    // 格式化类型选项
    formatTypes: [
      { value: 'json', name: 'JSON格式化' },
      { value: 'xml', name: 'XML格式化' },
      { value: 'yaml', name: 'YAML格式化' },
      { value: 'markdown', name: 'Markdown格式化' },
      { value: 'html', name: 'HTML格式化' }
    ],
    // 当前选中的类型索引
    formatTypeIndex: 0,
    // 当前选中的类型对象
    currentFormatType: { value: 'json', name: 'JSON格式化' },
    // 输入文本
    inputText: '',
    maxLength: 5000,
    // 处理结果
    resultText: '',
    processInfo: '',
    isProcessing: false,
    // 预览相关
    viewMode: 'source', // source, preview
    previewNodes: [],
    // towxml实例
    towxml: null,
    // JSON格式化选项
    indentSpaces: 2,
    sortKeys: false,
    indentOptions: ['2', '4'],
    indentIndex: 0,
    // 帮助信息
    helpTitle: '',
    helpItems: [],
    // 历史记录
    history: []
  },

  onLoad: function() {
    console.log('文本处理页面加载');
    this.setData({
      theme: app.globalData.theme
    });
    
    // 初始化towxml
    this.initTowxml();
    
    // 加载帮助信息
    this.loadHelpInfo();
    
    // 加载历史记录
    this.loadHistory();
  },

  onShow: function() {
    console.log('文本处理页面显示');
    this.setData({
      theme: app.globalData.theme
    });
    
    // 更新towxml主题
    if (this.data.towxml) {
      this.data.towxml.options.theme = this.data.theme;
    }
  },

  goBack: function() {
    wx.navigateBack();
  },

  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 初始化towxml
  initTowxml: function() {
    const towxml = new Towxml({
      theme: this.data.theme,
      base: '',
      events: {
        tap: (e) => {
          this.onPreviewTap(e);
        }
      },
      supportCustomStyle: true
    });
    
    console.log('Towxml 初始化完成');
    this.setData({ towxml: towxml });
  },

  // 预览点击事件
  onPreviewTap: function(e) {
    console.log('预览点击事件:', e);
    
    const { type, data } = e.detail || {};
    
    if (type === 'link' || (data && data.href)) {
      const url = data?.url || data?.href;
      if (url && url !== '#') {
        wx.showModal({
          title: '打开链接',
          content: url,
          confirmText: '复制链接',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: url,
                success: () => {
                  wx.showToast({
                    title: '链接已复制',
                    icon: 'success',
                    duration: 1000
                  });
                }
              });
            }
          }
        });
      }
    }
  },

  // 加载帮助信息
  loadHelpInfo: function() {
    const { currentFormatType } = this.data;
    this.updateHelpInfo(currentFormatType.value);
  },

  // 更新帮助信息
  updateHelpInfo: function(type) {
    const helpData = {
      'json': {
        title: 'JSON格式化说明',
        items: [
          'JSON（JavaScript Object Notation）是一种轻量级的数据交换格式',
          '支持格式化、压缩、验证、排序等操作',
          '支持2空格和4空格两种缩进方式',
          '支持按键名字母顺序排序'
        ]
      },
      'xml': {
        title: 'XML格式化说明',
        items: [
          'XML（可扩展标记语言）用于存储和传输数据',
          '支持格式化、压缩、验证等操作',
          '自动缩进和标签对齐',
          '保留注释和CDATA节点'
        ]
      },
      'yaml': {
        title: 'YAML格式化说明',
        items: [
          'YAML（YAML Ain\'t Markup Language）是一种人类可读的数据序列化格式',
          '支持YAML和JSON之间的相互转换',
          '自动处理多行字符串',
          '支持注释和锚点'
        ]
      },
      'markdown': {
        title: 'Markdown格式化说明',
        items: [
          'Markdown是一种轻量级标记语言，用于编写文档',
          '支持标题、列表、代码块、表格等格式',
          '支持源代码和预览两种视图',
          '点击预览中的链接可复制链接地址',
          '使用towxml库进行解析和渲染'
        ]
      },
      'html': {
        title: 'HTML格式化说明',
        items: [
          'HTML（超文本标记语言）用于创建网页',
          '支持格式化、压缩、验证等操作',
          '支持源代码和预览两种视图',
          '自动缩进和标签对齐',
          '使用towxml库进行解析和渲染'
        ]
      }
    };
    
    const info = helpData[type] || helpData['json'];
    this.setData({
      helpTitle: info.title,
      helpItems: info.items
    });
  },

  // 切换格式化类型
  changeFormatType: function(e) {
    if (!e || !e.detail) {
      console.error('changeFormatType: 事件对象或detail为空');
      return;
    }
    
    const index = e.detail.value;
    const selectedType = this.data.formatTypes[index];
    
    console.log('切换格式化类型:', index, selectedType);
    
    this.setData({
      formatTypeIndex: index,
      currentFormatType: selectedType,
      resultText: '',
      processInfo: '',
      viewMode: 'source',
      previewNodes: []
    });
    
    // 更新帮助信息
    this.updateHelpInfo(selectedType.value);
  },

  // 切换视图模式
  changeViewMode: function(e) {
    if (!e) return;
    
    const mode = e.currentTarget ? e.currentTarget.dataset.mode : e.target.dataset.mode;
    console.log('切换视图模式:', mode);
    
    this.setData({ viewMode: mode });
    
    // 如果需要预览且还未生成预览节点，则生成
    if (mode === 'preview' && this.data.resultText && 
        (this.data.currentFormatType.value === 'markdown' || this.data.currentFormatType.value === 'html') && 
        this.data.previewNodes.length === 0) {
      this.generatePreview();
    }
  },

  // 生成预览
  generatePreview: function() {
    const { currentFormatType, resultText, towxml } = this.data;
    
    if (!resultText || !towxml) {
      console.log('无法生成预览：缺少结果文本或towxml实例');
      return;
    }
    
    console.log('生成预览，类型:', currentFormatType.value);
    
    try {
      let parsedData = null;
      
      if (currentFormatType.value === 'markdown') {
        parsedData = towxml.toMarkdown(resultText);
      } else if (currentFormatType.value === 'html') {
        parsedData = towxml.toHtml(resultText);
      }
      
      console.log('解析结果:', parsedData);
      
      if (parsedData && !parsedData.error) {
        const nodes = towxml.toWxml(parsedData);
        console.log('生成的节点:', nodes);
        this.setData({ previewNodes: nodes });
      } else {
        this.setData({ 
          previewNodes: [{ 
            name: 'view', 
            attrs: { class: 'error' }, 
            children: [{ 
              type: 'text', 
              text: parsedData?.error || '预览生成失败' 
            }] 
          }] 
        });
      }
    } catch (error) {
      console.error('生成预览失败:', error);
      this.setData({ 
        previewNodes: [{ 
          name: 'view', 
          attrs: { class: 'error' }, 
          children: [{ 
            type: 'text', 
            text: '预览生成失败: ' + error.message 
          }] 
        }] 
      });
    }
  },

  // 输入变化
  onInputChange: function(e) {
    const value = e.detail.value;
    console.log('输入变化，长度:', value.length);
    
    this.setData({
      inputText: value
    });
  },

  // 从剪贴板粘贴
  pasteFromClipboard: function() {
    wx.getClipboardData({
      success: (res) => {
        console.log('粘贴内容，长度:', res.data.length);
        
        this.setData({
          inputText: res.data
        });
        
        wx.showToast({
          title: '已粘贴',
          icon: 'success',
          duration: 1000
        });
      },
      fail: (err) => {
        console.error('粘贴失败:', err);
        wx.showToast({
          title: '粘贴失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 清空输入
  clearInput: function() {
    this.setData({
      inputText: '',
      resultText: '',
      processInfo: '',
      viewMode: 'source',
      previewNodes: []
    });
  },

  // 加载示例
  loadSample: function() {
    const { currentFormatType } = this.data;
    let sampleText = '';
    
    switch (currentFormatType.value) {
      case 'json':
        sampleText = JSON.stringify({
          name: "文本处理工具",
          version: "1.0.0",
          features: ["JSON格式化", "XML格式化", "YAML格式化", "Markdown格式化", "HTML格式化"],
          settings: {
            autoFormat: true,
            indent: 2,
            sortKeys: false
          },
          author: {
            name: "开发者",
            email: "dev@example.com"
          }
        }, null, 2);
        break;
        
      case 'xml':
        sampleText = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`;
        break;
        
      case 'yaml':
        sampleText = `# 用户信息
user:
  name: 张三
  age: 25
  email: zhangsan@example.com
  address:
    city: 北京
    street: 朝阳路
    zipcode: "100000"

# 技能列表
skills:
  - JavaScript
  - Python
  - Java
  - Go

# 项目经验
projects:
  - name: 文本处理工具
    description: 支持多种格式的文本处理工具
    tech: [Vue.js, Node.js, MongoDB]
    year: 2023`;
        break;
        
      case 'markdown':
        sampleText = `# Markdown 示例文档

## 二级标题
这是一个段落，包含**粗体**和*斜体*文本。

### 三级标题
- 无序列表项1
- 无序列表项2
- 无序列表项3

#### 代码示例
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}!\`;
}
\`\`\`

##### 表格示例
| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25  | 北京 |
| 李四 | 30  | 上海 |
| 王五 | 28  | 广州 |

[这是一个链接](https://example.com)
`;
        break;
        
      case 'html':
        sampleText = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示例页面</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { background: #f0f0f0; padding: 20px; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>欢迎使用文本处理工具</h1>
    </header>
    <main class="content">
      <p>这是一个HTML格式化示例。</p>
      <ul>
        <li>支持HTML格式化</li>
        <li>支持标签缩进</li>
        <li>支持属性对齐</li>
      </ul>
      <p>访问<a href="https://example.com">示例网站</a>获取更多信息。</p>
    </main>
  </div>
</body>
</html>`;
        break;
    }
    
    this.setData({
      inputText: sampleText
    });
    
    wx.showToast({
      title: '示例已加载',
      icon: 'success',
      duration: 1000
    });
  },

  // 切换选项
  toggleOption: function(e) {
    const value = e.detail.value;
    console.log('切换选项:', value);
    
    if (value.includes('sort')) {
      this.setData({
        sortKeys: value.includes('sort')
      });
    }
  },

  // 修改缩进
  changeIndent: function(e) {
    const index = e.detail.value;
    const spaces = parseInt(this.data.indentOptions[index]);
    
    console.log('修改缩进:', spaces);
    
    this.setData({
      indentIndex: index,
      indentSpaces: spaces
    });
  },

  // 处理文本
  processText: function() {
    const { inputText, currentFormatType, indentSpaces, sortKeys } = this.data;
    const formatType = currentFormatType.value;
    
    console.log('开始处理文本，类型:', formatType);
    
    if (!inputText.trim()) {
      wx.showToast({
        title: '请输入要处理的文本',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    this.setData({ 
      isProcessing: true,
      viewMode: 'source',
      previewNodes: []
    });
    
    // 显示加载
    wx.showLoading({
      title: '处理中...',
      mask: true
    });
    
    try {
      let result = '';
      let info = '';
      
      // 根据类型处理文本
      switch (formatType) {
        case 'json':
          result = textFormatter.formatJson(inputText, indentSpaces, sortKeys);
          info = result.error ? 'JSON解析失败' : 'JSON格式化成功';
          if (!result.error) {
            result = result.formatted;
          }
          break;
          
        case 'xml':
          result = textFormatter.formatXml(inputText, indentSpaces);
          info = result.error ? 'XML解析失败' : 'XML格式化成功';
          if (!result.error) {
            result = result.formatted;
          }
          break;
          
        case 'yaml':
          result = textFormatter.formatYaml(inputText, indentSpaces);
          info = result.error ? 'YAML解析失败' : 'YAML格式化成功';
          if (!result.error) {
            result = result.formatted;
          }
          break;
          
        case 'markdown':
          result = textFormatter.formatMarkdown(inputText);
          info = 'Markdown格式化成功';
          break;
          
        case 'html':
          result = textFormatter.formatHtml(inputText, indentSpaces);
          info = result.error ? 'HTML解析失败' : 'HTML格式化成功';
          if (!result.error) {
            result = result.formatted;
          }
          break;
      }
      
      // 处理错误
      if (typeof result === 'object' && result.error) {
        wx.hideLoading();
        this.setData({
          isProcessing: false,
          resultText: '',
          processInfo: result.error
        });
        
        wx.showToast({
          title: '处理失败',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      this.setData({
        isProcessing: false,
        resultText: result,
        processInfo: info
      });
      
      // 如果是Markdown或HTML，自动生成预览
      if (formatType === 'markdown' || formatType === 'html') {
        this.generatePreview();
      }
      
      // 保存到历史记录
      this.saveToHistory(inputText, currentFormatType.name, result, info);
      
      wx.hideLoading();
      wx.showToast({
        title: '处理完成',
        icon: 'success',
        duration: 1000
      });
      
    } catch (error) {
      console.error('处理错误:', error);
      wx.hideLoading();
      this.setData({
        isProcessing: false,
        resultText: '',
        processInfo: '处理失败: ' + error.message
      });
      
      wx.showToast({
        title: '处理失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 复制结果
  copyResult: function() {
    const { resultText } = this.data;
    
    if (!resultText) {
      wx.showToast({
        title: '无结果可复制',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    
    wx.setClipboardData({
      data: resultText,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1000
        });
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1000
        });
      }
    });
  },

  // 清空结果
  clearResult: function() {
    this.setData({
      resultText: '',
      processInfo: '',
      viewMode: 'source',
      previewNodes: []
    });
  },

  // 保存到历史记录
  saveToHistory: function(inputText, typeName, result, info) {
    if (!inputText || !result) return;
    
    // 生成预览文本
    const preview = inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText;
    
    const historyData = {
      type: typeName,
      input: inputText,
      result: result,
      preview: preview,
      info: info
    };
    
    app.saveHistory('text_history', historyData);
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory: function() {
    const history = app.getHistory('text_history') || [];
    console.log('加载的历史记录:', history.length, '条');
    this.setData({ history: history });
  },

  // 加载历史记录项
  loadHistoryItem: function(e) {
    if (!e) return;
    
    const index = e.currentTarget ? e.currentTarget.dataset.index : e.target.dataset.index;
    if (index === undefined) return;
    
    const history = this.data.history;
    
    if (history && history[index]) {
      const item = history[index].data;
      
      console.log('加载历史记录项:', item.type);
      
      // 查找对应的类型索引
      const typeIndex = this.data.formatTypes.findIndex(formatType => 
        formatType.name === item.type
      );
      
      if (typeIndex === -1) {
        // 如果没有找到对应的类型，使用默认的第一个类型
        this.setData({
          formatTypeIndex: 0,
          currentFormatType: this.data.formatTypes[0]
        });
      } else {
        this.setData({
          formatTypeIndex: typeIndex,
          currentFormatType: this.data.formatTypes[typeIndex]
        });
      }
      
      // 设置参数
      this.setData({
        inputText: item.input,
        resultText: item.result,
        processInfo: item.info || '',
        viewMode: 'source',
        previewNodes: []
      });
      
      // 更新帮助信息
      this.updateHelpInfo(this.data.currentFormatType.value);
      
      // 如果是Markdown或HTML，生成预览
      if (this.data.currentFormatType.value === 'markdown' || this.data.currentFormatType.value === 'html') {
        setTimeout(() => {
          this.generatePreview();
        }, 100);
      }
      
      wx.showToast({
        title: '已加载历史记录',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 清空历史记录
  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          app.clearHistory('text_history');
          this.setData({ history: [] });
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});