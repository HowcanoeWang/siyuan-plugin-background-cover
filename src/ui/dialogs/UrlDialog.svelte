<script lang="ts">
    import { onDestroy } from "svelte"
    import { downloadUrl } from "../../utils/api"
    import { getFileUrl } from "../../utils/fs"
    import { IMAGE_EXTS, VIDEO_EXTS } from "../../constants"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    interface Props {
        onSuccess?: (uploadUrl?: string) => void
        onDynamicAdd?: (url: string) => void
    }

    let { onSuccess, onDynamicAdd }: Props = $props()

    const VALID_EXTS = IMAGE_EXTS.union(VIDEO_EXTS)

    let url = $state("")
    let previewSrc = $state<string | null>(null)
    let blobUrl = $state<string | null>(null)
    let validExt = $state(false)
    let isDynamic = $state(false)
    let checking = $state(false)
    let errorMsg = $state("")
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    function classifyUrl(u: string): 'upload' | 'dynamic' {
        const clean = u.split('?')[0]
        const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
        return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext) ? 'upload' : 'dynamic'
    }

    async function doCheck(trimmed: string) {
        checking = true
        errorMsg = ""
        validExt = false
        isDynamic = false
        previewSrc = null

        const urlType = classifyUrl(trimmed)

        try {
            const resp = await fetch(trimmed)
            if (!resp.ok) {
                errorMsg = `${i18n.fetchFailed} (HTTP ${resp.status})`
                checking = false
                return
            }
            const contentType = resp.headers.get('content-type') ?? ''
            if (contentType.startsWith('image/')) {
                if (urlType === 'upload') {
                    const blob = await resp.blob()
                    if (blobUrl) URL.revokeObjectURL(blobUrl)
                    blobUrl = URL.createObjectURL(blob)
                    previewSrc = blobUrl
                    validExt = true
                } else {
                    isDynamic = true
                    const blob = await resp.blob()
                    if (blobUrl) URL.revokeObjectURL(blobUrl)
                    blobUrl = URL.createObjectURL(blob)
                    previewSrc = blobUrl
                }
            } else if (contentType.startsWith('video/')) {
                if (urlType === 'upload') {
                    validExt = true
                } else {
                    errorMsg = i18n.notImageOrVideo
                }
            } else {
                errorMsg = i18n.notImageOrVideo
            }
        } catch {
            errorMsg = i18n.networkFailed
        }
        checking = false
    }

    function handleInput() {
        const trimmed = url.trim()
        if (!trimmed) {
            validExt = false
            isDynamic = false
            errorMsg = ""
            previewSrc = null
            return
        }
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => doCheck(trimmed), 500)
    }

    async function handleUpload() {
        const trimmed = url.trim()
        if (!trimmed || !validExt) return

        const fileName = trimmed.split('/').pop()?.split('?')[0] ?? 'download'
        const destPath = `data/public/siyuan-plugin-background-cover/${fileName}`

        const ok = await downloadUrl(trimmed, destPath)
        if (ok) {
            const renderingUrl = getFileUrl(`/data/public/siyuan-plugin-background-cover/${fileName}`, 'upload')
            onSuccess?.(renderingUrl)
        }
    }

    function handleDynamicAdd() {
        const trimmed = url.trim()
        if (!trimmed || !isDynamic) return
        onDynamicAdd?.(trimmed)
    }

    function getFileName(): string {
        return url.trim().split('/').pop()?.split('?')[0] ?? ''
    }

    function canConfirm(): boolean {
        return validExt || isDynamic
    }

    onDestroy(() => {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
    })
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 8px; width: 100%;">
    <div>
        <input class="b3-text-field fn__block" type="text" style="width: 100%;"
            placeholder={i18n.dynamicUrlHint || "https://example.com/random-image-api"}
            bind:value={url}
            oninput={handleInput}
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && canConfirm() && (validExt ? handleUpload() : handleDynamicAdd())}
        />
    </div>

    <div style="min-height: 160px; display: flex; align-items: center; justify-content: center;
        border: 1px dashed var(--b3-border-color); border-radius: 6px;
        background: var(--b3-theme-surface);">
        {#if checking}
            <span style="color: var(--b3-theme-on-surface);">{i18n.detecting}</span>
        {:else if isDynamic && previewSrc}
            <img src={previewSrc} alt="preview"
                style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 4px;" />
        {:else if previewSrc}
            <img src={previewSrc} alt="preview"
                style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 4px;" />
        {:else if validExt}
            <div style="text-align: center; color: var(--b3-theme-on-surface);">
                <div style="font-size: 2em;">🎬</div>
                <div>{getFileName()}</div>
                <div style="font-size: 0.85em; margin-top: 4px;">{i18n.videoNoPreview}</div>
            </div>
        {:else if isDynamic}
            <div style="text-align: center; color: var(--b3-theme-on-surface);">
                <div style="font-size: 2em;">🌐</div>
                <div>{i18n.detectedDynamic || '动态图像源（每次返回不同图片）'}</div>
            </div>
        {:else if errorMsg}
            <span style="color: var(--b3-theme-error); text-align: center; padding: 12px;">{errorMsg}</span>
        {:else}
            <span style="color: var(--b3-theme-on-surface);">{i18n.dynamicUrlHint || i18n.enterUrlHint}</span>
        {/if}
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
        {#if isDynamic || validExt}
            <span style="color: var(--b3-theme-on-surface); font-size: 0.85em;">
                {isDynamic
                    ? (i18n.detectedDynamic || '🌐 动态图像源（每次返回不同图片）')
                    : (i18n.detectedUpload || '📁 文件资源（下载并缓存到本地）')}
            </span>
        {:else}
            <span></span>
        {/if}
        <div class="fn__flex" style="gap: 8px;">
            {#if validExt}
                <button class="b3-button b3-button--text"
                    onclick={handleUpload}>
                    {i18n.uploadToCache || '上传到缓存'}
                </button>
            {/if}
            {#if isDynamic}
                <button class="b3-button b3-button--text"
                    onclick={handleDynamicAdd}>
                    {i18n.addToDynamic || '添加到订阅源'}
                </button>
            {/if}
        </div>
    </div>
</div>
