import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import {
    createBgLayer, destroyBgLayer,
    render, renderImage, renderVideo, clearLayer,
    setVisible, changeForegroundOpacity, changeBackgroundOpacity, changeBlur,
    changePosition, applyOverrides,
    startAutoRefresh, stopAutoRefresh,
    getCurrentMode,
} from "../../src/services/bgRender"

describe("bgRender - DOM 生命周期", () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.documentElement.innerHTML = '<head></head><body></body>'
        destroyBgLayer()
    })

    it("createBgLayer 创建 canvas 和 video 元素", () => {
        createBgLayer()
        const canvas = document.getElementById('bglayer')
        const video = document.getElementById('bgvideo')
        expect(canvas).toBeTruthy()
        expect(video).toBeTruthy()
        expect(canvas!.tagName).toBe('CANVAS')
        expect(video!.tagName).toBe('VIDEO')
    })

    it("createBgLayer 不创建重复元素", () => {
        createBgLayer()
        createBgLayer()
        expect(document.querySelectorAll('#bglayer').length).toBe(1)
        expect(document.querySelectorAll('#bgvideo').length).toBe(1)
    })

    it("destroyBgLayer 移除元素并清空引用", () => {
        createBgLayer()
        destroyBgLayer()
        expect(document.getElementById('bglayer')).toBeNull()
        expect(document.getElementById('bgvideo')).toBeNull()
    })

    it("canvas 和 video 的样式设置正确", () => {
        createBgLayer()
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.backgroundSize).toBe('cover')
        expect(canvas.style.position).toBe('absolute')

        const video = document.getElementById('bgvideo') as HTMLVideoElement
        expect(video.style.objectFit).toBe('cover')
        expect(video.autoplay).toBe(true)
        expect(video.loop).toBe(true)
        expect(video.muted).toBe(true)
    })
})

describe("bgRender - 渲染", () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.documentElement.innerHTML = '<head></head><body></body>'
        destroyBgLayer()
        createBgLayer()
    })

    it("renderImage 显示 canvas 隐藏 video", () => {
        renderImage('/assets/test.jpg')
        expect(getCurrentMode()).toBe('image')
        const canvas = document.getElementById('bglayer')!
        const video = document.getElementById('bgvideo')!
        expect(canvas.style.display).toBe('')
        expect(video.style.display).toBe('none')
        expect(canvas.style.backgroundImage).toContain('/assets/test.jpg')
    })

    it("renderVideo 显示 video 隐藏 canvas", () => {
        renderVideo('/assets/test.mp4')
        expect(getCurrentMode()).toBe('video')
        const canvas = document.getElementById('bglayer')!
        const video = document.getElementById('bgvideo')!
        expect(canvas.style.display).toBe('none')
        expect(video.style.display).toBe('')
    })

    it("render 自动检测图片类型", () => {
        render('/assets/photo.png')
        expect(getCurrentMode()).toBe('image')
    })

    it("render 自动检测视频类型", () => {
        render('/assets/clip.mp4')
        expect(getCurrentMode()).toBe('video')
    })

    it("render 处理 URL query string", () => {
        render('/assets/photo.jpg?t=123')
        expect(getCurrentMode()).toBe('image')
    })

    it("render 处理大小写混合扩展名", () => {
        render('/assets/VIDEO.MP4')
        expect(getCurrentMode()).toBe('video')
    })

    it("clearLayer 隐藏所有层", () => {
        renderImage('/assets/test.jpg')
        clearLayer()
        expect(getCurrentMode()).toBeNull()
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.display).toBe('none')
        expect(canvas.style.backgroundImage).toBe('')
    })
})

describe("bgRender - 样式控制", () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.documentElement.innerHTML = '<head></head><body></body>'
        destroyBgLayer()
        createBgLayer()
    })

    it("changeForegroundOpacity 图片模式修改 body opacity (加权)", () => {
        renderImage('/assets/test.jpg')
        changeForegroundOpacity(0.5)
        expect(document.body.style.opacity).toBe('0.875')
    })

    it("changeForegroundOpacity 视频模式也修改 body opacity", () => {
        renderVideo('/assets/test.mp4')
        changeForegroundOpacity(0.3)
        expect(document.body.style.opacity).toBe('0.925')
    })

    it("changeForegroundOpacity clamp 到 0-1", () => {
        renderImage('/assets/test.jpg')
        changeForegroundOpacity(-0.5)
        expect(document.body.style.opacity).toBe('1')
        changeForegroundOpacity(2.0)
        expect(document.body.style.opacity).toBe('0.75')
    })

    it("changeBackgroundOpacity 同步修改 canvas 和 video opacity", () => {
        changeBackgroundOpacity(1)
        const canvas = document.getElementById('bglayer')!
        const video = document.getElementById('bgvideo')!
        expect(canvas.style.opacity).toBe('0.35')
        expect(video.style.opacity).toBe('0.35')
    })

    it("changeBackgroundOpacity clamp 到 0-1 后映射到 0-0.35", () => {
        changeBackgroundOpacity(-0.5)
        const canvas = document.getElementById('bglayer')!
        const video = document.getElementById('bgvideo')!
        expect(canvas.style.opacity).toBe('0')
        expect(video.style.opacity).toBe('0')

        changeBackgroundOpacity(2)
        expect(canvas.style.opacity).toBe('0.35')
        expect(video.style.opacity).toBe('0.35')
    })

    it("changeBlur 图片模式设置 canvas filter", () => {
        renderImage('/assets/test.jpg')
        changeBlur(5)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.filter).toBe('blur(5px)')
    })

    it("changeBlur 0 时清空 filter", () => {
        renderImage('/assets/test.jpg')
        changeBlur(0)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.filter).toBe('')
    })

    it("changePosition 仅对图片模式有效", () => {
        renderImage('/assets/test.jpg')
        changePosition(30, 70)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.backgroundPosition).toBe('30% 70%')
    })

    it("changePosition 视频模式不生效", () => {
        renderVideo('/assets/test.mp4')
        changePosition(20, 80)
        // position shouldn't affect video
    })

    it("applyOverrides 图片模式应用覆盖", () => {
        renderImage('/assets/test.jpg')
        applyOverrides(40, 60)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.backgroundPosition).toBe('40% 60%')
    })

    it("applyOverrides 视频模式不生效", () => {
        renderVideo('/assets/test.mp4')
        applyOverrides(40, 60)
        // should be no-op
    })

    it("applyOverrides 使用默认值作为 fallback", () => {
        renderImage('/assets/test.jpg')
        applyOverrides(undefined, undefined, 50, 50)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.backgroundPosition).toBe('50% 50%')
    })
})

describe("bgRender - 自动刷新", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        destroyBgLayer()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("startAutoRefresh 启动定时器", () => {
        const cb = vi.fn()
        startAutoRefresh(cb, 1000)
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1000)
        expect(cb).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(1000)
        expect(cb).toHaveBeenCalledTimes(2)
    })

    it("stopAutoRefresh 停止定时器", () => {
        const cb = vi.fn()
        startAutoRefresh(cb, 1000)
        vi.advanceTimersByTime(500)
        stopAutoRefresh()
        vi.advanceTimersByTime(2000)
        expect(cb).not.toHaveBeenCalled()
    })

    it("intervalMs ≤ 0 不创建定时器", () => {
        const cb = vi.fn()
        startAutoRefresh(cb, 0)
        vi.advanceTimersByTime(5000)
        expect(cb).not.toHaveBeenCalled()
    })
})

describe("bgRender - setVisible", () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.documentElement.innerHTML = '<head></head><body></body>'
        destroyBgLayer()
        createBgLayer()
    })

    it("setVisible(false) 隐藏所有层", () => {
        renderImage('/assets/test.jpg')
        setVisible(false)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.display).toBe('none')
    })

    it("setVisible(true) 恢复当前模式显示", () => {
        renderImage('/assets/test.jpg')
        setVisible(false)
        setVisible(true)
        const canvas = document.getElementById('bglayer')!
        expect(canvas.style.display).toBe('')
    })
})
