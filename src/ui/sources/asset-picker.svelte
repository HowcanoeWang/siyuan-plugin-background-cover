<script lang="ts">
    import { onMount } from "svelte"
    import { readDirItems } from "../../utils/api"
    import { classifyFileType } from "../../types"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    interface DirNode {
        name: string
        path: string
        imageCount: number
        videoCount: number
        children: DirNode[]
        open: boolean
        loaded: boolean
    }

    interface Props {
        onConfirm?: (selectedPaths: string[]) => void
    }

    let { onConfirm }: Props = $props()

    let roots = $state<DirNode[]>([])
    let selectedDir = $state<string | null>(null)
    let loading = $state(true)

    onMount(async () => {
        const items = await readDirItems("/data/assets/")
        for (const item of items) {
            if (!item.isDir) continue
            roots.push({
                name: item.name,
                path: "/data/assets/" + item.name,
                imageCount: 0,
                videoCount: 0,
                children: [],
                open: false,
                loaded: false,
            })
        }
        roots.sort((a, b) => a.name.localeCompare(b.name))
        loading = false
    })

    async function expandChild(node: DirNode) {
        if (node.loaded) {
            node.open = !node.open
            return
        }

        node.imageCount = 0
        node.videoCount = 0
        node.children = []

        const items = await readDirItems(node.path + '/')
        for (const child of items) {
            if (child.isDir) {
                node.children.push({
                    name: child.name,
                    path: node.path + '/' + child.name,
                    imageCount: 0,
                    videoCount: 0,
                    children: [],
                    open: false,
                    loaded: false,
                })
            } else {
                const type = classifyFileType(child.name)
                if (type === 'image') node.imageCount++
                else if (type === 'video') node.videoCount++
            }
        }
        node.children.sort((a, b) => a.name.localeCompare(b.name))
        node.loaded = true
        node.open = true
    }

    function selectDir(path: string, total: number) {
        if (total > 0) selectedDir = path
    }

    function getRelPath(fullPath: string): string {
        if (fullPath.startsWith('/data/assets/')) return `assets/${fullPath.slice('/data/assets/'.length)}`
        if (fullPath.startsWith('data/assets/')) return `assets/${fullPath.slice('data/assets/'.length)}`
        return fullPath
    }

    function confirm() {
        if (!selectedDir) return
        onConfirm?.([getRelPath(selectedDir)])
    }
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 8px; width: 100%;">
    <div class="b3-list b3-list--border b3-list--background" style="max-height: 400px; overflow-y: auto;">
        {#if loading}
            <div class="b3-list-item" style="color: var(--b3-theme-on-surface); padding: 16px; text-align: center;">
                {i18n.loading ?? "加载中…"}
            </div>
        {:else if roots.length === 0}
            <div class="b3-list-item" style="color: var(--b3-theme-on-surface); padding: 16px; text-align: center;">
                {i18n.noFolderSelected ?? "尚未选择任何文件夹"}
            </div>
        {:else}
            {#each roots as root (root.path)}
                {@const rTotal = root.imageCount + root.videoCount}
                <div
                    class="b3-list-item b3-list-item--narrow toggle"
                    class:b3-list-item--focus={selectedDir === root.path}
                    style:opacity={root.loaded && rTotal === 0 ? "0.45" : "1"}
                    onclick={() => selectDir(root.path, rTotal)}
                    onkeydown={undefined}
                    role="button"
                    tabindex="0"
                >
                    <span class="b3-list-item__toggle b3-list-item__toggle--hl"
                        onclick={(e: MouseEvent) => { e.stopPropagation(); expandChild(root) }}
                        onkeydown={undefined}
                        role="button"
                        tabindex="0">
                        <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={root.open}>
                            <use xlink:href="#iconRight"></use>
                        </svg>
                    </span>
                    <span class="b3-list-item__text fn__flex-1">
                        <svg style="width:14px;height:14px;margin-right:4px;vertical-align:middle">
                            <use xlink:href="#iconFolder"></use>
                        </svg>
                        {root.name}/
                        {#if root.loaded}
                            <span style="color: var(--b3-theme-on-surface); font-size: 0.85em; margin-left: 8px;">
                                ({rTotal} {i18n.imageCount ?? "图片"}, {root.videoCount} {i18n.videoCount ?? "视频"})
                            </span>
                        {/if}
                    </span>
                </div>

                {#if root.open}
                    <div class="b3-list__panel">
                        {#each root.children as child (child.path)}
                            {@const cTotal = child.imageCount + child.videoCount}
                            <div
                                class="b3-list-item b3-list-item--narrow toggle"
                                class:b3-list-item--focus={selectedDir === child.path}
                                style:opacity={child.loaded && cTotal === 0 ? "0.45" : "1"}
                                onclick={() => selectDir(child.path, cTotal)}
                                onkeydown={undefined}
                                role="button"
                                tabindex="0"
                            >
                                <span class="b3-list-item__toggle b3-list-item__toggle--hl"
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); expandChild(child) }}
                                    onkeydown={undefined}
                                    role="button"
                                    tabindex="0">
                                    <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={child.open}>
                                        <use xlink:href="#iconRight"></use>
                                    </svg>
                                </span>
                                <span class="b3-list-item__text fn__flex-1">
                                    <svg style="width:14px;height:14px;margin-right:4px;vertical-align:middle">
                                        <use xlink:href="#iconFolder"></use>
                                    </svg>
                                    {child.name}/
                                    {#if child.loaded}
                                        <span style="color: var(--b3-theme-on-surface); font-size: 0.85em; margin-left: 8px;">
                                            ({cTotal} {i18n.imageCount ?? "图片"}, {child.videoCount} {i18n.videoCount ?? "视频"})
                                        </span>
                                    {/if}
                                </span>
                            </div>

                            {#if child.open}
                                <div class="b3-list__panel">
                                    {#each child.children as grandchild (grandchild.path)}
                                        {@const gTotal = grandchild.imageCount + grandchild.videoCount}
                                        <div
                                            class="b3-list-item b3-list-item--narrow toggle"
                                            class:b3-list-item--focus={selectedDir === grandchild.path}
                                            style:opacity={grandchild.loaded && gTotal === 0 ? "0.45" : "1"}
                                            onclick={() => selectDir(grandchild.path, gTotal)}
                                            onkeydown={undefined}
                                            role="button"
                                            tabindex="0"
                                        >
                                            <span class="b3-list-item__toggle b3-list-item__toggle--hl"
                                                onclick={(e: MouseEvent) => { e.stopPropagation(); expandChild(grandchild) }}
                                                onkeydown={undefined}
                                                role="button"
                                                tabindex="0">
                                                <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={grandchild.open}>
                                                    <use xlink:href="#iconRight"></use>
                                                </svg>
                                            </span>
                                            <span class="b3-list-item__text fn__flex-1">
                                                <svg style="width:14px;height:14px;margin-right:4px;vertical-align:middle">
                                                    <use xlink:href="#iconFolder"></use>
                                                </svg>
                                                {grandchild.name}/
                                                {#if grandchild.loaded}
                                                    <span style="color: var(--b3-theme-on-surface); font-size: 0.85em; margin-left: 8px;">
                                                        ({gTotal} {i18n.imageCount ?? "图片"}, {grandchild.videoCount} {i18n.videoCount ?? "视频"})
                                                    </span>
                                                {/if}
                                            </span>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            {/each}
        {/if}
    </div>

    <div class="fn__flex" style="justify-content: flex-end;">
        <button class="b3-button b3-button--text"
            disabled={!selectedDir}
            onclick={confirm}>
            {i18n.confirm ?? "确认"}
        </button>
    </div>
</div>