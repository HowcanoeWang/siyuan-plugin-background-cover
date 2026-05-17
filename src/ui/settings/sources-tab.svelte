<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { isDesktop, getFileUrl } from "../../utils/fs"
    import { scanSource } from "../../services/sourceManager"
    import { renderImage, renderVideo } from "../../services/bgRender"
    import { svelteDialog, confirmDialog } from "../../libs/dialog"
    import { pluginAssetsDir } from "../../constants"
    import { removeFile, putFile as apiPutFile } from "../../utils/api"
    import { classifyFileType } from "../../types"
    import LocalDirDialog from "../local-dir-dialog.svelte"
    import AssetPicker from "../sources/asset-picker.svelte"
    import UrlDialog from "../url-dialog.svelte"
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
    let prevUrl = $state<string | null>(null)

    onMount(() => {
        refreshAll()
    })

    async function refreshAll() {
        const newGroups: SourceGroup[] = []

        const uploadFiles = await scanSource('upload', pluginAssetsDir)
        newGroups.push({
            type: 'upload',
            label: i18n.pluginCache ?? '插件缓存',
            path: pluginAssetsDir,
            removable: false,
            files: uploadFiles,
            inaccessible: false,
            collapsed: false,
            configKey: '',
        })

        const assetDirs = configStore.get("assetDirs")
        for (const dir of assetDirs) {
            if (!dir) continue
            const normalized = dir.startsWith('/data/assets/') ? `assets/${dir.slice('/data/assets/'.length)}`
                : dir.startsWith('data/assets/') ? `assets/${dir.slice('data/assets/'.length)}`
                : dir
            const path = `/data/${normalized}`
            const label = normalized.startsWith('assets/') ? normalized.slice('assets/'.length) : normalized
            const files = await scanSource('assets', path + '/')
            newGroups.push({
                type: 'assets',
                label,
                path,
                removable: true,
                files,
                inaccessible: files.length === 0 && path.length > 0,
                collapsed: false,
                configKey: normalized,
            })
        }

        if (isDesktop()) {
            const localFolders = configStore.get("localFolders")
            for (const dir of localFolders) {
                if (!dir) continue
                const files = await scanSource('local', dir + (dir.endsWith('/') ? '' : '/'))
                newGroups.push({
                    type: 'local',
                    label: dir,
                    path: dir,
                    removable: true,
                    files,
                    inaccessible: files.length === 0,
                    collapsed: false,
                    configKey: dir,
                })
            }
        }

        groups = newGroups
    }

    function toggleGroup(i: number) {
        groups[i].collapsed = !groups[i].collapsed
        groups = groups
    }

    function showAssetDirDialog() {
        svelteDialog({
            title: i18n.addAssetsDirTitle ?? "选择 data/assets/ 下的子文件夹作为图片源",
            component: AssetPicker,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (paths: string[]) => {
                    for (const dir of paths) addAssetFolder(dir)
                },
            },
        })
    }

    function showLocalDirDialog() {
        svelteDialog({
            title: i18n.addLocalDirTitle ?? "添加本地目录",
            component: LocalDirDialog,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (path: string) => {
                    addLocalFolder(path)
                },
            },
        })
    }

    function addAssetFolder(dir: string) {
        if (!dir) return
        const dirs = [...configStore.get("assetDirs"), dir]
        configStore.set("assetDirs", dirs)
        configStore.save()
        refreshAll()
    }

    function addLocalFolder(path: string) {
        if (!path) return
        const folders = [...configStore.get("localFolders"), path]
        configStore.set("localFolders", folders)
        configStore.save()
        refreshAll()
    }

    function removeGroup(i: number) {
        const g = groups[i]
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
        refreshAll()
    }

    function setAsBackground(item: ImageItem) {
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
        if (prevUrl) URL.revokeObjectURL(prevUrl)
        selectedItem = null
        previewSrc = null
        prevUrl = null
    }

    function loadPreview(url: string) {
        if (prevUrl) URL.revokeObjectURL(prevUrl)
        prevUrl = null
        previewSrc = null
        fetch(url)
            .then(r => r.blob())
            .then(b => {
                if (selectedItem?.url === url) {
                    prevUrl = URL.createObjectURL(b)
                    previewSrc = prevUrl
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
        if (imgCount > 0) parts.push(`${imgCount} ${i18n.imageCount ?? 'images'}`)
        if (vidCount > 0) parts.push(`${vidCount} ${i18n.videoCount ?? 'videos'}`)
        const confirmed = await new Promise<boolean>(resolve => {
            confirmDialog({
                title: i18n.clearCacheTitle ?? "清空插件缓存",
                content: `${i18n.clearCacheConfirm ?? '确认删除所有插件缓存文件？将删除'} ${parts.join('、')}`,
                confirm: () => resolve(true),
                cancel: () => resolve(false),
                width: "360px",
            })
        })
        if (!confirmed) return
        const wasCurrentDeleted = group.files.some(f => f.url === configStore.get("currentFile"))
        for (const file of group.files) {
            await removeFile(file.apiPath)
        }
        if (wasCurrentDeleted) {
            configStore.set("currentFile", null)
            configStore.save()
            ;(window as any).bgCoverPlugin?.plugin?.randomSelect?.()
        }
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

    async function deleteFile(file: ImageItem) {
        const wasCurrent = file.url === configStore.get("currentFile")
        await removeFile(file.apiPath)
        if (wasCurrent) {
            configStore.set("currentFile", null)
            configStore.save()
            ;(window as any).bgCoverPlugin?.plugin?.randomSelect?.()
        }
        refreshAll()
    }

    function pickMultipleFiles() {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/*,video/*'
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', async () => {
            const files = input.files
            if (!files || files.length === 0) {
                document.body.removeChild(input)
                return
            }
            for (let i = 0; i < files.length; i++) {
                if (classifyFileType(files[i].name)) {
                    await apiPutFile(
                        `data/public/siyuan-plugin-background-cover/${files[i].name}`,
                        files[i],
                    )
                }
            }
            document.body.removeChild(input)
            refreshAll()
        })
        input.click()
    }

    function pickFolderFiles() {
        const input = document.createElement('input')
        input.type = 'file'
        input.setAttribute('webkitdirectory', '')
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', async () => {
            const files = input.files
            if (!files || files.length === 0) {
                document.body.removeChild(input)
                return
            }
            for (let i = 0; i < files.length; i++) {
                if (classifyFileType(files[i].name)) {
                    await apiPutFile(
                        `data/public/siyuan-plugin-background-cover/${files[i].name}`,
                        files[i],
                    )
                }
            }
            document.body.removeChild(input)
            refreshAll()
        })
        input.click()
    }

    function showAddUrlDialog() {
        svelteDialog({
            title: i18n.addUrlTitle ?? "添加网络背景资源",
            component: UrlDialog,
            width: "520px",
            height: "auto",
            props: { onSuccess: () => refreshAll() },
        })
    }
</script>

<div class="config__tab-container" data-name="sources" style="height: 100%; display: flex; flex-direction: column;">

    <div class="config-assets" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;">

        <div class="config-assets__list" style="flex: 0 0 55%; overflow-y: auto;">

            <div class="fn__flex" style="padding: 8px 0; gap: 8px;">
                {#if isDesktop()}
                    <button class="b3-button b3-button--outline" onclick={showLocalDirDialog}>
                        + {i18n.addLocalDir ?? "添加本地目录"}
                    </button>
                {/if}
                <button class="b3-button b3-button--outline" onclick={showAssetDirDialog}>
                    + {i18n.linkAssetsDir ?? "链接资源目录"}
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
                                ( 图片: {imgCount}  视频: {vidCount} )
                            </span>
                        </span>
                        {#if group.type === 'upload'}
                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                aria-label={i18n.uploadMultipleFiles ?? "上传多个文件"}
                                onclick={(e: MouseEvent) => { e.stopPropagation(); pickMultipleFiles() }}
                                onkeydown={undefined} role="button" tabindex="0">
                                <svg><use xlink:href="#iconFiles"></use></svg>
                            </span>
                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                aria-label={i18n.uploadEntireDir ?? "上传整个目录"}
                                onclick={(e: MouseEvent) => { e.stopPropagation(); pickFolderFiles() }}
                                onkeydown={undefined} role="button" tabindex="0">
                                <svg><use xlink:href="#iconFolder"></use></svg>
                            </span>
                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                aria-label={i18n.addNetworkResource ?? "添加网络资源"}
                                onclick={(e: MouseEvent) => { e.stopPropagation(); showAddUrlDialog() }}
                                onkeydown={undefined} role="button" tabindex="0">
                                <svg><use xlink:href="#iconLink"></use></svg>
                            </span>
                        {/if}
                        {#if isDesktop() && !group.inaccessible}
                            <span class="b3-list-item__action b3-tooltips b3-tooltips__w"
                                aria-label="打开文件夹"
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
                                aria-label={i18n.clearCacheTitle ?? "清空插件缓存"}
                                onclick={(e: MouseEvent) => { e.stopPropagation(); clearCache() }}
                                onkeydown={undefined}
                                role="button"
                                tabindex="0">
                                <svg><use xlink:href="#iconTrashcan"></use></svg>
                            </span>
                        {/if}
                        {#if group.inaccessible}
                            <span style="color: var(--b3-theme-error); font-size: 0.85em; margin-left: 8px;">{i18n.pathInaccessible ?? "不可访问"}</span>
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
                                            aria-label={i18n.delete ?? "删除"}
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
                                    <span class="b3-list-item__text">{i18n.noFiles ?? "暂无文件"}</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}

                {#if groups.length === 0}
                    <div class="b3-list-item" style="color: var(--b3-theme-on-surface); padding: 16px; text-align: center;">
                        {i18n.noSources ?? "尚未添加任何图片源，请使用下方按钮添加"}
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
                    <div style="font-size: 0.85em; margin-top: 4px;">{i18n.videoNoPreview ?? "视频文件 — 不支持预览"}</div>
                </div>
            {:else}
                <div style="color: var(--b3-theme-on-surface); text-align: center;">
                    <svg style="width:48px;height:48px;opacity:0.6"><use xlink:href="#iconImage"></use></svg>
                    <div>{i18n.noPreviewHint ?? "点击文件列表中图片以预览"}</div>
                </div>
            {/if}
        </div>
    </div>

</div>
