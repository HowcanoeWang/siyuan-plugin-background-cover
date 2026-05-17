<script lang="ts">
    import { configStore } from "../../stores/config"
    import { createBgLayer, renderImage, changeOpacity, changeBlur, changePosition } from "../../services/bgRender"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let activate = $state(configStore.get("activate"))
    let opacity = $state(configStore.get("opacity"))
    let blur = $state(configStore.get("blur"))
    let positionX = $state(configStore.get("positionX"))
    let positionY = $state(configStore.get("positionY"))
    let autoRefresh = $state(configStore.get("autoRefresh"))
    let autoRefreshTime = $state(configStore.get("autoRefreshTime"))
    let currentFile = $state(configStore.get("currentFile"))

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
</script>

<div class="config__tab-container" data-name="config" style="display: flex; flex-direction: column; gap: 16px;">
    <div class="b3-label">
        <div class="fn__flex" style="gap: 12px; align-items: center;">
            <code class="fn__code">{currentFile ?? i18n.none ?? "(无)"}</code>
            <span class="fn__space"></span>
            <label>X</label>
            <input
                class="b3-slider fn__size50"
                type="range" min="0" max="100" step="5"
                bind:value={positionX}
                oninput={() => changePosition(positionX, positionY)}
                onchange={() => configStore.set("positionX", positionX)}
            />
            <label>Y</label>
            <input
                class="b3-slider fn__size50"
                type="range" min="0" max="100" step="5"
                bind:value={positionY}
                oninput={() => changePosition(positionX, positionY)}
                onchange={() => configStore.set("positionY", positionY)}
            />
        </div>
    </div>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">{i18n.activateBg ?? "开启背景"}</div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={activate}
            onchange={handleActivateChange}
        />
    </label>

    <div class="fn__hr"></div>

    <label class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            {i18n.autoRefresh ?? "自动刷新"}
            <div class="b3-label__text">{i18n.autoRefreshDesc ?? "启动时自动更换背景"}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" type="checkbox"
            bind:checked={autoRefresh}
            onchange={() => configStore.set("autoRefresh", autoRefresh)}
        />
    </label>
    <div class="b3-label" style="margin-left: 8px;">
        <div class="fn__flex" style="gap: 8px;">
            <span>{i18n.switchInterval ?? "定时切换间隔"}</span>
            <input class="b3-text-field fn__size200" type="number"
                min="0" max="36000"
                bind:value={autoRefreshTime}
                disabled={!autoRefresh}
                onchange={() => configStore.set("autoRefreshTime", autoRefreshTime)}
            />
            <span>{i18n.minutes ?? "分钟"}</span>
        </div>
    </div>

    <div class="b3-label">
        <div class="b3-tooltips b3-tooltips__n" aria-label={String(opacity)}>
            <span>{i18n.foregroundOpacity ?? "前景透明度"}</span>
            <input class="b3-slider fn__size200" type="range"
                min="0.1" max="1" step="0.05"
                bind:value={opacity}
                oninput={() => changeOpacity(opacity)}
                onchange={() => configStore.set("opacity", opacity)}
            />
        </div>
    </div>

    <div class="b3-label">
        <div class="b3-tooltips b3-tooltips__n" aria-label={String(blur)}>
            <span>{i18n.bgBlur ?? "背景虚化"}</span>
            <input class="b3-slider fn__size200" type="range"
                min="0" max="10" step="1"
                bind:value={blur}
                oninput={() => changeBlur(blur)}
                onchange={() => configStore.set("blur", blur)}
            />
        </div>
    </div>
</div>
