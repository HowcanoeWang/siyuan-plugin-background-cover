import {
    Plugin,
    getFrontend,
} from "siyuan"

import { svelteDialog } from "./libs/dialog"
import { configStore } from "./stores/config"
import { destroyBgLayer, createBgLayer, renderImage, renderVideo, changeOpacity, changeBlur, changePosition, setVisible, startAutoRefresh, stopAutoRefresh } from "./services/bgRender"
import { scanAll, pickRandom } from "./services/sourceManager"
import { diyIcon, pickDefaultBackground, DEFAULT_BACKGROUNDS, IMAGE_EXTS, VIDEO_EXTS } from "./constants"
import { debug, log } from "./utils/logger"
import { isCurrentThemeDisabled, watchTheme } from "./utils/theme"
import SettingsPanel from "./ui/settings/settings.svelte"
import { buildTopBarMenu } from "./ui/topbar-menu"

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

        this.addIcons(diyIcon.iconLogo)

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
                const pool = await scanAll(assetDirs, localFolders)
                if (pool.length === 0) {
                    configStore.set("currentFile", pickDefaultBackground())
                    configStore.save()
                }
            }
            this.applyBackground()
        }

        this._unwatchTheme = watchTheme((mode, name) => {
            log("[bgCover] theme changed:", mode, name)
            if (!configStore.get("activate")) return
            if (isCurrentThemeDisabled(configStore.get("disabledThemes"))) {
                log("[bgCover] theme is disabled, hiding background")
                setVisible(false)
            } else {
                createBgLayer()
                this.applyBackground()
            }
        })

        log("[bgCover]", this.i18n.helloPlugin)
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
            height: "max(520px, 60vh)",
            component: SettingsPanel,
            props: { activeTab },
        })
    }

    onunload() {
        this._unwatchTheme?.()
        destroyBgLayer()
        log("[bgCover]", this.i18n.byePlugin)
    }

    async toggleBackground() {
        const active = !configStore.get("activate")
        log("[bgCover] toggleBackground:", active ? "activated" : "deactivated")
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
        const pool = await scanAll(assetDirs, localFolders)
        if (pool.length === 0) {
            log("[bgCover] randomSelect: pool is empty, nothing to pick")
            return
        }
        const exclude = pool.length > 1 ? configStore.get("currentFile") : null
        const item = pickRandom(pool, exclude)
        if (!item) return
        log("[bgCover] randomSelect: picked", item.name, "from", pool.length, "items")
        configStore.set("currentFile", item.url)
        configStore.save()
        if (item.type === 'image') {
            renderImage(item.url)
        } else {
            renderVideo(item.url)
        }
        changeOpacity(configStore.get("opacity"))
        changeBlur(configStore.get("blur"))
        changePosition(configStore.get("positionX"), configStore.get("positionY"))
    }

    private applyBackground() {
        log("[bgCover] applyBackground: start")
        try {
            const currentFile = configStore.get("currentFile")
            debug("[bgCover] applyBackground: currentFile =", currentFile)
            if (!currentFile) {
                debug("[bgCover] applyBackground: currentFile is null, skip render")
                return
            }

            const ext = '.' + (currentFile.split('.').pop()?.toLowerCase() ?? '')
            debug("[bgCover] applyBackground: ext =", ext)
            if (VIDEO_EXTS.has(ext)) {
                debug("[bgCover] applyBackground: -> renderVideo")
                renderVideo(currentFile)
            } else if (IMAGE_EXTS.has(ext)) {
                debug("[bgCover] applyBackground: -> renderImage")
                renderImage(currentFile)
            } else {
                console.warn(`[bgCover] applyBackground: unknown extension "${ext}" for ${currentFile}`)
                return
            }
        } finally {
            const opacity = configStore.get("opacity")
            const blur = configStore.get("blur")
            const px = configStore.get("positionX")
            const py = configStore.get("positionY")
            debug("[bgCover] applyBackground: changeOpacity =", opacity, "blur =", blur, "pos =", px, py)
            changeOpacity(opacity)
            changeBlur(blur)
            changePosition(px, py)
        }

        const interval = configStore.get("autoRefreshTime")
        stopAutoRefresh()
        if (interval > 0) {
            startAutoRefresh(() => this.randomSelect(), interval * 60000)
        }
    }
}
