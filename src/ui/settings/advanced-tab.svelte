<script lang="ts">
    import { configStore } from "../../stores/config"
    import { confirmDialog } from "../../libs/dialog"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let inDev = $state(configStore.get("inDev"))

    async function handleReset() {
        const confirmed = await new Promise<boolean>((resolve) => {
            confirmDialog({
                title: i18n.resetAllBtn ?? "重置所有设置",
                content: i18n.resetAllConfirm ?? "确认重置所有设置？这将清除所有配置和缓存图片。",
                confirm: () => resolve(true),
                cancel: () => resolve(false),
                width: "420px",
            })
        })
        if (!confirmed) return
        await configStore.reset()
        window.location.reload()
    }
</script>

<div class="config__tab-container" data-name="advanced" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="b3-label">
        <div class="fn__flex">
            <span class="fn__flex-1">{i18n.inDevModeLabel ?? "开发模式"}</span>
            <input class="b3-switch fn__flex-center" type="checkbox"
                bind:checked={inDev}
                onchange={() => configStore.setAndSave("inDev", inDev)}
            />
        </div>
        <div class="ft__breakword" style="font-size: 0.85em; color: var(--b3-theme-on-surface);">
            {i18n.inDevModeDesc ?? "显示调试信息 (frontend/backend/isMobile 等)"}
        </div>
    </div>

    <div class="fn__hr"></div>

    <div class="b3-label">
        <div class="fn__flex">
            <span class="fn__flex-1">{i18n.resetAllBtn ?? "重置所有设置"}</span>
            <button class="b3-button b3-button--outline" onclick={handleReset}>
                {i18n.reset ?? "重置"}
            </button>
        </div>
        <div class="ft__breakword" style="font-size: 0.85em; color: var(--b3-theme-on-surface);">
            {i18n.resetAllDesc ?? "将所有设置恢复到插件初始值 (包括所有缓存的图片)"}
        </div>
    </div>
</div>
