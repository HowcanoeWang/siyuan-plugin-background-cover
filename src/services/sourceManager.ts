import { isDesktop, readLocalDir, getFileUrl } from '../utils/fs'
import { readDir as readDirKernel } from '../utils/api'
import { classifyFileType } from '../types'
import type { ImageItem } from '../types'
import { pluginAssetsDir } from '../constants'

const ENGINE = '[bgCover] sourceManager'

export async function scanAll(
    assetDirs: string[] = [],
    localFolders: string[] = [],
): Promise<ImageItem[]> {
    const results: ImageItem[] = []

    const uploadItems = await scanSource('upload', pluginAssetsDir)
    results.push(...uploadItems)
    console.debug(`${ENGINE} scanAll upload: ${uploadItems.length} 个文件`)

    for (const dir of assetDirs) {
        if (dir.length === 0) continue
        const items = await scanSource('assets', dir)
        results.push(...items)
        console.debug(`${ENGINE} scanAll assets[${dir}]: ${items.length} 个文件`)
    }

    if (isDesktop()) {
        for (const dir of localFolders) {
            if (dir.length === 0) continue
            const ok = await validatePath(dir)
            if (!ok) {
                console.debug(`${ENGINE} scanAll local[${dir}]: 路径不可访问，跳过`)
                continue
            }
            const items = await scanSource('local', dir)
            results.push(...items)
            console.debug(`${ENGINE} scanAll local[${dir}]: ${items.length} 个文件`)
        }
    } else {
        console.debug(`${ENGINE} scanAll local: 非桌面端，跳过 ${localFolders.length} 个本地文件夹`)
    }

    console.debug(`${ENGINE} scanAll total: ${results.length} 个文件`)
    return results
}

export async function scanSource(
    type: 'local' | 'upload' | 'assets',
    path: string,
): Promise<ImageItem[]> {
    const filenames = type === 'local'
        ? await readLocalDir(path)
        : await readDirKernel(path)

    const items: ImageItem[] = []
    const skipped: string[] = []

    for (const name of filenames) {
        const fileType = classifyFileType(name)

        if (fileType === null) {
            skipped.push(name)
            continue
        }

        const cleanPath = path.endsWith('/') ? path : path + '/'
        const apiPath = `${cleanPath}${name}`
        const url = getFileUrl(apiPath, type)

        items.push({
            name,
            url,
            apiPath,
            type: fileType,
            sourceType: type,
            sourceLabel: getSourceLabel(type, path),
        })
    }

    if (skipped.length > 0) {
        console.debug(`${ENGINE} scanSource[${type}] 跳过不可识别的文件: [${skipped.join(', ')}]`)
    }

    return items
}

export function pickRandom(items: ImageItem[], excludeUrl?: string | null): ImageItem | null {
    if (items.length === 0) return null

    if (excludeUrl) {
        const filtered = items.filter(item => item.url !== excludeUrl)
        if (filtered.length === 0) return null
        const idx = Math.floor(Math.random() * filtered.length)
        return filtered[idx]
    }

    const idx = Math.floor(Math.random() * items.length)
    return items[idx]
}

export async function validatePath(path: string): Promise<boolean> {
    if (path.length === 0) return false

    if (isDesktop()) {
        try {
            await (window as any).require('fs/promises').access(path)
            return true
        } catch {
            return false
        }
    }

    try {
        await readDirKernel(path)
        return true
    } catch {
        return false
    }
}

function getSourceLabel(type: 'local' | 'upload' | 'assets', path: string): string {
    switch (type) {
        case 'upload':
            return 'upload'
        case 'assets': {
            const prefix = 'data/assets/'
            return path.startsWith(prefix) ? path.slice(prefix.length) : path
        }
        case 'local':
            return path
    }
}
