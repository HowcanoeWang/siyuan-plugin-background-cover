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
    localFolders: string[]
    assetDirs: string[]
    dynamicBgUrls: string[]
    customDynamicUrls: string[]
    changeBgOnStart: boolean
    autoRefreshTime: number
    disabledThemes: DisabledThemes
    imageOverrides: Record<string, ImageOverride>
    currentFile: string | null
    inDev: boolean
}

export interface ImageItem {
    name: string
    url: string
    apiPath: string
    type: 'image' | 'video'
    sourceType: 'local' | 'upload' | 'assets' | 'dynamic'
    sourceLabel: string
}

export interface SourceConfig {
    type: 'local' | 'upload' | 'assets' | 'dynamic'
    path: string
    label: string
}

export { IMAGE_EXTS, VIDEO_EXTS, classifyFileType } from "./constants"
