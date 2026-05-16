# Phase 5 执行计划：背景渲染重写

## 目标

重写 `src/services/bgRender.ts`，从纯 canvas 图片模式升级为**图片（canvas）+ 视频（video）双模式**渲染引擎。

---

## 一、当前代码分析

### 1.1 现有 bgRender.ts 的关键行号

| 行号 | 功能 | 现状 |
|------|------|------|
| 17-43 | `createBgLayer()` | 仅创建 `<canvas>` 元素，设置 background-* 样式 |
| 75-86 | `changeBackgroundContent()` | 通过 `background-image: url(...)` 渲染图片；视频模式为桩代码 |
| 99-107 | `changeOpacity()` | 直接修改 `document.body.style.opacity` |
| 109-112 | `changeBlur()` | 对 canvas 设置 `filter: blur()` |
| 114-124 | `changeBgPosition()` | 对 canvas 设置 `background-position` |
| 126-210 | `applySettings()` | 混合了应用设置、随机选取、autoRefresh 逻辑、per-image offset |

### 1.2 现有问题

- **紧耦合**：`bgRender.ts` 直接调用 `fileManagerUI`、`settingsUI`、`topbarUI`（循环依赖风险）
- **单模式**：视频功能完全未实现，仅有桩代码
- **职责不清**：`applySettings()` 混合了渲染 + 随机选择 + autoRefresh + per-image offset
- **硬编码**：Demo 图片 URL 等不应出现在渲染引擎中

### 1.3 VSCode 参考 (FileDom.ts)

VSCode 插件的视频创建方式（行 835-894）：
```javascript
video = document.createElement('video');
video.id = 'background-cover-video';
video.autoplay = true;
video.loop = true;
video.muted = true;
video.style.objectFit = 'cover';
video.style.position = 'absolute';
video.style.zIndex = '2';
video.style.pointerEvents = 'none';
document.body.prepend(video);
```

---

## 二、新架构设计

### 2.1 模块职责

`bgRender.ts` 是一个**纯渲染引擎**，不依赖 UI 模块、不执行配置读写。它只做两件事：
1. 管理 DOM 元素（canvas / video）
2. 对元素应用样式

配置的读写、随机选择、定时器调度等逻辑由调用方（store / index.ts）负责。

### 2.2 API 设计

```typescript
// ---- 生命周期 ----
/** 创建背景层 DOM（canvas + video），插入到 <head> 之前 */
export function createBgLayer(): void

/** 销毁背景层 DOM，清理定时器 */
export function destroyBgLayer(): void

// ---- 渲染 ----
/** 渲染图片：显示 canvas，隐藏 video，设置 background-image */
export function renderImage(url: string): void

/** 渲染视频：显示 video，隐藏 canvas，设置 video.src */
export function renderVideo(url: string): void

/** 隐藏/移除背景（不销毁 DOM，仅 display:none） */
export function clearLayer(): void

/** 切换可见性（主题黑名单用） */
export function setVisible(visible: boolean): void

// ---- 样式 ----
/** 设置透明度。图片模式改 body opacity，视频模式改 video opacity */
export function changeOpacity(val: number): void

/** 设置模糊度。对当前活跃层设置 filter: blur() */
export function changeBlur(val: number): void

/** 设置图片偏移。仅对 canvas 有效，video 模式无操作 */
export function changePosition(x: number, y: number): void

/** 应用 per-image 覆盖偏移。先查 overrides，无则用全局默认 */
export function applyOverrides(overrides?: { positionX?: number; positionY?: number }): void

// ---- 自动刷新 ----
/** 启动定时刷新 */
export function startAutoRefresh(callback: () => void, intervalMs: number): void

/** 停止定时刷新 */
export function stopAutoRefresh(): void
```

### 2.3 内部状态

```typescript
let canvasEl: HTMLCanvasElement | null = null;
let videoEl: HTMLVideoElement | null = null;
let currentMode: 'image' | 'video' | null = null;
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
```

### 2.4 元素创建详细规格

#### Canvas 元素（图片背景）

```typescript
canvasEl = document.createElement('canvas');
canvasEl.id = 'bglayer';
canvasEl.style.backgroundRepeat = 'no-repeat';
canvasEl.style.backgroundAttachment = 'fixed';
canvasEl.style.backgroundSize = 'cover';           // 统一 cover
canvasEl.style.backgroundPosition = '50% 50%';     // 默认居中
canvasEl.style.width = '100%';
canvasEl.style.height = '100%';
canvasEl.style.position = 'absolute';
canvasEl.style.zIndex = '-10000';
canvasEl.style.display = 'none';                   // 初始隐藏
```

#### Video 元素（视频背景）

```typescript
videoEl = document.createElement('video');
videoEl.id = 'bgvideo';
videoEl.autoplay = true;
videoEl.loop = true;
videoEl.muted = true;
videoEl.playsInline = true;                        // 移动端需要
videoEl.style.objectFit = 'cover';                 // 统一 cover
videoEl.style.objectPosition = '50% 50%';          // 无用户偏移支持
videoEl.style.width = '100%';
videoEl.style.height = '100%';
videoEl.style.position = 'absolute';
videoEl.style.zIndex = '-10000';
videoEl.style.display = 'none';                    // 初始隐藏
videoEl.style.pointerEvents = 'none';              // 透传鼠标事件
```

#### 层级与插入位置

两个元素均插入到 `<html>` 下、`<head>` 之前：
```typescript
const htmlEl = document.documentElement;
htmlEl.insertBefore(canvasEl, document.head);
htmlEl.insertBefore(videoEl, document.head);
```

Z-index 顺序（canvas 在上以支持 blur 滤镜渲染在 body 之上但用户可见）：
- body / 内容层：z-index auto（正常流）
- canvas（图片层）：z-index -10000
- video（视频层）：z-index -9999（比 canvas 稍高，防止被遮挡）

### 2.5 渲染模式自动检测

```typescript
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif'];

function detectType(url: string): 'image' | 'video' | null {
    const ext = '.' + url.split('.').pop()?.toLowerCase().split('?')[0];
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
    return null; // 无法识别
}

/**
 * 统一渲染入口：根据 URL 扩展名自动选择 canvas 或 video
 * 调用方无需手动区分类型
 */
export function render(url: string): void {
    const type = detectType(url);
    if (type === 'image') renderImage(url);
    else if (type === 'video') renderVideo(url);
}
```

### 2.6 renderImage() 流程

```typescript
export function renderImage(url: string): void {
    if (!canvasEl) return;
    currentMode = 'image';
    
    // 隐藏 video，显示 canvas
    if (videoEl) {
        videoEl.style.display = 'none';
        videoEl.pause();
        videoEl.removeAttribute('src');
    }
    canvasEl.style.display = '';
    canvasEl.style.backgroundImage = `url('${url}')`;
}
```

### 2.7 renderVideo() 流程

```typescript
export function renderVideo(url: string): void {
    if (!videoEl) return;
    currentMode = 'video';
    
    // 隐藏 canvas，显示 video
    if (canvasEl) canvasEl.style.display = 'none';
    videoEl.style.display = '';
    videoEl.src = url;
    videoEl.play().catch((e) => {
        if (e.name !== 'AbortError') {
            console.warn('[bgRender] video play failed:', e);
        }
    });
}
```

### 2.8 透明度的两种实现

根据 master plan §3.4：
- **图片模式**：改 `document.body.style.opacity`（图片通过 canvas 的 `background-image` 渲染，透明度需要 body 层面）
- **视频模式**：改 `video.style.opacity`（video 元素自身支持 opacity）

```typescript
export function changeOpacity(val: number): void {
    // val 是滑块值（0~4，对应正文 §二透明度说明中 0.25 步长），映射为 0.99 ~ 0.0
    const opacity = 0.99 - 0.25 * val;
    
    if (currentMode === 'image') {
        document.body.style.opacity = String(opacity);
        if (videoEl) videoEl.style.removeProperty('opacity');
    } else if (currentMode === 'video' && videoEl) {
        videoEl.style.opacity = String(opacity);
        document.body.style.removeProperty('opacity');
    }
}
```

### 2.9 changePosition() / applyOverrides() 逻辑

仅对 `currentMode === 'image'` 有效。video 模式下直接跳过。

```typescript
export function changePosition(x: number, y: number): void {
    if (!canvasEl || currentMode !== 'image') return;
    if (x == null || y == null) {
        canvasEl.style.backgroundPosition = 'center';
    } else {
        canvasEl.style.backgroundPosition = `${x}% ${y}%`;
    }
}

export function applyOverrides(overrides?: { positionX?: number; positionY?: number }): void {
    if (currentMode !== 'image') return;
    const posX = overrides?.positionX ?? confStore.get('positionX') ?? 50;
    const posY = overrides?.positionY ?? confStore.get('positionY') ?? 50;
    changePosition(posX, posY);
}
```

> **注意**：`applyOverrides()` 需要访问配置 store。可以在调用方传入解析后的值，或模块内部 import store。这里建议 **由调用方传入已解析的 x/y**，保持 bgRender 无 store 依赖。

### 2.10 自动刷新

```typescript
export function startAutoRefresh(callback: () => void, intervalMs: number): void {
    stopAutoRefresh();
    if (intervalMs <= 0) return;
    autoRefreshTimer = setInterval(callback, intervalMs);
}

export function stopAutoRefresh(): void {
    if (autoRefreshTimer !== null) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}
```

### 2.11 销毁

```typescript
export function destroyBgLayer(): void {
    stopAutoRefresh();
    // 恢复 body opacity
    document.body.style.removeProperty('opacity');
    // 移除 DOM
    canvasEl?.remove();
    videoEl?.remove();
    canvasEl = null;
    videoEl = null;
    currentMode = null;
}
```

---

## 三、设计决策汇总

| 决策 | 选择 | 依据 |
|------|------|------|
| 尺寸模式 | 统一 `cover` | 主计划 §4.5 |
| 图片渲染 | `<canvas>` 元素 + `background-image` | 保留现有方案，支持 position offset |
| 视频渲染 | `<video>` 元素 + `object-fit:cover` | VSCode 参考，CSS 能力限制 |
| 视频位置偏移 | 不支持 | CSS video 无 `background-position` |
| 透明度实现 | 图片→body opacity，视频→video opacity | master plan §3.4 |
| 类型判定 | 扩展名匹配 | master plan §3.2，快速路径 |
| 非 Electron 端 | 移除 `file:///` 协议检测 | 渲染引擎不关心 URL 协议 |
| Per-image offset | 调用方传入已解析值 | bgRender 不读配置 |
| 自动刷新 | 回调模式（不调用 UI 模块） | 解耦，调用方决定刷新逻辑 |

---

## 四、重构范围与文件树

```
src/services/
└── bgRender.ts          ← 重写（~120 行）

影响文件 (调用方调整)：
└── src/index.ts         ← 更新 bgRender API 调用
```

---

## 五、实施步骤

### Step 1: 删除旧文件，创建新骨架

删除 `src/services/bgRender.ts` 全部内容，按 §2 设计重建。

### Step 2: 实现 DOM 元素管理

- `createBgLayer()` — 创建 canvas + video 双元素
- `destroyBgLayer()` — 清理 DOM 和定时器
- `setVisible()` — 主题黑名单切换

### Step 3: 实现渲染函数

- `renderImage()` / `renderVideo()` — 双模式渲染
- `render()` — 自动检测扩展名的统一入口
- `clearLayer()` — 隐藏背景
- `detectType()` — 扩展名→类型

### Step 4: 实现样式控制

- `changeOpacity()` — 图片/视频双路径
- `changeBlur()` — 统一 filter
- `changePosition()` / `applyOverrides()` — 仅图片

### Step 5: 实现自动刷新

- `startAutoRefresh()` / `stopAutoRefresh()`

### Step 6: 类型定义更新

更新 `src/types.ts`，移除 `bgMode` 枚举（由 `detectType()` 替代），新增 `RenderMode` 类型。

### Step 7: 更新调用方

更新 `src/index.ts` 中对 `bgRender` 的调用：
- `applySettings()` 逻辑拆分到 index.ts 或 store 中
- 不再从 bgRender.ts 直接引用 UI 模块

### Step 8: 测试

编写 `tests/services/bgRender.test.ts`，覆盖：
- `createBgLayer()` / `destroyBgLayer()` — DOM 元素生命周期
- `renderImage()` / `renderVideo()` — 元素切换与样式设置
- `detectType()` — 扩展名识别与未知类型处理
- `changeOpacity()` — 图片/视频不同路径
- `changeBlur()` — filter 应用
- `changePosition()` / `applyOverrides()` — 偏移逻辑
- `startAutoRefresh()` / `stopAutoRefresh()` — 定时器管理
- `setVisible()` — 显示/隐藏切换

---

## 六、边界情况检查清单

- [ ] `createBgLayer()` 被调用两次 → 不创建重复元素
- [ ] URL 带 query string（如 `file.jpg?t=123`）→ `detectType()` 正确处理
- [ ] URL 大小写混合（如 `.MP4`）→ 扩展名匹配不区分大小写
- [ ] 视频播放失败（跨域、格式不支持）→ `play().catch()` 静默处理
- [ ] 在 `clearLayer()` 后设置样式 → 空元素检查，guard clause
- [ ] 图片模式下调用 `changePosition()` 且 `currentMode !== 'image'` → 直接返回
- [ ] `startAutoRefresh()` 传入 0 或负数 → 不创建定时器
- [ ] 移动端 `autoplay` → 必须 `muted` 且加 `playsInline`
- [ ] 展开名配置允许用户自定义 → 从 `constants.ts` 或配置 store 读取，不硬编码
