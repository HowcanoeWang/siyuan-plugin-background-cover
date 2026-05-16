<script lang="ts">
    import { downloadUrl } from "../utils/fs"

    interface Props {
        onSuccess?: () => void
    }

    let { onSuccess }: Props = $props()

    let url = $state("")
    let previewSrc = $state<string | null>(null)
    let validExt = $state(false)
    let checking = $state(false)
    let errorMsg = $state("")

    const VALID_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif',
        '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'])

    function checkExt(u: string): boolean {
        const clean = u.split('?')[0]
        const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
        return VALID_EXTS.has(ext)
    }

    async function handleCheck() {
        const trimmed = url.trim()
        if (!trimmed) return
        checking = true
        errorMsg = ""
        validExt = false
        previewSrc = null

        if (!checkExt(trimmed)) {
            errorMsg = "URL 后缀不在支持的图片/视频格式列表中"
            checking = false
            return
        }

        try {
            const resp = await fetch(trimmed)
            if (!resp.ok) {
                errorMsg = `无法获取资源 (HTTP ${resp.status})`
                checking = false
                return
            }
            const contentType = resp.headers.get('content-type') ?? ''
            if (contentType.startsWith('image/')) {
                const blob = await resp.blob()
                previewSrc = URL.createObjectURL(blob)
                validExt = true
            } else if (contentType.startsWith('video/')) {
                validExt = true
            } else {
                errorMsg = "URL 指向的资源不是图片或视频"
            }
        } catch {
            errorMsg = "网络请求失败，请确认 URL 正确"
        }
        checking = false
    }

    async function handleUpload() {
        const trimmed = url.trim()
        if (!trimmed || !validExt) return

        const fileName = trimmed.split('/').pop()?.split('?')[0] ?? 'download'
        const destPath = `data/public/siyuan-plugin-background-cover/${fileName}`

        const ok = await downloadUrl(trimmed, destPath)
        if (ok) {
            onSuccess?.()
        }
    }

    function getFileName(): string {
        return url.trim().split('/').pop()?.split('?')[0] ?? ''
    }
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 8px;">
    <div>
        <input class="b3-text-field fn__block" type="text"
            placeholder="https://example.com/background.jpg"
            bind:value={url}
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleCheck()}
        />
    </div>

    <div style="min-height: 160px; display: flex; align-items: center; justify-content: center;
        border: 1px dashed var(--b3-border-color); border-radius: 6px;
        background: var(--b3-theme-surface);">
        {#if checking}
            <span style="color: var(--b3-theme-on-surface);">正在检测...</span>
        {:else if previewSrc}
            <img src={previewSrc} alt="preview"
                style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 4px;" />
        {:else if validExt}
            <div style="text-align: center; color: var(--b3-theme-on-surface);">
                <div style="font-size: 2em;">🎬</div>
                <div>{getFileName()}</div>
                <div style="font-size: 0.85em; margin-top: 4px;">视频文件 — 预览暂不支持</div>
            </div>
        {:else if errorMsg}
            <span style="color: var(--b3-theme-error); text-align: center; padding: 12px;">{errorMsg}</span>
        {:else}
            <span style="color: var(--b3-theme-on-surface);">粘贴图片/视频 URL 后自动检测</span>
        {/if}
    </div>

    <div class="fn__flex" style="justify-content: flex-end; gap: 8px;">
        <button class="b3-button b3-button--cancel">取消</button>
        <button class="b3-button b3-button--text"
            disabled={!validExt}
            onclick={handleUpload}>
            上传
        </button>
    </div>
</div>
