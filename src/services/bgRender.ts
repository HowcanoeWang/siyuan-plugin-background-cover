import { IMAGE_EXTS, VIDEO_EXTS } from "../constants"

let canvasEl: HTMLCanvasElement | null = null
let videoEl: HTMLVideoElement | null = null
let currentMode: 'image' | 'video' | null = null
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

export function getCurrentMode(): 'image' | 'video' | null {
    return currentMode
}

function detectType(url: string): 'image' | 'video' | null {
    const clean = url.split('?')[0]
    const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
    if (VIDEO_EXTS.has(ext)) return 'video'
    if (IMAGE_EXTS.has(ext)) return 'image'
    return null
}

export function createBgLayer(): void {
    if (canvasEl || videoEl) return

    canvasEl = document.createElement('canvas')
    canvasEl.id = 'bglayer'
    canvasEl.style.backgroundRepeat = 'no-repeat'
    canvasEl.style.backgroundAttachment = 'fixed'
    canvasEl.style.backgroundSize = 'cover'
    canvasEl.style.backgroundPosition = '50% 50%'
    canvasEl.style.width = '100%'
    canvasEl.style.height = '100%'
    canvasEl.style.position = 'absolute'
    canvasEl.style.zIndex = '-10000'
    canvasEl.style.display = 'none'

    videoEl = document.createElement('video')
    videoEl.id = 'bgvideo'
    videoEl.autoplay = true
    videoEl.loop = true
    videoEl.muted = true
    videoEl.playsInline = true
    videoEl.style.objectFit = 'cover'
    videoEl.style.objectPosition = '50% 50%'
    videoEl.style.width = '100%'
    videoEl.style.height = '100%'
    videoEl.style.position = 'absolute'
    videoEl.style.zIndex = '-9999'
    videoEl.style.display = 'none'
    videoEl.style.pointerEvents = 'none'

    const htmlEl = document.documentElement
    htmlEl.insertBefore(canvasEl, document.head)
    htmlEl.insertBefore(videoEl, document.head)
}

export function destroyBgLayer(): void {
    stopAutoRefresh()
    document.body.style.removeProperty('opacity')
    canvasEl?.remove()
    videoEl?.remove()
    canvasEl = null
    videoEl = null
    currentMode = null
}

export function render(url: string): void {
    const type = detectType(url)
    if (type === 'image') renderImage(url)
    else if (type === 'video') renderVideo(url)
}

export function renderImage(url: string): void {
    if (!canvasEl) return
    currentMode = 'image'

    if (videoEl) {
        videoEl.style.display = 'none'
        try { videoEl.pause() } catch { /* ignored */ }
        videoEl.removeAttribute('src')
    }
    canvasEl.style.display = ''
    canvasEl.style.backgroundImage = `url('${url}')`
}

export function renderVideo(url: string): void {
    if (!videoEl) return
    currentMode = 'video'

    if (canvasEl) canvasEl.style.display = 'none'
    videoEl.style.display = ''
    videoEl.src = url
    const playPromise = videoEl.play()
    if (playPromise) {
        playPromise.catch((e) => {
            if (e.name !== 'AbortError') {
                console.warn('[bgRender] video play failed:', e)
            }
        })
    }
}

export function clearLayer(): void {
    if (canvasEl) {
        canvasEl.style.display = 'none'
        canvasEl.style.backgroundImage = ''
    }
    if (videoEl) {
        videoEl.style.display = 'none'
        try { videoEl.pause() } catch { /* not implemented in jsdom */ }
        videoEl.removeAttribute('src')
    }
    currentMode = null
}

export function setVisible(visible: boolean): void {
    if (canvasEl) canvasEl.style.display = visible && currentMode === 'image' ? '' : 'none'
    if (videoEl) videoEl.style.display = visible && currentMode === 'video' ? '' : 'none'
    if (!visible) {
        document.body.style.removeProperty('opacity')
    }
}

export function changeOpacity(raw: number): void {
    const clamped = Math.max(0.1, Math.min(1, raw))
    const opacity = 0.99 - 0.25 * clamped
    document.body.style.opacity = String(opacity)
}

export function changeBlur(val: number): void {
    const px = Math.max(0, Math.min(10, val))
    const filter = px > 0 ? `blur(${px}px)` : ''

    if (currentMode === 'image' && canvasEl) {
        canvasEl.style.filter = filter
    } else if (currentMode === 'video' && videoEl) {
        videoEl.style.filter = filter
    }
}

export function changePosition(x: number, y: number): void {
    if (!canvasEl || currentMode !== 'image') return
    canvasEl.style.backgroundPosition = `${x}% ${y}%`
}

export function applyOverrides(x?: number, y?: number, defaultX?: number, defaultY?: number): void {
    if (currentMode !== 'image') return
    const posX = x ?? defaultX ?? 50
    const posY = y ?? defaultY ?? 50
    changePosition(posX, posY)
}

export function startAutoRefresh(callback: () => void, intervalMs: number): void {
    stopAutoRefresh()
    if (intervalMs <= 0) return
    autoRefreshTimer = setInterval(callback, intervalMs)
}

export function stopAutoRefresh(): void {
    if (autoRefreshTimer !== null) {
        clearInterval(autoRefreshTimer)
        autoRefreshTimer = null
    }
}
