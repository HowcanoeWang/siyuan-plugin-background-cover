### 设计约定

| 目录 | 职责 | 原则 |
|------|------|------|
| `src/` 根 | 入口、类型、常量 | 仅保留全局共用的顶层文件 |
| `src/libs/` | 框架级基础件 | 通用封装，不依赖本插件业务逻辑（SettingUtils、dialog） |
| `src/utils/` | 业务领域工具 | 依赖本插件业务上下文（api、theme） |
| `src/stores/` | 状态管理 | 单例 store，管理配置和运行时状态 |
| `src/services/` | 核心服务 | 背景渲染引擎、图片源管理 |
| `src/ui/` | Svelte 组件 | 所有视图层，含组件内联的对话框调用 |

#### 静态资源

| 文件 | 位置 | 构建处理 |
|------|------|---------|
| `icon.png` | 项目根 | `viteStaticCopy` → `dist/` |
| `preview.png` | 项目根 | `viteStaticCopy` → `dist/` |
| `README*.md` | 项目根 | `viteStaticCopy` → `dist/` |
| `plugin.json` | 项目根 | `viteStaticCopy` → `dist/` |
| i18n JSON | `public/i18n/` | Vite 自动 → `dist/i18n/` |


#### i18n 机制

确保UI中的文本内容使用下面的i18n键进行国际化，支持多语言环境，不要硬编码文本：

| 环节 | 说明 |
|------|------|
| 源文件 | `public/i18n/<lang>.json`，扁平 JSON 键值对 |
| 构建 | Vite 自动将 `public/` 内容输出到 `dist/`（`i18n/` 子目录） |
| 运行时 | 思源自动读 `i18n/` 目录注入 `this.i18n`，无需手动加载 |
| 代码中使用 | `this.i18n.keyName` 直接访问，支持 `${var}` 模板插值 |
| 命令快捷键显示 | `addCommand({ langKey: "selectManual", hotkey: "⇧⌘F6" })` |
| plugin.json | `displayName` / `description` / `readme` 字段支持 `{ "default": "...", "zh_CN": "..." }` |


```
siyuan-plugin-background-cover/        # 项目根
├── plugin.json                        # 插件清单（displayName/desc 支持 i18n）
├── package.json                       # npm 依赖与脚本
├── tsconfig.json                      # TypeScript 配置
├── tsconfig.node.json                 # Vite 配置的 TS 类型
├── svelte.config.js                   # Svelte 预处理器
├── vite.config.ts                     # Vite 构建配置
│
├── icon.png                           # 集市图标 (160×160)
├── preview.png                        # 集市预览图 (1024×768)
├── README.md                          # 默认 README (中文)
├── README_en_US.md                    # 英文 README
│
├── scripts/                           # 开发辅助脚本
│   ├── copy2dev.js                   # 构建后自动复制到思源插件目录（开发时使用）
│   └── readme.md                     # 说明如何配置环境变量，让buildd后的文件自动复制到思源插件目录进行测试
│
├── public/                            # Vite 静态资源（构建时自动处理或 viteStaticCopy）
│   └── i18n/                          #   多语言翻译（运行时由思源自动注入 this.i18n）
│       ├── en_US.json                 #     英文
│       ├── zh_CN.json                 #     简体中文
│       └── ...
│
└── src/                               # 源代码
    ├── index.ts                       #   插件入口 (< 100行)
    ├── types.ts                       #   类型定义
    ├── constants.ts                   #   全局常量（包名、路径、图标 SVG、扩展名过滤等）
    │
    ├── libs/                          #   框架级基础件（无业务依赖）
    │   ├── setting-utils.ts           #     官方 Setting 面板工具类封装
    │   └── dialog.ts                  #     svelteDialog / confirmDialog 通用封装
    │
    ├── utils/                         #   业务领域工具（依赖本插件上下文）
    │   ├── api.ts                     #     思源内核 API 封装
    │   ├── fs.ts                      #     window.require('fs/promises') 安全封装（desktop only，平台检测 + 降级）
    │   └── theme.ts                   #     主题检测
    │
    ├── stores/                        #   状态管理
    │   └── config.ts                  #     配置 store（单层 local.json，read/write/reset）
    │
    ├── services/                      #   核心服务
    │   ├── bgRender.ts                #     背景渲染引擎
    │   └── sourceManager.ts           #     图片源管理器（双路径：desktop/fallback）
    │
    └── ui/                            #   Svelte 5 视图组件
        ├── topbar.svelte              #     顶栏菜单
        ├── settings/
        │   ├── settings.svelte        #       设置面板（主容器）
        │   ├── config-tab.svelte      #       全局配置选项卡 
        │   ├── sources-tab.svelte     #       数据管理选项卡
        │   ├── theme-tab.svelte       #       屏蔽主题选项卡
        │   ├── advanced-tab.svelte    #       高级设置选项卡
        │   └── about-tab.svelte       #       关于选项卡
        └── sources/
            ├── source-list.svelte     #       图片源列表
            └── asset-picker.svelte    #       assets 文件夹树选取器
```



#### 测试目录

```
tests/                                # 测试（镜像 src/ 结构）
├── vitest.setup.ts                   #   全局 mock（window.siyuan, window.require('fs/promises'), fetchPost）
├── stores/
│   └── config.test.ts                #   配置 CRUD、reset、旧版清理
├── services/
│   ├── sourceManager.test.ts         #   源扫描、过滤、平台降级、随机选取
│   └── bgRender.test.ts              #   渲染 URL 构建、video vs canvas 元素创建
├── utils/
│   ├── api.test.ts                   #   API 封装调用链
│   ├── fs.test.ts                    #   isDesktop() 检测、fs shim 降级
│   └── theme.test.ts                 #   主题检测（mock window.siyuan.config）
└── ui/                               #   Svelte 5 组件测试
    ├── topbar.test.ts                #     菜单结构渲染
    ├── settings.test.ts              #     tab 导航、表单控件
    └── sources/
        └── source-list.test.ts       #     源树渲染、文件操作按钮
```

**测试框架**：

| 工具 | 用途 |
|------|------|
| `vitest` | 测试运行器（Vite-native，零配置 TypeScript） |
| `@testing-library/svelte` | Svelte 组件测试（render + fireEvent） |
| `jsdom` | DOM 环境模拟 |

**Mock 策略** (`vitest.setup.ts`)：

```typescript
// Siyuan 运行时全局对象在测试环境不存在，需为所有测试统一 mock
(window as any).siyuan = {
  config: { system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' } },
  storage: {},
};
(window as any).require = (id: string) => {
  if (id === 'fs/promises') return { /* 仅在 desktop 测试场景中注入 */ };
  return undefined;
};
// fetchPost / fetchSyncPost 用 vitest.fn() mock
```