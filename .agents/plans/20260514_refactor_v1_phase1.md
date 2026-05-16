# Phase 1 执行计划：项目基建

> 目标：将 webpack + esbuild + 纯 TS 的旧项目骨架，切换为 Vite 5 + Svelte 5 + Vitest。

## 一、目标

搭建 Vite + Svelte 5 + Vitest 项目骨架，使 `pnpm dev` / `pnpm build` / `pnpm test` 均可运行，Plugin 类骨架能在思源中正确加载（可显示顶栏图标但无实际功能）。

## 二、新建 & 修改文件清单

以下列出 Phase 1 需要创建/修改的全部文件。`[新建]` 表示从零创建，`[修改]` 表示覆写现有文件。

```
项目根
├── package.json                          [修改] 全部覆写
├── plugin.json                           [修改] 更新 backends/frontends/minAppVersion
├── tsconfig.json                         [修改] 改为 Vite 兼容配置
├── tsconfig.node.json                    [新建] Vite 配置文件的 TS 上下文
├── svelte.config.js                      [新建] Svelte 预处理 + a11y 警告抑制
├── vite.config.ts                        [新建] Vite lib mode 构建配置
├── vitest.config.ts                      [新建] vitest 配置
├── .gitignore                            [修改] 适配新构建输出
├── icon.png                              [保留] 不变
├── preview.png                           [保留] 不变
├── README.md                             [保持不变]
├── README_en_US.md                       [保持不变]
│
├── public/                               [新建] Vite 静态资源目录
│   └── i18n/                             [新建] 从旧 src/i18n/ 搬移
│       ├── en_US.json                    [修改] 精简至 Phase 1 需要的最小 keys
│       └── zh_CN.json                    [修改] 同上
│
├── scripts/                           # 开发辅助脚本
│   ├── copy2dev.js                   # 构建后自动复制到思源插件目录（开发时使用）
│   └── readme.md                     # 说明如何配置环境变量，让buildd后的文件自动复制到思源插件目录进行测试
│
├── src/                                  [修改] 新架构目录
│   ├── index.ts                          [修改] Plugin 类骨架 (≤80行)
│   ├── constants.ts                      [新建] 全局常量占位（包名、图标 SVG）
│   ├── types.ts                          [新建] 类型定义占位
│   ├── libs/                             [新建] 框架级基础件
│   │   ├── index.d.ts                    [新建] SettingUtils 类型定义
│   │   ├── setting-utils.ts              [新建] 官方 Setting 工具类
│   │   └── dialog.ts                     [新建] svelteDialog 封装
│   ├── ui/                               [新建] Svelte 组件目录
│   │   └── setting-panel.svelte          [新建] 占位设置面板（仅显示版本号）
│   └── types/                            [新建] SiYuan 类型补充
│       └── index.d.ts                    [新建] Window.siyuan 全局类型声明
│
└── tests/                                [新建] 测试目录
    ├── vitest.setup.ts                   [新建] 全局 mock（window.siyuan 等）
    └── index.test.ts                     [新建] 入口加载冒烟测试
```

**删除的文件**（不再需要）：
```
删除 webpack.config.js
删除 src/i18n/ (已迁移至 public/i18n/)
删除 src/services/ (Phase 1 不需要，后续重建)
删除 src/utils/ (Phase 1 不需要，后续重建)
删除 src/ui/ 旧纯 TS 文件 (后续 Svelte 替代)
删除 static/ 捐赠二维码 (后续 Phase 6 处理)
删除 asset/ 目录
删除 .eslintrc.js / .eslintignore (Vite 不做 ESLint 配置, 不再添加)
```

## 三、详细步骤

### Step 1: package.json — 依赖与脚本

以 `plugin-sample-vite-svelte` 的 `package.json:1-37` 为蓝本，调整包名和版本。

**关键差异**：旧项目 `"type": "commonjs"`，新项目 `"type": "module"`（Vite CJS output 的输入为 ESM）。

新增 vitest 依赖：
- `vitest` (devDependencies)
- `@testing-library/svelte` (devDependencies)
- `jsdom` (devDependencies)
- `@testing-library/jest-dom` (devDependencies)

```json
{
  "name": "siyuan-plugin-background-cover",
  "version": "1.0.0-dev",
  "type": "module",
  "description": "Add a picture you like to cover the entire Siyuan Note",
  "repository": "https://github.com/HowcanoeWang/siyuan-plugin-background-cover",
  "author": "HowcanoeWang",
  "license": "MIT",
  "scripts": {
    "dev": "cross-env NODE_ENV=development VITE_SOURCEMAP=inline vite build --watch",
    "build": "cross-env NODE_ENV=production vite build",
    "make-link": "node --no-warnings ./scripts/make_dev_link.js",
    "make-link-win": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/elevate.ps1 -scriptPath ./scripts/make_dev_link.js",
    "make-install": "vite build && node --no-warnings ./scripts/make_install.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/svelte": "^5.0.0",
    "@tsconfig/svelte": "^4.0.1",
    "@types/node": "^20.3.0",
    "cross-env": "^7.0.3",
    "fast-glob": "^3.2.12",
    "glob": "^10.0.0",
    "jsdom": "^25.0.0",
    "minimist": "^1.2.8",
    "rollup-plugin-livereload": "^2.0.5",
    "siyuan": "^1.1.2",
    "svelte": "^5.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.4",
    "vite-plugin-static-copy": "^1.0.2",
    "vite-plugin-zip-pack": "^1.0.5",
    "vitest": "^2.0.0"
  }
}
```

**参考依据**：
- `siyuan` 升级至 `^1.1.2`（主计划 §五）
- 不再依赖 `ts-md5`、`sass`、`eslint`（主计划 §二移除项、§五）
- 移除全部 webpack 相关依赖

### Step 2: vite.config.ts — 构建配置

以 `plugin-sample-vite-svelte/vite.config.ts:1-107` 为蓝本。

**模式差异**：
- `NODE_ENV=development` → `outDir: "dev"`，带 sourcemap inline + livereload
- `NODE_ENV=production` → `outDir: "dist"`，minify + zip pack

**关键配置点**：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `build.lib.entry` | `src/index.ts` | 插件入口 |
| `build.lib.formats` | `["cjs"]` | 思源插件必须是 CommonJS（设计约定） |
| `build.lib.fileName` | `"index"` | 输出 `dist/index.js` |
| `rollupOptions.external` | `["siyuan", "process"]` | siyuan 是外部运行时提供的模块（`plugin-sample-vite-svelte/vite.config.ts:94`） |
| `viteStaticCopy` | 复制 `README*.md`, `plugin.json`, `icon.png`, `preview.png` | 参考 `plugin-sample-vite-svelte/vite.config.ts:36-43` |
| livereload (dev) | `rollup-plugin-livereload` → 监听 `dev/` | 参考 `plugin-sample-vite-svelte/vite.config.ts:66` |

**不需要的部分**：
- `vitePluginYamlI18n` — 我们的 i18n 是 JSON 格式，不需要 YAML 编译
- `cleanupDistFiles` — 我们不用 YAML，不需要后清理

```typescript
// vite.config.ts
import { resolve } from "path"
import { defineConfig } from "vite"
import { viteStaticCopy } from "vite-plugin-static-copy"
import livereload from "rollup-plugin-livereload"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import zipPack from "vite-plugin-zip-pack"
import fg from 'fast-glob'

const env = process.env
const isSrcmap = env.VITE_SOURCEMAP === 'inline'
const isDev = env.NODE_ENV === 'development'
const outputDir = isDev ? "dev" : "dist"

console.log("isDev=>", isDev)
console.log("isSrcmap=>", isSrcmap)
console.log("outputDir=>", outputDir)

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        }
    },

    plugins: [
        svelte(),

        viteStaticCopy({
            targets: [
                { src: "./README*.md", dest: "./" },
                { src: "./plugin.json", dest: "./" },
                { src: "./preview.png", dest: "./" },
                { src: "./icon.png", dest: "./" }
            ],
        }),
    ],

    define: {
        "process.env.DEV_MODE": JSON.stringify(isDev),
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
    },

    build: {
        outDir: outputDir,
        emptyOutDir: false,
        minify: true,
        sourcemap: isSrcmap ? 'inline' : false,

        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            fileName: "index",
            formats: ["cjs"],
        },
        rollupOptions: {
            plugins: [
                ...(isDev ? [
                    livereload(outputDir),
                    {
                        name: 'watch-external',
                        async buildStart() {
                            const files = await fg([
                                'public/i18n/**',
                                './README*.md',
                                './plugin.json'
                            ])
                            for (let file of files) {
                                this.addWatchFile(file)
                            }
                        }
                    }
                ] : [
                    zipPack({
                        inDir: './dist',
                        outDir: './',
                        outFileName: 'package.zip'
                    })
                ])
            ],

            external: ["siyuan", "process"],

            output: {
                entryFileNames: "[name].js",
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === "style.css") {
                        return "index.css"
                    }
                    return assetInfo.name
                },
            },
        },
    }
})
```

`public/` 目录由 Vite 自动输出到 `outputDir/`（i18n 文件无需手动复制）。`plugin.json` / `icon.png` 等不在 `public/` 中的静态文件通过 `viteStaticCopy` 处理。

### Step 3: svelte.config.js

直接复制 `plugin-sample-vite-svelte/svelte.config.js:1-26`：

```js
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

const NoWarns = new Set([
    "a11y-click-events-have-key-events",
    "a11y-no-static-element-interactions",
    "a11y-no-noninteractive-element-interactions"
])

export default {
    preprocess: vitePreprocess(),
    onwarn: (warning, handler) => {
        if (NoWarns.has(warning.code)) return
        handler(warning)
    }
}
```

### Step 4: tsconfig.json

以 `plugin-sample-vite-svelte/tsconfig.json:1-59` 为蓝本，微调 paths：

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "useDefineForClassFields": true,
        "module": "ESNext",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "skipLibCheck": true,
        "moduleResolution": "Node",
        "allowSyntheticDefaultImports": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "preserve",
        "strict": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "allowJs": true,
        "checkJs": true,
        "types": ["node", "vite/client", "svelte"],
        "paths": {
            "@/*": ["./src/*"],
            "@/libs/*": ["./src/libs/*"]
        }
    },
    "include": [
        "scripts/**/*.ts",
        "src/**/*.ts",
        "src/**/*.d.ts",
        "src/**/*.svelte",
        "tests/**/*.ts"
    ],
    "references": [
        { "path": "./tsconfig.node.json" }
    ],
    "root": "."
}
```

### Step 5: tsconfig.node.json

直接复制 `plugin-sample-vite-svelte/tsconfig.node.json:1-12`：

```json
{
    "compilerOptions": {
        "composite": true,
        "skipLibCheck": true,
        "module": "ESNext",
        "moduleResolution": "Node",
        "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
}
```

### Step 6: plugin.json — 清单更新

主计划 §五要求升级 `minAppVersion`、`backends`、`frontends`。以 `plugin-sample-vite-svelte/plugin.json:1-48` 为蓝本：

```json
{
  "name": "siyuan-plugin-background-cover",
  "author": "HowcanoeWang",
  "url": "https://github.com/HowcanoeWang/siyuan-plugin-background-cover",
  "version": "1.0.0-dev",
  "minAppVersion": "3.2.1",
  "backends": [
    "windows",
    "linux",
    "darwin",
    "ios",
    "android",
    "harmony",
    "docker"
  ],
  "frontends": [
    "desktop",
    "mobile",
    "browser-desktop",
    "browser-mobile",
    "desktop-window"
  ],
  "displayName": {
    "default": "Background Cover",
    "zh_CN": "替换背景图片"
  },
  "description": {
    "default": "Add a picture you like to cover the entire Siyuan Note",
    "zh_CN": "添加一张你喜欢的图片铺满整个思源笔记"
  },
  "readme": {
    "default": "README.md",
    "zh_CN": "README.md",
    "en_US": "README_en_US.md"
  },
  "funding": {
    "openCollective": "",
    "patreon": "",
    "github": "https://github.com/HowcanoeWang"
  },
  "keywords": [
    "background",
    "cover",
    "wallpaper",
    "背景",
    "壁纸"
  ]
}
```

**与旧版差异**：
- `minAppVersion` 从 `3.1.20` → `3.2.1`（参考 `plugin-sample-vite-svelte/plugin.json:6`）
- `backends` 从 `["all"]` → 显式枚举（参考 `plugin-sample-vite-svelte/plugin.json:8-16`），包含 `harmony`
- `frontends` 新增 `desktop-window`（参考 `plugin-sample-vite-svelte/plugin.json:22`）

### Step 7: i18n 文件

**源位置**：从 `src/i18n/` 搬移到 `public/i18n/`（Vite 自动输出到 `dist/i18n/`）。

**Phase 1 最小 i18n keys**（旧 i18n 见 `src/i18n/zh_CN.json:1-113`，只需保留 Phase 1 入口用到的）：

```json
// public/i18n/zh_CN.json
{
    "addTopBarIcon": "切换背景图",
    "helloPlugin": "背景插件载入成功",
    "byePlugin": "背景插件已关闭",
    "selectPictureLabel": "选择一张背景图",
    "settingLabel": "设置",
    "openBackgroundLabel": "打开图片背景",
    "closeBackgroundLabel": "关闭图片背景",
    "selectPictureManualLabel": "手动挑一张",
    "selectPictureRandomLabel": "随机抽一张",
    "reduceBackgroundOpacityLabel": "减少背景透明度",
    "addBackgroundOpacityLabel": "增加背景透明度",
    "reduceBackgroundBlurLabel": "减少背景模糊度",
    "addBackgroundBlurLabel": "增加背景模糊度",
    "notImplementTitle": "抱歉！",
    "notImplementMsg": "该功能尚在开发中"
}
```

```json
// public/i18n/en_US.json
{
    "addTopBarIcon": "SwitchBgCover",
    "helloPlugin": "Background Cover loaded",
    "byePlugin": "Background Cover closed",
    "selectPictureLabel": "Select Pictures",
    "settingLabel": "Settings",
    "openBackgroundLabel": "Opening Background",
    "closeBackgroundLabel": "Closing Background",
    "selectPictureManualLabel": "Manual Selection",
    "selectPictureRandomLabel": "Random Selection",
    "reduceBackgroundOpacityLabel": "Reduce Background Opacity",
    "addBackgroundOpacityLabel": "Add Background Opacity",
    "reduceBackgroundBlurLabel": "Reduce Background Blur",
    "addBackgroundBlurLabel": "Add Background Blur",
    "notImplementTitle": "Oops!",
    "notImplementMsg": "This feature is still under development"
}
```

**说明**：因为使用的是 JSON 格式（非 YAML），必须小心确保 JSON 中没有尾随逗号，且键名完全匹配旧版 `index.ts:50-101` 中 `addCommand` 的 `langKey` 参数。

### Step 8: src/index.ts — Plugin 类骨架

以 `plugin-sample-vite-svelte/src/index.ts:45-398` 为基础，结合旧 `src/index.ts:20-163` 的核心逻辑。

Phase 1 的目标：**空壳能加载** — 能在思源中显示顶栏图标，菜单项均为占位，快捷键绑定保留但回调为空。

```typescript
// src/index.ts
import {
    Plugin,
    getFrontend,
    getBackend,
    showMessage,
    Menu,
} from "siyuan"
import { mount, unmount } from "svelte"

import { SettingUtils } from "./libs/setting-utils"
import { svelteDialog } from "./libs/dialog"
import SettingPanel from "./ui/setting-panel.svelte"

export { SettingUtils }
export { svelteDialog }

const STORAGE_NAME = "settings"

export default class BgCoverPlugin extends Plugin {

    public isMobileLayout: boolean
    private settingUtils: SettingUtils

    async onload() {
        const frontEnd = getFrontend()
        this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile"

        // 暴露全局接口供后续 UI / services 使用
        ;(window as any).bgCoverPlugin = {
            i18n: this.i18n,
            isMobileLayout: this.isMobileLayout,
            plugin: this,
        }

        // 添加图标（图标 SVG 占位，Phase 2 补全）
        this.addIcons(`<symbol id="iconCoverBg" viewBox="0 0 32 32">
<path d="M4 4h24v24H4z"/>
</symbol>`)

        // 注册快捷键（占位，回调尚未实现）
        this.addCommand({ langKey: "selectPictureManualLabel", hotkey: "⇧⌘F6", callback: () => {} })
        this.addCommand({ langKey: "selectPictureRandomLabel", hotkey: "⇧⌘F7", callback: () => {} })
        this.addCommand({ langKey: "openBackgroundLabel", hotkey: "⇧⌘F4", callback: () => {} })
        this.addCommand({ langKey: "reduceBackgroundOpacityLabel", hotkey: "⇧⌘7", callback: () => {} })
        this.addCommand({ langKey: "addBackgroundOpacityLabel", hotkey: "⇧⌘8", callback: () => {} })
        this.addCommand({ langKey: "reduceBackgroundBlurLabel", hotkey: "⇧⌘9", callback: () => {} })
        this.addCommand({ langKey: "addBackgroundBlurLabel", hotkey: "⇧⌘0", callback: () => {} })

        // 初始化 SettingUtils
        this.settingUtils = new SettingUtils({
            plugin: this,
            name: STORAGE_NAME,
        })
        this.settingUtils.addItem({
            key: "hint",
            value: "",
            type: "hint",
            title: this.i18n.notImplementTitle,
            description: this.i18n.notImplementMsg,
        })

        console.log(this.i18n.helloPlugin)
    }

    onLayoutReady() {
        const topBarElement = this.addTopBar({
            icon: "iconCoverBg",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => this.addMenu(topBarElement),
        })
        this.settingUtils.load().catch(e =>
            console.error("Error loading settings:", e)
        )
    }

    openSetting(): void {
        svelteDialog({
            title: "Background Cover",
            width: "800px",
            height: "35rem",
            component: SettingPanel,
            props: { app: this.app },
        })
    }

    onunload() {
        console.log(this.i18n.byePlugin)
    }

    private addMenu(topBarElement: HTMLElement) {
        const menu = new Menu("bgCoverMenu", () => {})
        menu.addItem({
            icon: "iconSettings",
            label: this.i18n.settingLabel,
            click: () => this.openSetting(),
        })
        menu.addItem({
            icon: "iconImage",
            label: this.i18n.notImplementMsg,
            type: "readonly",
        })
        if (this.isMobileLayout) {
            menu.fullscreen()
        } else {
            const rect = topBarElement.getBoundingClientRect()
            menu.open({ x: rect.right, y: rect.bottom, isLeft: true })
        }
    }
}
```

**关键设计决策**（主计划 §六）：
- `export { SettingUtils, svelteDialog }` 从入口导出两个公共工具，避免其他文件重复导入 `siyuan` 后又间接调用
- `(window as any).bgCoverPlugin` 保留全局命名空间，保持向下兼容，同时提供给 Svelte 组件和 service 层使用
- `addMenu` 使用 `Menu` 类而非手写 HTML（与旧 `src/index.ts` 一致），参考 `plugin-sample-vite-svelte/src/index.ts:493-1008`
- `openSetting()` 直接调用 `svelteDialog()` 封装（参考 `plugin-sample-vite-svelte/src/index.ts:419-441`）

### Step 9: src/libs/setting-utils.ts — 官方 Setting 工具

直接复制 `plugin-sample-vite-svelte/src/libs/setting-utils.ts:1-397`，无需修改。

这个文件是思源官方提供的 Setting 面板工具类，Phase 1 仅引用其基本能力（init → load → addItem → dump），Phase 2 后将逐步替换为 `setLocalStorageVal` 模式。

### Step 10: src/libs/dialog.ts — Svelte 对话框封装

直接复制 `plugin-sample-vite-svelte/src/libs/dialog.ts:1-177`，无需修改。

提供 `svelteDialog()` / `confirmDialog()` / `simpleDialog()` 等封装，在 `index.ts:96` 中使用。

### Step 11: src/libs/index.d.ts — SettingUtils 类型定义

直接复制 `plugin-sample-vite-svelte/src/libs/index.d.ts:1-43`，无需修改。

### Step 12: src/types/index.d.ts — SiYuan 全局类型补充

直接复制 `plugin-sample-vite-svelte/src/types/index.d.ts:1-106`，无需修改。

### Step 13: 占位 Svelte 组件

```svelte
<!-- src/ui/setting-panel.svelte -->
<script lang="ts">
    let { app }: { app: any } = $props()
    const version = "1.0.0-dev"
</script>

<div class="fn__flex-column" style="padding: 1rem; gap: 0.5rem;">
    <div class="b3-label fn__flex-center">
        Background Cover Plugin v{version}
    </div>
    <div class="ft__breakword">
        This is a placeholder setting panel.<br>
        The actual settings will be implemented in Phase 6.
    </div>
</div>
```

### Step 14: vitest.config.ts + vitest.setup.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            "@": new URL('./src', import.meta.url).pathname,
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/vitest.setup.ts'],
        include: ['tests/**/*.test.ts'],
    },
})
```

```typescript
// tests/vitest.setup.ts
import '@testing-library/jest-dom/vitest'

// Mock siyuan runtime globals — 参考主计划 §六 mock 策略
;(window as any).siyuan = {
    config: {
        system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' },
    },
    storage: {},
    languages: { cancel: 'Cancel', confirm: 'Confirm' },
}
;(window as any).fetchPost = async () => ({ code: 0, data: null })
```

```typescript
// tests/index.test.ts
import { describe, it, expect, vi } from 'vitest'

// Mock siyuan module
vi.mock('siyuan', () => ({
    Plugin: class {
        data: Record<string, any> = {}
        i18n: Record<string, string> = {}
        app: any = {}
        addIcons() {}
        addCommand() {}
        addTopBar() { return document.createElement('div') }
        onLayoutReady() {}
    },
    getFrontend: vi.fn(() => 'desktop'),
    getBackend: vi.fn(() => 'linux'),
    showMessage: vi.fn(),
    Menu: vi.fn(() => ({
        addItem: vi.fn(),
        addSeparator: vi.fn(),
        open: vi.fn(),
        fullscreen: vi.fn(),
    })),
}))

describe('Plugin entry', () => {
    it('should export BgCoverPlugin class', async () => {
        const mod = await import('../src/index')
        expect(mod.default).toBeDefined()
        expect(mod.SettingUtils).toBeDefined()
        expect(mod.svelteDialog).toBeDefined()
    })
})
```

### Step 16: .gitignore 更新

```gitignore
.idea
node_modules
.DS_Store
.eslintcache
dev
dist
package.zip
*.xcf
SyncSettings.ffs_gui
.agents/references/
```

**变更说明**：
- 新增 `dev`（dev 构建输出目录，不提交）
- 保留 `dist`、`package.zip`
- `.agents/references/` 统一忽略（旧 .gitignore 逐个子目录列出）
- 不再需要 `index.css` / `index.js` / `i18n` / `static` / `asset` 的忽略（新结构不再产生这些路径）

## 四、参考代码路径汇总

| 配置/文件 | 参考来源 | 关键行号 |
|----------|---------|---------|
| `vite.config.ts` 整体结构 | `plugin-sample-vite-svelte/vite.config.ts` | 1-107 |
| `vite.config.ts` externals | `plugin-sample-vite-svelte/vite.config.ts` | 94 |
| `vite.config.ts` viteStaticCopy | `plugin-sample-vite-svelte/vite.config.ts` | 36-43 |
| `vite.config.ts` livereload + watch | `plugin-sample-vite-svelte/vite.config.ts` | 64-79 |
| `vite.config.ts` zipPack | `plugin-sample-vite-svelte/vite.config.ts` | 86-91 |
| `svelte.config.js` 完整 | `plugin-sample-vite-svelte/svelte.config.js` | 1-26 |
| `tsconfig.json` 完整 | `plugin-sample-vite-svelte/tsconfig.json` | 1-59 |
| `tsconfig.node.json` 完整 | `plugin-sample-vite-svelte/tsconfig.node.json` | 1-12 |
| `package.json` scripts | `plugin-sample-vite-svelte/package.json` | 10-17 |
| `package.json` deps | `plugin-sample-vite-svelte/package.json` | 18-37 |
| `plugin.json` backends/frontends | `plugin-sample-vite-svelte/plugin.json` | 8-22 |
| `plugin.json` displayName/desc | 旧 `plugin.json` | 9-16 |
| `src/index.ts` Plugin 类结构 | `plugin-sample-vite-svelte/src/index.ts` | 45-76 |
| `src/index.ts` addTopBar + menu | `plugin-sample-vite-svelte/src/index.ts` | 344-379, 493-1008 |
| `src/index.ts` openSetting + svelteDialog | `plugin-sample-vite-svelte/src/index.ts` | 419-441 |
| `src/index.ts` addCommand 快捷键 | 旧 `src/index.ts` | 50-101 |
| `src/libs/setting-utils.ts` 完整 | `plugin-sample-vite-svelte/src/libs/setting-utils.ts` | 1-397 |
| `src/libs/dialog.ts` 完整 | `plugin-sample-vite-svelte/src/libs/dialog.ts` | 1-177 |
| `src/libs/index.d.ts` 类型 | `plugin-sample-vite-svelte/src/libs/index.d.ts` | 1-43 |
| `src/types/index.d.ts` 全局类型 | `plugin-sample-vite-svelte/src/types/index.d.ts` | 1-106 |
| `scripts/make_dev_link.js` 完整 | `plugin-sample-vite-svelte/scripts/make_dev_link.js` | 1-66 |
| `scripts/make_install.js` 完整 | `plugin-sample-vite-svelte/scripts/make_install.js` | 1-57 |
| `scripts/utils.js` 完整 | `plugin-sample-vite-svelte/scripts/utils.js` | 1-182 |
| i18n keys 快捷键 langKey | 旧 `src/index.ts` | 50-101 |
| i18n 旧翻译内容 | 旧 `src/i18n/zh_CN.json` | 1-113 |
| i18n 旧翻译内容 | 旧 `src/i18n/en_US.json` | 1-113 |
| vitest.setup.ts 全局 mock | 主计划 `§六 tests 目录` | 538-548 |
| `window.bgCoverPlugin` 全局命名空间 | 旧 `src/index.ts` | 35-41 |

## 五、脚本命令

| 命令 | 用途 | 输出 |
|------|------|------|
| `pnpm install` | 安装所有依赖 | `node_modules/` |
| `pnpm dev` | 开发模式构建 + watch + livereload | `dev/` (含 sourcemap inline) |
| `pnpm build` | 生产模式构建 + zip 打包 | `dist/` + `package.zip` |
| `pnpm test` | 运行全部测试 | 终端输出 |
| `pnpm test:watch` | 测试监听模式 | 终端持续输出 |
| `pnpm test:coverage` | 测试覆盖率 | 终端 + `coverage/` |

## 六、Phase 1 测试验证

| 验证项 | 方法 | 预期 |
|--------|------|------|
| **dep 安装成功** | `pnpm install` | 无报错 |
| **类型检查通过** | `pnpm exec tsc --noEmit` | 0 errors |
| **dev 构建成功** | `pnpm dev` | 输出 `dev/index.js` + `dev/i18n/` + 静态文件 |
| **prod 构建成功** | `pnpm build` | 输出 `dist/index.js` + `dist/i18n/` + `package.zip` |
| **vitest 冒烟测试** | `pnpm test` | `index.test.ts` 通过：模块导入、类导出验证 |
| **dev watch 工作** | 修改 `src/index.ts` 后观察终端 | Vite 自动 rebuild |
| **livereload 工作** | 修改后检查浏览器是否自动重载 | 思源界面自动刷新 |
| **顶栏菜单可打开** | 点击顶栏图标 | 弹出 Menu（含"设置"和占位项） |
| **设置面板可渲染** | 点击"设置"菜单项 | 弹出 Dialog，显示占位内容 |
| **plugin.json 有效** | 思源集市识别 | `backends` / `frontends` / `minAppVersion` 格式正确 |
| **i18n 正常注入** | `this.i18n.helloPlugin` 在控制台打印 | 控制台输出正确的翻译文本 |
| **旧代码已清理** | 检查 `webpack.config.js` / `src/i18n/` / 旧 webpack 依赖 | 文件已删除 |
| **.gitignore 有效** | build 产物不出现在 `git status` 中 | `dev/` `dist/` `node_modules/` 被忽略 |

## 七、不在 Phase 1 范围内的

以下功能在后续 Phase 中实现，Phase 1 仅保留空壳占位：

- ❌ 背景渲染引擎 (`bgRender.ts`)
- ❌ 图片源管理器 (`sourceManager.ts`)
- ❌ 文件系统封装 (`fs.ts`)
- ❌ API 封装 (`api.ts`)
- ❌ 主题检测 (`theme.ts`)
- ❌ 配置 store (`config.ts`)
- ❌ 顶栏菜单实际逻辑 (`topbar.svelte`)
- ❌ 完整的设置面板 UI (5 个 tab)
- ❌ 快捷键实际回调实现
- ❌ `window.require('fs/promises')` 相关逻辑
