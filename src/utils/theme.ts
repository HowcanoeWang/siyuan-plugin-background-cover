export interface ThemeInfo {
    name: string
    label: string
}

import { log } from "./logger"

function getAppearance() {
    return (window as any).siyuan?.config?.appearance
}

export function getInstalledThemes(): [ThemeInfo[], ThemeInfo[]] {
    const appearance = getAppearance()
    if (!appearance) return [[], []]

    const light: ThemeInfo[] = (appearance.lightThemes ?? [])
        .filter((t: any) => t?.name)
        .map((t: any) => ({ name: t.name, label: t.label ?? t.name }))

    const dark: ThemeInfo[] = (appearance.darkThemes ?? [])
        .filter((t: any) => t?.name)
        .map((t: any) => ({ name: t.name, label: t.label ?? t.name }))

    log("[bgCover] getInstalledThemes: light =", light.length, "dark =", dark.length)
    return [light, dark]
}

export function getCurrentThemeInfo(): [number, string] {
    const appearance = getAppearance()
    if (!appearance) return [0, '']
    return [appearance.mode ?? 0, appearance.themeDark ?? '']
}

export function getCurrentThemeName(): string {
    const appearance = getAppearance()
    if (!appearance) return ''
    return appearance.mode === 0
        ? (appearance.themeLight ?? '')
        : (appearance.themeDark ?? '')
}

export function isCurrentThemeDisabled(
    disabledThemes: { light: string[]; dark: string[] }
): boolean {
    const appearance = getAppearance()
    if (!appearance) return false
    const mode = appearance.mode === 0 ? 'light' : 'dark'
    const name = mode === 'light' ? (appearance.themeLight ?? '') : (appearance.themeDark ?? '')
    return disabledThemes[mode]?.includes(name) ?? false
}

export function watchTheme(
    onChange: (mode: 'light' | 'dark', name: string) => void
): () => void {
    const observer = new MutationObserver(() => {
        const appearance = getAppearance()
        if (!appearance) return
        const mode: 'light' | 'dark' = appearance.mode === 0 ? 'light' : 'dark'
        const name = mode === 'light'
            ? (appearance.themeLight ?? '')
            : (appearance.themeDark ?? '')
        log("[bgCover] watchTheme: detected change ->", mode, name)
        onChange(mode, name)
    })

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme-mode'],
    })

    return () => observer.disconnect()
}
