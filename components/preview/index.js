Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 节点数据
    nodes: {
      type: Array,
      value: [],
      observer: function(newVal) {
        this.handleNodesChange(newVal);
      }
    },
    
    // 预览类型：markdown, html
    type: {
      type: String,
      value: 'markdown',
      observer: function(newVal) {
        this.updatePreviewClass(newVal);
      }
    },
    
    // 空状态文本
    emptyText: {
      type: String,
      value: '暂无预览内容'
    },
    
    // 错误信息
    error: {
      type: String,
      value: ''
    },
    
    // 是否显示加载状态
    loading: {
      type: Boolean,
      value: false
    },
    
    // 加载文本
    loadingText: {
      type: String,
      value: '正在加载...'
    },
    
    // 是否启用链接点击事件
    enableLinkTap: {
      type: Boolean,
      value: true
    },
    
    // 是否启用图片点击事件
    enableImageTap: {
      type: Boolean,
      value: true
    },
    
    // 最大高度（单位：rpx），0表示不限制
    maxHeight: {
      type: Number,
      value: 0
    },
    
    // 是否显示边框
    showBorder: {
      type: Boolean,
      value: false
    },
    
    // 背景颜色
    backgroundColor: {
      type: String,
      value: ''
    },
    
    // 内边距（单位：rpx）
    padding: {
      type: Number,
      value: 20
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 处理后的节点数据
    processedNodes: [],
    // 预览类名
    previewClass: 'markdown-preview',
    // 容器样式
    containerStyle: '',
    // 内容样式
    contentStyle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理节点数据变化
     */
    handleNodesChange: function(nodes) {
      if (!nodes || !Array.isArray(nodes)) {
        this.setData({ processedNodes: [] });
        return;
      }
      
      // 处理节点数据
      const processedNodes = this.processNodes(nodes);
      this.setData({ processedNodes: processedNodes });
    },
    
    /**
     * 处理节点数据
     */
    processNodes: function(nodes) {
      try {
        // 深拷贝节点数据
        const processedNodes = JSON.parse(JSON.stringify(nodes));
        
        // 处理节点样式和事件
        this.addNodeStyles(processedNodes);
        this.addNodeEvents(processedNodes);
        
        return processedNodes;
      } catch (error) {
        console.error('处理节点数据失败:', error);
        return nodes;
      }
    },
    
    /**
     * 添加节点样式
     */
    addNodeStyles: function(nodes) {
      if (!nodes || !Array.isArray(nodes)) return;
      
      for (const node of nodes) {
        if (!node.attrs) {
          node.attrs = {};
        }
        
        // 添加基础样式类
        if (node.attrs.class) {
          node.attrs.class += ' ' + this.data.previewClass;
        } else {
          node.attrs.class = this.data.previewClass;
        }
        
        // 处理特殊节点的样式
        this.addSpecialNodeStyles(node);
        
        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
          this.addNodeStyles(node.children);
        }
      }
    },
    
    /**
     * 添加特殊节点样式
     */
    addSpecialNodeStyles: function(node) {
      if (!node.attrs) return;
      
      // 链接样式
      if (node.name === 'a' || node.attrs.class?.includes('link')) {
        node.attrs.class += ' link';
        node.attrs['data-type'] = 'link';
        if (node.attrs.href) {
          node.attrs['data-href'] = node.attrs.href;
        }
      }
      
      // 图片样式
      if (node.name === 'img' || node.attrs.class?.includes('image')) {
        node.attrs.class += ' image';
        node.attrs['data-type'] = 'image';
        node.attrs.mode = node.attrs.mode || 'widthFix';
      }
      
      // 代码块样式
      if (node.attrs.class?.includes('code-block') || node.attrs.class?.includes('pre')) {
        node.attrs.class += ' code-block';
      }
      
      // 表格样式
      if (node.name === 'table' || node.attrs.class?.includes('table')) {
        node.attrs.class += ' table';
      }
    },
    
    /**
     * 添加节点事件
     */
    addNodeEvents: function(nodes) {
      if (!nodes || !Array.isArray(nodes)) return;
      
      for (const node of nodes) {
        // 添加点击事件标识
        if (node.name === 'a' || node.attrs?.class?.includes('link')) {
          node.attrs['data-event'] = 'link';
        }
        
        if (node.name === 'img' || node.attrs?.class?.includes('image')) {
          node.attrs['data-event'] = 'image';
        }
        
        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
          this.addNodeEvents(node.children);
        }
      }
    },
    
    /**
     * 更新预览类名
     */
    updatePreviewClass: function(type) {
      const previewClass = type === 'html' ? 'html-preview' : 'markdown-preview';
      this.setData({ previewClass: previewClass });
    },
    
    /**
     * 更新容器样式
     */
    updateContainerStyle: function() {
      let style = '';
      
      // 设置最大高度
      if (this.data.maxHeight > 0) {
        style += `max-height: ${this.data.maxHeight}rpx; overflow-y: auto; `;
      }
      
      // 设置边框
      if (this.data.showBorder) {
        style += 'border: 1rpx solid #eaeaea; border-radius: 8rpx; ';
      }
      
      // 设置背景颜色
      if (this.data.backgroundColor) {
        style += `background-color: ${this.data.backgroundColor}; `;
      }
      
      this.setData({ containerStyle: style });
    },
    
    /**
     * 更新内容样式
     */
    updateContentStyle: function() {
      if (this.data.padding > 0) {
        this.setData({ 
          contentStyle: `padding: ${this.data.padding}rpx;` 
        });
      }
    },
    
    /**
     * 节点点击事件
     */
    onNodeTap: function(e) {
      const { dataset } = e.currentTarget;
      
      if (!dataset) return;
      
      const { type, href, src, alt } = dataset;
      
      // 触发自定义事件
      this.triggerEvent('nodetap', {
        type: type,
        href: href,
        src: src,
        alt: alt,
        dataset: dataset
      });
      
      // 处理链接点击
      if (type === 'link' && href && this.data.enableLinkTap) {
        this.handleLinkTap(href);
      }
      
      // 处理图片点击
      if (type === 'image' && src && this.data.enableImageTap) {
        this.handleImageTap(src, alt);
      }
    },
    
    /**
     * 处理链接点击
     */
    handleLinkTap: function(href) {
      if (!href || href === '#') return;
      
      // 触发链接点击事件
      this.triggerEvent('linktap', {
        href: href
      });
      
      // 这里可以添加更多处理逻辑，比如跳转页面等
    },
    
    /**
     * 处理图片点击
     */
    handleImageTap: function(src, alt) {
      if (!src) return;
      
      // 触发图片点击事件
      this.triggerEvent('imagetap', {
        src: src,
        alt: alt || ''
      });
      
      // 这里可以添加图片预览功能
      this.previewImage(src, alt);
    },
    
    /**
     * 预览图片
     */
    previewImage: function(src, alt) {
      if (!src) return;
      
      wx.previewImage({
        current: src,
        urls: [src],
        success: () => {
          console.log('图片预览成功');
        },
        fail: (err) => {
          console.error('图片预览失败:', err);
        }
      });
    },
    
    /**
     * 重新加载节点
     */
    reload: function() {
      this.handleNodesChange(this.data.nodes);
    },
    
    /**
     * 清空节点
     */
    clear: function() {
      this.setData({ processedNodes: [] });
    },
    
    /**
     * 设置错误信息
     */
    setError: function(error) {
      this.setData({ error: error });
    },
    
    /**
     * 清除错误信息
     */
    clearError: function() {
      this.setData({ error: '' });
    },
    
    /**
     * 开始加载
     */
    startLoading: function(loadingText) {
      this.setData({ 
        loading: true,
        loadingText: loadingText || '正在加载...'
      });
    },
    
    /**
     * 结束加载
     */
    stopLoading: function() {
      this.setData({ loading: false });
    },
    
    /**
     * 获取节点数量
     */
    getNodeCount: function() {
      return this.data.processedNodes?.length || 0;
    },
    
    /**
     * 获取预览文本
     */
    getPreviewText: function() {
      if (!this.data.processedNodes || this.data.processedNodes.length === 0) {
        return '';
      }
      
      // 提取文本内容
      let text = '';
      this.extractTextFromNodes(this.data.processedNodes, text);
      return text;
    },
    
    /**
     * 从节点中提取文本
     */
    extractTextFromNodes: function(nodes, text) {
      if (!nodes || !Array.isArray(nodes)) return;
      
      for (const node of nodes) {
        if (node.type === 'text' && node.text) {
          text += node.text + ' ';
        }
        
        if (node.children && Array.isArray(node.children)) {
          this.extractTextFromNodes(node.children, text);
        }
      }
    },
    
    /**
     * 导出为HTML
     */
    exportAsHtml: function() {
      if (!this.data.processedNodes || this.data.processedNodes.length === 0) {
        return '';
      }
      
      // 将节点转换为HTML字符串
      return this.nodesToHtml(this.data.processedNodes);
    },
    
    /**
     * 将节点转换为HTML
     */
    nodesToHtml: function(nodes) {
      if (!nodes || !Array.isArray(nodes)) return '';
      
      let html = '';
      
      for (const node of nodes) {
        if (node.type === 'text' && node.text) {
          html += node.text;
          continue;
        }
        
        const tagName = node.name || 'div';
        const attrs = this.nodeAttrsToHtml(node.attrs || {});
        
        html += `<${tagName}${attrs}>`;
        
        if (node.children && Array.isArray(node.children)) {
          html += this.nodesToHtml(node.children);
        }
        
        html += `</${tagName}>`;
      }
      
      return html;
    },
    
    /**
     * 将节点属性转换为HTML属性
     */
    nodeAttrsToHtml: function(attrs) {
      if (!attrs || typeof attrs !== 'object') return '';
      
      let attrStr = '';
      
      for (const [key, value] of Object.entries(attrs)) {
        // 跳过事件属性
        if (key.startsWith('data-event') || key.startsWith('bind')) {
          continue;
        }
        
        if (value === true) {
          attrStr += ` ${key}`;
        } else if (value !== false && value !== null && value !== undefined) {
          attrStr += ` ${key}="${String(value).replace(/"/g, '&quot;')}"`;
        }
      }
      
      return attrStr;
    }
  },

  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached: function() {
      // 组件实例进入页面节点树时执行
      console.log('preview 组件 attached');
      
      // 更新预览类名
      this.updatePreviewClass(this.data.type);
      
      // 更新样式
      this.updateContainerStyle();
      this.updateContentStyle();
      
      // 处理初始节点数据
      this.handleNodesChange(this.data.nodes);
    },
    
    ready: function() {
      // 组件布局完成后执行
      console.log('preview 组件 ready');
    },
    
    detached: function() {
      // 组件实例从页面节点树移除时执行
      console.log('preview 组件 detached');
    }
  },

  /**
   * 页面生命周期函数
   */
  pageLifetimes: {
    show: function() {
      // 页面被展示时执行
    },
    
    hide: function() {
      // 页面被隐藏时执行
    },
    
    resize: function(size) {
      // 页面尺寸变化时执行
    }
  },

  /**
   * 组件选项
   */
  options: {
    // 启用多slot支持
    multipleSlots: true,
    
    // 样式隔离
    styleIsolation: 'apply-shared',
    
    // 纯数据字段
    pureDataPattern: /^_/
  }
});