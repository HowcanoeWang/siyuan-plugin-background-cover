import {
    Plugin,
    getFrontend,
} from "siyuan"

import { svelteDialog } from "./libs/dialog"
import { configStore } from "./stores/config"
import { destroyBgLayer, createBgLayer, renderImage, renderVideo, renderDynamic, changeOpacity, changeBlur, changePosition, applyOverrides, setVisible, startAutoRefresh, stopAutoRefresh } from "./services/bgRender"
import { scanAll, pickRandom } from "./services/sourceManager"
import { pluginTopIcon, pickDefaultBackground, DEFAULT_BACKGROUNDS, IMAGE_EXTS, VIDEO_EXTS, DYNAMIC_BG_FALLBACK_URL, isDynamicUrl } from "./constants"
import { devDebug, devLog } from "./utils/logger"
import { isCurrentThemeDisabled, watchTheme } from "./utils/theme"
import SettingsPanel from "./ui/settings/SettingsPanel.svelte"
import { buildTopBarMenu } from "./ui/topbarMenu"

export { svelteDialog }

export default class BgCoverPlugin extends Plugin {

    public isMobileLayout: boolean
    private _unwatchTheme: (() => void) | null = null

    async onload() {
        const frontEnd = getFrontend()
        this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile"

        await configStore.load()

        await configStore.cleanOldConfigIfNeeded()

        ;(window as any).bgCoverPlugin = {
            i18n: this.i18n,
            isMobileLayout: this.isMobileLayout,
            plugin: this,
            configStore,
        }

        this.addIcons(pluginTopIcon.iconLogo)

        this.addCommand({ langKey: "selectPictureManualLabel", hotkey: "⇧⌘F6", callback: () => this.openSetting("sources") })
        this.addCommand({ langKey: "selectPictureRandomLabel", hotkey: "⇧⌘F7", callback: () => this.randomSelect() })
        this.addCommand({ langKey: "openBackgroundLabel", hotkey: "⇧⌘F4", callback: () => this.toggleBackground() })
        this.addCommand({ langKey: "reduceBackgroundOpacityLabel", hotkey: "⇧⌘7", callback: () => {
            const v = Math.max(0, configStore.get("opacity") - 0.05)
            configStore.setAndSave("opacity", v)
            changeOpacity(v)
        }})
        this.addCommand({ langKey: "addBackgroundOpacityLabel", hotkey: "⇧⌘8", callback: () => {
            const v = Math.min(1, configStore.get("opacity") + 0.05)
            configStore.setAndSave("opacity", v)
            changeOpacity(v)
        }})
        this.addCommand({ langKey: "reduceBackgroundBlurLabel", hotkey: "⇧⌘9", callback: () => {
            const v = Math.max(0, configStore.get("blur") - 1)
            configStore.setAndSave("blur", v)
            changeBlur(v)
        }})
        this.addCommand({ langKey: "addBackgroundBlurLabel", hotkey: "⇧⌘0", callback: () => {
            const v = Math.min(10, configStore.get("blur") + 1)
            configStore.setAndSave("blur", v)
            changeBlur(v)
        }})

        if (configStore.get("activate")) {
            createBgLayer()
            if (configStore.get("changeBgOnStart")) {
                await this.randomSelect()
            }
            const currentFile = configStore.get("currentFile")
            if (DEFAULT_BACKGROUNDS.includes(currentFile ?? '')) {
                configStore.set("currentFile", pickDefaultBackground())
                configStore.save()
            }
            if (!configStore.get("currentFile")) {
                const assetDirs = configStore.get("assetDirs")
                const localFolders = configStore.get("localFolders")
                const dynamicBgUrls = configStore.get("dynamicBgUrls")
                const pool = await scanAll(assetDirs, localFolders, dynamicBgUrls)
                if (pool.length === 0) {
                    configStore.set("currentFile", pickDefaultBackground())
                    configStore.save()
                }
            }
            this.applyBackground()
        }

        this._unwatchTheme = watchTheme((mode, name) => {
            devLog("[bgCover] theme changed:", mode, name)
            this.applyThemeShield()
        })

        devLog("[bgCover]", this.i18n.helloPlugin)
    }

    onLayoutReady() {
        const topBarElement = this.addTopBar({
            icon: "iconLogo",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                buildTopBarMenu(topBarElement, this, {
                    onOpenSettings: (tab?: string) => this.openSetting(tab),
                    toggleBackground: () => this.toggleBackground(),
                    randomSelect: () => this.randomSelect(),
                })
            },
        })
    }

    openSetting(activeTab?: string): void {
        svelteDialog({
            title: "Background Cover",
            width: this.isMobileLayout ? "92vw" : "max(520px, 60vw)",
            height: "max(520px, 80vh)",
            component: SettingsPanel,
            props: { activeTab },
        })
    }

    onunload() {
        this._unwatchTheme?.()
        destroyBgLayer()
        devLog("[bgCover]", this.i18n.byePlugin)
    }

    async toggleBackground() {
        const active = !configStore.get("activate")
        devLog("[bgCover] toggleBackground:", active ? "activated" : "deactivated")
        configStore.setAndSave("activate", active)
        if (active) {
            createBgLayer()
            this.applyBackground()
        } else {
            destroyBgLayer()
        }
    }

    async randomSelect() {
        const assetDirs = configStore.get("assetDirs")
        const localFolders = configStore.get("localFolders")
        const dynamicBgUrls = configStore.get("dynamicBgUrls")
        const pool = await scanAll(assetDirs, localFolders, dynamicBgUrls)
        if (pool.length === 0) {
            devLog("[bgCover] randomSelect: pool is empty, nothing to pick")
            return
        }
        const exclude = pool.length > 1 ? configStore.get("currentFile") : null
        const item = pickRandom(pool, exclude)
        if (!item) return
        devLog("[bgCover] randomSelect: picked", item.name, "from", pool.length, "items")
        configStore.set("currentFile", item.url)
        configStore.save()
        if (item.sourceType === 'dynamic') {
            const cb = item.url + (item.url.includes('?') ? '&' : '?') + '_t=' + Date.now()
            renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
        } else if (item.type === 'image') {
            renderImage(item.url)
        } else {
            renderVideo(item.url)
        }
        changeOpacity(configStore.get("opacity"))
        changeBlur(configStore.get("blur"))
        const ov = configStore.get("imageOverrides")[item.url]
        applyOverrides(ov?.positionX, ov?.positionY, 50, 50)
    }

    private applyBackground() {
        devLog("[bgCover] applyBackground: start")
        try {
            const currentFile = configStore.get("currentFile")
            devDebug("[bgCover] applyBackground: currentFile =", currentFile)
            if (!currentFile) {
                devDebug("[bgCover] applyBackground: currentFile is null, skip render")
                return
            }

            if (isDynamicUrl(currentFile)) {
                const cb = currentFile + (currentFile.includes('?') ? '&' : '?') + '_t=' + Date.now()
                renderDynamic(cb, DYNAMIC_BG_FALLBACK_URL)
            } else {
                const ext = '.' + (currentFile.split('.').pop()?.toLowerCase() ?? '')
                devDebug("[bgCover] applyBackground: ext =", ext)
                if (VIDEO_EXTS.has(ext)) {
                    devDebug("[bgCover] applyBackground: -> renderVideo")
                    renderVideo(currentFile)
                } else if (IMAGE_EXTS.has(ext)) {
                    devDebug("[bgCover] applyBackground: -> renderImage")
                    renderImage(currentFile)
                } else {
                    console.warn(`[bgCover] applyBackground: unknown extension "${ext}" for ${currentFile}`)
                    return
                }
            }
        } finally {
            const opacity = configStore.get("opacity")
            const blur = configStore.get("blur")
            changeOpacity(opacity)
            changeBlur(blur)
            const ov = configStore.get("imageOverrides")[currentFile]
            applyOverrides(ov?.positionX, ov?.positionY, 50, 50)
        }

        const interval = configStore.get("autoRefreshTime")
        stopAutoRefresh()
        if (interval > 0) {
            startAutoRefresh(() => this.randomSelect(), interval * 60000)
        }
    }

    applyThemeShield() {
        if (!configStore.get("activate")) return
        if (isCurrentThemeDisabled(configStore.get("disabledThemes"))) {
            devLog("[bgCover] applyThemeShield: theme disabled, hiding")
            setVisible(false)
        } else {
            devLog("[bgCover] applyThemeShield: theme enabled, showing")
            createBgLayer()
            this.applyBackground()
        }
    }
}
