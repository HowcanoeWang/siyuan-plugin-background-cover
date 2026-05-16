import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("siyuan", () => ({
    fetchPost: vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
        callback({ code: 0, data: null })
    }),
}))

import { fetchPost } from "siyuan"
import { classifyFileType } from "../../src/types"
import { scanAll, scanSource, pickRandom, validatePath } from "../../src/services/sourceManager"

describe("types.ts - classifyFileType", () => {
    it.each([
        ['sunset.png', 'image'],
        ['photo.jpg', 'image'],
        ['photo.jpeg', 'image'],
        ['anim.gif', 'image'],
        ['pic.webp', 'image'],
        ['pic.bmp', 'image'],
        ['icon.svg', 'image'],
        ['hdr.avif', 'image'],
        ['video.mp4', 'video'],
        ['video.webm', 'video'],
        ['video.ogg', 'video'],
        ['movie.mov', 'video'],
        ['movie.avi', 'video'],
        ['movie.mkv', 'video'],
        ['readme.md', null],
        ['script.js', null],
        ['noextension', null],
    ])('%s → %s', (filename, expected) => {
        expect(classifyFileType(filename)).toBe(expected)
    })
})

describe("sourceManager - pickRandom", () => {
    const items = [
        { name: 'a.jpg', url: 'file:///a.jpg', apiPath: '/a.jpg', type: 'image' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
        { name: 'b.png', url: 'file:///b.png', apiPath: '/b.png', type: 'image' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
        { name: 'c.mp4', url: 'file:///c.mp4', apiPath: '/c.mp4', type: 'video' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
    ]

    it("空数组返回 null", () => {
        expect(pickRandom([])).toBeNull()
    })

    it("非空数组返回一个 item", () => {
        const result = pickRandom(items)
        expect(result).toBeDefined()
        expect(items).toContain(result)
    })

    it("excludeUrl 排除指定项", () => {
        const result = pickRandom(items, 'file:///a.jpg')
        expect(result!.url).not.toBe('file:///a.jpg')
    })

    it("excludeUrl 排除后候选为空时返回 null", () => {
        const singleItem = [items[0]]
        const result = pickRandom(singleItem, 'file:///a.jpg')
        expect(result).toBeNull()
    })
})

describe("sourceManager - scanAll", () => {
    beforeEach(() => {
        delete (window as any).require
        vi.mocked(fetchPost).mockClear()
    })

    it("空 source 列表返回数组", async () => {
        vi.mocked(fetchPost).mockImplementation(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({ code: 0, data: [] })
            }
        )

        const result = await scanAll([], [])
        expect(Array.isArray(result)).toBe(true)
    })

    it("非 desktop 端跳过 localFolders", async () => {
        vi.mocked(fetchPost).mockImplementation(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({ code: 0, data: [] })
            }
        )

        const result = await scanAll([], ['/home/user/Pictures'])
        expect(result.filter(i => i.sourceType === 'local').length).toBe(0)
    })

    it("返回有效的 ImageItem 结构", async () => {
        vi.mocked(fetchPost).mockImplementation(
            (_url: string, _data: any, callback: (response: any) => void) => {
                callback({
                    code: 0,
                    data: [
                        { isDir: false, name: 'sunset.jpg' },
                        { isDir: false, name: 'waterfall.mp4' },
                        { isDir: false, name: 'readme.txt' },
                    ],
                })
            }
        )

        const result = await scanSource('upload', 'data/public/plugin/')
        expect(result.length).toBe(2)
        expect(result[0].type).toBe('image')
        expect(result[1].type).toBe('video')
        expect(result[0].sourceType).toBe('upload')

        for (const item of result) {
            expect(item.name).toBeDefined()
            expect(item.url).toBeDefined()
            expect(item.apiPath).toBeDefined()
            expect(item.type).toMatch(/^(image|video)$/)
            expect(item.sourceType).toMatch(/^(local|upload|assets)$/)
        }
    })
})

describe("sourceManager - validatePath", () => {
    it("空字符串返回 false", async () => {
        expect(await validatePath("")).toBe(false)
    })
})
