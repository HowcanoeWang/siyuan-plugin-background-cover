interface ThemeInfo {
    name: string
    label: string
}

export function getInstalledThemes(): [ThemeInfo[], ThemeInfo[]] {
    const appearance = (window as any).siyuan?.config?.appearance
    if (!appearance) return [[], []]

    const themes = appearance.themes ?? []
    const light: ThemeInfo[] = []
    const dark: ThemeInfo[] = []

    for (const t of themes) {
        if (!t?.name) continue
        if (t.mode === 'dark') {
            dark.push({ name: t.name, label: t.label ?? t.name })
        } else {
            light.push({ name: t.name, label: t.label ?? t.name })
        }
    }

    return [light, dark]
}

export function getCurrentThemeInfo(): [number, string] {
    const appearance = (window as any).siyuan?.config?.appearance
    return [appearance?.mode ?? 0, appearance?.themeDark ?? '']
}
