<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { getInstalledThemes, getCurrentThemeInfo } from "../../utils/theme"
    import type { ThemeInfo } from "../../utils/theme"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}

    let disabledThemes = $state(configStore.get("disabledThemes"))
    let lightItems = $state<ThemeInfo[]>([])
    let darkItems = $state<ThemeInfo[]>([])
    let currentMode = $state(0)
    let currentThemeName = $state('')

    onMount(() => {
        const [light, dark] = getInstalledThemes()
        lightItems = light
        darkItems = dark
        const [mode, name] = getCurrentThemeInfo()
        currentMode = mode
        currentThemeName = name
    })

    $effect(() => {
        disabledThemes = configStore.get("disabledThemes")
    })

    function toggleTheme(mode: 'light' | 'dark', name: string) {
        const dt = configStore.get("disabledThemes")
        const key = mode === 'light' ? 'light' : 'dark'
        const list = [...dt[key]]
        const idx = list.indexOf(name)
        if (idx >= 0) list.splice(idx, 1)
        else list.push(name)
        configStore.setAndSave("disabledThemes", { ...dt, [key]: list })
        ;(window as any).bgCoverPlugin?.plugin?.applyThemeShield?.()
    }
</script>

<div class="config__tab-container" data-name="theme">
    <div class="config-bazaar__panel">

        <div class="fn__flex config-bazaar__title">
            <div>{i18n.lightThemes}</div>
        </div>
        <div class="config-bazaar__content">
            {#if lightItems.length === 0}
                <div style="color: var(--b3-theme-on-surface); padding: 8px;">
                    {i18n.noLightThemes}
                </div>
            {:else}
                <div class="b3-cards">
                    {#each lightItems as theme (theme.name)}
                        <div class="b3-card b3-card--wrap">
                            <div class="fn__flex-1 fn__flex-column">
                                <div class="b3-card__info b3-card__info--left fn__flex-1">
                                    <span
                                        style:color={currentMode === 0 && currentThemeName === theme.name
                                            ? 'var(--b3-theme-primary)' : ''}
                                    >
                                        {theme.name}
                                        {#if currentMode === 0 && currentThemeName === theme.name}
                                            {i18n.currentThemeLabel}
                                        {/if}
                                    </span>
                                    <div class="b3-card__desc">{theme.label}</div>
                                </div>
                            </div>
                            <div class="b3-card__actions b3-card__actions--right">
                                <span class="fn__space"></span>
                                <input class="b3-switch fn__flex-center" type="checkbox"
                                    checked={disabledThemes.light.includes(theme.name)}
                                    onchange={() => toggleTheme('light', theme.name)}
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="fn__flex config-bazaar__title">
            <div>{i18n.darkThemes}</div>
        </div>
        <div class="config-bazaar__content">
            {#if darkItems.length === 0}
                <div style="color: var(--b3-theme-on-surface); padding: 8px;">
                    {i18n.noDarkThemes}
                </div>
            {:else}
                <div class="b3-cards">
                    {#each darkItems as theme (theme.name)}
                        <div class="b3-card b3-card--wrap">
                            <div class="fn__flex-1 fn__flex-column">
                                <div class="b3-card__info b3-card__info--left fn__flex-1">
                                    <span
                                        style:color={currentMode === 1 && currentThemeName === theme.name
                                            ? 'var(--b3-theme-primary)' : ''}
                                    >
                                        {theme.name}
                                        {#if currentMode === 1 && currentThemeName === theme.name}
                                            {i18n.currentThemeLabel}
                                        {/if}
                                    </span>
                                    <div class="b3-card__desc">{theme.label}</div>
                                </div>
                            </div>
                            <div class="b3-card__actions b3-card__actions--right">
                                <span class="fn__space"></span>
                                <input class="b3-switch fn__flex-center" type="checkbox"
                                    checked={disabledThemes.dark.includes(theme.name)}
                                    onchange={() => toggleTheme('dark', theme.name)}
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

    </div>
</div>