# Phase 6：UI 重写 执行计划

## 一、前置条件

| 依赖 | Phase | 状态 |
|------|-------|------|
| `src/libs/dialog.ts` — `svelteDialog` 封装 | Phase 1 | 已完成 |
| `src/libs/setting-utils.ts` — `SettingUtils` 类 | Phase 1 | 已完成 |
| `src/stores/config.ts` — 配置 store | Phase 2 | 已完成 |
| `src/services/sourceManager.ts` — 源扫描逻辑 | Phase 4 | 已完成 |
| `src/services/bgRender.ts` — 背景渲染引擎 | Phase 5 | 已完成 |
| Svelte 5 组件运行时 | Phase 1 | Vite 构建已配置 |

---

## 二、目标

用 Svelte 5 组件替代所有 HTML 模板字符串（`settings.ts` ~550 行、`fileManager.ts` ~150 行、`topbar.ts` 的 Menu 构造），实现 master plan §4.9 的 UI 设计。同时移除 `src/ui/notice.ts`、`src/ui/components/dialogs.ts`、`src/ui/components/templates.ts` 中不再需要的对话框工具。

---

## 三、新组件树

```
src/ui/
├── topbar.svelte                  # 顶栏下拉菜单（替代旧 topbar.ts 的 Menu 构造）
├── settings/
│   ├── settings.svelte            # 设置面板主容器 + tab 导航
│   ├── config-tab.svelte          # 全局配置：开关、滑块、自动刷新
│   ├── sources-tab.svelte         # 资源池 tab（三种源类型统一展示）
│   ├── theme-tab.svelte           # 主题屏蔽 tab
│   ├── advanced-tab.svelte        # 高级设置 + 开发者模式
│   └── about-tab.svelte           # 关于 + 捐赠
└── sources/
    ├── source-list.svelte         # 单个源的树形文件列表
    └── asset-picker.svelte        # assets 子文件夹树选取器（替代旧 fileManager.ts）
```

---

## 四、逐组件设计

### 4.1 `topbar.svelte` — 顶栏下拉菜单

```svelte
<script lang="ts">
    import { Menu, getFrontend } from "siyuan";
    import { onMount } from "svelte";
    import { configStore } from "../stores/config";
    import { sourceManager } from "../services/sourceManager";
    import { bgRender } from "../services/bgRender";
    import { isDesktop } from "../utils/fs";

    interface Props {
        pluginInstance: any;   // BgCoverPlugin 引用，用于 addTopBar、addCommand 等
        onOpenSettings: (tab?: string) => void;
    }

    let { pluginInstance, onOpenSettings }: Props = $props();

    /*
     * Siyuan 的 Menu 类仍用于下拉菜单渲染（纯 JS 无法用 Svelte 替代），
     * 但菜单结构的构造逻辑和 handler 回调在此组件中集中管理。
     */

    function buildMenuItems() {
        return [
            // 选择一张背景 (submenu)
            {
                icon: "iconIndent",
                label: i18n.selectPictureLabel,
                type: "submenu",
                submenu: [
                    {
                        icon: "iconHand",
                        label: i18n.selectPictureManualLabel,
                        accelerator: pluginInstance.commands[0]?.customHotkey,
                        click: () => onOpenSettings("sources"),
                    },
                    {
                        icon: "iconMark",
                        label: i18n.selectPictureRandomLabel,
                        accelerator: pluginInstance.commands[1]?.customHotkey,
                        click: () => bgRender.pickRandomAndApply(),
                    },
                ],
            },
            // 添加图片 (submenu)
            {
                icon: "iconAdd",
                label: i18n.addImageLabel,
                type: "submenu",
                submenu: buildAddImageSubmenu(),
            },
            {
                icon: configStore.activate ? "iconClose" : "iconSelect",
                label: configStore.activate ? i18n.closeBackgroundLabel : i18n.openBackgroundLabel,
                accelerator: pluginInstance.commands[2]?.customHotkey,
                click: () => configStore.toggle("activate"),
            },
            { type: "separator" },
            {
                icon: "iconSettings",
                label: i18n.settingLabel,
                click: () => onOpenSettings(),
            },
            // desktop only: test window.require
            ...(isDesktop() ? [{
                icon: "iconCode",
                label: i18n.testWindowFsLabel,
                click: () => showFsTestDialog(),
            }] : []),
        ];
    }

    function buildAddImageSubmenu() {
        const items = [
            {
                icon: "iconImage",
                label: i18n.addSeveralImagesLabel,
                click: () => sourceManager.addLocalFiles(),
            },
            {
                icon: "iconFolder",
                label: i18n.addDirectoryLabel,
                click: () => sourceManager.addLocalFolder(),
            },
            {
                icon: "iconLink",
                label: i18n.addUrlLabel,
                click: () => showAddUrlDialog(),
            },
        ];
        if (isDesktop()) {
            items.unshift({
                icon: "iconFilesRoot",
                label: i18n.addLocalDirectorySource,
                click: () => sourceManager.addLocalSource(),
            });
        }
        items.push({
            icon: "iconFilesRoot",
            label: i18n.addNoteAssetsDirectoryLabel,
            click: () => showAssetPickerDialog(),
        });
        return items;
    }
</script>
```

**建议实现顺序**：

1. 将 `initTopbar()` 的逻辑迁移到 `topbar.svelte` 的 `onMount` 生命周期中
2. `addTopBar` 仍通过回调触发，在回调中创建 `Menu` 实例（Siyuan 原生能力，无法绕过）
3. Menu 的 `click` 回调从原来直接调用 UI 函数改为通过 props `onOpenSettings` / 直接调用 service 层

---

### 4.2 `settings/settings.svelte` — 设置面板主容器

```svelte
<script lang="ts">
    import { mount, unmount } from "svelte";
    import { Dialog } from "siyuan";
    import ConfigTab from "./config-tab.svelte";
    import SourcesTab from "./sources-tab.svelte";
    import ThemeTab from "./theme-tab.svelte";
    import AdvancedTab from "./advanced-tab.svelte";
    import AboutTab from "./about-tab.svelte";

    interface Props {
        activeTab?: string;   // 初始激活 tab: "config" | "sources" | "theme" | "advanced" | "about"
    }

    let { activeTab = "config" }: Props = $props();

    let currentTab = $state(activeTab);

    const tabs = [
        { name: "config",    icon: "#iconEdit",     label: "Tab 全局配置" },
        { name: "sources",   icon: "#iconImage",    label: "Tab 资源池" },
        { name: "theme",     icon: "#iconTheme",    label: "Tab 屏蔽主题" },
        { name: "advanced",  icon: "#iconRiffCard", label: "Tab 高级设置" },
        { name: "about",     icon: "#iconInfo",     label: "Tab 关于" },
    ];

    function switchTab(name: string) {
        currentTab = name;
    }
</script>

<div class="fn__flex-1 fn__flex config__panel" style="overflow: hidden; position: relative;">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each tabs as tab}
            <li
                data-name={tab.name}
                class="b3-list-item"
                class:b3-list-item--focus={currentTab === tab.name}
                onclick={() => switchTab(tab.name)}
                onkeydown={undefined}
            >
                <svg class="b3-list-item__graphic">
                    <use xlink:href={tab.icon}></use>
                </svg>
                <span class="b3-list-item__text">{tab.label}</span>
            </li>
        {/each}
    </ul>

    <div class="config__tab-wrap">
        <ConfigTab   display={currentTab === "config"} />
        <SourcesTab  display={currentTab === "sources"} />
        <ThemeTab    display={currentTab === "theme"} />
        <AdvancedTab display={currentTab === "advanced"} />
        <AboutTab    display={currentTab === "about"} />
    </div>
</div>
```

**关键决策**：

| 问题 | 决策 |
|------|------|
| Dialog 在哪管理？ | 由 `index.ts` 或调用方调用 `svelteDialog({ component: SettingsPanel, ... })`，`settings.svelte` 自身不创建 `Dialog` |
| 从顶部栏打开并定位到特定 tab | `topbar.svelte` 的 `onOpenSettings` 传入 `activeTab` prop |
| 每个 tab 用 `fn__none` 切换 | 每个 tab 组件接受 `display` prop，用 `$derived` 计算 CSS class |

---

### 4.3 `settings/config-tab.svelte` — 全局配置

```
┌──────────────────────────────────────────────────────┐
│  当前图片名: sunset.jpg                               │
│  偏移: [X: ──●──] [Y: ──○──]  (智能轴切换)         │
│                                                      │
│  █ 开启背景        [switch]                           │
│  ─────────────────                                    │
│  自动刷新          [switch]                           │
│  刷新间隔          [60] 分钟                          │
│                                                      │
│  透明度            [────────●] 0.5                    │
│  模糊度            [───●─────] 3px                    │
└──────────────────────────────────────────────────────┘
```

```svelte
<script lang="ts">
    import { configStore } from "../../stores/config";
    import { bgRender } from "../../services/bgRender";
    import { sourceManager } from "../../services/sourceManager";
    import { FormWrap, FormInput } from "../components/Form";

    interface Props {
        display: boolean;
    }

    let { display }: Props = $props();
    let fnNoneClass = $derived(display ? "" : "fn__none");

    let activate    = $derived(configStore.activate);
    let opacity     = $derived(configStore.opacity);
    let blur        = $derived(configStore.blur);
    let positionX   = $derived(configStore.positionX);
    let positionY   = $derived(configStore.positionY);
    let autoRefresh = $derived(configStore.autoRefresh);
    let refreshTime = $derived(configStore.autoRefreshTime);
    let currentFile = $derived(sourceManager.currentFileName);

    function handleConfigChanged(key: string, value: any) {
        configStore.set(key, value);
        bgRender.applySettings();
    }

    function handlePositionInput(axis: "X" | "Y", value: number) {
        if (axis === "X") configStore.positionX = value;
        else              configStore.positionY = value;
        bgRender.changeBgPosition(configStore.positionX, configStore.positionY);
    }

    function handlePositionChange(axis: "X" | "Y", value: number) {
        configStore.set(axis === "X" ? "positionX" : "positionY", value);
        bgRender.applySettings();
    }
</script>

<div class="config__tab-container {fnNoneClass}" data-name="config">
    <!-- 当前图片信息 + 位置偏移 -->
    <FormWrap title="当前图片" description="">
        <div class="fn__flex" style="gap: 12px; align-items: center;">
            <code class="fn__code">{currentFile ?? "（无）"}</code>
            <span class="fn__space"></span>
            <label for="posX">X</label>
            <input
                id="posX"
                class="b3-slider fn__size50"
                type="range" min="0" max="100" step="5"
                bind:value={positionX}
                oninput={() => handlePositionInput("X", positionX)}
                onchange={() => handlePositionChange("X", positionX)}
            />
            <label for="posY">Y</label>
            <input
                id="posY"
                class="b3-slider fn__size50"
                type="range" min="0" max="100" step="5"
                bind:value={positionY}
                oninput={() => handlePositionInput("Y", positionY)}
                onchange={() => handlePositionChange("Y", positionY)}
            />
        </div>
    </FormWrap>

    <!-- 开关 -->
    <FormWrap title="i18n:openBackgroundLabel" description="i18n:openBackgroundLabelDes">
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={activate}
            onchange={() => handleConfigChanged("activate", activate)}
        />
    </FormWrap>

    <div class="fn__hr"></div>

    <!-- 自动刷新 -->
    <FormWrap title="i18n:autoRefreshLabel" description="">
        <div class="fn__flex" style="gap: 12px;">
            <span>i18n:autoRefreshDes</span>
            <input class="b3-switch fn__flex-center" type="checkbox"
                bind:checked={autoRefresh}
                onchange={() => handleConfigChanged("autoRefresh", autoRefresh)}
            />
        </div>
        <div class="fn__flex" style="gap: 8px;">
            <span>i18n:autoRefreshTimeDes</span>
            <input class="b3-text-field fn__size200" type="number"
                min="0" max="36000"
                bind:value={refreshTime}
                disabled={!autoRefresh}
                onchange={() => handleConfigChanged("autoRefreshTime", refreshTime)}
            />
            <span>i18n:autoRefreshTimeUnit</span>
        </div>
    </FormWrap>

    <!-- 透明度滑块 -->
    <FormWrap title="i18n:opacityLabel" description="i18n:opacityDes">
        <div class="b3-tooltips b3-tooltips__n" aria-label={opacity}>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="1" step="0.05"
                bind:value={opacity}
                oninput={() => bgRender.changeOpacity(opacity)}
                onchange={() => handleConfigChanged("opacity", opacity)}
            />
        </div>
    </FormWrap>

    <!-- 模糊滑块 -->
    <FormWrap title="i18n:blurLabel" description="i18n:blurDes">
        <div class="b3-tooltips b3-tooltips__n" aria-label={blur}>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="10" step="1"
                bind:value={blur}
                oninput={() => bgRender.changeBlur(blur)}
                onchange={() => handleConfigChanged("blur", blur)}
            />
        </div>
    </FormWrap>
</div>
```

**关键 Point**：

- **智能轴切换**：`container` 宽高比 → 判断 X/Y 哪个是 full-side → 禁用该滑块；复用旧版 `CloseCV.getFullSide()` 放到 `utils/image.ts` 中
- **`oninput` vs `onchange`**：`oninput` 实时预览，`onchange` 持久化写入 store
- **`autoRefreshTimeInput` disabled**：当 `autoRefresh` 为 `false` 时禁用

---

### 4.4 `settings/sources-tab.svelte` — 资源池 tab

实现文件树的选项，即@.agents/plans/20260514_refactor_v1.md 中Line353-374的那种面板设置

```
全局设置  ┌───────────────── 66% width ───────────────────────┐────────33% width──────
         │                                                                              │       图片/视频缩略图预览区 
数据管理->│ 📁 插件缓存 ( 图片: 73  视频: 2  )                              [📂定位] [🗑 清空]│              
         │    ├── 🖼 sunset.jpg        [设为背景] [删除]                                │
屏蔽主题  │    ├── 🎬 waterfall.mp4     [设为背景] [删除]                                │
         │    └── 🖼 mountain.jpg      [设为背景] [删除]                                │
高级设置  │                                                                              │
         │ 📁 assets/wallpaper（图片: 12  视频: 0 ）                     [📂定位] [✕ 移除] │───────────────────
关于      │    ├── 🖼 beach.jpg          [设为背景]                                     │
         │    └── 🖼 forest.jpg         [设为背景]                                      │   图片信息展示区，如分辨率，文件大小，创建时间等
         │                                                                              │
         │ 📁 /home/user/Pictures/nature （图片: 45  视频: 1 ）           [📂定位] [✕ 移除]│
         │    ├── 🖼 lake.jpg           [设为背景]                                      │
         │    └── 🎬 timelapse.mp4      [设为背景]                                     │
         │                                                                              │
         │ [+ 添加本地目录] [+ 添加 assets 目录]                                           │
         ├────────────────────────────────────────────────────────────────── 

鼠标悬浮图片/视频文件名时 → 缩略图预览 (fetch blob + createObjectURL)
文件夹状态不可访问时 → 行变灰，checkbox 不可用，仅 [✕ 移除] 可用
```

文件树可以参考下面思源的 设置-快捷键-b3-label file-tree config-keymap类，来更符合思源笔记整体UI

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import { sourceManager } from "../../services/sourceManager";
    import { configStore } from "../../stores/config";
    import { isDesktop } from "../../utils/fs";
    import SourceList from "../sources/source-list.svelte";
    import { svelteDialog } from "../../libs/dialog";
    import AssetPicker from "../sources/asset-picker.svelte";
    import { showMessage } from "siyuan";

    interface Props {
        display: boolean;
    }

    let { display }: Props = $props();
    let fnNoneClass = $derived(display ? "" : "fn__none");

    let uploadFiles  = $state(sourceManager.getUploadFiles());
    let assetSources = $state(configStore.assetDirs);
    let localSources = $state(isDesktop() ? configStore.localFolders : []);

    function refreshAll() {
        uploadFiles  = sourceManager.getUploadFiles();
        assetSources = configStore.assetDirs;
        localSources = isDesktop() ? configStore.localFolders : [];
    }

    function handleRemoveAssetDir(index: number) {
        configStore.removeAssetDir(index);
        refreshAll();
    }

    function handleRemoveLocalDir(index: number) {
        configStore.removeLocalFolder(index);
        refreshAll();
    }

    function handleSetAsBackground(url: string) {
        sourceManager.setCurrentFile(url);
    }

    function handleDeleteUploadFile(url: string) {
        sourceManager.removeUploadFile(url);
        refreshAll();
    }

    function handleClearUploadCache() {
        sourceManager.clearUploadCache();
        refreshAll();
    }

    function handleAddLocalSource() {
        // 弹出路径输入 → 验证 → 加入 configStore.localFolders
    }

    async function showAssetPickerDialog() {
        const result = await new Promise<string[] | null>((resolve) => {
            svelteDialog({
                title: window.bgCoverPlugin.i18n.addNoteAssetsDirectoryLabel,
                component: AssetPicker,
                width: "600px",
                height: "70vh",
                callback: () => resolve(null),
            });
            // 注意：AssetPicker 需要通过某种方式传出结果
            // 方式 A：在 AssetPicker 的 props 中传入 onConfirm 回调
            // 方式 B：AssetPicker 内部 dialog.destroy() + 通过事件传递
        });
        if (result) {
            configStore.addAssetDirs(result);
            refreshAll();
        }
    }
</script>

<div class="config__tab-container {fnNoneClass}" data-name="sources">
    <!-- upload 源（固定） -->
    <SourceList
        sourceType="upload"
        label="i18n:cacheDirectoryLabel"
        sublabel="i18n:cacheDirectoryDes"
        files={uploadFiles}
        detailPath="data/public/siyuan-plugin-bgcover/"
        canDelete={true}
        canClear={true}
        canRemove={false}
        onSetAsBackground={handleSetAsBackground}
        onDeleteFile={handleDeleteUploadFile}
        onClearAll={handleClearUploadCache}
    />

    <!-- assets 源（从配置读取） -->
    {#each assetSources as assetDir, i}
        <SourceList
            sourceType="assets"
            label={`assets/${assetDir}`}
            files={sourceManager.getAssetFiles(assetDir)}
            detailPath={`data/assets/${assetDir}`}
            canDelete={false}
            canClear={false}
            canRemove={true}
            onSetAsBackground={handleSetAsBackground}
            onRemoveSource={() => handleRemoveAssetDir(i)}
        />
    {/each}

    <!-- local 源（从配置读取，desktop only） -->
    {#each localSources as localDir, i}
        <SourceList
            sourceType="local"
            label={localDir}
            files={sourceManager.getLocalFiles(localDir)}
            detailPath={localDir}
            canDelete={false}
            canClear={false}
            canRemove={true}
            inaccessible={sourceManager.isLocalPathInaccessible(localDir)}
            onSetAsBackground={handleSetAsBackground}
            onRemoveSource={() => handleRemoveLocalDir(i)}
        />
    {/each}

    <!-- 添加按钮 -->
    <div class="fn__flex" style="gap: 8px; padding: 12px;">
        {#if isDesktop()}
            <button class="b3-button b3-button--outline"
                onclick={handleAddLocalSource}>
                + 添加本地目录
            </button>
        {/if}
        <button class="b3-button b3-button--outline"
            onclick={showAssetPickerDialog}>
            + 添加 assets 目录
        </button>
    </div>
</div>
```

---

### 4.5 `sources/source-list.svelte` — 单个源的文件列表

```svelte
<script lang="ts">
    interface FileItem {
        name: string;
        url: string;
        type: "image" | "video";
    }

    interface Props {
        sourceType: "upload" | "assets" | "local";
        label: string;
        sublabel?: string;
        files: FileItem[];
        detailPath: string;
        canDelete: boolean;
        canClear: boolean;
        canRemove: boolean;
        inaccessible?: boolean;
        onSetAsBackground: (url: string) => void;
        onDeleteFile?: (url: string) => void;
        onClearAll?: () => void;
        onRemoveSource?: () => void;
    }

    let {
        sourceType, label, sublabel, files, detailPath,
        canDelete, canClear, canRemove, inaccessible = false,
        onSetAsBackground, onDeleteFile, onClearAll, onRemoveSource,
    }: Props = $props();

    let collapsed = $state(false);
    let imageCount = $derived(files.filter(f => f.type === "image").length);
    let videoCount = $derived(files.filter(f => f.type === "video").length);
    let hoveredFile = $state<string | null>(null);
    let hoverPreviewSrc = $state<string | null>(null);

    function handleMouseEnter(file: FileItem) {
        if (file.type !== "image") return;
        hoveredFile = file.url;
        // 对于 http(s) URL fetch 为 blob URL，对于 file:// 直接使用
        fetch(file.url)
            .then(res => res.blob())
            .then(blob => {
                if (hoveredFile === file.url) {
                    hoverPreviewSrc = URL.createObjectURL(blob);
                }
            })
            .catch(() => {});
    }

    function handleMouseLeave() {
        if (hoverPreviewSrc) URL.revokeObjectURL(hoverPreviewSrc);
        hoveredFile = null;
        hoverPreviewSrc = null;
    }
</script>

<div class="b3-label config__item"
    style:opacity={inaccessible ? "0.5" : "1"}
    style:pointer-events={inaccessible ? "none" : "auto"}
>
    <div class="fn__flex">
        <span class="fn__flex-1">
            📁 {label}
            <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                 ({sublabel || ""} 图片: {imageCount} 视频: {videoCount})
            </span>
        </span>
        <span class="fn__space"></span>
        <!-- 操作按钮 -->
        {#if canDelete || canClear}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={() => {} /* shell.openPath(detailPath) */}>
                📂 定位
            </button>
        {/if}
        {#if canClear}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onClearAll}>
                🗑 清空
            </button>
        {/if}
        {#if canRemove}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onRemoveSource}>
                ✕ 移除
            </button>
        {/if}
        {#if inactive}
            <!-- 灰色的 inacessible 提示 -->
            <span style="color: var(--b3-theme-error);">路径不可访问</span>
        {/if}
    </div>

    <div class="fn__hr"></div>

    <!-- 文件列表 -->
    <div class="b3-list b3-list--background">
        {#each files as file}
            <div class="b3-list-item b3-list-item--hide-action"
                onmouseenter={() => handleMouseEnter(file)}
                onmouseleave={handleMouseLeave}
            >
                <span class="b3-list-item__text">
                    {file.type === "image" ? "🖼" : "🎬"} {file.name}
                </span>
                <span class="b3-list-item__action" onclick={() => onSetAsBackground(file.url)}>
                    设为背景
                </span>
                {#if canDelete}
                    <span class="b3-list-item__action" onclick={() => onDeleteFile?.(file.url)}>
                        删除
                    </span>
                {/if}
            </div>
        {/each}
    </div>

    <!-- 鼠标悬浮缩略图预览 -->
    {#if hoverPreviewSrc}
        <div class="preview-overlay" data-hover-preview style="position: absolute;">
            <img src={hoverPreviewSrc} alt="preview"
                style="max-width: 240px; max-height: 160px; border-radius: 4px;" />
        </div>
    {/if}
</div>
```

**操作语义表**（对齐 master plan §4.9）：

| 操作 | upload | assets | local | local (inaccessible) |
|------|--------|--------|-------|---------------------|
| 设为背景 | ✓ | ✓ | ✓ | ✗（灰色） |
| 删除文件 | ✓ | ✗ | ✗ | ✗ |
| 清空目录 | ✓ | ✗ | ✗ | ✗ |
| 📂 定位 | ✓ | ✓ | ✓ | ✗ |
| ✕ 移除源 | ✗ | ✓ | ✓ | ✓ |

---

### 4.6 `sources/asset-picker.svelte` — Assets 文件夹树选取器

基于旧版 `fileManager.ts:openAssetsFolderPickerDialog()` 的核心逻辑，用 Svelte 重写的思路：

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import { KernelApi } from "../utils/api";

    interface Props {
        rootPath?: string;
        onConfirm: (selectedPaths: string[]) => void;
    }

    let { rootPath = "data/assets", onConfirm }: Props = $props();

    // ... 树形渲染逻辑，每个节点：
    //   - 显示文件夹名 + 图片计数 badge
    //   - checkbox 勾选/取消
    //   - 箭头展开/折叠（懒加载子目录）
    //
    // 核心差异：
    //   旧版：纯 DOM 操作 (createElement / innerHTML / appendChild)
    //   新版：Svelte 响应式树，利用 $state 追踪展开状态 + 选中集合
    //
    // 按钮：
    //   取消 → dialog.destroy()
    //   确认 → onConfirm(Array.from(selectedPaths))
</script>
```

**关键变化**：

1. 树节点状态（展开、选中、loading）用 `$state` 管理
2. 递归组件：每个树节点是一个 `TreeNode.svelte` 子组件
3. props 通过 `onConfirm` 回调传出结果，对话框层由调用方用 `svelteDialog` 管理

---

### 4.7 `settings/theme-tab.svelte` — 主题屏蔽

```svelte
<script lang="ts">
    /*
     * 替代旧 settings.ts 的 generatedisabledThemeElement() 函数。
     *
     * 逻辑：
     *   1. getInstalledThemes() → [lightThemes[], darkThemes[]]
     *   2. 为每个主题渲染一个卡片（name + label + switch）
     *   3. 当前主题高亮为蓝色
     *   4. switch 绑定到 configStore.disabledThemes[dark|light][themeName]
     */
</script>
```

用 `{#each}` 渲染，不再需要用 `DOMParser` 解析 HTML 字符串。

---

### 4.8 `settings/advanced-tab.svelte` — 高级设置

```svelte
<script lang="ts">
    /*
     * 替代旧 settings.ts 的高级 tab。
     *
     * 内容：
     *   - 重置配置按钮（确认对话框 + rmtree + configStore.reset()）
     *   - 开发者模式开关
     *   - Frontend / Backend / isMobileLayout / isBrowser 调试信息
     */
</script>
```

---

### 4.9 `settings/about-tab.svelte` — 关于

```svelte
<script lang="ts">
    import { packageVersion } from "../../constants";
    /*
     * 内容：
     *   - 当前版本号
     *   - 捐赠二维码（支付宝/微信）
     *   - GitHub 链接
     */
</script>
```

---

## 五、Dialog 集成方式

### 5.1 设置面板

```typescript
// src/index.ts 中

import { svelteDialog } from "./libs/dialog";
import SettingsPanel from "./ui/settings/settings.svelte";

function openSettings(activeTab?: string) {
    svelteDialog({
        title: `${i18n.addTopBarIcon} - ${i18n.settingLabel}`,
        component: SettingsPanel,
        props: { activeTab },
        width: isMobileLayout ? "92vw" : "max(520px, 60vw)",
        height: "max(520px, 60vh)",
    });
}
```

### 5.2 Assets 选取器

```typescript
async function showAssetPickerDialog() {
    return new Promise<string[] | null>((resolve) => {
        svelteDialog({
            title: i18n.addNoteAssetsDirectoryLabel,
            component: AssetPicker,
            props: {
                onConfirm: (paths: string[]) => resolve(paths),
            },
            width: "600px",
            height: "70vh",
            callback: () => resolve(null),   // dialog 关闭时
        });
    });
}
```

### 5.3 路径输入对话框（添加本地目录）

```typescript
async function showAddLocalSourceDialog() {
    const path = await inputDialogSync({
        title: i18n.addLocalDirectorySource,
        placeholder: "/home/user/Pictures/wallpaper",
        width: "520px",
    });
    if (path) {
        // 验证路径存在且为目录
        sourceManager.addLocalSource(path);
    }
}
```

---

## 六、Svelte 5 模式清单

| 模式 | 用途 | 示例位置 |
|------|------|---------|
| `$state()` | 局部响应式变量 | `currentTab`, `collapsed`, `hoveredFile` |
| `$derived()` | 派生值 | `imageCount`, `fnNoneClass`, `inacessible` |
| `$props()` + `interface` | 组件输入 | 每个 `.svelte` 的 `<script>` 顶部 |
| `$bindable()` | 双向绑定（滑块、开关） | `settings/config-tab.svelte` 的 `bind:checked`, `bind:value` |
| `onMount` / `onDestroy` | 生命周期 | topbar 初始化、Dialog destroy 回调 |
| callback props | 替换 `createEventDispatcher` | `onSetAsBackground`, `onConfirm` |
| `{#each}...{/each}` | 列表渲染 | 主题卡片、文件列表 |
| `{@render children?.()}` | Snippet (slot) | 继承 Form.Wrap 模式时 |

**注意**：Svelte 5 不再使用 `createEventDispatcher`。所有子→父通信通过 callback props。

---

## 七、测试计划

### 7.1 组件渲染测试

| 测试文件 | 测试内容 |
|---------|---------|
| `tests/ui/settings.test.ts` | settings.svelte: tab 切换、各 tab 内容正确渲染 |
| `tests/ui/config-tab.test.ts` | config-tab.svelte: 滑块值绑定、开关切换、自动刷新联动 |
| `tests/ui/sources-tab.test.ts` | sources-tab.svelte: 三种源类型渲染、文件列表、操作按钮 |
| `tests/ui/source-list.test.ts` | source-list.svelte: 文件 item 渲染、鼠标悬停预览、按钮回调 |
| `tests/ui/theme-tab.test.ts` | theme-tab.svelte: 主题卡片渲染、当前主题高亮、switch 绑定 |
| `tests/ui/topbar.test.ts` | topbar.svelte: 菜单项结构、desktop-only 条件渲染 |

### 7.2 Mock 策略

```typescript
// tests/vitest.setup.ts 已提供 window.siyuan, window.require 等全局 mock
// UI 测试额外 mock:

// mock svelteDialog 避免实际创建 Siyuan Dialog
vi.mock("../src/libs/dialog", () => ({
    svelteDialog: vi.fn((args) => ({
        component: {}, dialog: { destroy: vi.fn() }, close: vi.fn()
    })),
    inputDialogSync: vi.fn(),
    confirmDialog: vi.fn(),
}));

// mock sourceManager / configStore / bgRender
vi.mock("../src/services/sourceManager", () => ({
    sourceManager: {
        getUploadFiles: vi.fn(() => []),
        getAssetFiles: vi.fn(() => []),
        getLocalFiles: vi.fn(() => []),
        setCurrentFile: vi.fn(),
        removeUploadFile: vi.fn(),
        clearUploadCache: vi.fn(),
    },
}));
```

### 7.3 关键测试用例

```typescript
describe("ConfigTab", () => {
    it("should render all slider controls", () => { /* ... */ });
    it("should bind opacity value to slider", () => { /* ... */ });
    it("should disable autoRefreshTime when autoRefresh is off", () => { /* ... */ });
    it("should call bgRender.changeOpacity on slider input", () => { /* ... */ });
    it("should call configStore.set on slider change (commit)", () => { /* ... */ });
});

describe("SourceList", () => {
    it("should render file items with type icon", () => { /* ... */ });
    it("should show preview on mouse hover", async () => { /* ... */ });
    it("should not show delete button when canDelete=false", () => { /* ... */ });
    it("should gray out inaccessible items", () => { /* ... */ });
    it("should call onSetAsBackground when set-as-bg clicked", () => { /* ... */ });
});

describe("SourcesTab", () => {
    it("should render upload source with clear button", () => { /* ... */ });
    it("should render asset sources with remove button", () => { /* ... */ });
    it("should render local sources with remove button (desktop only)", () => { /* ... */ });
    it("should call showAssetPickerDialog on add assets button click", () => { /* ... */ });
});
```

---

## 八、文件清理

Phase 6 完成后，以下旧文件应移除或标记为废弃：

| 文件 | 处理 |
|------|------|
| `src/ui/settings.ts` | **删除**。逻辑迁移到 `settings/*.svelte` |
| `src/ui/fileManager.ts` | **删除**。逻辑迁移到 `sources/*.svelte` + `services/sourceManager.ts` |
| `src/ui/notice.ts` | **删除**。开发消息改用 `showMessage`；对话框改用 `confirmDialog`/`svelteDialog` |
| `src/ui/components/dialogs.ts` | **删除**。`showConfirmationDialog` → `confirmDialog`；`showNoticeDialog` → `svelteDialog` |
| `src/ui/components/templates.ts` | **删除**。模板字符串全部移除 |
| `src/ui/topbar.ts` | 保留 `initTopbar()` 调用处（`index.ts`），改为调用 `topbar.svelte` 组件。旧代码在迁移后删除 |
| `src/utils/pythonic.ts` | 保留 `OS.listdir()` / `OS.mkdir()` 等被 service 层使用的工具函数。移除 UI 专用的 `CloseCV` 引用 |

---

## 九、执行顺序

```
6.1  创建 src/ui/components/Form/ 目录，从参考项目复制 Form 组件
     （form-wrap.svelte, form-input.svelte, index.ts）
6.2  实现 settings/settings.svelte — 主容器 + tab 导航
6.3  实现 settings/config-tab.svelte — 全局配置
6.4  实现 sources/source-list.svelte — 文件列表（核心组件）
6.5  实现 settings/sources-tab.svelte — 资源池 tab
6.6  实现 sources/asset-picker.svelte — assets 树选取器
6.7  实现 settings/theme-tab.svelte — 主题屏蔽
6.8  实现 settings/advanced-tab.svelte — 高级设置
6.9  实现 settings/about-tab.svelte — 关于
6.10 实现 topbar.svelte — 顶栏菜单
6.11 修改 src/index.ts：onload 中启用 topbar.svelte + openSettings 调用
6.12 编写 tests/ui/ 下的所有组件测试
6.13 删除旧 UI 文件，运行 `pnpm test` 验证
6.14 运行 `pnpm build` 验证生产构建通过
```

---

## 十、风险与注意事项

1. **Siyuan Menu 类不可替代**：`Menu` 是 Siyuan 原生 JS API，不能也不应用 Svelte 重写。`topbar.svelte` 负责组织和触发 Menu，而非渲染 Menu DOM。
2. **Dialog 生命周期**：`svelteDialog` 在 `destroyCallback` 中调用 `unmount()`，确保组件销毁时清理 `$effect` 等副作用。
3. **国际化**：Svelte 模板中通过 `window.bgCoverPlugin.i18n.*` 访问翻译，因为思源在 `onload` 前注入 `this.i18n` 到 `window`。
4. **Desktop-only 条件**：所有涉及 `local` 源的 UI 用 `isDesktop()` 守卫，组件内用 `{#if isDesktop()}` 条件渲染。
5. **旧代码参考但不复制**：旧 `settings.ts` 的 `updateSettingPanelElementStatus()` 逻辑在 Svelte 5 中用 `$effect` 或直接绑定替代，不再需要手动 DOM 操作。

---

## 附录：参考代码速查

| 旧代码 | 行数 | 迁移目标 |
|--------|------|---------|
| `settings.ts:29-357` Dialog content 字符串 | ~330 | `settings/*.svelte` |
| `settings.ts:358-380` tab 切换逻辑 | ~20 | `settings/settings.svelte` |
| `settings.ts:382-437` 偏移滑块逻辑 | ~55 | `settings/config-tab.svelte` |
| `settings.ts:438-534` 各控件事件绑定 | ~100 | `settings/config-tab.svelte` |
| `settings.ts:554-662` 主题屏蔽生成 | ~110 | `settings/theme-tab.svelte` |
| `settings.ts:664-837` update/patch 函数 | ~170 | 删除（Svelte reactive 替代） |
| `fileManager.ts:327-420` 选择图片 Dialog | ~95 | `sources/source-list.svelte` |
| `fileManager.ts:422-523` 图片列表生成 | ~100 | `sources/source-list.svelte` |
| `fileManager.ts:530-701` assets 树选取器 | ~170 | `sources/asset-picker.svelte` |
| `topbar.ts:34-163` 顶栏菜单构建 | ~130 | `topbar.svelte` |
