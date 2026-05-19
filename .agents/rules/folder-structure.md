# 文件与目录结构设计规范

## 命名规范

| 文件类型 | 命名风格 | 示例 |
|---------|---------|------|
| Svelte 组件（`.svelte`） | **PascalCase** | `SettingsPanel.svelte`, `ConfigTab.svelte`, `AssetPicker.svelte` |
| TypeScript 模块（`.ts`） | **camelCase** | `sourceManager.ts`, `bgRender.ts`, `topbarMenu.ts` |
| 类型声明（`.d.ts`） | 保持原格式 | `index.d.ts` |
| 常量文件 | lowercase | `constants.ts`, `types.ts` |

## 设计约定

| 目录 | 职责 | 原则 |
|------|------|------|
| `src/` 根 | 入口、类型、常量 | 仅保留全局共用的顶层文件 |
| `src/libs/` | 框架级基础件 | 通用封装，不依赖本插件业务逻辑（SettingUtils、dialog） |
| `src/utils/` | 业务领域工具 | 依赖本插件业务上下文（api、fs、theme） |
| `src/stores/` | 状态管理 | 单例 store，管理配置和运行时状态 |
| `src/services/` | 核心服务 | 背景渲染引擎、图片源管理 |
| `src/ui/dialogs/` | 共享对话框 UI 动作 | `svelteDialog` 调用的工厂函数 + 对话框 Svelte 组件，供 topbarMenu 和 settings 共用 |
| `src/ui/settings/` | 设置面板 | 主容器 `SettingsPanel.svelte` + 各选项卡子组件 |

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

### 结构图

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
    │   ├── siyuanSetting.ts          #     官方 Setting 面板工具类封装
    │   └── dialog.ts                  #     svelteDialog / confirmDialog 通用封装
    │
    ├── utils/                         #   业务领域工具（依赖本插件上下文）
    │   ├── api.ts                     #     思源内核 API 封装（siyuanApiPost, readSiyuanDir, putFile, removeFile, downloadUrl）
    │   ├── fs.ts                      #     window.require('fs/promises') 安全封装（desktop only，平台检测 + 降级）
    │   ├── logger.ts                  #     条件日志输出（devLog / devDebug，仅在 inDev 模式下生效）
    │   ├── path.ts                    #     路径归一化工具（assets 路径格式化）
    │   └── theme.ts                   #     主题检测
    │
    ├── stores/                        #   状态管理
    │   └── config.ts                  #     配置 store（单层 local.json，read/write/reset，含 isLocalPath 方法）
    │
    ├── services/                      #   核心服务
    │   ├── bgRender.ts                #     背景渲染引擎（canvas/video DOM 操作）
    │   └── sourceManager.ts           #     图片源管理器（三种源类型：local / upload / assets）
    │
    └── ui/                            #   Svelte 5 视图组件
        ├── topbarMenu.ts              #     顶栏菜单构建器
        ├── settings/
        │   ├── SettingsPanel.svelte   #       设置面板（主容器，选项卡路由）
        │   ├── ConfigTab.svelte       #       全局配置选项卡（激活/透明度/模糊/位置/自动刷新）
        │   ├── SourcesTab.svelte      #       数据管理选项卡（文件列表 + 预览 + 上传/删除操作）
        │   ├── ThemeTab.svelte        #       屏蔽主题选项卡
        │   ├── AdvancedTab.svelte     #       高级设置选项卡（重置、开发模式开关）
        │   └── AboutTab.svelte        #       关于选项卡
        └── dialogs/
            ├── index.ts              #       对话框工厂函数（showLocalDirDialog, showAssetsDirDialog, showUrlDialog, pickMultipleFiles, pickFolderFiles）
            ├── AssetPicker.svelte     #       assets 文件夹树形选取器
            ├── LocalDirDialog.svelte  #       本地目录路径输入对话框
            └── UrlDialog.svelte       #       网络资源 URL 输入对话框
```