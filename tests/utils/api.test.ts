import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("siyuan", () => ({
    fetchSyncPost: vi.fn(async (_url: string, _data: any) => ({ code: 0, msg: "", data: null, cmd: "", sid: "" })),
}))

import { fetchSyncPost } from "siyuan"
import { readDir, downloadUrl } from "../../src/utils/api"

describe("api.ts - readDir", () => {
    beforeEach(() => {
        vi.mocked(fetchSyncPost).mockClear()
    })

    it("返回文件列表，过滤目录", async () => {
        vi.mocked(fetchSyncPost).mockResolvedValueOnce({
            code: 0,
            msg: "",
            cmd: "",
            sid: "",
            data: [
                { isDir: true, name: 'subfolder' },
                { isDir: false, name: 'img.jpg' },
                { isDir: false, name: 'vid.mp4' },
            ],
        })

        const files = await readDir('data/public/plugin')
        expect(files).toEqual(['img.jpg', 'vid.mp4'])
    })

    it("fetchSyncPost 返回错误时返回 []", async () => {
        vi.mocked(fetchSyncPost).mockResolvedValueOnce({ code: -1, msg: 'error', data: null, cmd: "", sid: "" })

        const files = await readDir('data/public/bad')
        expect(files).toEqual([])
    })
})

describe("api.ts - downloadUrl", () => {
    it("fetch 失败时返回 false", async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
        expect(await downloadUrl('https://bad.url/img.jpg', '/dest/path')).toBe(false)
    })
})
