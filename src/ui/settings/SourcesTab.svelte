<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { isDesktop } from "../../utils/fs"
    import { scanSource } from "../../services/sourceManager"
    import { renderImage, renderVideo, changeOpacity, changeBlur } from "../../services/bgRender"
    import { confirmDialog } from "../../libs/dialog"
    import { pluginAssetsDir, pickDefaultBackground } from "../../constants"
    import { removeFile } from "../../utils/api"
    import { toAssetRelPath } from "../../utils/path"
    import { devLog } from "../../utils/logger"
    import {
        showLocalDirDialog,
        showAssetsDirDialog,
        showUrlDialog,
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

    onMount(() => {
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
    }

    function selectPreview(item: ImageItem) {
        if (item.type !== 'image') return
        if (selectedItem?.url === item.url) {
            clearPreview()
            return
        }
        selectedItem = item
        loadPreview(item.url)
    }

    function clearPreview() {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
        selectedItem = null
        previewSrc = null
        previewObjectUrl = null
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

<div class="config__tab-container" data-name="sources" style="height: 100%; display: flex; flex-direction: column;">

    <div class="config-assets" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;">

        <div class="config-assets__list" style="flex: 0 0 55%; overflow-y: auto;">

            <div class="fn__flex" style="padding: 8px 0; gap: 8px;">
                {#if isDesktop()}
                    <button class="b3-button b3-button--outline" onclick={openLocalDirDialog}>
                        + {i18n.addLocalDir}
                    </button>
                {/if}
                <button class="b3-button b3-button--outline" onclick={openAssetDirDialog}>
                    + {i18n.linkAssetsDir}
                </button>
            </div>

            <div class="b3-list b3-list--border b3-list--background">
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


        </div>

        <div class="fn__hr--b"></div>

        <div class="config-assets__preview" style="flex: 0 0 45%; display: flex; align-items: center; justify-content: center; padding: 8px; overflow: hidden; background: var(--b3-theme-surface);">
            {#if previewSrc}
                <img src={previewSrc} alt="preview" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;" />
            {:else if selectedItem && selectedItem.type === 'video'}
                <div style="color: var(--b3-theme-on-surface); text-align: center;">
                    <svg style="width:48px;height:48px;opacity:0.6"><use xlink:href="#iconVideo"></use></svg>
                    <div>{selectedItem.name}</div>
                    <div style="font-size: 0.85em; margin-top: 4px;">{i18n.videoNoPreview}</div>
                </div>
            {:else}
                <div style="color: var(--b3-theme-on-surface); text-align: center;">
                    <svg style="width:48px;height:48px;opacity:0.6"><use xlink:href="#iconImage"></use></svg>
                    <div>{i18n.noPreviewHint}</div>
                </div>
            {/if}
        </div>
    </div>

</div>
