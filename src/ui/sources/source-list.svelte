<script lang="ts">
    import { ImageItem } from "../../types"

    interface Props {
        sourceType: "upload" | "assets" | "local"
        label: string
        files: ImageItem[]
        canDelete: boolean
        canClear: boolean
        canRemove: boolean
        inaccessible?: boolean
        onSetAsBackground?: (url: string) => void
        onDeleteFile?: (url: string) => void
        onClearAll?: () => void
        onRemoveSource?: () => void
    }

    let {
        sourceType, label, files,
        canDelete = false, canClear = false, canRemove = false,
        inaccessible = false,
        onSetAsBackground, onDeleteFile, onClearAll, onRemoveSource,
    }: Props = $props()

    let imageCount = $derived(files.filter(f => f.type === "image").length)
    let videoCount = $derived(files.filter(f => f.type === "video").length)
</script>

<div class="b3-label"
    style:opacity={inaccessible ? "0.5" : "1"}
>
    <div class="fn__flex" style="align-items: center;">
        <span class="fn__flex-1">
             {label}
            <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                (图片: {imageCount} 视频: {videoCount})
            </span>
        </span>
        <span class="fn__space"></span>
        {#if canClear}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onClearAll}>
                清空
            </button>
        {/if}
        {#if canRemove}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onRemoveSource}>
                ✕ 移除
            </button>
        {/if}
        {#if inaccessible}
            <span style="color: var(--b3-theme-error); margin-left: 8px;">路径不可访问</span>
        {/if}
    </div>

    <div class="fn__hr"></div>

    <div class="b3-list b3-list--background">
        {#each files as file}
            <div class="b3-list-item b3-list-item--hide-action">
                <span class="b3-list-item__text">
                    {#if file.type === "video"}🎬{:else}🖼{/if} {file.name}
                </span>
                <span class="b3-list-item__action"
                    onclick={() => onSetAsBackground?.(file.url)}>
                    设为背景
                </span>
                {#if canDelete}
                    <span class="b3-list-item__action"
                        onclick={() => onDeleteFile?.(file.url)}>
                        删除
                    </span>
                {/if}
            </div>
        {/each}
        {#if files.length === 0}
            <div style="color: var(--b3-theme-on-surface); padding: 8px;">
                暂无文件
            </div>
        {/if}
    </div>
</div>
