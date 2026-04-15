# 🎡 转盘生成器 (Wheel Generator)

一个单文件离线自定义转盘生成器，允许用户创建带有权重选项的转盘，并导出为独立的 HTML 文件。

## ✨ 特性

- **实时预览**：编辑时实时查看转盘变化
- **权重系统**：支持为每个选项设置权重
- **多主题**：内置 5 种精美主题（森林、海洋、夕阳、浆果、清新）
- **单文件导出**：导出的 HTML 文件完全离线可用
- **可二次编辑**：导出的文件支持再次编辑和重新导出
- **响应式设计**：完美支持移动端和桌面端

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 📖 使用说明

### 编辑器模式

1. **设置标题**：输入转盘的主题文字
2. **选择主题**：从 5 种预设主题中选择
3. **添加选项**：
   - 点击 "+ 添加选项" 按钮添加新选项
   - 为每个选项设置标签和权重
   - 点击 "×" 按钮删除选项
4. **实时预览**：右侧会实时显示转盘预览
5. **导出文件**：点击 "生成转盘文件" 下载独立的 HTML 文件

### 游玩模式

1. 点击 "开始旋转" 按钮开始旋转
2. 转盘会根据权重随机选择一个选项
3. 旋转完成后显示中奖结果
4. 可点击 "编辑" 按钮修改配置

## 🎯 核心功能

### SVG 渲染

使用原生 SVG 绘制转盘扇区，通过数学计算精确控制每个扇区的角度和位置。

### 加权随机

根据选项权重进行随机选择，确保权重高的选项有更大的选中概率。

### 物理动画

使用 CSS cubic-bezier 实现流畅的减速动画效果。

### 单文件导出

将所有 CSS、JavaScript 和配置打包到一个 HTML 文件中，无需任何外部依赖。

## 📁 项目结构

```
zhuanpan/
├── index.html              # 主页面（编辑器）
├── template.html           # 导出模板
├── src/
│   ├── main.js             # 应用入口
│   ├── utils.js            # 工具函数
│   ├── themes.js           # 主题系统
│   ├── wheel.js            # 转盘渲染
│   ├── spin.js             # 旋转动画
│   ├── export.js           # 导出功能
│   ├── standalone.js       # 独立文件逻辑
│   └── export-styles.css   # 导出样式
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 主题

项目内置 5 种主题：

- **森林**：绿色系，自然清新
- **海洋**：蓝色系，深邃宁静
- **夕阳**：暖色系，活力四射
- **浆果**：紫红系，优雅神秘
- **清新**：多彩系，明快活泼

## 🔧 技术栈

- **Vite**：构建工具
- **Vanilla JavaScript**：无框架依赖
- **SVG**：图形渲染
- **CSS Variables**：主题系统

## 📝 开发指南

### 添加新主题

在 `src/themes.js` 中添加新主题配置：

```javascript
export const THEMES = {
    // ... 现有主题
    myTheme: {
        name: '我的主题',
        colors: ['#color1', '#color2', '#color3', '#color4', '#color5'],
        background: '#bg-color',
        text: '#text-color',
        accent: '#accent-color'
    }
};
```

### 修改动画参数

在 `src/spin.js` 中调整旋转参数：

```javascript
{
    spins: 5,        // 旋转圈数
    duration: 4000,  // 动画时长（毫秒）
    easing: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)' // 缓动函数
}
```

## 🌐 浏览器支持

- Chrome / Edge (最新版)
- Safari (最新版)
- Firefox (最新版)
- 移动端浏览器

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
