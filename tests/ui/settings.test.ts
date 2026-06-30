import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import { tick } from "svelte"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

import ConfigTab from "../../src/ui/settings/ConfigTab.svelte"
import { createBgLayer, destroyBgLayer } from "../../src/services/bgRender"
import { configStore } from "../../src/stores/config"

describe("settings", () => {
    beforeEach(() => {
        cleanup()
        destroyBgLayer()
        configStore._resetForTest()
        ;(window as any).bgCoverPlugin = {
            i18n: {
                activateBg: "开启背景",
                activateBgDesc: "关闭后背景图片不显示",
                foregroundOpacity: "前景透明度",
                foregroundOpacityDesc: "范围(0-1), 鼠标拖动后更新",
                backgroundOpacity: "背景透明度",
                backgroundOpacityDesc: "范围(0-1), 鼠标拖动后更新",
                bgBlur: "背景模糊度",
                bgBlurDesc: "范围(0-10), 鼠标拖动后更新",
            },
        }
    })

    afterEach(() => {
        cleanup()
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

    it("renders background opacity setting", () => {
        render(ConfigTab)

        expect(screen.getByText("背景透明度")).toBeInTheDocument()
    })

    it("updates sliders when config changes outside the panel", async () => {
        const { container } = render(ConfigTab)
        const ranges = container.querySelectorAll<HTMLInputElement>('input[type="range"]')
        const inputEvents: string[] = []
        ranges.forEach(range => range.addEventListener("input", () => inputEvents.push(range.value)))

        configStore.set("foregroundOpacity", 0.75)
        configStore.set("backgroundOpacity", 0.4)
        configStore.set("blur", 2)
        await tick()

        expect(ranges[0].value).toBe("0.75")
        expect(ranges[1].value).toBe("0.4")
        expect(ranges[2].value).toBe("2")
        expect(ranges[0].parentElement).toHaveAttribute("aria-label", "0.75")
        expect(ranges[1].parentElement).toHaveAttribute("aria-label", "0.4")
        expect(ranges[2].parentElement).toHaveAttribute("aria-label", "2")
        expect(inputEvents).toEqual(["0.75", "0.4", "2"])
    })
})
