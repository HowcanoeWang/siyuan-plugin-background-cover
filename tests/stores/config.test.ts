import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetchSyncPost = vi.fn(async (_url: string, _data: any) => ({ code: 0, msg: "", data: null, cmd: "", sid: "" }))

vi.doMock("siyuan", () => ({
    fetchPost: vi.fn(),
    fetchSyncPost: mockFetchSyncPost,
    Plugin: class {
        data: Record<string, any> = {}
        i18n: Record<string, string> = {}
        addIcons() {}
        addCommand() {}
    },
    getFrontend: vi.fn(() => 'desktop'),
    getBackend: vi.fn(() => 'linux'),
    showMessage: vi.fn(),
    Menu: vi.fn(),
    Dialog: vi.fn(),
    Setting: vi.fn(),
}))

const { configStore } = await import("../../src/stores/config")

describe("ConfigStore", () => {
    beforeEach(() => {
        ;(window as any).siyuan.storage = {}
        mockFetchSyncPost.mockClear()
        mockFetchSyncPost.mockResolvedValue({ code: 0, msg: "", data: null, cmd: "", sid: "" })
        configStore._resetForTest()
    })

    describe("load()", () => {
        it("应该从空存储中读取默认值", async () => {
            await configStore.load()
            expect(configStore.get("activate")).toBe(true)
            expect(configStore.get("opacity")).toBe(0.5)
            expect(configStore.get("blur")).toBe(5)
            expect(configStore.get("localFolders")).toEqual([])
        })

        it("应该合并已有配置并补缺", async () => {
            ;(window as any).siyuan.storage["siyuan-plugin-background-cover"] = {
                activate: false,
                opacity: 0.8,
            }
            await configStore.load()
            expect(configStore.get("activate")).toBe(false)
            expect(configStore.get("opacity")).toBe(0.8)
            expect(configStore.get("blur")).toBe(5)
        })

        it("load 不应对已有配置触发额外 save", async () => {
            ;(window as any).siyuan.storage["siyuan-plugin-background-cover"] = {
                activate: true,
                opacity: 0.3,
                localFolders: [],
                assetDirs: [],
            }
            mockFetchSyncPost.mockClear()
            await configStore.load()
            // No migration save should fire
            expect(mockFetchSyncPost).not.toHaveBeenCalled()
        })

        it("第二次 load 应直接返回不重复读取", async () => {
            ;(window as any).siyuan.storage["siyuan-plugin-background-cover"] = {
                activate: true,
            }
            await configStore.load()
            mockFetchSyncPost.mockClear()
            await configStore.load()
            expect(mockFetchSyncPost).not.toHaveBeenCalled()
        })
    })

    describe("get() / set() / snapshot()", () => {
        it("set 应该改变内存值但不自动保存", async () => {
            await configStore.load()
            configStore.set("opacity", 0.3)
            expect(configStore.get("opacity")).toBe(0.3)
        })

        it("snapshot 应该返回独立副本", async () => {
            await configStore.load()
            const snap = configStore.snapshot()
            expect(snap.activate).toBe(true)
        })
    })

    describe("setAndSave()", () => {
        it("应该立即持久化", async () => {
            await configStore.load()
            mockFetchSyncPost.mockClear()

            await configStore.setAndSave("opacity", 0.3)

            expect(mockFetchSyncPost).toHaveBeenCalledWith(
                "/api/storage/setLocalStorageVal",
                expect.objectContaining({
                    key: "siyuan-plugin-background-cover",
                    val: expect.objectContaining({ opacity: 0.3 }),
                }),
            )
        })
    })

    describe("reset()", () => {
        it("应该恢复默认值并调用清理 API", async () => {
            await configStore.load()
            await configStore.setAndSave("activate", false)
            mockFetchSyncPost.mockClear()

            await configStore.reset()

            expect(configStore.get("activate")).toBe(true)
            expect(mockFetchSyncPost).toHaveBeenCalledWith(
                "/api/storage/removeLocalStorageVals",
                { keys: ["siyuan-plugin-background-cover"] },
            )
        })
    })

})

