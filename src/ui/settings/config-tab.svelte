<script lang="ts">
    import { configStore } from "../../stores/config"
    import { createBgLayer, renderImage, changeOpacity, changeBlur, changePosition, getCurrentMode } from "../../services/bgRender"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let activate = $state(configStore.get("activate"))
    let opacity = $state(configStore.get("opacity"))
    let blur = $state(configStore.get("blur"))
    let positionX = $state(configStore.get("positionX"))
    let positionY = $state(configStore.get("positionY"))
    let autoRefresh = $state(configStore.get("autoRefresh"))
    let autoRefreshTime = $state(configStore.get("autoRefreshTime"))
    let currentFile = $state(configStore.get("currentFile"))

    let currentMode = $state(getCurrentMode())
    let posDisabled = $derived(currentMode !== 'image')

    function handleActivateChange() {
        activate = !activate
        configStore.set("activate", activate)
        if (activate) {
            createBgLayer()
            if (currentFile) {
                renderImage(currentFile)
                changeOpacity(opacity)
                changeBlur(blur)
                changePosition(positionX, positionY)
            }
        }
    }

    $effect(() => {
        currentMode = getCurrentMode()
    })
</script>

<div class="config__tab-container" data-name="config">
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {i18n.currentFile ?? "当前背景图片"}
            <div class="b3-label__text">
                <code class="fn__code">{currentFile ?? i18n.none ?? "(无)"}</code>
            </div>
        </div>
        <div class="fn__flex-center">
            <div>
                <label>X</label>
                <input class="b3-slider fn__size50"
                    type="range" min="0" max="100" step="5"
                    disabled={posDisabled} style:opacity={posDisabled ? "0.1" : "1"}
                    bind:value={positionX}
                    oninput={() => changePosition(positionX, positionY)}
                    onchange={() => configStore.set("positionX", positionX)}
                />
            </div>
            <div>
                <label>Y</label>
                <input class="b3-slider fn__size50"
                    type="range" min="0" max="100" step="5"
                    disabled={posDisabled} style:opacity={posDisabled ? "0.1" : "1"}
                    bind:value={positionY}
                    oninput={() => changePosition(positionX, positionY)}
                    onchange={() => configStore.set("positionY", positionY)}
                />
            </div>
        </div>
    </label>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.activateBg ?? "开启背景"}
            <div class="b3-label__text">{i18n.activateBgDesc ?? "关闭后背景图片不显示(但背景元素还存在于html代码中)"}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={activate}
            onchange={handleActivateChange}
        />
    </label>

    <div class="b3-label">
        <div>{i18n.autoRefresh ?? "自动刷新"}</div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">{i18n.autoRefreshDesc ?? "启动时自动更换背景"}</div>
            <span class="fn__space"></span>
            <input class="b3-switch fn__flex-center" type="checkbox"
                bind:checked={autoRefresh}
                onchange={() => configStore.set("autoRefresh", autoRefresh)}
            />
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">{i18n.switchIntervalDesc ?? "定时自动切换时间，设置为0则不定时切换"}</div>
            <span class="fn__space"></span>
            <input class="b3-text-field fn__flex-center fn__size200" type="number"
                min="0" max="36000"
                bind:value={autoRefreshTime}
                disabled={!autoRefresh}
                onchange={() => configStore.set("autoRefreshTime", autoRefreshTime)}
            />
            <span class="fn__space"></span>
            <span class="ft__on-surface fn__flex-center">{i18n.minutes ?? "分钟"}</span>
        </div>
    </div>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.foregroundOpacity ?? "前景透明度"}
            <div class="b3-label__text">{i18n.foregroundOpacityDesc ?? "范围(0.1-1), 鼠标拖动后更新"}</div>
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
                onchange={() => configStore.set("opacity", opacity)}
            />
        </div>
    </label>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.bgBlur ?? "背景虚化"}
            <div class="b3-label__text">{i18n.bgBlurDesc ?? "范围(0-10), 鼠标拖动后更新"}</div>
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
                onchange={() => configStore.set("blur", blur)}
            />
        </div>
    </label>
</div>