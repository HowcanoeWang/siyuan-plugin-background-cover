# 动态订阅源功能实施计划

> 创建于 2026-05-19 | 方案 A：直接 canvas URL + CSS 双层 fallback

## 背景

支持类似 `https://imgapi.cn/api.php?fl=fengjing&gs=images` 的随机图片 API，每次返回不同背景图。

## 设计决策

| 决策 | 理由 |
|------|------|
| **跳过可达性检测** | 失败时 CSS fallback 自动兜底，无需预检+缓存基础设施 |
| **直接插入 canvas CSS** | `canvasEl.style.backgroundImage = url(...)` 而非下载到本地 |
| **CSS 双层 background-image 做 fallback** | `url(dynamic), url(fallback)` — dynamic 失败自动暴露 fallback |
| **缓存破坏** | 渲染时追加 `?_t=timestamp` |
| **动态 URL 默认 image 类型** | 不存在返回视频的动态 API |
| **混合预设+自定义** | 插件内置维护低频失效的预设，用户可添加自己的 URL |

## UI 布局

动态 URL group 放在 SourcesTab **最顶部**：

```
┌─ 数据源管理 ────────────────────────────────────────────────┐
│                                                              │
│  [+ 链接本地目录]  [+ 链接资源目录]                            │
│                                                              │
│  ▼ iconCloud 动态网络壁纸                                    [+添加]  │
│     ├─ [✓] 必应每日壁纸 (https://api.dujin.org/bing/1920.php) │ ← 预设，无删除
│     ├─ [ ] 随机风景 (xxxx full url)                           │ ← 预设
│     ├─ [ ] Unsplash 随机 (xxxx full url)                     │ ← 预设
│     ├─ [✓] https://imgapi.cn/api.php?...            [🗑]      │ ← 自定义，可删
│     └─ [✓] https://example.com/myapi.php           [🗑]      │ ← 自定义，可删
│                                                              │
│  ▼ 📦 Plugin Cache（云同步）              (Images:2 Videos:1) │
│     ...                                                      │
│  ▼ 📁 assets/...                                             │
│     ...                                                      │
```


## 文件改动清单

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `src/types.ts` | 修改 | `sourceType` 联合添加 `'dynamic'` |
| 2 | `src/constants.ts` | 修改 | `DYNAMIC_BG_PRESETS` + `DYNAMIC_BG_FALLBACK_URL` + `isDynamicUrl()` |
| 3 | `src/stores/config.ts` | 修改 | `AppConfig` 新增 `dynamicBgUrls: string[]` |
| 4 | `src/services/bgRender.ts` | 修改 | `render(forceType?)` + `renderDynamic(url, fallback)` |
| 5 | `src/services/sourceManager.ts` | 修改 | `scanDynamicUrls()` + `scanAll` 含 dynamic + `getSourceLabel` |
| 6 | `src/index.ts` | 修改 | `randomSelect` / `applyBackground` 处理 dynamic 分支 |
| 7 | `src/ui/settings/SourcesTab.svelte` | 修改 | 顶部新增动态 URL group（预设 checkbox + [+添加] + 自定义删除） |
| 8 | `src/ui/settings/ConfigTab.svelte` | 修改 | `currentFile` 对 dynamic URL 格式化显示（预设名/域名截断） |
| 9 | `src/ui/settings/AboutTab.svelte` | 修改 | 视频背景素材站推荐 |
| 10 | `src/ui/dialogs/index.ts` | 修改 | 新增 `showAddDynamicUrlDialog()` |
| 11 | `public/i18n/zh_CN.json` | 修改 | ~12 新键 |
| 12 | `public/i18n/en_US.json` | 修改 | ~12 新键 |


## 详细设计

### 1. `src/types.ts`

```typescript
export interface ImageItem {
    name: string
    url: string
    apiPath: string
    type: 'image' | 'video'
    sourceType: 'local' | 'upload' | 'assets' | 'dynamic'  // 新增 'dynamic'
    sourceLabel: string
}
```

### 2. `src/constants.ts`

```typescript
export const DYNAMIC_BG_PRESETS: { id: string; name: string; url: string }[] = [
    { id: 'bing_1920',     name: '必应每日壁纸(1920x1080)',          url: 'https://api.dujin.org/bing/1920.php' },
    { id: 'bing_1366',     name: '必应每日壁纸(1366x768)', url: 'https://api.dujin.org/bing/1366.php' },
    { id: 'unsplash_random', name: 'Unsplash 随机图片 (1600x900)', url: 'https://unsplash.it/1600/900?random' },
    { id: 'imgapi_scenic', name: 'imgapi随机风景',  url: 'https://imgapi.cn/api.php?fl=fengjing&gs=images' },
    { id: 'acg_sx',        name: '后宫漫图',              url: 'https://acg.sx/images?utm_source=ld246.com' },
    { id: 'img_xjh',       name: '岁月小筑随机动漫图片',  url: 'https://img.xjh.me/random_img.php' },

]

export const DYNAMIC_BG_FALLBACK_URL = "plugins/siyuan-plugin-background-cover/default/404.jpg"

/**
 * 判断 URL 是否为动态源（无已知图片/视频后缀且是 http 开头）
 */
export function isDynamicUrl(url: string): boolean {
    const clean = url.split('?')[0]
    const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
    return !IMAGE_EXTS.has(ext) && !VIDEO_EXTS.has(ext) && url.startsWith('http')
}
```

### 3. `src/stores/config.ts`

```typescript
const APP_CONFIG_DEFAULTS: AppConfig = {
    // ...existing...
    dynamicBgUrls: [],
}
```

### 4. `src/services/bgRender.ts`

```typescript
// ① render() 接受可选类型强制
export function render(url: string, forceType?: 'image' | 'video'): void {
    const type = forceType ?? detectType(url)
    if (type === 'image') renderImage(url)
    else if (type === 'video') renderVideo(url)
}

// ② CSS 双层 background-image 实现自动 fallback
export function renderDynamic(url: string, fallbackUrl: string): void {
    if (!canvasEl) return
    if (videoEl) {
        videoEl.style.display = 'none'
        try { videoEl.pause() } catch { /* ignored */ }
        videoEl.removeAttribute('src')
    }
    currentMode = 'image'
    canvasEl.style.display = ''
    canvasEl.style.backgroundImage = `url('${url}'), url('${fallbackUrl}')`
    canvasEl.style.backgroundSize = 'cover, cover'
}
```

### 5. `src/services/sourceManager.ts`

```typescript
export async function scanAll(
    assetDirs: string[] = [],
    localFolders: string[] = [],
    dynamicBgUrls: string[] = [],   // 新增参数
): Promise<ImageItem[]> {
    const tasks: Promise<ImageItem[]>[] = [
        scanSource('upload', pluginAssetsDir),
        scanDynamicUrls(dynamicBgUrls),   // 新增
    ]
    const validAssetDirs = assetDirs.filter(d => d.length > 0)
        .map(dir => {
            const normalized = toAssetRelPath(dir)
            return `/data/${normalized}`
        })
    tasks.push(...validAssetDirs.map(path => scanSource('assets', path + '/')))
    // ...local folder logic...
    const batch = await Promise.all(tasks)
    return batch.flat()
}

export function scanDynamicUrls(urls: string[]): ImageItem[] {
    return urls.map(url => {
        const preset = DYNAMIC_BG_PRESETS.find(p => p.url === url)
        return {
            name: preset?.name ?? new URL(url).hostname,
            url,
            apiPath: url,            // 无本地路径，用 URL 本身
            type: 'image' as const,
            sourceType: 'dynamic' as const,
            sourceLabel: 'dynamic',
        }
    })
}

// getSourceLabel 新增 case
function getSourceLabel(type: 'local' | 'upload' | 'assets' | 'dynamic', path: string): string {
    switch (type) {
        case 'dynamic':
            return 'dynamic'
        // ...existing cases...
    }
}
```

### 6. `src/index.ts`

**randomSelect** — 纳入 dynamic URLs 到随机池：

```typescript
async randomSelect() {
    const assetDirs = configStore.get("assetDirs")
    const localFolders = configStore.get("localFolders")
    const dynamicBgUrls = configStore.get("dynamicBgUrls")  // 新增
    const pool = await scanAll(assetDirs, localFolders, dynamicBgUrls)
    if (pool.length === 0) return
    const exclude = pool.length > 1 ? configStore.get("currentFile") : null
    const item = pickRandom(pool, exclude)
    if (!item) return

    configStore.set("currentFile", item.url)
    configStore.save()

    if (item.sourceType === 'dynamic') {
        const cb = item.url + (item.url.includes('?') ? '&' : '?') + '_t=' + Date.now()
        renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
    } else if (item.type === 'image') {
        renderImage(item.url)
    } else {
        renderVideo(item.url)
    }
    changeOpacity(configStore.get("opacity"))
    changeBlur(configStore.get("blur"))
    changePosition(configStore.get("positionX"), configStore.get("positionY"))
}
```

**applyBackground** — 处理无后缀的 dynamic URL：

```typescript
private applyBackground() {
    try {
        const currentFile = configStore.get("currentFile")
        if (!currentFile) return

        // 优先判断动态 URL
        if (isDynamicUrl(currentFile)) {
            const cb = currentFile + (currentFile.includes('?') ? '&' : '?') + '_t=' + Date.now()
            renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
        } else {
            const ext = '.' + (currentFile.split('.').pop()?.toLowerCase() ?? '')
            if (VIDEO_EXTS.has(ext)) {
                renderVideo(currentFile)
            } else if (IMAGE_EXTS.has(ext)) {
                renderImage(currentFile)
            } else {
                console.warn(`[bgCover] applyBackground: unknown extension "${ext}" for ${currentFile}`)
                return
            }
        }
    } finally {
        // opacity, blur, position...
    }
    // autoRefresh timer...
}
```

**onload** — 初始化扫描包含 dynamic：

```typescript
// onload 中 scanAll 调用
const dynamicBgUrls = configStore.get("dynamicBgUrls")
const pool = await scanAll(assetDirs, localFolders, dynamicBgUrls)
```

### 7. `src/ui/settings/SourcesTab.svelte`

**新增 dynamic group 到顶部**：

```svelte
<script lang="ts">
    import { isDynamicUrl, DYNAMIC_BG_PRESETS, DYNAMIC_BG_FALLBACK_URL } from "../../constants"
    import { renderDynamic } from "../../services/bgRender"

    // 动态订阅源相关状态
    let dynamicUrls = $state<string[]>(configStore.get("dynamicBgUrls"))

    function togglePreset(url: string) {
        if (dynamicUrls.includes(url)) {
            dynamicUrls = dynamicUrls.filter(u => u !== url)
        } else {
            dynamicUrls = [...dynamicUrls, url]
        }
        configStore.set("dynamicBgUrls", dynamicUrls)
        configStore.save()
        if (url === configStore.get("currentFile")) reselectBackground()
        refreshAll()
    }

    function isPreset(url: string): boolean {
        return DYNAMIC_BG_PRESETS.some(p => p.url === url)
    }

    function removeDynamicUrl(url: string) {
        dynamicUrls = dynamicUrls.filter(u => u !== url)
        configStore.set("dynamicBgUrls", dynamicUrls)
        configStore.save()
        if (url === configStore.get("currentFile")) reselectBackground()
        refreshAll()
    }

    async function addDynamicUrlDialog() {
        showAddDynamicUrlDialog((url: string) => {
            if (!dynamicUrls.includes(url)) {
                dynamicUrls = [...dynamicUrls, url]
                configStore.set("dynamicBgUrls", dynamicUrls)
                configStore.save()
                refreshAll()
            }
        })
    }

    // scanAll 传入 dynamicBgUrls
    async function refreshAll() {
        const dynamicBgUrls = configStore.get("dynamicBgUrls")
        // ...existing scan logic, pass dynamicBgUrls to scanAll...
    }
</script>

<div class="b3-list b3-list--border b3-list--background">
    <!-- ▼ 动态网络壁纸 Group -->
    <!-- 仅在 dynamicUrls 非空或有预设列表时显示 -->
    <div class="b3-list-item b3-list-item--narrow toggle"
         class:b3-list-item--focus={!dynamicCollapsed}
         onclick={() => dynamicCollapsed = !dynamicCollapsed}>
        <span class="b3-list-item__toggle b3-list-item__toggle--hl">
            <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={!dynamicCollapsed}>
                <use xlink:href="#iconRight"></use>
            </svg>
        </span>
        <svg class="b3-list-item__graphic"><use xlink:href="#iconCloud"></use></svg>
        <span class="b3-list-item__text fn__flex-1">{i18n.dynamicBgGroup}</span>
        <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
            aria-label={i18n.addDynamicUrl}
            onclick={(e) => { e.stopPropagation(); addDynamicUrlDialog() }}
            onkeydown={undefined} role="button" tabindex="0">
            <svg><use xlink:href="#iconAdd"></use></svg>
        </span>
    </div>

    {#if !dynamicCollapsed}
        <div class="b3-list__panel">
            <!-- 预设项 -->
            {#each DYNAMIC_BG_PRESETS as preset}
                <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                    class:b3-list-item--focus={preset.url === configStore.get("currentFile")}>
                    <span class="fn__flex-1" onclick={() => { /* set as bg */ }}>
                        <input type="checkbox"
                            checked={dynamicUrls.includes(preset.url)}
                            onchange={() => togglePreset(preset.url)}
                        />
                        <span style="margin-left: 8px;">
                            {i18n.presetPrefix} {preset.name}
                            <span style="color: var(--b3-theme-on-surface); font-size: 0.8em; display: block;">
                                {preset.url}
                            </span>
                        </span>
                    </span>
                </label>
            {/each}

            <!-- 自定义 URL -->
            {#each dynamicUrls.filter(u => !isPreset(u)) as url}
                <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                    class:b3-list-item--focus={url === configStore.get("currentFile")}>
                    <span class="b3-list-item__text fn__flex-1"
                        onclick={() => { /* set as bg */ }}>
                        <svg><use xlink:href="#iconLink"></use></svg>
                        {url}
                    </span>
                    <span class="b3-list-item__action"
                        onclick={(e) => { e.preventDefault(); e.stopPropagation(); removeDynamicUrl(url) }}
                        onkeydown={undefined} role="button" tabindex="0">
                        <svg><use xlink:href="#iconTrashcan"></use></svg>
                    </span>
                </label>
            {/each}
        </div>
    {/if}

    <!-- 现有的 upload / assets / local groups... -->
</div>
```

**设为背景** — 点击动态 URL 项时：

```typescript
function setDynamicAsBackground(url: string) {
    const cb = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now()
    configStore.set("currentFile", url)  // 存原始 URL（无 cache-bust）
    configStore.save()
    renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
    changeOpacity(configStore.get("opacity"))
    changeBlur(configStore.get("blur"))
}
```

### 8. `src/ui/settings/ConfigTab.svelte`

```typescript
function formatCurrentFile(url: string | null): string {
    if (!url) return i18n.none
    // 动态 URL：查找预设名或显示截断域名
    if (isDynamicUrl(url)) {
        const preset = DYNAMIC_BG_PRESETS.find(p => p.url === url)
        if (preset) return `🌐 ${preset.name}`
        const hostname = new URL(url).hostname
        return `🌐 ${hostname}...`
    }
    return url
}
```

```svelte
<code class="fn__code">{formatCurrentFile(currentFile)}</code>
```

### 9. `src/ui/settings/AboutTab.svelte`

在现有内容末尾追加视频背景素材站推荐：

```svelte
<div class="fn__hr"></div>
<div class="b3-label">
    {i18n.videoBgRecommend}
    <div class="b3-label__text">{i18n.videoBgRecommendDesc}</div>
</div>
<div class="ft__breakword" style="font-size: 0.85em;">
    • Pexels Videos — pexels.com/videos<br>
    • Pixabay Videos — pixabay.com/videos<br>
    • Videezy — videezy.com<br>
    • Coverr — coverr.co
</div>
```

### 10. `src/ui/dialogs/index.ts`

复用现有 `UrlDialog.svelte` 或新建 `DynamicUrlDialog.svelte`。扩展现有 `showUrlDialog` 为双模式：

```typescript
import DynamicUrlDialog from './DynamicUrlDialog.svelte'

export function showAddDynamicUrlDialog(onSuccess: (url: string) => void): void {
    svelteDialog({
        title: i18n.addDynamicUrlTitle,
        width: "520px",
        component: DynamicUrlDialog,
        props: { onSuccess },
    })
}
```

或者直接扩展 `UrlDialog.svelte` 添加 `mode: 'upload' | 'dynamic'` prop，根据后缀自动判定。

**自动类型判断**（`UrlDialog.svelte` 中 `checkExt` 扩展）：

| URL 后缀模式 | 判定 | 结果标签 |
|-------------|------|---------|
| `.jpg`, `.png`, `.webp` ... | 普通图片 → upload | `📁 文件资源（下载并缓存到本地）` |
| `.mp4`, `.webm` ... | 普通视频 → upload | `📁 文件资源（下载并缓存到本地）` |
| `.php`, 无后缀 ... | **动态源** → dynamic | `🌐 动态图像源（每次返回不同图片）` |

```typescript
function classifyUrlType(ext: string): 'upload' | 'dynamic' {
    if (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) return 'upload'
    return 'dynamic'
}
```

### 11. i18n 新增键

| 键 | 中文 | 英文 | 用途 |
|----|------|------|------|
| `dynamicBgGroup` | 动态网络壁纸 | Dynamic Web Wallpaper | group 标题 |
| `addDynamicUrl` | 添加订阅源 | Add Feed | [+添加] tooltip |
| `addDynamicUrlTitle` | 添加动态背景源 | Add Dynamic Background Source | Dialog 标题 |
| `detectedDynamic` | 动态图像源（每次返回不同图片） | Dynamic image source (different each time) | 检测结果标签 |
| `detectedUpload` | 文件资源（下载并缓存到本地） | File resource (download & cache) | 检测结果标签 |
| `addToDynamic` | 添加到订阅源 | Add to Feeds | 按钮 (dynamic 模式) |
| `uploadToCache` | 上传到缓存 | Upload to Cache | 按钮 (upload 模式) |
| `dynamicUrlHint` | 输入图片 API 或图片 URL | Enter image API or image URL | 输入框 placeholder |
| `videoBgRecommend` | 视频背景素材推荐 | Video Background Resources | About 小标题 |
| `videoBgRecommendDesc` | 动态订阅源仅支持图片背景。如需视频背景，请从以下网站下载后通过本地上传添加。 | Dynamic feeds support images only. For video backgrounds, download from these sites and add via local upload. | About 说明 |
| `presetPrefix` | [预设] | [Preset] | 预设项名称前缀 |
| `removeDynamic` | 移除订阅源 | Remove Feed | 删除 tooltip |


## 验证清单

- [ ] 勾选预设 → `dynamicBgUrls` 写入 config，`save()`
- [ ] 取消勾选预设 → 从 `dynamicBgUrls` 移除
- [ ] 点击 [+添加] → Dialog 弹出，输入 URL → fetch 检测 → 后缀自动分类
- [ ] 无后缀 URL → 判定为 dynamic，按钮为「添加到订阅源」
- [ ] 有图片后缀 URL → 判定为 upload，按钮为「上传到缓存」
- [ ] 有视频后缀 URL → 判定为 upload，按钮为「上传到缓存」
- [ ] URL 不可达 → 添加按钮禁用，显示错误信息
- [ ] 自定义 URL 添加成功 → 出现在 dynamic group 列表中
- [ ] 自定义 URL 删除 → 从 `dynamicBgUrls` 移除，若为当前背景则触发 reselect
- [ ] `随机抽一张` → dynamic URL 入选随机池，选中后 cache-bust 渲染
- [ ] 动态 URL 加载成功 → canvas 显示图片
- [ ] 动态 URL 加载失败 → CSS fallback 自动显示默认背景图
- [ ] 关闭再打开背景 → `applyBackground()` 正确识别 dynamic URL 并渲染
- [ ] 启动时 `changeBgOnStart` → dynamic URL 参与随机，正确渲染
- [ ] ConfigTab 当前背景 → dynamic URL 显示为预设名或截断域名
- [ ] AboutTab → 显示视频素材站推荐列表
- [ ] i18n 中英文切换正常
- [ ] 预设项无删除按钮（仅 checkbox），自定义 URL 有删除按钮
- [ ] 删除预设的最后一个"自定义URL"后，group 仍可见（预设列表存在）


## 禁止事项

- ❌ 不做批量可达性检测和本地缓存
- ❌ 不支持视频动态 URL
- ❌ 预设 URL 不提供删除按钮
- ❌ 不硬编码中文文本（全部走 i18n 键）
- ❌ 不使用 `createObjectURL` 做缩略图预览
- ❌ 不在 `for...of` 中串行 `await` 扫描
