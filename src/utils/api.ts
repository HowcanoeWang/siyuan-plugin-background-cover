import { fetchSyncPost, IWebSocketData } from "siyuan"
import { devDebug } from "./logger"

interface IDirItem {
    isDir: boolean
    name: string
}

export async function request(url: string, data?: any): Promise<any> {
    const res: IWebSocketData = await fetchSyncPost(url, data ?? {})
    return res.code === 0 ? res.data : null
}

export async function readSiyuanDir(path: string): Promise<string[]> {
    const data = await request("/api/file/readDir", { path })
    if (!Array.isArray(data)) return []
    return (data as IDirItem[])
        .filter(item => !item.isDir)
        .map(item => item.name)
}

export async function fileExistsRemote(path: string): Promise<boolean> {
    if (!path) return false
    const parentPath = path.substring(0, path.lastIndexOf('/'))
    const targetName = path.substring(path.lastIndexOf('/') + 1)
    const files = await readSiyuanDir(parentPath)
    return files.includes(targetName)
}

export async function readDirItems(path: string): Promise<IDirItem[]> {
    const data = await request("/api/file/readDir", { path })
    if (!Array.isArray(data)) return []
    return data as IDirItem[]
}

export async function putFile(path: string, file: File | Blob): Promise<boolean> {
    const formData = new FormData()
    formData.append("path", path)
    formData.append("isDir", "false")
    formData.append("modTime", Math.floor(Date.now() / 1000).toString())
    formData.append("file", file)
    const data = await request("/api/file/putFile", formData)
    return data !== null
}

export async function removeFile(path: string): Promise<boolean> {
    const data = await request("/api/file/removeFile", { path })
    return data !== null
}

export async function getLocalStorage(): Promise<Record<string, any> | null> {
    return request("/api/storage/getLocalStorage")
}

export async function setLocalStorageVal(key: string, val: any): Promise<boolean> {
    const data = await request("/api/storage/setLocalStorageVal", { key, val })
    return data !== null
}

export async function removeLocalStorageVals(keys: string[]): Promise<boolean> {
    const data = await request("/api/storage/removeLocalStorageVals", { keys })
    return data !== null
}

export async function downloadUrl(url: string, destPath: string): Promise<boolean> {
    try {
        const response = await fetch(url)
        if (!response.ok) return false
        const blob = await response.blob()
        return await putFile(destPath, blob)
    } catch (err: any) {
        devDebug('[bgCover] api.ts downloadUrl 失败:', url, err.message)
        return false
    }
}
