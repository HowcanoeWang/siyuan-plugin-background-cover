import {
    Plugin,
    getFrontend,
} from "siyuan"

import { svelteDialog } from "./libs/dialog"
import { configStore } from "./stores/config"
import { createBgLayer, destroyBgLayer, renderImage, changeOpacity, changeBlur, changePosition } from "./services/bgRender"
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

        this.addIcons(`<symbol id="iconCoverBg" viewBox="0 0 32 32">
<path d="M4 4h24v24H4z"/>
</symbol>`)

        this.addCommand({ langKey: "selectPictureManualLabel", hotkey: "⇧⌘F6", callback: () => this.openSetting("sources") })
        this.addCommand({ langKey: "selectPictureRandomLabel", hotkey: "⇧⌘F7", callback: () => {} })
        this.addCommand({ langKey: "openBackgroundLabel", hotkey: "⇧⌘F4", callback: () => {
            const active = !configStore.get("activate")
            configStore.setAndSave("activate", active)
            if (active) {
                this.applyBackground()
            } else {
                destroyBgLayer()
            }
        }})
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
            this.applyBackground()
        }

        console.log(this.i18n.helloPlugin)
    }

    onLayoutReady() {
        const topBarElement = this.addTopBar({
            icon: "iconCoverBg",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                buildTopBarMenu(topBarElement, this, (tab?: string) => this.openSetting(tab))
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

    private applyBackground() {
        const currentFile = configStore.get("currentFile")
        if (currentFile) {
            renderImage(currentFile)
            changeOpacity(configStore.get("opacity"))
            changeBlur(configStore.get("blur"))
            changePosition(configStore.get("positionX"), configStore.get("positionY"))
        }
    }
}
