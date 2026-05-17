<script lang="ts">
    import { getFrontend, getBackend } from "siyuan"
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

    const frontEnd = getFrontend()
    const backEnd = getBackend()
    const isMobileLayout = (window as any).bgCoverPlugin?.isMobileLayout ?? false
    const isBrowser = frontEnd === "browser"
    const isAndroid = frontEnd === "browser-mobile"
</script>

<div class="config__tab-container" data-name="advanced">
    <label class="b3-label config__item fn__flex">
        <div class="fn__flex-1">
            {i18n.resetAllBtn ?? "重置所有设置"}
            <div class="b3-label__text">
                {i18n.resetAllDesc ?? "将所有设置恢复到插件初始值 (包括所有缓存的图片)"}
            </div>
        </div>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--outline fn__flex-center fn__size100"
            onclick={handleReset}>
            <svg><use xlink:href="#iconRefresh"></use></svg>
            {i18n.reset ?? "重置"}
        </button>
    </label>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.inDevModeLabel ?? "开发者模式"}
            <div class="b3-label__text">
                {i18n.inDevModeDesc ?? "开启后将显示更多日志输出"} •
                FrontEnd: <code class="fn__code">{frontEnd}</code> •
                BackEnd: <code class="fn__code">{backEnd}</code> •
                isMobileLayout: <code class="fn__code">{String(isMobileLayout)}</code> •
                isBrowser: <code class="fn__code">{String(isBrowser)}</code> •
                isAndroid: <code class="fn__code">{String(isAndroid)}</code>
            </div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={inDev}
            onchange={() => configStore.setAndSave("inDev", inDev)}
        />
    </label>
</div>