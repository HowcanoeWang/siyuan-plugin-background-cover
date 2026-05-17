<script lang="ts">
    import { classifyFileType } from "../types"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    interface Props {
        onConfirm?: (path: string) => void
    }

    let { onConfirm }: Props = $props()

    let pathInput = $state("")
    let checking = $state(false)
    let validDir = $state(false)
    let imgCount = $state(0)
    let vidCount = $state(0)
    let errorMsg = $state("")
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    async function doCheck(p: string) {
        if (!p) {
            validDir = false
            errorMsg = ""
            imgCount = 0
            vidCount = 0
            return
        }
        checking = true
        errorMsg = ""
        validDir = false
        imgCount = 0
        vidCount = 0

        const fsp = (window as any).require?.('fs/promises')
        if (!fsp) {
            errorMsg = i18n.notDesktop ?? "当前非桌面端，不支持本地目录"
            checking = false
            return
        }

        try {
            await fsp.access(p)
        } catch {
            errorMsg = i18n.pathNotExist ?? "路径不存在或无法访问"
            checking = false
            return
        }

        try {
            const entries = await fsp.readdir(p, { withFileTypes: true })
            for (const e of entries) {
                if (!e.isFile()) continue
                const t = classifyFileType(e.name)
                if (t === 'image') imgCount++
                else if (t === 'video') vidCount++
            }
            if (imgCount + vidCount === 0) {
                errorMsg = i18n.noValidFiles ?? "该目录下未发现支持的图片/视频文件"
            } else {
                validDir = true
            }
        } catch (e: any) {
            errorMsg = `${i18n.readDirFailed ?? "读取目录失败"}: ${e.message}`
        }
        checking = false
    }

    function handleInput() {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => doCheck(pathInput.trim()), 500)
    }

    function confirm() {
        onConfirm?.(pathInput.trim())
    }
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 8px; width: 100%;">

    <input class="b3-text-field fn__block" type="text" style="width: 100%;"
        placeholder="/home/user/Pictures/wallpaper"
        bind:value={pathInput}
        oninput={handleInput}
        onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && validDir && confirm()}
    />

    <div style="min-height: 60px; display: flex; align-items: center; padding: 8px;
        border-radius: 4px; background: var(--b3-theme-surface);">
        {#if checking}
            <span style="color: var(--b3-theme-on-surface);">{i18n.detecting ?? "正在检测…"}</span>
        {:else if validDir}
            <span>
                📁 <code class="fn__code">{pathInput.trim()}</code>
                <span style="margin-left: 12px; color: var(--b3-theme-primary);">
                    发现 {imgCount} 张图片, {vidCount} 个视频 — ✅
                </span>
            </span>
        {:else if errorMsg}
            <span style="color: var(--b3-theme-error);">{errorMsg}</span>
        {:else}
            <span style="color: var(--b3-theme-on-surface);">{i18n.autoDetectHint ?? "输入路径后自动检测"}</span>
        {/if}
    </div>

    <div class="fn__flex" style="justify-content: flex-end;">
        <button class="b3-button b3-button--text"
            disabled={!validDir}
            onclick={confirm}>
            {i18n.add ?? "添加"}
        </button>
    </div>
</div>
