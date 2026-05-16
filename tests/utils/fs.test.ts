import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("siyuan", () => ({
    fetchPost: vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
        callback({ code: 0, data: null })
    }),
}))

import { fetchPost } from "siyuan"
import { isDesktop, readDir, getFileUrl, fileExists } from "../../src/utils/fs"

describe("fs.ts - isDesktop", () => {
    beforeEach(() => {
        delete (window as any).require
    })

    it("window.require 存在且能加载 fs/promises 时返回 true", () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return { readdir: vi.fn(), access: vi.fn(), writeFile: vi.fn() }
            return undefined
        })
        expect(isDesktop()).toBe(true)
    })

    it("window.require 不存在时返回 false", () => {
        expect(isDesktop()).toBe(false)
    })

    it("window.require 存在但 fs/promises 抛出时返回 false", () => {
        (window as any).require = vi.fn(() => {
            throw new Error("Cannot find module")
        })
        expect(isDesktop()).toBe(false)
    })
})

describe("fs.ts - readDir", () => {
    beforeEach(() => {
        delete (window as any).require
        vi.mocked(fetchPost).mockClear()
    })

    it("desktop: 返回纯文件列表，过滤目录", async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                readdir: vi.fn().mockResolvedValue([
                    { name: 'a.jpg', isFile: () => true },
                    { name: 'subdir', isFile: () => false },
                    { name: 'b.png', isFile: () => true },
                ]),
            }
            return undefined
        })

        const files = await readDir('/fake/path')
        expect(files).toEqual(['a.jpg', 'b.png'])
    })

    it("desktop: readdir 抛出时返回 []", async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                readdir: vi.fn().mockRejectedValue(new Error('ENOENT')),
            }
            return undefined
        })

        const files = await readDir('/nonexistent')
        expect(files).toEqual([])
    })

    it("fallback: fetchPost readDir 返回文件列表", async () => {
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

    it("fallback: fetchPost 返回错误时返回 []", async () => {
        vi.mocked(fetchPost).mockImplementationOnce(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({ code: -1, msg: 'error' })
            }
        )

        const files = await readDir('data/public/bad')
        expect(files).toEqual([])
    })
})

describe("fs.ts - getFileUrl", () => {
    beforeEach(() => {
        delete (window as any).require
        ;(window as any).siyuan = {
            config: { system: { workspaceDir: '/tmp/workspace' } },
        }
    })

    it("local: 返回 file:// 协议", () => {
        (window as any).require = vi.fn(() => ({}))
        expect(getFileUrl('/home/user/Pictures/img.jpg', 'local'))
            .toBe('file:///home/user/Pictures/img.jpg')
    })

    it("assets: 返回 /assets/... 路径", () => {
        expect(getFileUrl('data/assets/wallpaper/img.jpg', 'assets'))
            .toBe('/assets/wallpaper/img.jpg')
    })

    it("upload desktop: 返回 file:// 协议", () => {
        (window as any).require = vi.fn(() => ({}))
        expect(getFileUrl('data/public/plugin/img.jpg', 'upload'))
            .toBe('file:///tmp/workspace/data/public/plugin/img.jpg')
    })

    it("upload fallback: 返回 /public/... 路径", () => {
        expect(getFileUrl('data/public/plugin/img.jpg', 'upload'))
            .toBe('/public/plugin/img.jpg')
    })
})

describe("fs.ts - fileExists", () => {
    it("desktop: 调用 fsp.access() 成功返回 true", async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                access: vi.fn().mockResolvedValue(undefined),
            }
            return undefined
        })
        expect(await fileExists('/fake/path.jpg', 'local')).toBe(true)
    })

    it("desktop: fsp.access() 失败返回 false", async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                access: vi.fn().mockRejectedValue(new Error('ENOENT')),
            }
            return undefined
        })
        expect(await fileExists('/nonexistent.jpg', 'local')).toBe(false)
    })
})
