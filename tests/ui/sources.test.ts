import { cleanup, render, screen, waitFor } from "@testing-library/svelte"
import { tick } from "svelte"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SourcesTab from "../../src/ui/settings/SourcesTab.svelte"
import { configStore } from "../../src/stores/config"

vi.mock("../../src/services/sourceManager", () => ({
    scanSource: vi.fn(async (type: string) => {
        if (type !== "upload") return []
        return [
            {
                name: "old.jpg",
                url: "public/siyuan-plugin-background-cover/old.jpg",
                apiPath: "/data/public/siyuan-plugin-background-cover/old.jpg",
                type: "image",
                sourceType: "upload",
                sourceLabel: "upload",
            },
            {
                name: "new.jpg",
                url: "public/siyuan-plugin-background-cover/new.jpg",
                apiPath: "/data/public/siyuan-plugin-background-cover/new.jpg",
                type: "image",
                sourceType: "upload",
                sourceLabel: "upload",
            },
        ]
    }),
}))

vi.mock("../../src/services/bgRender", () => ({
    renderImage: vi.fn(),
    renderVideo: vi.fn(),
    renderDynamic: vi.fn(),
    changeForegroundOpacity: vi.fn(),
    changeBackgroundOpacity: vi.fn(),
    changeBlur: vi.fn(),
    changePosition: vi.fn(),
}))

describe("sources settings", () => {
    beforeEach(() => {
        cleanup()
        configStore._resetForTest()
        configStore.set("currentFile", "public/siyuan-plugin-background-cover/old.jpg")
        ;(window as any).bgCoverPlugin = {
            i18n: {
                currentFile: "当前背景",
                pluginCache: "插件缓存",
                dynamicBgGroup: "动态背景",
                dynamicBGGroupHint: "订阅源",
                fileCountSummary: "{img} 图 / {vid} 视频",
                noPreviewHint: "暂无预览",
            },
        }
    })

    afterEach(() => {
        cleanup()
    })

    it("updates current background and focused item when currentFile changes outside the tab", async () => {
        const { container } = render(SourcesTab)
        await waitFor(() => expect(screen.getByText("old.jpg")).toBeInTheDocument())

        configStore.set("currentFile", "public/siyuan-plugin-background-cover/new.jpg")
        await tick()

        expect(screen.getByText("public/siyuan-plugin-background-cover/new.jpg")).toBeInTheDocument()
        const focusedItem = container.querySelector(".b3-list__panel label.b3-list-item--focus .b3-list-item__text")
        expect(focusedItem).toHaveTextContent("new.jpg")
    })
})
