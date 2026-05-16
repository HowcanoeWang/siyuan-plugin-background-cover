import { fetchPost } from "siyuan"

const ENGINE = 'fs.ts'

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

export async function readDir(path: string): Promise<string[]> {
    const fsp = getFsp()
    if (isDesktop() && fsp) {
        try {
            const entries = await fsp.readdir(path, { withFileTypes: true })
            return entries
                .filter((e: any) => e.isFile())
                .map((e: any) => e.name)
        } catch (err: any) {
            console.debug(`${ENGINE} readDir desktop 失败: path=${path}, err=${err.message}`)
            return []
        }
    }

    return new Promise((resolve) => {
        fetchPost("/api/file/readDir", { path }, (response: any) => {
            if (response.code === 0 && Array.isArray(response.data)) {
                resolve(
                    (response.data as { isDir: boolean; name: string }[])
                        .filter(item => !item.isDir)
                        .map(item => item.name)
                )
            } else {
                resolve([])
            }
        })
    })
}

export function getFileUrl(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): string {
    if (sourceType === 'local') {
        return `file://${apiPath}`
    }

    if (isDesktop()) {
        const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
        const sep = wsDir.endsWith('/') ? '' : '/'
        return `file://${wsDir}${sep}${apiPath}`
    }

    const rel = apiPath.startsWith('data/')
        ? '/' + apiPath.slice('data/'.length)
        : '/' + apiPath
    return rel
}

export async function fileExists(apiPath: string, sourceType: 'local' | 'upload' | 'assets'): Promise<boolean> {
    if (apiPath.length === 0) return false

    const fsp = getFsp()
    if (sourceType === 'local' || (sourceType !== 'assets' && isDesktop() && fsp)) {
        try {
            await fsp.access(apiPath)
            return true
        } catch {
            return false
        }
    }

    const parentPath = apiPath.substring(0, apiPath.lastIndexOf('/'))
    const targetName = apiPath.substring(apiPath.lastIndexOf('/') + 1)
    const files = await readDir(parentPath)
    return files.includes(targetName)
}

export async function downloadUrl(url: string, destPath: string): Promise<boolean> {
    try {
        const response = await fetch(url)
        if (!response.ok) return false

        const blob = await response.blob()

        const fsp = getFsp()
        if (isDesktop() && fsp) {
            const buffer = await blob.arrayBuffer()
            await fsp.writeFile(destPath, Buffer.from(buffer))
            return true
        }

        return new Promise((resolve) => {
            const formData = new FormData()
            formData.append("path", destPath)
            formData.append("isDir", "false")
            formData.append("modTime", Math.floor(Date.now() / 1000).toString())
            formData.append("file", blob)
            fetchPost("/api/file/putFile", formData, (res: any) => {
                resolve(res.code === 0)
            })
        })
    } catch (err: any) {
        console.debug(`${ENGINE} downloadUrl 失败: url=${url}, err=${err.message}`)
        return false
    }
}
