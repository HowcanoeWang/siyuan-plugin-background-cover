import {
    Plugin,
    getFrontend,
} from "siyuan"

import { svelteDialog } from "./libs/dialog"
import { configStore } from "./stores/config"
import { destroyBgLayer, createBgLayer, renderImage, renderVideo, changeOpacity, changeBlur, changePosition } from "./services/bgRender"
import { scanAll, pickRandom } from "./services/sourceManager"
import { diyIcon, pickDefaultBackground } from "./constants"
import SettingsPanel from "./ui/settings/settings.svelte"
import { buildTopBarMenu } from "./ui/topbar-menu"

export { svelteDialog }

export default class BgCoverPlugin extends Plugin {

    public isMobileLayout: boolean

    async onload() {
        const frontEnd = getFrontend()
        this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile"

        await configStore.load()

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
            if (!configStore.get("currentFile")) {
                const url = pickDefaultBackground()
                configStore.set("currentFile", url)
                configStore.save()
            }
            this.applyBackground()
        }

        console.log(this.i18n.helloPlugin)
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
        destroyBgLayer()
        console.log(this.i18n.byePlugin)
    }

    toggleBackground() {
        const active = !configStore.get("activate")
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
        if (pool.length === 0) return
        const exclude = pool.length > 1 ? configStore.get("currentFile") : null
        const item = pickRandom(pool, exclude)
        if (!item) return
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
        let currentFile = configStore.get("currentFile")
        if (!currentFile) {
            currentFile = pickDefaultBackground()
            configStore.set("currentFile", currentFile)
            configStore.save()
        }
        renderImage(currentFile)
        changeOpacity(configStore.get("opacity"))
        changeBlur(configStore.get("blur"))
        changePosition(configStore.get("positionX"), configStore.get("positionY"))
    }
}
