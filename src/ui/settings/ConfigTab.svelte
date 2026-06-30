<script lang="ts">
    import { onMount, tick } from "svelte"
    import { configStore } from "../../stores/config"
    import { createBgLayer, destroyBgLayer, render, changeForegroundOpacity, changeBackgroundOpacity, changeBlur, applyOverrides, startAutoRefresh, stopAutoRefresh } from "../../services/bgRender"
    import type { AppConfig } from "../../types"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let activate = $state(configStore.get("activate"))
    let foregroundOpacity = $state(configStore.get("foregroundOpacity"))
    let backgroundOpacity = $state(configStore.get("backgroundOpacity"))
    let blur = $state(configStore.get("blur"))
    let changeBgOnStart = $state(configStore.get("changeBgOnStart"))
    let autoRefreshTime = $state(configStore.get("autoRefreshTime"))
    let foregroundOpacityInput: HTMLInputElement
    let backgroundOpacityInput: HTMLInputElement
    let blurInput: HTMLInputElement

    onMount(() => configStore.subscribe(syncFromStore))

    function syncFromStore(cfg: Readonly<AppConfig>) {
        const changedSliders = [
            foregroundOpacity !== cfg.foregroundOpacity ? [foregroundOpacityInput, cfg.foregroundOpacity] as const : null,
            backgroundOpacity !== cfg.backgroundOpacity ? [backgroundOpacityInput, cfg.backgroundOpacity] as const : null,
            blur !== cfg.blur ? [blurInput, cfg.blur] as const : null,
        ]

        activate = cfg.activate
        foregroundOpacity = cfg.foregroundOpacity
        backgroundOpacity = cfg.backgroundOpacity
        blur = cfg.blur
        changeBgOnStart = cfg.changeBgOnStart
        autoRefreshTime = cfg.autoRefreshTime

        tick().then(() => {
            changedSliders.forEach(item => {
                if (!item) return
                refreshSlider(item[0], item[1])
            })
        })
    }

    function refreshSlider(input: HTMLInputElement | undefined, value: number) {
        if (!input) return
        input.parentElement?.setAttribute('aria-label', String(value))
        input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    function handleActivateChange() {
        configStore.setAndSave("activate", activate)
        if (!activate) {
            destroyBgLayer()
            return
        }

        createBgLayer()
        const currentFile = configStore.get("currentFile")
        if (currentFile) {
            render(currentFile)
            changeForegroundOpacity(foregroundOpacity)
            changeBackgroundOpacity(backgroundOpacity)
            changeBlur(blur)
            const ov = configStore.get("imageOverrides")[currentFile]
            applyOverrides(ov?.positionX, ov?.positionY, 50, 50)
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
        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label={String(foregroundOpacity)}>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="1" step="0.05"
                bind:this={foregroundOpacityInput}
                bind:value={foregroundOpacity}
                oninput={() => {
                    changeForegroundOpacity(foregroundOpacity)
                    const el = document.activeElement?.parentElement
                    if (el) el.setAttribute('aria-label', String(foregroundOpacity))
                }}
                onchange={() => configStore.setAndSave("foregroundOpacity", foregroundOpacity)}
            />
        </div>
    </label>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.backgroundOpacity}
            <div class="b3-label__text">{i18n.backgroundOpacityDesc}</div>
        </div>
        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label={String(backgroundOpacity)}>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="1" step="0.05"
                bind:this={backgroundOpacityInput}
                bind:value={backgroundOpacity}
                oninput={() => {
                    changeBackgroundOpacity(backgroundOpacity)
                    const el = document.activeElement?.parentElement
                    if (el) el.setAttribute('aria-label', String(backgroundOpacity))
                }}
                onchange={() => configStore.setAndSave("backgroundOpacity", backgroundOpacity)}
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
                bind:this={blurInput}
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
