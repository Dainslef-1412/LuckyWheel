# 🌐 部署指南

## 快速部署到互联网

这个转盘应用是一个纯静态网站，可以免费部署到多个平台。

## 🚀 推荐部署方式

### 方案 1：Vercel（最简单）⭐

1. **构建项目**
```bash
npm run build
```

2. **部署到 Vercel**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录并部署
vercel
```

3. **或者使用 Vercel 网站**
- 访问 https://vercel.com/
- 连接你的 GitHub 仓库
- 自动部署，每次更新都会重新部署

**你的网站地址：** `https://你的项目名.vercel.app`

---

### 方案 2：Netlify（拖拽部署）

1. **构建项目**
```bash
npm run build
```

2. **部署到 Netlify**
- 访问 https://www.netlify.com/
- 注册/登录
- 直接拖拽 `dist/` 文件夹到页面
- 完成！

**你的网站地址：** `https://随机名字.netlify.app`

---

### 方案 3：GitHub Pages

1. **修改 package.json**
```json
{
  "homepage": "https://你的用户名.github.io/zhuanpan"
}
```

2. **安装并部署**
```bash
# 安装 gh-pages 工具
npm install -g gh-pages

# 构建项目
npm run build

# 部署到 GitHub Pages
gh-pages -d dist
```

3. **在 GitHub 仓库设置中**
- 进入 Settings → Pages
- Source 选择 gh-pages 分支
- 保存

**你的网站地址：** `https://你的用户名.github.io/zhuanpan`

---

### 方案 4：Cloudflare Pages

1. **访问 Cloudflare Pages**
- https://pages.cloudflare.com/

2. **连接 GitHub 仓库**
- 选择你的仓库
- 构建命令：`npm run build`
- 输出目录：`dist`
- 自动部署

**你的网站地址：** `https://你的项目名.pages.dev`

---

## 📝 部署前检查清单

- [ ] 运行 `npm run build` 构建项目
- [ ] 检查 `dist/` 文件夹是否生成
- [ ] 在本地测试：`npm run preview`
- [ ] 确认所有功能正常工作

## 🔧 常见问题

### Q: 需要服务器吗？
A: 不需要！这些都是静态网站托管，无需服务器。

### Q: 可以使用自定义域名吗？
A: 可以！所有平台都支持自定义域名配置。

### Q: 多少钱？
A: 这些方案都有免费套餐，完全够用。

### Q: 更新网站怎么办？
A: 重新构建并部署即可，或者连接 GitHub 自动部署。

## 🎯 推荐选择

- **最简单**: Vercel（一键部署，自动 HTTPS）
- **最快速**: Cloudflare Pages（全球 CDN 最快）
- **最灵活**: Netlify（支持拖拽部署）
- **开发者友好**: GitHub Pages（与代码仓库集成）

## 🌐 部署后

部署完成后，你会得到一个公网 URL，可以：
- 分享给任何人使用
- 在社交媒体上分享
- 嵌入到其他网站
- 二维码分享给手机用户

祝你部署顺利！🎉
