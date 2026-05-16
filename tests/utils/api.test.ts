import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("siyuan", () => ({
    fetchPost: vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
        callback({ code: 0, data: null })
    }),
}))

import { fetchPost } from "siyuan"
import { readDir, downloadUrl } from "../../src/utils/api"

describe("api.ts - readDir", () => {
    beforeEach(() => {
        vi.mocked(fetchPost).mockClear()
    })

    it("返回文件列表，过滤目录", async () => {
        vi.mocked(fetchPost).mockImplementationOnce(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({
                    code: 0,
                    data: [
                        { isDir: true, name: 'subfolder' },
                        { isDir: false, name: 'img.jpg' },
                        { isDir: false, name: 'vid.mp4' },
                    ],
                })
            }
        )

        const files = await readDir('data/public/plugin')
        expect(files).toEqual(['img.jpg', 'vid.mp4'])
    })

    it("fetchPost 返回错误时返回 []", async () => {
        vi.mocked(fetchPost).mockImplementationOnce(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({ code: -1, msg: 'error' })
            }
        )

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
