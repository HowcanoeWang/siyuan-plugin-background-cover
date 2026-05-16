import { vi } from 'vitest'

export const Plugin = class {
    data: Record<string, any> = {}
    i18n: Record<string, string> = {}
    app: any = {}
    addIcons() {}
    addCommand() {}
    addTopBar() { return document.createElement('div') }
    onLayoutReady() {}
}

export const getFrontend = vi.fn(() => 'desktop')
export const getBackend = vi.fn(() => 'linux')
export const showMessage = vi.fn()

export const Menu = vi.fn(() => ({
    addItem: vi.fn(),
    addSeparator: vi.fn(),
    open: vi.fn(),
    fullscreen: vi.fn(),
}))

export const Dialog = vi.fn()
export const Setting = vi.fn()

export const fetchPost = vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
    callback({ code: 0, data: null })
})
