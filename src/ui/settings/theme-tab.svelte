<script lang="ts">
    import { configStore } from "../../stores/config"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let disabledThemes = $state(configStore.get("disabledThemes"))
    let darkThemes = $state<string[]>([])
    let lightThemes = $state<string[]>([])

    $effect(() => {
        disabledThemes = configStore.get("disabledThemes")
    })

    function toggleDarkTheme(name: string) {
        const dt = configStore.get("disabledThemes")
        const dark = [...dt.dark]
        const idx = dark.indexOf(name)
        if (idx >= 0) dark.splice(idx, 1)
        else dark.push(name)
        configStore.setAndSave("disabledThemes", { ...dt, dark })
    }

    function toggleLightTheme(name: string) {
        const dt = configStore.get("disabledThemes")
        const light = [...dt.light]
        const idx = light.indexOf(name)
        if (idx >= 0) light.splice(idx, 1)
        else light.push(name)
        configStore.setAndSave("disabledThemes", { ...dt, light })
    }
</script>

<div class="config__tab-container" data-name="theme" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="b3-label">{i18n.disabledThemesTitle ?? "屏蔽主题 (在下列主题不显示背景)"}</div>

    <div class="fn__hr"></div>

    <div class="b3-label">{i18n.darkThemes ?? "深色主题"}</div>
    {#if darkThemes.length === 0}
        <div style="color: var(--b3-theme-on-surface); padding: 8px;">{i18n.noDarkThemes ?? "暂无已安装的深色主题"}</div>
    {:else}
        {#each darkThemes as name}
            <div class="b3-list-item">
                <span class="b3-list-item__text fn__flex-1">{name}</span>
                <input class="b3-switch fn__flex-center" type="checkbox"
                    checked={disabledThemes.dark.includes(name)}
                    onchange={() => toggleDarkTheme(name)}
                />
            </div>
        {/each}
    {/if}

    <div class="fn__hr"></div>

    <div class="b3-label">{i18n.lightThemes ?? "浅色主题"}</div>
    {#if lightThemes.length === 0}
        <div style="color: var(--b3-theme-on-surface); padding: 8px;">{i18n.noLightThemes ?? "暂无已安装的浅色主题"}</div>
    {:else}
        {#each lightThemes as name}
            <div class="b3-list-item">
                <span class="b3-list-item__text fn__flex-1">{name}</span>
                <input class="b3-switch fn__flex-center" type="checkbox"
                    checked={disabledThemes.light.includes(name)}
                    onchange={() => toggleLightTheme(name)}
                />
            </div>
        {/each}
    {/if}
</div>
