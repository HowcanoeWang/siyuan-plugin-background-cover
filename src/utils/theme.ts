/**
 * 获取当前主题名字和模式
 */
export function getCurrentThemeInfo() {
    // 0 -> light, 1 -> dark
    const themeMode = (window as any).siyuan.config.appearance.mode
    let themeName = ''
    
    if (themeMode === 0 ) {
        themeName = (window as any).siyuan.config.appearance.themeLight
    }else{
        themeName = (window as any).siyuan.config.appearance.themeDark
    }

    return [themeMode, themeName]
}

export function getInstalledThemes() {
    // in siyan 2.1.30, theme data structure changed to:
    // 不需要加载缓存就能直接获取主题字段和对应的名字了
    const lightThemes = (window as any).siyuan.config.appearance.lightThemes;
    const darkThemes = (window as any).siyuan.config.appearance.darkThemes;

    return [lightThemes, darkThemes]
}