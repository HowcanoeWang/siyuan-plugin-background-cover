import { isDesktop, readLocalDir, getFileUrl, fileExistsLocal } from '../utils/fs'
import { readSiyuanDir } from '../utils/api'
import type { ImageItem } from '../types'
import { pluginAssetsDir, classifyFileType } from '../constants'
import { devDebug } from '../utils/logger'
import { toAssetRelPath } from '../utils/path'

const ENGINE = '[bgCover] sourceManager'

export async function scanAll(
    assetDirs: string[] = [],
    localFolders: string[] = [],
): Promise<ImageItem[]> {
    const tasks: Promise<ImageItem[]>[] = [
        scanSource('upload', pluginAssetsDir),
    ]

    const validAssetDirs = assetDirs.filter(d => d.length > 0)
        .map(dir => {
            const normalized = toAssetRelPath(dir)
            return `/data/${normalized}`
        })
    tasks.push(...validAssetDirs.map(path => scanSource('assets', path + '/')))

    if (isDesktop()) {
        const validLocalDirs = localFolders.filter(d => d.length > 0)
        for (const dir of validLocalDirs) {
            const ok = await validatePath(dir)
            if (!ok) {
                devDebug(`${ENGINE} scanAll local[${dir}]: 路径不可访问，跳过`)
            } else {
                tasks.push(scanSource('local', dir))
            }
        }
    } else {
        devDebug(`${ENGINE} scanAll local: 非桌面端，跳过 ${localFolders.length} 个本地文件夹`)
    }

    const batch = await Promise.all(tasks)
    const results = batch.flat()
    devDebug(`${ENGINE} scanAll total: ${results.length} 个文件`)
    return results
}

export async function scanSource(
    type: 'local' | 'upload' | 'assets',
    path: string,
): Promise<ImageItem[]> {
    const filenames = type === 'local'
        ? await readLocalDir(path)
        : await readSiyuanDir(path)

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
        devDebug(`${ENGINE} scanSource[${type}] 跳过不可识别的文件: [${skipped.join(', ')}]`)
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
        return fileExistsLocal(path)
    }

    try {
        await readSiyuanDir(path)
        return true
    } catch {
        return false
    }
}

function getSourceLabel(type: 'local' | 'upload' | 'assets', path: string): string {
    switch (type) {
        case 'upload':
            return 'upload'
        case 'assets':
            return toAssetRelPath(path)
        case 'local':
            return path
    }
}
