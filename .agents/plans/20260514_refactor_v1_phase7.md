# Phase 7：收尾

## 目标

完成重构后的清理工作：全量测试验证、代码质量检查、构建验证、开发环境测试、文档更新、变更日志编写。

---

## 一、任务清单

### 1.1 全量测试

```bash
pnpm test -- --run
```

覆盖范围：

| 测试目录 | 测试文件 | 验证内容 |
|---------|---------|---------|
| `tests/stores/` | `config.test.ts` | 配置 CRUD、reset、旧版数据清理 |
| `tests/services/` | `sourceManager.test.ts` | 三种源扫描、扩展名过滤、平台降级、随机选取 |
| `tests/services/` | `bgRender.test.ts` | 渲染 URL 构建、video/canvas 元素创建、opacity/blur/position 应用 |
| `tests/utils/` | `api.test.ts` | 思源内核 API 封装调用链 |
| `tests/utils/` | `fs.test.ts` | `isDesktop()` 检测、`require('fs/promises')` shim 降级 |
| `tests/utils/` | `theme.test.ts` | 主题变更检测、MutationObserver 逻辑 |
| `tests/ui/` | `topbar.test.ts` | 菜单结构渲染、desktop/mobile 菜单项差异 |
| `tests/ui/` | `settings.test.ts` | tab 导航、表单控件双向绑定 |
| `tests/ui/sources/` | `source-list.test.ts` | 源树渲染、文件操作按钮、悬浮预览 |

通过标准：所有测试用例 pass，无 skip。

### 1.2 Lint / 类型检查

```bash
pnpm lint
pnpm exec tsc --noEmit
```

检查项：
- 无 `any` 类型逃逸（`src/utils/fs.ts` 的平台检测 `(window as any).require` 是唯一例外，需在 lint 规则中加 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 注释）
- 无未使用的 import
- 无未使用的变量（`_` 前缀除外）
- 无 dead code

### 1.3 构建验证

```bash
pnpm build
```

验证 `dist/` 输出结构：

```
dist/
├── icon.png                          # 160×160
├── preview.png                       # 1024×768
├── plugin.json                       # 完整清单
├── README.md                         # 中文版
├── README_en_US.md                   # 英文版
├── i18n/                             # 多语言文件
│   ├── en_US.json
│   ├── zh_CN.json
│   └── ...
├── index.js                          # CJS 入口（Vite lib mode build）
└── index.css                         # 样式
```

验证项：
- `plugin.json` 中 `version` 已更新为 `1.0.0`
- `plugin.json` 中 `minAppVersion` ≥ `3.1.20`
- `dist/` 不包含 `node_modules/`、测试文件、源码 SourceMap
- 总包体积 < 2MB（不含 `node_modules`）

### 1.4 开发环境安装验证

```bash
pnpm make-link
```

此命令将 `dist/` 符号链接到思源插件 dev 目录。启动思源后验证：
- 插件在集市中显示「已安装」
- 插件加载无报错（Console 无红色错误）
- 顶栏菜单正常渲染
- 设置面板可打开

### 1.5 手动测试清单

见 [§二、测试矩阵](#二测试矩阵)。

### 1.6 清理未使用的依赖

从 `package.json` 移除以下依赖（Phase 1-6 重构后不再需要）：

| 依赖 | 类别 | 原因 |
|------|------|------|
| `ts-md5` | dependencies | Phase 2 已替换为文件名去重 |
| `install` | dependencies | 无用依赖 |
| `webpack` / `webpack-cli` | devDependencies | Phase 1 已迁移到 Vite |
| `esbuild-loader` | devDependencies | 替换为 Vite |
| `copy-webpack-plugin` | devDependencies | 替换为 `vite-plugin-static-copy` |
| `css-loader` | devDependencies | 替换为 Vite CSS 处理 |
| `sass` / `sass-loader` | devDependencies | 替换为 Vite + svelte-preprocess |
| `mini-css-extract-plugin` | devDependencies | 替换为 Vite |
| `zip-webpack-plugin` | devDependencies | 替换为 Vite 打包方案 |
| `fs-extra` | devDependencies | 替换为 `fs/promises`（Node 18+ 内置） |
| `siyuan` (0.7.4) | devDependencies | 升级到 `siyuan` ≥ 1.1.2 |
| `@types/wicg-file-system-access` | devDependencies | 未使用 |

确保 `dependencies` 块为空（或仅保留 Svelte 运行时依赖），`devDependencies` 只保留 Vite、Svelte、TypeScript、Vitest、ESLint 相关。

### 1.7 更新 README.md / README_en_US.md

**中文版 README.md** 内容更新：

- 特性列表替换为新版本功能：
  - 桌面端本地文件夹直读（`file:///` 渲染）
  - 思源 assets 子文件夹引用
  - 多源混合随机池（local / upload / assets）
  - 视频背景支持（.mp4 / .webm / .ogg / .mov）
  - URL 在线图片/视频下载
  - 按主题禁用
  - 透明度 / 模糊 / 位置偏移控制
  - 自动刷新定时器
- 实现思路更新：从 `<canvas>` 升级到 `<canvas> + <video>` 双元素
- 更新日志追加 v1.0.0 条目（日期）
- 致谢部分保持不变

**英文版 README_en_US.md** 同步更新翻译。

### 1.8 编写 CHANGELOG.md

新建 `CHANGELOG.md`，格式遵循 [Keep a Changelog](https://keepachangelog.com/)：

```markdown
# Changelog

## [1.0.0] - 本日日期

### 新增
- 桌面端本地文件夹直读（file:/// 渲染，零上传）
- 思源 assets 子文件夹引用（避免双倍存储）
- 视频背景支持（.mp4/.webm/.ogg/.mov）
- URL 在线图片/视频下载
- 三源统一随机池管理
- 图片/视频类型过滤

### 变更
- 构建工具由 webpack 迁移到 Vite 5
- UI 框架由纯 TS+HTML 迁移到 Svelte 5
- 配置存储由 `plugin.saveData()` 迁移到 `localStorageVal()` API
- 图片渲染由单 canvas 升级到 canvas+video 双模式
- 移除 `sizeMode`，统一使用 `cover`
- 移除 ts-md5 依赖，改为文件名去重

### 移除
- Live2D 桩代码
- Bug 报告弹窗
- Demo 图片
- 旧版迁移逻辑
- 云同步配置

### 修复
- API `/api/storage/setLocalStorage` 废弃警告（迁移到 `setLocalStorageVal`）
- 重置配置不清除旧版余留数据
```

### 1.9 Git 检查清单

```bash
# 确认无意外文件入库
git status

# .gitignore 应包含以下条目
node_modules
dist
.eslintcache
*.zip

# 在重构结束时，以下引用目录应保留在 .gitignore 中
.agents/references/siyuan/
.agents/references/siyuan-plugin-background-cover/
.agents/references/plugin-sample/
.agents/references/plugin-sample-vite-svelte/
.agents/references/petal/
.agents/references/vscode-background-cover/

# 以下旧项目文件已移除，确认清理
#   webpack.config.js
#   .eslintrc.js
#   不再有 sass/scss 源文件
```

确认：
- 工作区干净（无意外 untracked 文件）
- `node_modules/` 和 `dist/` 被忽略
- 无 `.env`、密钥文件入库
- `package-lock.json` 不存在（使用 pnpm，只有 `pnpm-lock.yaml`）

---

## 二、测试矩阵

### 2.1 测试前置条件

| 平台 | 运行环境 | `require('fs/promises')` | `file:///` | 测试环境 |
|------|---------|------------|-----------|---------|
| Desktop (Electron) | Electron + Node.js | ✅ | ✅ | 开发环境：思源桌面版 |
| Mobile (Android/iOS) | 原生 WebView | ❌ | ❌ | 真机 + 思源 App |
| Browser-Desktop | 浏览器宽屏 | ❌ | ❌ | Chrome DevTools 移动模拟 |
| Browser-Mobile | 浏览器窄屏 | ❌ | ❌ | Chrome DevTools 移动模拟 |

### 2.2 Desktop (Electron) 测试项

| # | 测试项 | 操作 | 预期结果 |
|---|--------|------|---------|
| D1 | 添加本地文件夹 | 顶栏菜单 → 添加本地目录 → 输入绝对路径 | 文件夹出现在源列表中，图片被枚举并加入随机池 |
| D2 | 上传文件 | 顶栏菜单 → 上传多张本地文件 → 选择图片 | 文件出现在插件缓存分区中 |
| D3 | 从本地目录上传 | 顶栏菜单 → 从本地目录中上传 → 选择文件夹 | 文件夹内所有图片被上传到缓存 |
| D4 | 添加 assets 目录 | 顶栏菜单 → 添加 assets 中的目录 → 勾选子文件夹 | 子文件夹出现在源列表中 |
| D5 | 添加 URL | 顶栏菜单 → 上传一张 URL → 输入 https 图片链接 | 预览显示后确认，文件下载到缓存 |
| D6 | 随机切换 | 顶栏菜单 → 随机换一张 / 快捷键 | 背景立即更换，不重复当前图片 |
| D7 | 透明度滑块 | 设置面板 → 全局设置 → 拖动透明度 | `body` opacity 实时变化 |
| D8 | 模糊滑块 | 设置面板 → 全局设置 → 拖动模糊 | canvas/video `filter: blur()` 实时变化 |
| D9 | X/Y 位置 | 设置面板 → 全局设置 → 拖动位置滑块 | 图片 background-position / 视频 object-position 更新 |
| D10 | 按主题禁用 | 设置面板 → 屏蔽主题 → 勾选某主题 → 切换到该主题 | 背景隐藏，切回其他主题时恢复 |
| D11 | 自动刷新 | 设置面板 → 全局设置 → 启用自动刷新 → 设 1 分钟 | 1 分钟后自动切换背景 |
| D12 | 快捷键 | 各快捷键组合 | 功能触发正确 |
| D13 | 本地文件夹路径失效 | 源列表中某 local 源路径改为不可访问 | 源行变灰，仅 [✕ 移除] 可用 |
| D14 | 视频背景渲染 | 源中含 .mp4 文件，随机选中视频 | `<video>` 元素创建，autoplay + loop + muted |
| D15 | 悬浮缩略图预览 | 源列表中鼠标悬浮文件名 | 显示缩略图浮层 |

### 2.3 Mobile / Tablet 测试项

| # | 测试项 | 操作 | 预期结果 |
|---|--------|------|---------|
| M1 | 本地文件夹选项隐藏 | 打开顶栏菜单 | 「添加本地目录」不显示 |
| M2 | `require('fs/promises')` 降级 | Console 日志 | 非 dev 模式无输出，`isDesktop()` 返回 false |
| M3 | 上传文件 | 顶栏菜单 → 上传多张本地文件 | 文件上传到缓存，正常加入随机池 |
| M4 | 添加 URL | 顶栏菜单 → 上传一张 URL → 输入链接 | 图片下载到缓存 |
| M5 | 添加 assets 目录 | 顶栏菜单 → 添加 assets 中的目录 | 子文件夹树正常显示 |
| M6 | 随机切换 | 随机换一张 | 背景立即更换 |
| M7 | 透明度/模糊/位置滑块 | 设置面板调节 | 实时生效 |
| M8 | 插件开关 | 关闭插件 → 打开插件 | 背景消失/恢复 |
| M9 | 视频背景 | 随机选中视频文件 | `<video>` 正常播放 |

### 2.4 Browser-Desktop / Browser-Mobile 测试项

| # | 测试项 | 操作 | 预期结果 |
|---|--------|------|---------|
| B1 | `local` 功能隐藏 | 打开顶栏菜单 | 所有本地文件夹相关选项不显示 |
| B2 | upload 源正常 | 上传文件 / 添加 URL | 正常上传，随机池可用 |
| B3 | assets 源正常 | 添加 assets 子文件夹 | 正常枚举 |
| B4 | 基本控制 | 透明度/模糊/位置/随机/禁用 | 全部正常 |

---

## 三、已知限制（需写入 README 和 CHANGELOG）

| # | 限制 | 范围 | 说明 |
|---|------|------|------|
| 1 | 视频不支持位置偏移 | 视频背景 | video 元素的 `object-position` 在 `object-fit: cover` 下行为不一致，暂不提供 X/Y 偏移 |
| 2 | `file:///` 仅桌面端可用 | 本地文件夹 | 移动端/浏览器端无 Node.js 运行时，无法读取本地文件系统 |
| 3 | 本地文件夹仅 Electron 端可用 | 本地文件夹 | 同限制 2 |
| 4 | URL 下载依赖网络 | URL 功能 | 离线环境下 URL 图片/视频不可用 |
| 5 | assets 子文件夹过多时首次加载可能慢 | assets 源 | 用户勾选数万文件的大子文件夹时扫描耗时，建议分散到小文件夹 |
| 6 | 跨设备不共享配置 | 配置 | `localStorageVal` 存储的配置各设备独立，需在每个设备上分别配置 |
| 7 | 视频解码开销 | 视频背景 | 低性能设备（老旧手机）播放视频背景可能导致卡顿 |

---

## 四、完成标准

- [ ] `pnpm test -- --run` 全量通过，0 失败
- [ ] `pnpm lint` 无错误
- [ ] `pnpm exec tsc --noEmit` 无类型错误
- [ ] `pnpm build` 成功，`dist/` 结构正确
- [ ] `pnpm make-link` 成功，思源中插件正常加载
- [ ] Desktop 手动测试 15 项全部通过
- [ ] Mobile 手动测试 9 项全部通过
- [ ] Browser 测试 4 项全部通过
- [ ] `package.json` 无未使用依赖
- [ ] `README.md` / `README_en_US.md` 已更新
- [ ] `CHANGELOG.md` 已编写
- [ ] `plugin.json` version 更新为 `1.0.0`
- [ ] `.gitignore` 条目正确
- [ ] 工作区干净，无意外文件
