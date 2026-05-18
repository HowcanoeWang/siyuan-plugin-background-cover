<script lang="ts">
    import { onDestroy } from "svelte"
    import { downloadUrl } from "../../utils/api"
    import { getFileUrl } from "../../utils/fs"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    interface Props {
        onSuccess?: (uploadUrl?: string) => void
    }

    let { onSuccess }: Props = $props()

    let url = $state("")
    let previewSrc = $state<string | null>(null)
    let blobUrl = $state<string | null>(null)
    let validExt = $state(false)
    let checking = $state(false)
    let errorMsg = $state("")
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const VALID_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif',
        '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'])

    function checkExt(u: string): boolean {
        const clean = u.split('?')[0]
        const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
        return VALID_EXTS.has(ext)
    }

    async function doCheck(trimmed: string) {
        checking = true
        errorMsg = ""
        validExt = false
        previewSrc = null

        if (!checkExt(trimmed)) {
            errorMsg = i18n.urlSuffixInvalid
            checking = false
            return
        }

        try {
            const resp = await fetch(trimmed)
            if (!resp.ok) {
                errorMsg = `${i18n.fetchFailed} (HTTP ${resp.status})`
                checking = false
                return
            }
            const contentType = resp.headers.get('content-type') ?? ''
            if (contentType.startsWith('image/')) {
                const blob = await resp.blob()
                if (blobUrl) URL.revokeObjectURL(blobUrl)
                blobUrl = URL.createObjectURL(blob)
                previewSrc = blobUrl
                validExt = true
            } else if (contentType.startsWith('video/')) {
                validExt = true
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

    function getFileName(): string {
        return url.trim().split('/').pop()?.split('?')[0] ?? ''
    }

    onDestroy(() => {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
    })
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 8px; width: 100%;">
    <div>
        <input class="b3-text-field fn__block" type="text" style="width: 100%;"
            placeholder="https://example.com/background.jpg"
            bind:value={url}
            oninput={handleInput}
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && validExt && handleUpload()}
        />
    </div>

    <div style="min-height: 160px; display: flex; align-items: center; justify-content: center;
        border: 1px dashed var(--b3-border-color); border-radius: 6px;
        background: var(--b3-theme-surface);">
        {#if checking}
            <span style="color: var(--b3-theme-on-surface);">{i18n.detecting}</span>
        {:else if previewSrc}
            <img src={previewSrc} alt="preview"
                style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 4px;" />
        {:else if validExt}
            <div style="text-align: center; color: var(--b3-theme-on-surface);">
                <div style="font-size: 2em;">🎬</div>
                <div>{getFileName()}</div>
                <div style="font-size: 0.85em; margin-top: 4px;">{i18n.videoNoPreview}</div>
            </div>
        {:else if errorMsg}
            <span style="color: var(--b3-theme-error); text-align: center; padding: 12px;">{errorMsg}</span>
        {:else}
            <span style="color: var(--b3-theme-on-surface);">{i18n.enterUrlHint}</span>
        {/if}
    </div>

    <div class="fn__flex" style="justify-content: flex-end;">
        <button class="b3-button b3-button--text"
            disabled={!validExt}
            onclick={handleUpload}>
            {i18n.upload}
        </button>
    </div>
</div>
