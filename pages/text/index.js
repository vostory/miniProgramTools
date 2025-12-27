const app = getApp();
const textFormatter = require('../../utils/textFormatter.js');

Page({
  data: {
    theme: 'light',
    // 格式化类型
    formatType: 'json',
    // 输入文本
    inputText: '',
    maxLength: 5000,
    // 处理结果
    resultText: '',
    processInfo: '',
    isProcessing: false,
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
  },

  goBack: function() {
    wx.navigateBack();
  },

  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 加载帮助信息
  loadHelpInfo: function() {
    const { formatType } = this.data;
    this.updateHelpInfo(formatType);
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
          '自动美化Markdown语法',
          '支持GFM（GitHub Flavored Markdown）扩展'
        ]
      },
      'html': {
        title: 'HTML格式化说明',
        items: [
          'HTML（超文本标记语言）用于创建网页',
          '支持格式化、压缩、验证等操作',
          '自动缩进和标签对齐',
          '保留内联样式和脚本'
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
    if (!e) return;
    
    const type = e.currentTarget ? e.currentTarget.dataset.type : e.target.dataset.type;
    console.log('切换格式化类型:', type);
    
    this.setData({
      formatType: type,
      resultText: '',
      processInfo: ''
    });
    
    // 更新帮助信息
    this.updateHelpInfo(type);
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
      processInfo: ''
    });
  },

  // 加载示例
  loadSample: function() {
    const { formatType } = this.data;
    let sampleText = '';
    
    switch (formatType) {
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
    const { inputText, formatType, indentSpaces, sortKeys } = this.data;
    
    console.log('开始处理文本，类型:', formatType);
    
    if (!inputText.trim()) {
      wx.showToast({
        title: '请输入要处理的文本',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    this.setData({ isProcessing: true });
    
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
      
      // 保存到历史记录
      this.saveToHistory(inputText, formatType, result, info);
      
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
      processInfo: ''
    });
  },

  // 保存到历史记录
  saveToHistory: function(inputText, type, result, info) {
    if (!inputText || !result) return;
    
    // 生成预览文本
    const preview = inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText;
    
    const historyData = {
      type: type,
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
      
      // 设置参数
      this.setData({
        formatType: item.type,
        inputText: item.input,
        resultText: item.result,
        processInfo: item.info || ''
      });
      
      // 更新帮助信息
      this.updateHelpInfo(item.type);
      
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