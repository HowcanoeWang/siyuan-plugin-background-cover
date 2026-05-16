import { configStore } from "../stores/config"

function getFsp(): any {
    try {
        return (window as any).require?.('fs/promises') ?? null
    } catch {
        return null
    }
}

export function isDesktop(): boolean {
    return typeof (window as any).require === 'function' && getFsp() !== null
}

export function isLocalPath(path: string): boolean {
    return configStore.get("localFolders").some(f => path.startsWith(f))
}

export async function readLocalDir(path: string): Promise<string[]> {
    const fsp = getFsp()
    if (!fsp) return []

    try {
        const entries = await fsp.readdir(path, { withFileTypes: true })
        return entries
            .filter((e: any) => e.isFile())
            .map((e: any) => e.name)
    } catch (err: any) {
        console.debug('fs.ts readLocalDir 失败:', path, err.message)
        return []
    }
}

export function getFileUrl(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): string {
    if (sourceType === 'local') {
        return `file://${apiPath}`
    }

    if (isDesktop()) {
        const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
        const cleanPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath
        const sep = wsDir.endsWith('/') ? '' : '/'
        return `file://${wsDir}${sep}${cleanPath}`
    }

    let rel = apiPath
    if (rel.startsWith('/data/')) rel = rel.slice(1)
    if (rel.startsWith('data/')) rel = '/' + rel.slice('data/'.length)
    else if (!rel.startsWith('/')) rel = '/' + rel
    return rel
}

export async function fileExists(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): Promise<boolean> {
    if (apiPath.length === 0) return false

    if (sourceType === 'local' && isDesktop()) {
        const fsp = getFsp()
        try {
            await fsp.access(apiPath)
            return true
        } catch {
            return false
        }
    }

    const parentPath = apiPath.substring(0, apiPath.lastIndexOf('/'))
    const targetName = apiPath.substring(apiPath.lastIndexOf('/') + 1)
    const { readDir } = await import("./api")
    const files = await readDir(parentPath)
    return files.includes(targetName)
}
