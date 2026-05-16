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

export interface ImageItem {
    name: string
    url: string
    apiPath: string
    type: 'image' | 'video'
    sourceType: 'local' | 'upload' | 'assets'
    sourceLabel: string
}

export interface SourceConfig {
    type: 'local' | 'upload' | 'assets'
    path: string
    label: string
}

export const IMAGE_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif',
])

export const VIDEO_EXTS = new Set([
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv',
])

export function classifyFileType(filename: string): 'image' | 'video' | null {
    const ext = filename.includes('.')
        ? '.' + filename.split('.').pop()!.toLowerCase()
        : ''

    if (IMAGE_EXTS.has(ext)) return 'image'
    if (VIDEO_EXTS.has(ext)) return 'video'
    return null
}
