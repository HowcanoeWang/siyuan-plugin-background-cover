<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { isDesktop } from "../../utils/fs"
    import { scanSource } from "../../services/sourceManager"
    import { renderImage, renderVideo, renderDynamic, changeOpacity, changeBlur, changePosition } from "../../services/bgRender"
    import { confirmDialog } from "../../libs/dialog"
    import { pluginAssetsDir, pickDefaultBackground, DYNAMIC_BG_PRESETS, DYNAMIC_BG_FALLBACK_URL, isDynamicUrl, VIDEO_EXTS } from "../../constants"
    import { removeFile } from "../../utils/api"
    import { toAssetRelPath } from "../../utils/path"
    import { devLog } from "../../utils/logger"
    import {
        showLocalDirDialog,
        showAssetsDirDialog,
        showUrlDialog,
        showAddDynamicUrlDialog,
        setupMultipleFilePicker,
        setupFolderFilePicker,
    } from "../dialogs"
    import type { ImageItem } from "../../types"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    interface SourceGroup {
        type: 'upload' | 'assets' | 'local'
        label: string
        path: string
        removable: boolean
        files: ImageItem[]
        inaccessible: boolean
        collapsed: boolean
        configKey: string
    }

    let groups = $state<SourceGroup[]>([])
    let selectedItem = $state<ImageItem | null>(null)
    let previewSrc = $state<string | null>(null)
    let previewObjectUrl = $state<string | null>(null)
    let previewVideoSrc = $state<string | null>(null)
    let dynamicCollapsed = $state(false)
    let dynamicUrls = $state<string[]>([])
    let customDynamicUrls = $state<string[]>([])

    let currentBg = $state<string | null>(null)
    let posX = $state(50)
    let posY = $state(50)
    let hasOverride = $state(false)
    let xDisabled = $state(false)
    let yDisabled = $state(false)

    function detectRelevantAxis() {
        xDisabled = false; yDisabled = false
        if (!currentBg) return
        const ext = '.' + (currentBg.split('.').pop()?.toLowerCase() ?? '')
        if (VIDEO_EXTS.has(ext)) return
        if (isDynamicUrl(currentBg)) return

        const img = new Image()
        img.onload = () => {
            const imgAR = img.naturalWidth / img.naturalHeight
            const vpW = document.documentElement.clientWidth
            const vpH = document.documentElement.clientHeight
            if (vpW === 0 || vpH === 0) return
            const vpAR = vpW / vpH
            xDisabled = imgAR < vpAR - 0.01
            yDisabled = imgAR > vpAR + 0.01
            if (xDisabled) posX = 50
            if (yDisabled) posY = 50
        }
        img.src = currentBg
    }

    function syncCurrentBg() {
        currentBg = configStore.get("currentFile")
        const override = configStore.get("imageOverrides")[currentBg ?? '']
        posX = override?.positionX ?? 50
        posY = override?.positionY ?? 50
        hasOverride = !!override
        detectRelevantAxis()
    }

    function savePositionOverride() {
        if (!currentBg) return
        const overrides = { ...configStore.get("imageOverrides") }
        if (posX === 50 && posY === 50) {
            delete overrides[currentBg]
        } else {
            overrides[currentBg] = { positionX: posX, positionY: posY }
        }
        configStore.set("imageOverrides", overrides)
        configStore.save()
        hasOverride = !!overrides[currentBg]
    }

    function clearOverride(url: string) {
        const overrides = { ...configStore.get("imageOverrides") }
        delete overrides[url]
        configStore.set("imageOverrides", overrides)
        configStore.save()
        if (url === currentBg) {
            posX = 50; posY = 50
            hasOverride = false
            changePosition(50, 50)
        }
    }

    function presetDisplayName(preset: typeof DYNAMIC_BG_PRESETS[number]): string {
        return i18n[preset.nameKey] ?? preset.name
    }

    onMount(() => {
        dynamicUrls = [...configStore.get("dynamicBgUrls")]
        customDynamicUrls = [...configStore.get("customDynamicUrls")]
        syncCurrentBg()
        refreshAll()
    })

    async function refreshAll() {
        const newGroups: SourceGroup[] = []

        const uploadFiles = await scanSource('upload', pluginAssetsDir)
        newGroups.push({
            type: 'upload',
            label: i18n.pluginCache,
            path: pluginAssetsDir,
            removable: false,
            files: uploadFiles,
            inaccessible: false,
            collapsed: false,
            configKey: '',
        })

        const assetDirs = configStore.get("assetDirs").filter(Boolean)
        const localFolders = isDesktop() ? configStore.get("localFolders").filter(Boolean) : []

        const assetTasks = assetDirs.map(async (dir) => {
            const normalized = toAssetRelPath(dir)
            const path = `/data/${normalized}`
            const label = normalized.startsWith('assets/') ? normalized.slice('assets/'.length) : normalized
            const files = await scanSource('assets', path + '/')
            return { type: 'assets' as const, label, path, files, normalized }
        })

        const localTasks = localFolders.map(async (dir) => {
            const files = await scanSource('local', dir + (dir.endsWith('/') ? '' : '/'))
            return { type: 'local' as const, label: dir, path: dir, files }
        })

        const allScanResults = await Promise.all([...assetTasks, ...localTasks])

        for (const r of allScanResults) {
            if (r.type === 'assets') {
                newGroups.push({
                    type: 'assets', label: r.label, path: r.path,
                    removable: true, files: r.files,
                    inaccessible: r.files.length === 0 && r.path.length > 0,
                    collapsed: false, configKey: r.normalized,
                })
            } else {
                newGroups.push({
                    type: 'local', label: r.label, path: r.path,
                    removable: true, files: r.files,
                    inaccessible: r.files.length === 0,
                    collapsed: false, configKey: r.label,
                })
            }
        }

        groups = newGroups
    }

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

    function toggleCustomDynamic(url: string) {
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

    function removeCustomDynamic(url: string) {
        dynamicUrls = dynamicUrls.filter(u => u !== url)
        customDynamicUrls = customDynamicUrls.filter(u => u !== url)
        configStore.set("dynamicBgUrls", dynamicUrls)
        configStore.set("customDynamicUrls", customDynamicUrls)
        configStore.save()
        if (url === configStore.get("currentFile")) reselectBackground()
        refreshAll()
    }

    function addDynamicUrl() {
        showAddDynamicUrlDialog((url: string) => {
            if (!customDynamicUrls.includes(url)) {
                customDynamicUrls = [...customDynamicUrls, url]
                dynamicUrls = [...dynamicUrls, url]
                configStore.set("customDynamicUrls", customDynamicUrls)
                configStore.set("dynamicBgUrls", dynamicUrls)
                configStore.save()
                refreshAll()
            }
        })
    }

    function setDynamicAsBackground(url: string) {
        const cb = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now()
        configStore.set("currentFile", url)
        configStore.save()
        renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
        changeOpacity(configStore.get("opacity"))
        changeBlur(configStore.get("blur"))
    }

    function toggleGroup(i: number) {
        groups[i].collapsed = !groups[i].collapsed
        groups = groups
    }

    function openAssetDirDialog() {
        showAssetsDirDialog((paths: string[]) => {
            for (const dir of paths) addAssetFolder(dir)
        })
    }

    function openLocalDirDialog() {
        showLocalDirDialog((path: string) => {
            addLocalFolder(path)
        })
    }

    function addAssetFolder(dir: string) {
        if (!dir) return
        devLog("[bgCover] addAssetFolder:", dir)
        const dirs = [...configStore.get("assetDirs"), dir]
        configStore.set("assetDirs", dirs)
        configStore.save()
        refreshAll()
    }

    function addLocalFolder(path: string) {
        if (!path) return
        devLog("[bgCover] addLocalFolder:", path)
        const folders = [...configStore.get("localFolders"), path]
        configStore.set("localFolders", folders)
        configStore.save()
        refreshAll()
    }

    function removeGroup(i: number) {
        const g = groups[i]
        devLog("[bgCover] removeGroup:", g.type, g.configKey)
        const currentFile = configStore.get("currentFile")
        const wasCurrentInGroup = g.files.some(f => f.url === currentFile)
        if (g.type === 'assets') {
            const dirs = [...configStore.get("assetDirs")]
            const idx = dirs.indexOf(g.configKey)
            if (idx >= 0) {
                dirs.splice(idx, 1)
                configStore.set("assetDirs", dirs)
                configStore.save()
            }
        } else if (g.type === 'local') {
            const dirs = [...configStore.get("localFolders")]
            const idx = dirs.indexOf(g.configKey)
            if (idx >= 0) {
                dirs.splice(idx, 1)
                configStore.set("localFolders", dirs)
                configStore.save()
            }
        }
        clearPreview()
        if (wasCurrentInGroup) {
            reselectBackground()
        }
        refreshAll()
    }

    function setAsBackground(item: ImageItem) {
        devLog("[bgCover] setAsBackground:", item.name)
        configStore.set("currentFile", item.url)
        configStore.save()
        if (item.type === 'image') {
            renderImage(item.url)
        } else {
            renderVideo(item.url)
        }
        syncCurrentBg()
        const ov = configStore.get("imageOverrides")[item.url]
        if (ov) changePosition(ov.positionX ?? 50, ov.positionY ?? 50)
    }

    function selectPreview(item: ImageItem) {
        if (selectedItem?.url === item.url) {
            clearPreview()
            return
        }
        selectedItem = item
        if (item.type === 'image') {
            loadPreview(item.url)
        } else {
            previewVideoSrc = item.url
        }
    }

    function clearPreview() {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
        selectedItem = null
        previewSrc = null
        previewObjectUrl = null
        previewVideoSrc = null
    }

    function loadPreview(url: string) {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
        previewObjectUrl = null
        previewSrc = null
        fetch(url)
            .then(r => r.blob())
            .then(b => {
                if (selectedItem?.url === url) {
                    previewObjectUrl = URL.createObjectURL(b)
                    previewSrc = previewObjectUrl
                }
            })
            .catch(() => {})
    }

    async function clearCache() {
        const group = groups.find(g => g.type === 'upload')
        if (!group || group.files.length === 0) return
        const imgCount = group.files.filter(f => f.type === 'image').length
        const vidCount = group.files.filter(f => f.type === 'video').length
        const parts: string[] = []
        if (imgCount > 0) parts.push(`${imgCount} ${i18n.imageCount}`)
        if (vidCount > 0) parts.push(`${vidCount} ${i18n.videoCount}`)
        const confirmed = await new Promise<boolean>(resolve => {
            confirmDialog({
                title: i18n.clearCacheTitle,
                content: `${i18n.clearCacheConfirm} ${parts.join('、')}`,                confirm: () => resolve(true),
                cancel: () => resolve(false),
                width: "360px",
            })
        })
        if (!confirmed) return
        devLog("[bgCover] clearCache:", group.files.length, "files")
        const wasCurrentDeleted = group.files.some(f => f.url === configStore.get("currentFile"))
        for (const file of group.files) {
            await removeFile(file.apiPath)
        }
        if (wasCurrentDeleted) await reselectBackground()
        refreshAll()
    }

    function openInFileManager(group: SourceGroup) {
        const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
        let absPath = group.path
        if (group.type === 'upload' || group.type === 'assets') {
            absPath = wsDir + absPath
        }
        try {
            const shell = (window as any).require?.('electron')?.shell
            if (shell) {
                shell.openPath(absPath)
            } else {
                const { exec } = (window as any).require?.('child_process') ?? {}
                if (exec) {
                    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
                    exec(`${cmd} "${absPath}"`)
                }
            }
        } catch { /* ignore */ }
    }

    async function reselectBackground() {
        configStore.set("currentFile", null)
        await configStore.save()
        await (window as any).bgCoverPlugin?.plugin?.randomSelect?.()
        if (!configStore.get("currentFile")) {
            configStore.set("currentFile", pickDefaultBackground())
            await configStore.save()
            ;(window as any).bgCoverPlugin?.plugin?.applyBackground?.()
        }
    }

    async function deleteFile(file: ImageItem) {
        devLog("[bgCover] deleteFile:", file.name)
        const wasCurrent = file.url === configStore.get("currentFile")
        await removeFile(file.apiPath)
        if (wasCurrent) await reselectBackground()
        refreshAll()
    }

    function pickMultipleFiles() {
        setupMultipleFilePicker(() => { refreshAll() })
    }

    function pickFolderFiles() {
        setupFolderFilePicker(() => { refreshAll() })
    }

    function showAddUrlDialog() {
        showUrlDialog((uploadUrl?: string) => {
            if (uploadUrl) {
                configStore.set("currentFile", uploadUrl)
                configStore.save()
                if (uploadUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                    renderVideo(uploadUrl)
                } else {
                    renderImage(uploadUrl)
                }
                changeOpacity(configStore.get("opacity"))
                changeBlur(configStore.get("blur"))
            }
            refreshAll()
        })
    }
</script>

<div class="config__tab-container" data-name="sources">

    <div class="fn__flex-column" style="height: 100%">

        {#if currentBg}
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                {i18n.currentFile}
                <div class="b3-label__text"><code class="fn__code">{currentBg}</code></div>
            </div>
            <div class="fn__flex-center" style="gap: 8px; flex-shrink: 0;">
                <div>
                    <label>X</label>
                    <input class="b3-slider fn__size50" type="range"
                        min="0" max="100" step="5"
                        bind:value={posX}
                        disabled={xDisabled}
                        title={xDisabled ? i18n.axisDisabledX : ''}
                        oninput={() => changePosition(posX, posY)}
                        onchange={savePositionOverride}
                    />
                </div>
                <div>
                    <label>Y</label>
                    <input class="b3-slider fn__size50" type="range"
                        min="0" max="100" step="5"
                        bind:value={posY}
                        disabled={yDisabled}
                        title={yDisabled ? i18n.axisDisabledY : ''}
                        oninput={() => changePosition(posX, posY)}
                        onchange={savePositionOverride}
                    />
                </div>
            </div>
        </label>
        {/if}

        <div class="b3-label">
            <div class="fn__flex-1">
                {i18n.videoNoticeTitle || '推荐视频素材站'}
                <span class="fn__space"></span>
                <a href="https://www.pexels.com/videos/" target="_blank" rel="noopener noreferrer">Pexels</a>
                <span class="fn__space"></span>
                <a href="https://pixabay.com/videos/" target="_blank" rel="noopener noreferrer">Pixabay</a>
                <span class="fn__space"></span>
                <a href="https://www.videezy.com/" target="_blank" rel="noopener noreferrer">Videezy</a>
                <span class="fn__space"></span>
                <a href="https://coverr.co/" target="_blank" rel="noopener noreferrer">Coverr</a>
                <div class="b3-label__text" style="display: flex; gap: 12px; ">
                    {i18n.videoBgRecommendDesc || '动态订阅源仅支持图片。如需视频背景请下载后通过本地上传添加。'}
                </div>
            </div>
        </div>

        <div class="fn__flex-1">

            <div class="config-assets" style="padding: 0 24px;">

                <div class="fn__flex">
                    {#if isDesktop()}
                    <button class="b3-button b3-button--outline fn__flex-center fn__size200" onclick={openLocalDirDialog}>
                        <svg><use xlink:href="#iconUpload"></use></svg> {i18n.addLocalDir}
                    </button>
                    {/if}
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--outline fn__flex-center fn__size200" onclick={openAssetDirDialog}>
                        <svg><use xlink:href="#iconUpload"></use></svg> {i18n.linkAssetsDir}
                    </button>
                </div>

                <div class="fn__hr"></div>

                <div class="b3-list b3-list--border b3-list--background  config-assets__list">

                    <div class="b3-list-item b3-list-item--narrow toggle"
                        class:b3-list-item--focus={!dynamicCollapsed}
                        onclick={() => dynamicCollapsed = !dynamicCollapsed}
                        onkeydown={undefined}
                        role="button"
                        tabindex="0"
                    >
                        <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                            <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={!dynamicCollapsed}>
                                <use xlink:href="#iconRight"></use>
                            </svg>
                        </span>
                        <svg class="b3-list-item__graphic"><use xlink:href="#iconCloud"></use></svg>
                        <span class="b3-list-item__text fn__flex-1">{i18n.dynamicBgGroup} ({i18n.dynamicBGGroupHint})</span>
                        <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                            aria-label={i18n.addDynamicUrl || '添加订阅源'}
                            onclick={(e: MouseEvent) => { e.stopPropagation(); addDynamicUrl() }}
                            onkeydown={undefined} role="button" tabindex="0">
                            <svg><use xlink:href="#iconAdd"></use></svg>
                        </span>
                    </div>
                    {#if !dynamicCollapsed}
                        <div class="b3-list__panel">
                            {#each DYNAMIC_BG_PRESETS as preset}
                                <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                                    class:b3-list-item--focus={configStore.get("currentFile") === preset.url}
                                    onclick={() => setDynamicAsBackground(preset.url)}
                                >
                                    <span class="fn__flex-1">
                                        <input type="checkbox"
                                            checked={dynamicUrls.includes(preset.url)}
                                            onchange={() => togglePreset(preset.url)}
                                            onclick={(e: MouseEvent) => e.stopPropagation()}
                                        />
                                        <span style="margin-left: 8px;">
                                            {presetDisplayName(preset)}
                                            <span style="color: var(--b3-theme-on-surface);">
                                                {preset.url}
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            {/each}
                            {#each customDynamicUrls as url}
                                <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                                    class:b3-list-item--focus={configStore.get("currentFile") === url}
                                    onclick={() => setDynamicAsBackground(url)}
                                >
                                    <span class="fn__flex-1">
                                        <input type="checkbox"
                                            checked={dynamicUrls.includes(url)}
                                            onchange={() => toggleCustomDynamic(url)}
                                            onclick={(e: MouseEvent) => e.stopPropagation()}
                                        />
                                        <span style="margin-left: 8px; word-break: break-all;">
                                            {url}
                                        </span>
                                    </span>
                                    <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                        aria-label={i18n.removeDynamic || '移除订阅源'}
                                        onclick={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); removeCustomDynamic(url) }}
                                        onkeydown={undefined} role="button" tabindex="0">
                                        <svg><use xlink:href="#iconTrashcan"></use></svg>
                                    </span>
                                </label>
                            {/each}
                        </div>
                    {/if}

                    {#each groups as group, i}
                        {@const imgCount = group.files.filter(f => f.type === 'image').length}
                        {@const vidCount = group.files.filter(f => f.type === 'video').length}
                        {@const groupIcon = group.type === 'upload' ? '#iconDatabase'
                            : group.type === 'assets' ? '#iconFilesRoot' : '#iconFolder'}
                        {@const displayLabel = group.type === 'assets' ? `assets/${group.label}` : group.label}

                        <div
                            class="b3-list-item b3-list-item--narrow toggle"
                            class:b3-list-item--focus={!group.collapsed}
                            style:opacity={group.inaccessible ? "0.45" : "1"}
                            onclick={() => toggleGroup(i)}
                            onkeydown={undefined}
                            role="button"
                            tabindex="0"
                        >
                            <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                                <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={!group.collapsed}>
                                    <use xlink:href="#iconRight"></use>
                                </svg>
                            </span>
                            <svg class="b3-list-item__graphic"><use xlink:href={groupIcon}></use></svg>
                            <span class="b3-list-item__text fn__flex-1">
                                {displayLabel}
                                <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                                    ( {i18n.fileCountSummary.replace('{img}', `${imgCount}`).replace('{vid}', `${vidCount}`)} )
                                </span>
                            </span>
                            {#if group.type === 'upload'}
                                <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                    aria-label={i18n.uploadMultipleFiles}
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); pickMultipleFiles() }}
                                    onkeydown={undefined} role="button" tabindex="0">
                                    <svg><use xlink:href="#iconFiles"></use></svg>
                                </span>
                                <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                    aria-label={i18n.uploadEntireDir}
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); pickFolderFiles() }}
                                    onkeydown={undefined} role="button" tabindex="0">
                                    <svg><use xlink:href="#iconFolder"></use></svg>
                                </span>
                                <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                    aria-label={i18n.uploadNetworkResource}
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); showAddUrlDialog() }}
                                    onkeydown={undefined} role="button" tabindex="0">
                                    <svg><use xlink:href="#iconLink"></use></svg>
                                </span>
                            {/if}
                            {#if isDesktop() && !group.inaccessible}
                                <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                    aria-label={i18n.openFolderLabel}
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); openInFileManager(group) }}
                                    onkeydown={undefined}
                                    role="button"
                                    tabindex="0">
                                    <svg><use xlink:href="#iconOpenWindow"></use></svg>
                                </span>
                            {/if}
                            {#if group.removable}
                                <span class="b3-list-item__action"
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); removeGroup(i) }}
                                    onkeydown={undefined}
                                    role="button"
                                    tabindex="0">
                                    <svg><use xlink:href="#iconTrashcan"></use></svg>
                                </span>
                            {/if}
                            {#if group.type === 'upload' && group.files.length > 0}
                                <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                    aria-label={i18n.clearCacheTitle}
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); clearCache() }}
                                    onkeydown={undefined}
                                    role="button"
                                    tabindex="0">
                                    <svg><use xlink:href="#iconTrashcan"></use></svg>
                                </span>
                            {/if}
                            {#if group.inaccessible}
                                <span style="color: var(--b3-theme-error); font-size: 0.85em; margin-left: 8px;">{i18n.pathInaccessible}</span>
                            {/if}
                        </div>

                        {#if !group.collapsed}
                            <div class="b3-list__panel">
                                {#each group.files as file}
                                    {@const override = configStore.get("imageOverrides")[file.url]}
                                    <label
                                        class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                                        class:b3-list-item--focus={selectedItem?.url === file.url}
                                        onclick={() => setAsBackground(file)}
                                    >
                                        <span class="b3-list-item__text fn__flex-1"
                                            onmouseover={() => selectPreview(file)}
                                            onkeydown={undefined}
                                            role="button"
                                            tabindex="0">
                                            <svg style="width:14px;height:14px;margin-right:4px;vertical-align:middle">
                                                <use xlink:href={file.type === 'video' ? '#iconVideo' : '#iconImage'}></use>
                                            </svg>
                                            {file.name}
                                            {#if override}
                                                <span style="color: var(--b3-theme-on-surface); font-size: 0.8em; margin-left: 6px;">
                                                    (x:{override.positionX ?? 50}%, y:{override.positionY ?? 50}%)
                                                </span>
                                            {/if}
                                        </span>
                                        {#if group.type === 'upload'}
                                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                                aria-label={i18n.delete}
                                                onclick={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); deleteFile(file) }}
                                                onkeydown={undefined}
                                                role="button"
                                                tabindex="0">
                                                <svg><use xlink:href="#iconTrashcan"></use></svg>
                                            </span>
                                        {/if}
                                        {#if override}
                                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                                aria-label={i18n.resetPosition}
                                                onclick={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); clearOverride(file.url) }}
                                                onkeydown={undefined}
                                                role="button"
                                                tabindex="0">
                                                <svg><use xlink:href="#iconFullscreenExit"></use></svg>
                                            </span>
                                        {/if}
                                    </label>
                                {/each}
                                {#if group.files.length === 0}
                                    <div class="b3-list-item b3-list-item--narrow" style="color: var(--b3-theme-on-surface);">
                                        <span class="b3-list-item__text">{i18n.noFiles}</span>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    {/each}

                    {#if groups.length === 0}
                        <div class="b3-list-item" style="color: var(--b3-theme-on-surface); padding: 16px; text-align: center;">
                            {i18n.noSources}
                        </div>
                    {/if}
                </div>

                <div class="config-assets__preview">
                    {#if previewVideoSrc}
                        <video src={previewVideoSrc} controls autoplay loop muted
                            style="max-width: 100%; max-height: 100%; border-radius: 4px;"></video>
                    {:else if previewSrc}
                        <img src={previewSrc} alt="preview" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;" />
                    {:else}
                        <div style="color: var(--b3-theme-on-surface); text-align: center;">
                            <svg style="width:48px;height:48px;opacity:0.6"><use xlink:href="#iconImage"></use></svg>
                            <div>{i18n.noPreviewHint}</div>
                        </div>
                    {/if}
                </div>

            </div>

        </div>

    </div>

</div>
