# 合规修复计划 — 2026-05-17 代码审查结果（二期追加）

> 基于 `.agents/rules/` 中全部 6 个规则文件的逐项审查结果 + 用户反馈的功能问题。

---

## 总览

| 步骤 | 优先级 | 内容 | 涉及文件数 | 预计影响 |
|------|--------|------|------------|----------|
| Step 1: V2 | 🔴 严重 | 修复 upload/assets 在 desktop 上错误返回 `file:///` URL | 1 | 渲染、预览 |
| Step 2: V16 | 🔴 严重 | 实现透明度加权公式、修复滑块范围 | 2 | 功能正确性 |
| Step 3: V11 | 🔴 严重 | `videoEl.pause()` 添加 try/catch 保护 | 1 | 生产稳定性 |
| Step 4: V6 | 🔴 严重 | 全部硬编码中文替换为 i18n 键 | ~15 | 国际化 |
| Step 5: 清理 | 🟡 中等 | 死代码删除、补缺失文件/键、轻微修复 | ~8 | 代码质量 |
| Step 6: 设置面板重构 | 🔴 严重 | config-tab/sources-tab/theme-tab/advanced-tab/about-tab | ~7 | 功能完整性 |
| Step 7: Assets 选取器 | 🔴 严重 | 递归文件夹树 dialog，对接 topbar 和 sources-tab | 2 | 缺失功能 |
| Step 8: 默认背景 | 🟡 中等 | public/default/ 打包默认图片/视频，重置后自动使用 | 3 | 用户体验 |
| Step 9: Bug修复 | 🔴 严重 | 上传后未设置 body opacity，导致背景不可见 | 1 | 功能可用性 |

---

## Step 1 (V2): 修复 Canvas 渲染 URL — upload/assets 禁止用 `file:///`

### 问题位置

`src/utils/fs.ts:39-43` — `getFileUrl()` 函数

### 当前代码

```typescript
export function getFileUrl(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): string {
    if (sourceType === 'local') {
        return `file://${apiPath}`
    }

    if (isDesktop()) {                              // ← BUG: 无 sourceType 守卫
        const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
        const cleanPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath
        const sep = wsDir.endsWith('/') ? '' : '/'
        return `file://${wsDir}${sep}${cleanPath}`  // → file:///home/.../data/public/.../img.jpg
    }

    let rel = apiPath
    if (rel.startsWith('/data/')) rel = rel.slice(1)
    if (rel.startsWith('data/')) rel = '/' + rel.slice('data/'.length)
    else if (!rel.startsWith('/')) rel = '/' + rel
    return rel
}
```

### 规则要求

| sourceType | Canvas `url()` |
|-----------|---------------|
| `local` | `url("file:///home/user/Pictures/img.jpg")` |
| `upload` | `url("public/{packageName}/img.jpg")` |
| `assets` | `url("assets/.../img.jpg")` |

> `file:///` 仅用于 `local`。upload 和 assets 在所有平台（含 desktop）都使用思源 webview 的相对路径。

### 改动方案

删除 `isDesktop()` 分支（第 39-44 行），让所有非 local 类型统一走 webview 相对路径转换：

```typescript
export function getFileUrl(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): string {
    if (sourceType === 'local') {
        return `file://${apiPath}`
    }

    // upload / assets 在所有平台统一使用 webview 相对路径
    let rel = apiPath
    if (rel.startsWith('/data/')) rel = rel.slice(1)          // /data/public/... → data/public/...
    if (rel.startsWith('data/')) rel = rel.slice('data/'.length) // data/public/... → public/...
    else if (rel.startsWith('/')) rel = rel.slice(1)          // /assets/... → assets/...
    return rel
}
```

### 连带修复

此修复会同时解决 `sources-tab.svelte` 缩略图预览问题（Step 4 中处理），因为渲染 URL 正确后，`<img src={item.url}>` 即可直接使用。

### 验证

```bash
pnpm test -- tests/utils/fs.test.ts
```

---

## Step 2 (V16): 实现透明度加权公式

### 问题位置

1. `src/services/bgRender.ts:123-131` — `changeOpacity()` 直接应用原始值
2. `src/ui/settings/config-tab.svelte:90` — 滑块 `min="0"` 无下限

### 规则要求

- 用户设定域: `[0.1, 1]`
- 加权公式: `f(x) = 0.99 - 0.25x`
- 实际应用域: `[0.74, 0.99]`
- 禁止修改 `<canvas>` 和 `<video>` 的透明度

### 当前代码

```typescript
// bgRender.ts:123
export function changeOpacity(val: number): void {
    const opacity = Math.max(0, Math.min(1, val))  // 无加权
    if (currentMode === 'image') {
        document.body.style.opacity = String(opacity)
    } else if (currentMode === 'video' && videoEl) {
        videoEl.style.opacity = String(opacity)     // ← 违规：修改了 video 透明度
        document.body.style.removeProperty('opacity')
    }
}
```

```svelte
<!-- config-tab.svelte:90 -->
<input type="range" min="0" max="1" step="0.05" ...>  <!-- min 应为 0.1 -->
```

### 改动方案

**A. `src/services/bgRender.ts` — 加权 + 统一 body opacity**

```typescript
export function changeOpacity(raw: number): void {
    const clamped = Math.max(0.1, Math.min(1, raw))
    const opacity = 0.99 - 0.25 * clamped   // f(x) = 0.99 - 0.25x
    document.body.style.opacity = String(opacity)
}
```

**B. `src/ui/settings/config-tab.svelte` — 滑块范围修正**

```svelte
<input class="b3-slider fn__size200" type="range"
    min="0.1" max="1" step="0.05"
    bind:value={opacity}
    oninput={() => changeOpacity(opacity)}
    onchange={() => configStore.set("opacity", opacity)}
/>
```

### 连带影响

`src/index.ts:39-47` 中 `reduceBackgroundOpacityLabel` / `addBackgroundOpacityLabel` 调用 `changeOpacity(v)`，传入值域 `[0,1]`，加权后自动映射，无需修改。

### 验证

```bash
pnpm test -- tests/services/bgRender.test.ts
```

---

## Step 3 (V11): `videoEl.pause()` 添加 try/catch 保护

### 问题位置

`src/services/bgRender.ts:78` — `renderImage()` 函数

### 当前代码

```typescript
export function renderImage(url: string): void {
    // ...
    if (videoEl) {
        videoEl.style.display = 'none'
        videoEl.pause()          // ← jsdom 未实现，生产环境罕见情况也可能抛异常
        videoEl.removeAttribute('src')
    }
    // ...
}
```

### 规则要求

```typescript
try { videoEl.pause() } catch { /* not implemented in jsdom */ }
```

### 改动方案

```typescript
if (videoEl) {
    videoEl.style.display = 'none'
    try { videoEl.pause() } catch { /* ignored */ }
    videoEl.removeAttribute('src')
}
```

### 说明

同一文件 L92 (`playPromise.catch`) 和 L109 (`try { pause() }`) 已正确保护，仅 L78 遗漏。

### 验证

```bash
pnpm test -- tests/services/bgRender.test.ts
```

---

## Step 4 (V6): 硬编码中文文本全部替换为 i18n

### 概述

所有 11 个 `.svelte` 文件 + `topbar-menu.ts` 中共 70+ 处硬编码中文文本，全部需替换为 i18n 键。

### 4.1 — 新建/补充 i18n 翻译键

`public/i18n/zh_CN.json` 和 `en_US.json` 需同步新增以下键。

#### 通用 UI 文本

| 键 | zh_CN | en_US |
|----|-------|-------|
| `selectPictureLabel` | 选择图片 | Select Picture |
| `addBackground` | 添加背景 | Add Background |
| `linkLocalDir` | 链接本地目录 | Link Local Directory |
| `linkAssetsDir` | 链接资源目录 | Link Assets Directory |
| `uploadMultipleFiles` | 上传多个文件 | Upload Multiple Files |
| `uploadEntireDir` | 上传整个目录 | Upload Entire Directory |
| `addNetworkResource` | 添加网络资源 | Add Network Resource |
| `confirmUpload` | 确定上传 | Confirm Upload |
| `refresh` | 刷新 | Refresh |
| `clear` | 清空 | Clear |
| `remove` | 移除 | Remove |
| `setAsBackground` | 设为背景 | Set as Background |
| `delete` | 删除 | Delete |
| `cancel` | 取消 | Cancel |
| `confirm` | 确认 | Confirm |
| `save` | 保存 | Save |
| `reset` | 重置 | Reset |
| `add` | 添加 | Add |
| `upload` | 上传 | Upload |
| `preview` | 预览 | Preview |
| `loading` | 加载中… | Loading… |
| `noFiles` | 暂无文件 | No files |
| `noSources` | 尚未添加任何图片源 | No image sources added yet |
| `noPreviewHint` | 点击文件列表中图片以预览 | Click image in list to preview |
| `videoNoPreview` | 视频文件 — 不支持预览 | Video — preview not supported |
| `pathInaccessible` | 路径不可访问 | Path inaccessible |
| `pathNotExist` | 路径不存在或无法访问 | Path does not exist or is inaccessible |
| `noValidFiles` | 该目录下未发现支持的图片/视频文件 | No supported image/video files found |
| `readDirFailed` | 读取目录失败 | Failed to read directory |
| `detecting` | 正在检测… | Detecting… |
| `autoDetectHint` | 输入路径后自动检测 | Auto-detect on input |
| `enterLocalDirHint` | 输入本地文件夹的绝对路径 | Enter absolute path to local folder |
| `enterAssetsDirHint` | 输入子文件夹名称 | Enter subfolder name |
| `enterUrlHint` | 粘贴图片/视频 URL 后自动检测 | Paste image/video URL to auto-detect |
| `notDesktop` | 当前非桌面端，不支持本地目录 | Desktop-only feature |

#### 设置面板文本

| 键 | zh_CN | en_US |
|----|-------|-------|
| `tabGlobal` | 全局设置 | General |
| `tabSources` | 数据管理 | Sources |
| `tabThemes` | 屏蔽主题 | Theme Filter |
| `tabAdvanced` | 高级设置 | Advanced |
| `tabAbout` | 关于 | About |
| `activateBg` | 开启背景 | Enable Background |
| `autoRefresh` | 自动刷新 | Auto Refresh |
| `autoRefreshDesc` | 启动时自动更换背景 | Auto change on startup |
| `switchInterval` | 定时切换间隔 | Switch Interval |
| `minutes` | 分钟 | min |
| `foregroundOpacity` | 前景透明度 | Foreground Opacity |
| `bgBlur` | 背景虚化 | Background Blur |
| `pluginCache` | 插件缓存 | Plugin Cache |
| `addLocalDir` | 添加本地目录 | Add Local Directory |
| `none` | (无) | (None) |
| `disabledThemesTitle` | 屏蔽主题 (在下列主题不显示背景) | Disabled Themes |
| `darkThemes` | 深色主题 | Dark Themes |
| `lightThemes` | 浅色主题 | Light Themes |
| `noDarkThemes` | 暂无已安装的深色主题 | No dark themes installed |
| `noLightThemes` | 暂无已安装的浅色主题 | No light themes installed |
| `resetAllConfirm` | 确认重置所有设置？这将清除所有配置和缓存图片。 | Reset all settings? This will clear all config and cached images. |
| `resetAllBtn` | 重置所有设置 | Reset All Settings |
| `resetAllDesc` | 将所有设置恢复到插件初始值 (包括所有缓存的图片) | Restore all settings to defaults (including cached images) |

#### 对话框文本

| 键 | zh_CN | en_US |
|----|-------|-------|
| `urlSuffixInvalid` | URL 后缀不在支持的图片/视频格式列表中 | URL suffix not in supported formats |
| `fetchFailed` | 无法获取资源 | Failed to fetch resource |
| `notImageOrVideo` | URL 指向的资源不是图片或视频 | Resource is not an image or video |
| `networkFailed` | 网络请求失败，请确认 URL 正确 | Network request failed, check URL |
| `bulkUploadWarning` | 此次将上传 {count} 张图片/视频，确定全部上传吗？ | Upload {count} images/videos. Continue? |
| `bulkUploadTitle` | 大量文件警告 | Bulk Upload Warning |
| `addAssetsDirTitle` | 选择 data/assets/ 下的子文件夹作为图片源 | Select subfolder under data/assets/ |
| `noFolderSelected` | 尚未选择任何文件夹 | No folder selected |
| `addLocalDirTitle` | 添加本地目录 | Add Local Directory |
| `addUrlTitle` | 添加网络背景资源 | Add Background from URL |

#### 关于 / 描述

| 键 | zh_CN | en_US |
|----|-------|-------|
| `aboutDesc` | 添加一张你喜欢的图片铺满整个思源笔记 | Fill your SiYuan Note with a favorite background image |
| `aboutAuthor` | Author: HowcanoeWang | MIT License |

#### 补充缺失的键

| 键 | zh_CN | en_US | 原来缺失 |
|----|-------|-------|---------|
| `addNoteAssetsDirectoryLabel` | 链接资源目录 | Link Assets Directory | 引用但不存在 |

### 4.2 — 逐个文件替换

#### 方法

在 Svelte 组件中，通过 `(window as any).bgCoverPlugin?.i18n` 访问 i18n：

```svelte
<script lang="ts">
    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
</script>

<span>{i18n.tabGlobal}</span>
```

在 TS 文件中同理：

```typescript
const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
```

#### 文件清单（硬编码文本数估算）

| 文件 | 硬编码处 | 预计替换 |
|------|---------|---------|
| `src/ui/url-dialog.svelte` | 9 | 9 |
| `src/ui/local-dir-dialog.svelte` | 8 | 8 |
| `src/ui/settings/config-tab.svelte` | 10 | 10 |
| `src/ui/settings/sources-tab.svelte` | 11 | 11 |
| `src/ui/settings/theme-tab.svelte` | 6 | 6 |
| `src/ui/settings/advanced-tab.svelte` | 4 | 4 |
| `src/ui/settings/about-tab.svelte` | 2 | 2 |
| `src/ui/settings/settings.svelte` | 5 | 5 |
| `src/ui/sources/source-list.svelte` | 6 | 6 |
| `src/ui/topbar-menu.ts` | 6 | 3 (部分已有 i18n) |
| `src/ui/sources/asset-picker.svelte` | — | 待重写（见 Step 7） |
| `src/ui/topbar.svelte` | — | 待删除（见 Step 5） |

### 4.3 — 验证

- 构建后检查 `dist/i18n/` 中包含所有新键
- 手动检查 En/中文切换无误

---

## Step 5: 清理 — 死代码删除、补漏、轻微问题

### 5.1 — 删除死代码

| 文件 | 原因 | 操作 |
|------|------|------|
| `src/ui/topbar.svelte` | 无人 import，功能已被 `topbar-menu.ts` 替代 | 删除 |

> `asset-picker.svelte` 不再删除——将在 Step 7 中重写为文件夹树选取器。

删除前检查：
```bash
rg "topbar\.svelte" src/     # 确认无 import
```

### 5.2 — 补缺失文件 `src/utils/theme.ts`

规则文档结构图列出该文件。检查现有代码中是否已有 theme 相关逻辑：

```bash
rg -r "isThemeDark|theme|dark|light" src/ --include="*.ts" -l
```

根据检查结果：
- 如有分散的 theme 逻辑，提取到 `src/utils/theme.ts`
- 如当前无 theme 逻辑，创建占位导出（最小实现），后续按需扩展

### 5.3 — 修复 `fileExists()` 职责分离 (V1)

`src/utils/fs.ts:66-70` — 动态 import api.ts：

```typescript
// 当前违规代码
const { readDir } = await import("./api")
const files = await readDir(parentPath)
return files.includes(targetName)
```

**修方案 A（推荐）**：将 `fileExists` 拆为两个导出函数：

```typescript
// fs.ts — 仅处理 local
export async function fileExistsLocal(path: string): Promise<boolean> {
    if (!isDesktop()) return false
    const fsp = getFsp()
    try { await fsp.access(path); return true }
    catch { return false }
}

// api.ts — 处理 upload/assets
export async function fileExistsRemote(path: string): Promise<boolean> {
    const parentPath = path.substring(0, path.lastIndexOf('/'))
    const targetName = path.substring(path.lastIndexOf('/') + 1)
    const files = await readDir(parentPath)
    return files.includes(targetName)
}
```

**修方案 B**：将 `fileExists` 完全移入 `sourceManager.ts`（调用方可直接 dispatch）。

### 5.4 — `src/ui/url-dialog.svelte` — 修复 createObjectURL 泄漏 (V5)

```svelte
<script lang="ts">
    import { onDestroy } from "svelte"

    let previewSrc = $state<string | null>(null)
    let blobUrl = $state<string | null>(null)

    function setPreview(blob: Blob) {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        blobUrl = URL.createObjectURL(blob)
        previewSrc = blobUrl
    }

    onDestroy(() => {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
    })
</script>
```

### 5.5 — 删除错误上传路径前导 `/` (V3)

`src/utils/fs.ts:48`：
```typescript
// 当前
if (rel.startsWith('data/')) rel = '/' + rel.slice('data/'.length)

// 修复后
if (rel.startsWith('data/')) rel = rel.slice('data/'.length)
```

### 5.6 — 删除误导性全局 mock 死代码 (V13)

`tests/vitest.setup.ts:10`：

```typescript
// 删除此行使可——所有 import { fetchPost } 已被 vitest alias 到 __mocks__/siyuan.ts
;(window as any).fetchPost = async () => ({ code: 0, data: null })
```

替换为 null 保护：
```typescript
if (!(window as any).fetchPost) {
    ;(window as any).fetchPost = () => {}
}
```

### 5.7 — 补充测试目录结构 (V12)

创建占位测试文件（可先 skip，后续按需实现）：

```
tests/ui/topbar.test.ts
tests/ui/settings.test.ts
tests/ui/sources/source-list.test.ts
tests/libs/dialog.test.ts
tests/utils/theme.test.ts
```

---

## 问题 0: `src/types.ts` vs `src/types/` 目录 — 调查结论

### 结论：无功能/设计重复，不建议合并

| 文件 | 内容 | 性质 |
|------|------|------|
| `src/types.ts` (57行) | `AppConfig`, `ImageItem`, `SourceConfig`, `DisabledThemes`, `ImageOverride`, `classifyFileType()` | **插件业务类型 (`export`)** |
| `src/types/index.d.ts` (106行) | `Block`, `DocumentId`, `BlockType`, `Notebook`, `interface Window` 等 | **思源 API 环境声明 (`declare`/`interface`)** |

差异：
- `types.ts` 是 `export interface`，用于插件内部模块间的类型导入
- `index.d.ts` 是 `declare type` / `interface Window`，属于**全局环境类型补全**（ambient declaration），让 TS 识别思源 JS API 的类型
- 合并会导致 `index.d.ts` 中 `declare type BlockId = string` 等失去全局声明效力，或 `export` 干预全局类型

**建议**: 保持分离。在 `folder-structure.md` 中将 `src/types/index.d.ts` 标注为"思源 API 外部类型声明"。

---

## Step 6: 设置面板五个 Tab 重构

### 6.1 — `config-tab.svelte`: UI 布局重构

**参考**: `.agents/references/siyuan-plugin-background-cover/src/ui/settings.ts` L87-190

**当前问题**:
- 缺少 `config__item` class（参考使用的间距样式）
- 缺少 `b3-label__text` 子描述文本
- 当前背景图片路径展示行结构不够清晰

**参考布局模式**:
```html
<label class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${label}
        <div class="b3-label__text">${description}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" ... />
</label>
```

**改动**:
1. 当前背景图片行: 文件路径 `<code>` + X/Y 偏移 slider
2. 开启背景: switch + 无描述
3. 自动刷新: switch + 时间输入 + `b3-label__text` 描述
4. 透明度 slider: label + aria-label tooltip
5. 虚化 slider: label + aria-label tooltip

### 6.2 — `sources-tab.svelte`: 添加 assets 文件夹按钮

**当前**: 顶部只有 `+ 添加本地目录` 按钮（desktop only），缺少 assets 入口。

**改动**: L180-186 按钮区域加 `+ 链接资源目录` 按钮，弹出 Step 7 的 assets 文件树 dialog。确认后写入 `configStore.assetDirs`。

### 6.3 — `theme-tab.svelte`: 功能无效 + UI 重构

**根因调查**: `darkThemes`/`lightThemes` 在 L5-6 初始化为 `$state<string[]>([])` 但**从未被赋值**。缺少 `src/utils/theme.ts` 的调用。

**参考**: `settings.ts` L555-662 `generatedisabledThemeElement()`

**改动**:
A. 新建 `src/utils/theme.ts`，导出：
```typescript
/**
 * 获取当前激活主题
 * @returns [modeIndex, themeName] — 0=light, 1=dark
 */
export function getCurrentThemeInfo(): [number, string]

/**
 * 获取已安装主题列表
 * @returns [lightThemes[], darkThemes[]]，每项 {name, label}
 */
export function getInstalledThemes(): Array<Array<{name: string, label: string}>>
```
通过 `(window as any).siyuan.config.appearance` 读取。

B. 重写 `theme-tab.svelte`:
- `onMount` 调用 `getInstalledThemes()` 填充数据
- 卡片布局 `.b3-cards` > `.b3-card.b3-card--wrap`（仿参考）
- 当前主题高亮（`var(--b3-theme-primary)`）
- 保留现有开关逻辑

### 6.4 — `advanced-tab.svelte`: 添加开发者模式

**参考**: `settings.ts` L265-307

**当前缺失**: `inDev` 配置键、开发者开关、调试信息展示。

**改动**:
A. `src/types.ts` AppConfig 添加: `inDev: boolean`
B. `src/stores/config.ts` 默认值添加: `inDev: false`
C. `advanced-tab.svelte`:
- 开发模式开关: `inDevModeLabel` + `inDevModeDes`（显示 frontend/backend/isMobile 等）
- 重置按钮改用 `confirmDialog()`（非 `window.confirm()`，与 UI 规则一致）

### 6.5 — `about-tab.svelte`: 版本号统一

**当前**: L2 `const version = "1.0.0-dev"` 硬编码，与 `plugin.json:5` 重复。

**改动**: `src/constants.ts` 从 `plugin.json` 导入版本：
```typescript
import pluginJson from "../plugin.json"
export const packageVersion = pluginJson.version
```
about-tab 使用 `{packageVersion}`。

---

## Step 7: Assets 文件夹文件树选取器

### 7.1 — 需求

`topbar-menu.ts` 中"链接资源目录"菜单项 (L203) 当前仅跳转设置面板（`cb.onOpenSettings("sources")`），无选择功能。

需实现 svelteDialog：递归遍历 `data/assets/` 下所有子文件夹 → 显示文件夹树 → 每文件夹后括号标注合法图片/视频数量 → 用户单选 → 确认。

### 7.2 — 递归树结构

`data/assets/` 下文件夹可能有嵌套：
```
data/assets/
├── wallpaper/           (48 图片, 3 视频)
│   └── nature/          (12 图片)
├── photos/              (5 图片)
└── empty/               (0 图片, 0 视频)
```

实现要点:
1. `readDir("/data/assets/")` 获取顶层条目
2. 对每个 `isDir` 子目录递归 `readDir`，累计统计文件
3. 文件夹内 file + 子文件夹递归均计入统计
4. 叶节点展开/折叠（参考 `b3-list-item__toggle` UI 规范）
5. 统计为 0 的文件夹灰显不可选
6. 单选 + 高亮 `b3-list-item--focus`
7. 根容器 `width: 100%`，只有确认按钮（无取消）

### 7.3 — 改动文件

A. **重写 `src/ui/sources/asset-picker.svelte`**（当前是死代码文本输入模式）
- 递归构建文件夹树 `DirNode { name, path, imageCount, videoCount, children }`
- 交互: 点击展开/折叠 + 点击选择 + 确认

B. **`topbar-menu.ts`** — 添加 `showAssetsDirDialog()` 函数，L203 替换为调用此函数

C. **`sources-tab.svelte`** — 顶部加 `+ 链接资源目录` 按钮（见 Step 6.2）

### 7.4 — 路径约定

- API 枚举: `"/data/assets/"` + 子路径
- 最终储存: `"assets/subfolder"`（匹配现有 `sources-tab.svelte:48` 路径构造）

---

## Step 8: 默认背景资源

### 8.1 — 需求

插件安装/重置后提供默认背景，让用户知道背景功能已启用。资源放在 `public/default/`。

### 8.2 — 路径格式

打包后 Vite 将 `public/default/` 复制到 `dist/default/`，思源加载后路径为：
- 本地文件: `data/plugins/siyuan-plugin-background-cover/default/xxx.jpg`
- Canvas URL: `plugins/siyuan-plugin-background-cover/default/xxx.jpg`

**因此 getFileUrl 不需要处理**——直接硬编码为 webview 相对路径即可：
```typescript
export const DEFAULT_BACKGROUNDS = [
    "plugins/siyuan-plugin-background-cover/default/default-01.jpg",
    "plugins/siyuan-plugin-background-cover/default/default-01.mp4",
]
```

由于是固定路径不需要 `readDir`，也不需要 `sourceType` 参与。

### 8.3 — 资源文件

MVP 使用低分辨率占位图（< 50KB），一份图片 + 一份视频：
```
public/default/
├── .gitkeep
├── default-01.jpg   (< 50KB, 来自 unsplash/自行生成)
└── default-01.mp4   (< 200KB, 静色纯色循环)
```

大文件不加入 `.gitignore`（因为文件小）。后续可选改为 CI 拉取。

### 8.4 — 代码改动

A. `src/constants.ts` — 添加默认背景常量：
```typescript
export const DEFAULT_BACKGROUNDS = [
    "plugins/siyuan-plugin-background-cover/default/default-01.jpg",
    "plugins/siyuan-plugin-background-cover/default/default-01.mp4",
]

export function pickDefaultBackground(): string {
    return DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)]
}
```

B. `src/index.ts` — `onload()` 中无 currentFile 时：
```typescript
if (!configStore.get("currentFile")) {
    const url = pickDefaultBackground()
    configStore.set("currentFile", url)
    configStore.save()
    renderImage(url)
    changeOpacity(configStore.get("opacity"))
}
```

C. `configStore.reset()` 后同样触发 `pickDefaultBackground()` + `renderImage()` + `changeOpacity()`。

---

## Step 9 (V18): 上传后背景不可见 Bug

### 问题位置

`src/ui/topbar-menu.ts:83-91` — `pickMultipleFiles()`  
`src/ui/topbar-menu.ts:174-183` — `pickFolderFiles()`

### 根因

上传流程调用 `renderImage(lastUrl)` 设置 canvas 背景图，但**未调用 `changeOpacity()`**。此时 `document.body` 保持原始不透明度（浏览器默认值），背景被完全不透明的 body 遮挡，用户看不到。

重启思源后 `onload()` → `applyBackground()` 同时调用了 `renderImage` + `changeOpacity`，所以背景可见。

### 当前代码

```typescript
if (lastUrl) {
    configStore.set("currentFile", lastUrl)
    configStore.save()
    const { renderImage, renderVideo } = await import("../services/bgRender")
    if (lastUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
        renderVideo(lastUrl)
    } else {
        renderImage(lastUrl)
    }
    // ← 缺失 changeOpacity / changeBlur 调用
}
```

### 改动方案

```typescript
if (lastUrl) {
    configStore.set("currentFile", lastUrl)
    configStore.save()
    const { renderImage, renderVideo, changeOpacity, changeBlur } = await import("../services/bgRender")
    if (lastUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
        renderVideo(lastUrl)
    } else {
        renderImage(lastUrl)
    }
    changeOpacity(configStore.get("opacity"))
    changeBlur(configStore.get("blur"))
}
```

`pickFolderFiles()` (L174-183) 同样修改。

---

## 执行顺序

```
Step 1 (V2: URL修复)
  → Step 2 (V16: 透明度公式)
    → Step 3 (V11: pause 保护)
      → Step 9 (V18: 上传不可见)  [关键 bug，紧接 Step 3]
        → Step 4 (V6: i18n) + Step 6 (设置面板)  [可并行]
          → Step 7 (Assets选取器) + Step 8 (默认背景)  [可并行]
            → Step 5 (清理收尾)
```

每个 Step 完成后运行 `pnpm test` 确保不引入回归。

---

## 预期产出

| 步骤 | 修改文件数 | 删除文件数 | 新增文件 |
|------|-----------|-----------|---------|
| Step 1~3 | 3 | 0 | 0 |
| Step 9 | 1 | 0 | 0 |
| Step 4 | ~13 | 0 | 2 (i18n 增量) |
| Step 5 | 4 | 1 (`topbar.svelte`) | 1 (`theme.ts`) + 5 (测试占位) |
| Step 6 | 7 | 0 | 0 |
| Step 7 | 2 | 1 (`asset-picker.svelte` 旧版) | 1 (`asset-picker.svelte` 新版) |
| Step 8 | 3 | 0 | 2-3 (`public/default/` 资源) |
| **合计** | **~33** | **2** | **~12** |
