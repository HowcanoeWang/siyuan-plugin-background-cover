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
        loading: boolean
    }

    interface Props {
        onConfirm?: (selectedPaths: string[]) => void
    }

    let { onConfirm }: Props = $props()

    let roots = $state<DirNode[]>([])
    let selectedDir = $state<string | null>(null)
    let loading = $state(true)

    onMount(async () => {
        roots = await loadChildren("/data/assets/")
        loading = false
    })

    async function loadChildren(dirPath: string): Promise<DirNode[]> {
        const items = await readDirItems(dirPath)
        const nodes: DirNode[] = []

        for (const item of items) {
            if (!item.isDir) continue
            const childPath = dirPath.endsWith('/') ? dirPath + item.name : dirPath + '/' + item.name

            const node: DirNode = {
                name: item.name,
                path: childPath,
                imageCount: 0,
                videoCount: 0,
                children: [],
                open: false,
                loading: false,
            }

            const childItems = await readDirItems(childPath + '/')
            for (const child of childItems) {
                if (child.isDir) {
                    node.children.push({
                        name: child.name,
                        path: childPath + '/' + child.name,
                        imageCount: 0,
                        videoCount: 0,
                        children: [],
                        open: false,
                        loading: true,
                    })
                } else {
                    const type = classifyFileType(child.name)
                    if (type === 'image') node.imageCount++
                    else if (type === 'video') node.videoCount++
                }
            }

            nodes.push(node)
        }

        return nodes.sort((a, b) => a.name.localeCompare(b.name))
    }

    async function toggleNode(node: DirNode) {
        if (node.open) {
            node.open = false
            return
        }

        if (node.loading && node.children.length > 0) {
            node.loading = false
            node.children = await loadChildren(node.path + '/')
        }
        node.open = true
    }

    function selectDir(path: string) {
        selectedDir = path
    }

    function getRelPath(fullPath: string): string {
        return fullPath.startsWith('data/assets/')
            ? fullPath.slice('data/assets/'.length)
            : fullPath
    }

    function getTotalCount(node: DirNode): number {
        return node.imageCount + node.videoCount
    }

    function confirm() {
        if (!selectedDir) return
        onConfirm?.([getRelPath(selectedDir)])
    }
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 8px; width: 100%;">
    <div class="b3-label">{i18n.addAssetsDirTitle ?? "选择 data/assets/ 下的子文件夹作为图片源"}</div>

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
            {#each roots as root}
                {@const total = getTotalCount(root)}
                <div
                    class="b3-list-item b3-list-item--narrow toggle"
                    class:b3-list-item--focus={selectedDir === root.path}
                    style:opacity={total > 0 ? "1" : "0.45"}
                    onclick={() => total > 0 && selectDir(root.path)}
                    onkeydown={undefined}
                    role="button"
                    tabindex={total > 0 ? 0 : -1}
                >
                    <span class="b3-list-item__toggle b3-list-item__toggle--hl"
                        onclick={(e: MouseEvent) => {
                            e.stopPropagation()
                            if (root.children.length > 0) toggleNode(root)
                        }}
                        onkeydown={undefined}
                        role="button"
                        tabindex="0">
                        <svg class="b3-list-item__arrow" class:b3-list-item__arrow--open={root.open}>
                            <use xlink:href="#iconRight"></use>
                        </svg>
                    </span>
                    <span class="b3-list-item__text fn__flex-1">
                        {root.name}
                        <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                            ({i18n.imageCount ?? "图片"}: {root.imageCount}, {i18n.videoCount ?? "视频"}: {root.videoCount})
                        </span>
                    </span>
                </div>

                {#if root.open && root.children.length > 0}
                    <div class="b3-list__panel">
                        {#each root.children as child}
                            {@const childTotal = getTotalCount(child)}
                            <div
                                class="b3-list-item b3-list-item--narrow"
                                class:b3-list-item--focus={selectedDir === child.path}
                                style:opacity={childTotal > 0 ? "1" : "0.45"}
                                style:padding-left="40px"
                                onclick={() => childTotal > 0 && selectDir(child.path)}
                                onkeydown={undefined}
                                role="button"
                                tabindex={childTotal > 0 ? 0 : -1}
                            >
                                <span class="b3-list-item__text fn__flex-1">
                                    {child.name}
                                    <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                                        ({i18n.imageCount ?? "图片"}: {child.imageCount}, {i18n.videoCount ?? "视频"}: {child.videoCount})
                                    </span>
                                </span>
                            </div>
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