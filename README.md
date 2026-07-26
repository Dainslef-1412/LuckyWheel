# 转盘生成器 (LuckyWheel)

一个纯静态的自定义转盘工具。用户可以编辑转盘标题、选项、权重和主题，在页面内直接旋转、保存预设，并生成分享链接。

## 文档分工

- [SPEC.md](./SPEC.md)：产品真相，描述功能范围、交互流程、算法和验收重点。
- [DATA_DESIGN.md](./DATA_DESIGN.md)：数据真相，描述配置对象、URL 状态、localStorage 和兼容规则。
- [TECH_DESIGN.md](./TECH_DESIGN.md)：技术真相，描述静态架构、模块职责、构建和部署约束。
- [TEST_PLAN.md](./TEST_PLAN.md)：验证真相，描述构建检查和手工验收清单。
- [PROJECT_LAYOUT.md](./PROJECT_LAYOUT.md)：目录真相，描述当前项目结构与标准代码项目结构的映射。
- [AGENTS.md](./AGENTS.md)：Agent 执行入口，详细开发规范保存在 [docs/agent-development-guidelines.md](./docs/agent-development-guidelines.md)。
- [docs/tech/deployment.md](./docs/tech/deployment.md)：部署指南。

## 目录结构

```text
.
├── src/                  # 浏览器应用代码
├── docs/                 # 详细工程、部署和交付文档
├── outputs/              # 生成的部署包和可再生成产物
├── SPEC.md
├── DATA_DESIGN.md
├── TECH_DESIGN.md
├── TEST_PLAN.md
├── PROJECT_LAYOUT.md
├── AGENTS.md
├── index.html
├── package.json
└── vite.config.js
```

## 当前功能

- 实时预览转盘配置。
- 支持选项增删、标签编辑和正整数权重。
- 内置森林、海洋、夕阳、浆果、清新主题。
- 使用 SVG 绘制扇区，通过权重计算角度。
- 使用加权随机选择中奖项。
- 支持本地预设保存、复制、重命名、删除。
- 支持将当前配置编码到 URL 分享。
- 可作为纯静态网站部署。

## 本地命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

开发模式默认访问 `http://localhost:5173`。生产构建输出到 `dist/`，生成的部署包或压缩产物放入 `outputs/`。

## 技术栈

- Vite
- Vanilla JavaScript
- SVG
- CSS Variables
- Browser localStorage

## 下一步

- 为权重随机、扇区角度、URL 编解码和预设持久化补单元测试。
- 补桌面和移动端的手工视觉回归清单。
- 在改变配置结构前确认分享链接兼容策略。
