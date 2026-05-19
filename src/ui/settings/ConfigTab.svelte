<script lang="ts">
    import { configStore } from "../../stores/config"
    import { createBgLayer, render, changeOpacity, changeBlur, applyOverrides, startAutoRefresh, stopAutoRefresh } from "../../services/bgRender"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let activate = $state(configStore.get("activate"))
    let opacity = $state(configStore.get("opacity"))
    let blur = $state(configStore.get("blur"))
    let changeBgOnStart = $state(configStore.get("changeBgOnStart"))
    let autoRefreshTime = $state(configStore.get("autoRefreshTime"))

    function handleActivateChange() {
        activate = !activate
        configStore.setAndSave("activate", activate)
        if (activate) {
            createBgLayer()
            const currentFile = configStore.get("currentFile")
            if (currentFile) {
                render(currentFile)
                changeOpacity(opacity)
                changeBlur(blur)
                const ov = configStore.get("imageOverrides")[currentFile]
                applyOverrides(ov?.positionX, ov?.positionY, 50, 50)
            }
        }
    }

    function syncAutoRefreshTimer() {
        stopAutoRefresh()
        if (autoRefreshTime > 0) {
            const plugin = (window as any).bgCoverPlugin?.plugin
            startAutoRefresh(() => plugin?.randomSelect?.(), autoRefreshTime * 60000)
        }
    }

</script>

<div class="config__tab-container" data-name="config">
    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.activateBg}
            <div class="b3-label__text">{i18n.activateBgDesc}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={activate}
            onchange={handleActivateChange}
        />
    </label>

    <div class="b3-label">
        <div>{i18n.autoRefresh}</div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">{i18n.autoRefreshDesc}</div>
            <span class="fn__space"></span>
            <input class="b3-switch fn__flex-center" type="checkbox"
                bind:checked={changeBgOnStart}
                onchange={() => { configStore.setAndSave("changeBgOnStart", changeBgOnStart); syncAutoRefreshTimer() }}
            />
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">{i18n.switchIntervalDesc}</div>
            <span class="fn__space"></span>
            <input class="b3-text-field fn__flex-center fn__size200" type="number"
                min="0" max="36000"
                bind:value={autoRefreshTime}
                onchange={() => { configStore.setAndSave("autoRefreshTime", autoRefreshTime); syncAutoRefreshTimer() }}
            />
            <span class="fn__space"></span>
            <span class="ft__on-surface fn__flex-center">{i18n.minutes}</span>
        </div>
    </div>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.foregroundOpacity}
            <div class="b3-label__text">{i18n.foregroundOpacityDesc}</div>
        </div>
        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label={String(opacity)}>
            <input class="b3-slider fn__size200" type="range"
                min="0.1" max="1" step="0.05"
                bind:value={opacity}
                oninput={() => {
                    changeOpacity(opacity)
                    const el = document.activeElement?.parentElement
                    if (el) el.setAttribute('aria-label', String(opacity))
                }}
                onchange={() => configStore.setAndSave("opacity", opacity)}
            />
        </div>
    </label>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.bgBlur}
            <div class="b3-label__text">{i18n.bgBlurDesc}</div>
        </div>
        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label={String(blur)}>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="10" step="1"
                bind:value={blur}
                oninput={() => {
                    changeBlur(blur)
                    const el = document.activeElement?.parentElement
                    if (el) el.setAttribute('aria-label', String(blur))
                }}
                onchange={() => configStore.setAndSave("blur", blur)}
            />
        </div>
    </label>
</div>