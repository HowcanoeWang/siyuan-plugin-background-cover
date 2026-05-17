# UI 层开发规则

> 整理自 Phase 1-6 实施期间 Svelte 5 组件开发中建立的约束

---

## 一、Dialog 组件规范

### svelteDialog 子组件不需要「取消」按钮

Dialog wrapper 自带关闭机制：按 Escape、点击遮罩层外部均可关闭。组件内只需保留确认类按钮。

```svelte
<!-- ✅ 正确：只有确认按钮 -->
<div class="fn__flex" style="justify-content: flex-end;">
    <button class="b3-button b3-button--text" onclick={confirm}>确认</button>
</div>

<!-- ❌ 错误：多余的取消按钮（无效） -->
<div class="fn__flex" style="justify-content: flex-end; gap: 8px;">
    <button class="b3-button b3-button--cancel">取消</button>
    <button class="b3-button b3-button--text" onclick={confirm}>确认</button>
</div>
```

### svelteDialog 容器宽度须 100%

```svelte
<!-- 根容器必须 fill dialog -->
<div style="display: flex; flex-direction: column; gap: 12px; padding: 8px; width: 100%;">
```

---

## 二、URL 输入规范

### 必须 `oninput` + 防抖，不能仅 `onkeydown Enter`

粘贴操作不触发 `keydown`。

```svelte
<script>
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    function handleInput() {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => doCheck(url.trim()), 500)
    }
</script>

<input bind:value={url} oninput={handleInput} />
<!-- Enter 仅用于确认，非检测 -->
```

---

## 三、文件选择器规范

### 本地目录：用文本输入 + `fsp` 验证，不用 `webkitdirectory`

`webkitdirectory` 在 Electron 不同版本下 `files[0].path` 行为不一致（有时只返回文件夹名）。改用自定义 Dialog：

```
┌──────────────────────────────────────┐
│  添加本地目录                         │
├──────────────────────────────────────┤
│  路径: [___________________________] │  文本输入（oninput 防抖 500ms）
├──────────────────────────────────────┤
│  发现 48 张图片, 3 个视频 — ✅        │  fsp.access → fsp.readdir → classifyFileType
├──────────────────────────────────────┤
│                              [添加]  │
└──────────────────────────────────────┘
```

### 多文件选择：`<input multiple accept="image/*,video/*">`

```typescript
const input = document.createElement('input')
input.type = 'file'
input.multiple = true
input.accept = 'image/*,video/*'
input.onchange = () => { /* process files */ }
input.click()
```

### 整个目录选择：`<input webkitdirectory>`

```typescript
const input = document.createElement('input')
input.type = 'file'
input.setAttribute('webkitdirectory', '')
input.onchange = async () => {
    const validFiles = [...files].filter(f => classifyFileType(f.name) !== null)
    // ≥ 30 文件时需 confirmDialog 确认
}
input.click()
```

---

## 四、缩略图预览规范

### 必须配对 `createObjectURL` / `revokeObjectURL`

```typescript
let previewSrc: string | null = $state(null)

function loadPreview(url: string) {
    if (prevUrl) URL.revokeObjectURL(prevUrl)
    fetch(url).then(r => r.blob()).then(b => {
        previewSrc = URL.createObjectURL(b)
    })
}

function clearPreview() {
    if (prevUrl) URL.revokeObjectURL(prevUrl)
    previewSrc = null
}
```

---

## 五、思源原生 UI 类名规范

### 文件树折叠节点

```html
<div class="b3-list b3-list--border b3-list--background">
    <!-- 折叠头 -->
    <div class="b3-list-item b3-list-item--narrow toggle">
        <span class="b3-list-item__toggle b3-list-item__toggle--hl">
            <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={open}>
                <use xlink:href="#iconRight"></use>
            </svg>
        </span>
        <span class="b3-list-item__text ft__on-surface">标题</span>
    </div>
    <!-- 折叠内容 -->
    <div class="b3-list__panel">...</div>
</div>
```

### 文件列表项

```html
<label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action">
    <span class="b3-list-item__text fn__flex-1">文件名</span>
    <span class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="操作">
        <svg><use xlink:href="#iconXXX"></use></svg>
    </span>
</label>
```

### config-assets 分栏布局（文件列表 + 预览）

```html
<div class="config-assets" style="flex: 1; display: flex; flex-direction: column;">
    <div class="config-assets__list" style="flex: 0 0 55%; overflow-y: auto;">
        <!-- 文件列表 -->
    </div>
    <div class="fn__hr--b"></div>
    <div class="config-assets__preview" style="flex: 0 0 45%;">
        <!-- 预览区 -->
    </div>
</div>
```

---

## 六、菜单项标签规范

> 主计划 §4.9 和多次调整后的最终版本

| 菜单路径 | 最终 label | 备注 |
|---------|-----------|------|
| 选择一张背景 > 手动挑一个 | — | `i18n.selectPictureManualLabel` |
| 选择一张背景 > 随机抽一张 | — | `i18n.selectPictureRandomLabel` |
| 添加背景 | 添加背景 | 原「添加图片」 |
| ├ 链接本地目录 | 链接本地目录 | desktop only |
| ├ 链接资源目录 | `i18n.addNoteAssetsDirectoryLabel` | |
| ├ 上传多个文件 | 上传多个文件 | 原「上传多张本地图片」 |
| ├ 上传整个目录 | 上传整个目录 | |
| └ 添加网络资源 | 添加网络资源 | 原「上传一张网络图片」 |
| 关闭/打开背景 | — | `i18n.toggleBackgroundLabel` |
| 设置 | — | `i18n.settingLabel` |

---

## 七、禁止事项

| 禁止 | 原因 |
|------|------|
| svelteDialog 子组件放取消按钮 | Dialog 自带关闭机制 |
| URL 输入仅 `onkeydown Enter` | 粘贴不触发 |
| `webkitdirectory` 做本地目录选择 | 路径不可靠 |
| `createObjectURL` 后不 `revoke` | 内存泄漏 |
| 硬编码中文文本 | 使用 `i18n` 键或 `window.bgCoverPlugin.i18n.*` |
