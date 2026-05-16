export interface DisabledThemes {
    dark: string[]
    light: string[]
}

export interface ImageOverride {
    positionX?: number
    positionY?: number
}

export interface AppConfig {
    activate: boolean
    opacity: number
    blur: number
    positionX: number
    positionY: number
    localFolders: string[]
    assetDirs: string[]
    autoRefresh: boolean
    autoRefreshTime: number
    disabledThemes: DisabledThemes
    imageOverrides: Record<string, ImageOverride>
    currentFile: string | null
}
