import { fetchSyncPost } from "siyuan"

interface IResponse {
    code: number
    msg: string
    data: any
}

interface IDirItem {
    isDir: boolean
    name: string
}

async function request(url: string, data: any): Promise<any> {
    const res: IResponse = await fetchSyncPost(url, data)
    return res.code === 0 ? res.data : null
}

export async function readDir(path: string): Promise<string[]> {
    const data = await request("/api/file/readDir", { path })
    if (!Array.isArray(data)) return []
    return (data as IDirItem[])
        .filter(item => !item.isDir)
        .map(item => item.name)
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

    const res: IResponse = await fetchSyncPost("/api/file/putFile", formData)
    return res.code === 0
}

export async function removeFile(path: string): Promise<boolean> {
    const res: IResponse = await fetchSyncPost("/api/file/removeFile", { path })
    return res.code === 0
}

export async function downloadUrl(url: string, destPath: string): Promise<boolean> {
    try {
        const response = await fetch(url)
        if (!response.ok) return false
        const blob = await response.blob()
        return await putFile(destPath, blob)
    } catch (err: any) {
        console.debug('api.ts downloadUrl 失败:', url, err.message)
        return false
    }
}
