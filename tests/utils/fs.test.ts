import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("siyuan", () => ({
    fetchPost: vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
        callback({ code: 0, data: null })
    }),
    fetchSyncPost: vi.fn(async (_url: string, _data: any) => ({ code: 0, msg: "", data: null, cmd: "", sid: "" })),
}))

vi.mock("../../src/stores/config", () => ({
    configStore: {
        get: vi.fn((key: string) => {
            if (key === "localFolders") return ["/fake/path", "/nonexistent"]
            return null
        }),
    },
}))

import { isDesktop, readLocalDir, getFileUrl, fileExists } from "../../src/utils/fs"

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

describe("fs.ts - readLocalDir", () => {
    beforeEach(() => {
        delete (window as any).require
    })

    it("返回纯文件列表，过滤目录", async () => {
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

        const files = await readLocalDir('/fake/path')
        expect(files).toEqual(['a.jpg', 'b.png'])
    })

    it("readdir 抛出时返回 []", async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                readdir: vi.fn().mockRejectedValue(new Error('ENOENT')),
            }
            return undefined
        })

        const files = await readLocalDir('/nonexistent')
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

    it("assets: 返回 assets/... 路径 (无前导/)", () => {
        expect(getFileUrl('data/assets/wallpaper/img.jpg', 'assets'))
            .toBe('assets/wallpaper/img.jpg')
    })

    it("upload: 返回 public/... 路径 (无前导/)", () => {
        (window as any).require = vi.fn(() => ({}))
        expect(getFileUrl('data/public/plugin/img.jpg', 'upload'))
            .toBe('public/plugin/img.jpg')
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
