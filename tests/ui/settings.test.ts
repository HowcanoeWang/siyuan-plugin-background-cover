import { fireEvent, render, screen } from "@testing-library/svelte"
import { describe, it, expect, beforeEach } from "vitest"

import ConfigTab from "../../src/ui/settings/ConfigTab.svelte"
import { createBgLayer, destroyBgLayer } from "../../src/services/bgRender"
import { configStore } from "../../src/stores/config"

describe("settings", () => {
    beforeEach(() => {
        destroyBgLayer()
        configStore._resetForTest()
        ;(window as any).bgCoverPlugin = {
            i18n: {
                activateBg: "开启背景",
                activateBgDesc: "关闭后背景图片不显示",
            },
        }
    })

    it("closes background layer when activate switch is turned off", async () => {
        createBgLayer()
        render(ConfigTab)

        const label = screen.getByText("开启背景").closest("label")
        const input = label?.querySelector("input[type='checkbox']")
        expect(input).toBeInstanceOf(HTMLInputElement)
        await fireEvent.click(input as HTMLInputElement)

        expect(configStore.get("activate")).toBe(false)
        expect(document.querySelector("#bglayer")).not.toBeInTheDocument()
        expect(document.querySelector("#bgvideo")).not.toBeInTheDocument()
    })
})
