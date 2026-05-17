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

    let rel = apiPath
    if (rel.startsWith('/data/')) rel = rel.slice(1)
    if (rel.startsWith('data/')) rel = rel.slice(5)
    else if (rel.startsWith('/')) rel = rel.slice(1)
    return rel
}

export async function fileExistsLocal(path: string): Promise<boolean> {
    if (!path || !isDesktop()) return false
    const fsp = getFsp()
    try {
        await fsp.access(path)
        return true
    } catch {
        return false
    }
}
