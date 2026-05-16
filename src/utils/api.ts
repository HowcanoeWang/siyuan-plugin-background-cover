import { fetchPost } from "siyuan"

export async function request(url: string, data: any): Promise<any> {
    return new Promise((resolve) => {
        fetchPost(url, data, (response: any) => {
            resolve(response.code === 0 ? response.data : null)
        })
    })
}

export async function readDir(path: string): Promise<string[]> {
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

export async function putFile(path: string, file: File | Blob): Promise<boolean> {
    const formData = new FormData()
    formData.append("path", path)
    formData.append("isDir", "false")
    formData.append("modTime", Math.floor(Date.now() / 1000).toString())
    formData.append("file", file)

    return new Promise((resolve) => {
        fetchPost("/api/file/putFile", formData, (res: any) => {
            resolve(res.code === 0)
        })
    })
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
