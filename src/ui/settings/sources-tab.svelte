<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { isDesktop } from "../../utils/fs"
    import { scanSource } from "../../services/sourceManager"
    import { renderImage, renderVideo } from "../../services/bgRender"
    import { pluginAssetsDir } from "../../constants"
    import type { ImageItem } from "../../types"

    interface SourceGroup {
        type: 'upload' | 'assets' | 'local'
        label: string
        path: string
        removable: boolean
        files: ImageItem[]
        inaccessible: boolean
        collapsed: boolean
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
            label: '插件缓存',
            path: pluginAssetsDir,
            removable: false,
            files: uploadFiles,
            inaccessible: false,
            collapsed: false,
        })

        const assetDirs = configStore.get("assetDirs")
        for (const dir of assetDirs) {
            if (!dir) continue
            const path = dir.startsWith('data/') ? dir : `data/assets/${dir}`
            const files = await scanSource('assets', path + '/')
            newGroups.push({
                type: 'assets',
                label: dir.startsWith('data/assets/') ? dir.slice('data/assets/'.length) : dir,
                path,
                removable: true,
                files,
                inaccessible: files.length === 0 && path.length > 0,
                collapsed: false,
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
                })
            }
        }

        groups = newGroups
    }

    function toggleGroup(i: number) {
        groups[i].collapsed = !groups[i].collapsed
        groups = groups
    }

    function pickLocalFolder() {
        const input = document.createElement('input')
        input.type = 'file'
        input.setAttribute('webkitdirectory', '')
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', () => {
            const files = input.files
            if (files && files.length > 0) {
                const firstPath = (files[0] as any).path ?? files[0].webkitRelativePath
                const dir = firstPath.includes('/')
                    ? firstPath.substring(0, firstPath.lastIndexOf('/'))
                    : firstPath
                if (dir) addLocalFolder(dir)
            }
            document.body.removeChild(input)
        })
        input.click()
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
            const idx = dirs.indexOf(g.label)
            if (idx >= 0) {
                dirs.splice(idx, 1)
                configStore.set("assetDirs", dirs)
                configStore.save()
            }
        } else if (g.type === 'local') {
            const dirs = [...configStore.get("localFolders")]
            const idx = dirs.indexOf(g.path)
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
</script>

<div class="config__tab-container" data-name="sources" style="height: 100%; display: flex; flex-direction: column;">

    <div class="config-assets" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;">

        <div class="config-assets__list" style="flex: 0 0 55%; overflow-y: auto;">

            <div class="fn__flex" style="padding: 8px 0;">
                {#if isDesktop()}
                    <button class="b3-button b3-button--outline" onclick={pickLocalFolder}>
                        + 添加本地目录
                    </button>
                {/if}
            </div>

            <div class="b3-list b3-list--border b3-list--background">
                {#each groups as group, i}
                    {@const imgCount = group.files.filter(f => f.type === 'image').length}
                    {@const vidCount = group.files.filter(f => f.type === 'video').length}

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
                        <span class="b3-list-item__text fn__flex-1">
                            {group.label}
                            <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                                ( 图片: {imgCount}  视频: {vidCount} )
                            </span>
                        </span>
                        {#if group.removable}
                            <span class="b3-list-item__action"
                                onclick={(e: MouseEvent) => { e.stopPropagation(); removeGroup(i) }}
                                onkeydown={undefined}
                                role="button"
                                tabindex="0">✕ 移除</span>
                        {/if}
                        {#if group.inaccessible}
                            <span style="color: var(--b3-theme-error); font-size: 0.85em; margin-left: 8px;">不可访问</span>
                        {/if}
                    </div>

                    {#if !group.collapsed}
                        <div class="b3-list__panel">
                            {#each group.files as file}
                                <label
                                    class="b3-list-item b3-list-item--narrow b3-list-item--hide-action"
                                    class:b3-list-item--focus={selectedItem?.url === file.url}
                                >
                                    <span class="b3-list-item__text fn__flex-1"
                                        onmouseover={() => selectPreview(file)}
                                        onkeydown={undefined}
                                        role="button"
                                        tabindex="0">
                                        {#if file.type === 'video'}🎬{:else}🖼{/if} {file.name}
                                    </span>
                                    <span class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="设为背景"
                                        onclick={(e: MouseEvent) => { e.preventDefault(); setAsBackground(file) }}
                                        onkeydown={undefined}
                                        role="button"
                                        tabindex="0">
                                        <svg><use xlink:href="#iconEye"></use></svg>
                                    </span>
                                </label>
                            {/each}
                            {#if group.files.length === 0}
                                <div class="b3-list-item b3-list-item--narrow" style="color: var(--b3-theme-on-surface);">
                                    <span class="b3-list-item__text">暂无文件</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}

                {#if groups.length === 0}
                    <div class="b3-list-item" style="color: var(--b3-theme-on-surface); padding: 16px; text-align: center;">
                        尚未添加任何图片源，请使用下方按钮添加
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
                    <div style="font-size: 2em;">🎬</div>
                    <div>{selectedItem.name}</div>
                    <div style="font-size: 0.85em; margin-top: 4px;">视频文件 — 不支持预览</div>
                </div>
            {:else}
                <div style="color: var(--b3-theme-on-surface); text-align: center;">
                    <div style="font-size: 2em;">🖼</div>
                    <div>点击文件列表中图片以预览</div>
                </div>
            {/if}
        </div>
    </div>

</div>
