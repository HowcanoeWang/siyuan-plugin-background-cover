<script lang="ts">
    import { ImageItem } from "../../types"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

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
                ({i18n.fileCountSummary.replace('{img}', `${imageCount}`).replace('{vid}', `${videoCount}`)})
            </span>
        </span>
        <span class="fn__space"></span>
        {#if canClear}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onClearAll}>
                {i18n.clear}
            </button>
        {/if}
        {#if canRemove}
            <button class="b3-button b3-button--outline fn__flex-center"
                onclick={onRemoveSource}>
                ✕ {i18n.remove}
            </button>
        {/if}
        {#if inaccessible}
            <span style="color: var(--b3-theme-error); margin-left: 8px;">{i18n.pathInaccessible}</span>
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
                    {i18n.setAsBackground}
                </span>
                {#if canDelete}
                    <span class="b3-list-item__action"
                        onclick={() => onDeleteFile?.(file.url)}>
                        {i18n.delete}
                    </span>
                {/if}
            </div>
        {/each}
        {#if files.length === 0}
            <div style="color: var(--b3-theme-on-surface); padding: 8px;">
                {i18n.noFiles}
            </div>
        {/if}
    </div>
</div>
